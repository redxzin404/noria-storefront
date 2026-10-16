import { NextResponse } from 'next/server';
import { z } from 'zod';

import { prisma } from '@/lib/db';
import {
  releaseExpiredInventoryReservations,
  releaseOrderInventoryReservation,
} from '@/lib/integrations/inventory';
import { verifyMercadoPagoSignature } from '@/lib/integrations/mercadopago-webhook';

const notificationSchema = z.object({
  type: z.string().optional(),
  live_mode: z.boolean().optional(),
  data: z.object({ id: z.union([z.string(), z.number()]).transform(String) }).optional(),
});

const paymentSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(String),
  status: z.string(),
  external_reference: z.string().nullable().optional(),
  transaction_amount: z.number(),
  currency_id: z.string(),
  live_mode: z.boolean().optional(),
});

export async function POST(request: Request) {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'Webhook secret is not configured.' }, { status: 503 });
  }

  const url = new URL(request.url);
  const requestId = request.headers.get('x-request-id');
  const signature = request.headers.get('x-signature');
  const dataId = url.searchParams.get('data.id') ?? url.searchParams.get('id');

  if (!verifyMercadoPagoSignature({
    dataId,
    requestId,
    signature,
    secret,
  })) {
    return NextResponse.json({ error: 'Invalid webhook signature.' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid webhook JSON.' }, { status: 400 });
  }

  const notification = notificationSchema.safeParse(body);
  if (!notification.success || notification.data.type !== 'payment' || !dataId) {
    return NextResponse.json({ received: true });
  }
  const expectsLivePayment = process.env.MERCADOPAGO_ENVIRONMENT === 'production';
  if (notification.data.live_mode !== undefined && notification.data.live_mode !== expectsLivePayment) {
    return NextResponse.json({ received: true, ignored: true });
  }

  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) {
    return NextResponse.json({ error: 'Payment provider is not configured.' }, { status: 503 });
  }

  let paymentResponse: Response;
  try {
    paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${encodeURIComponent(dataId)}`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(8000),
    });
  } catch (error) {
    console.error('Mercado Pago payment lookup failed:', error);
    return NextResponse.json({ error: 'Could not validate payment at provider.' }, { status: 503 });
  }

  if (!paymentResponse.ok) {
    console.error(`Mercado Pago payment lookup returned HTTP ${paymentResponse.status}.`);
    return NextResponse.json({ error: 'Could not validate payment at provider.' }, { status: 503 });
  }

  const payment = paymentSchema.safeParse(await paymentResponse.json());
  if (!payment.success || payment.data.id !== dataId || !payment.data.external_reference) {
    return NextResponse.json({ error: 'Provider returned invalid payment details.' }, { status: 400 });
  }
  if (payment.data.live_mode !== undefined && payment.data.live_mode !== expectsLivePayment) {
    return NextResponse.json({ received: true, ignored: true });
  }

  await releaseExpiredInventoryReservations();
  const order = await prisma.order.findUnique({ where: { id: payment.data.external_reference } });
  if (!order) {
    return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
  }

  const amountInCents = Math.round(payment.data.transaction_amount * 100);
  if (payment.data.currency_id !== 'BRL' || amountInCents !== order.total) {
    console.error(`Payment/order amount mismatch for order ${order.orderNumber}.`);
    return NextResponse.json({ received: true, ignored: true });
  }

  const statusMap: Record<string, { status: string; paymentStatus: string }> = {
    rejected: { status: 'REJECTED', paymentStatus: 'REJECTED' },
    cancelled: { status: 'CANCELLED', paymentStatus: 'CANCELLED' },
    refunded: { status: 'REFUNDED', paymentStatus: 'REFUNDED' },
    charged_back: { status: 'REFUNDED', paymentStatus: 'REFUNDED' },
  };
  const mapped = statusMap[payment.data.status];

  await prisma.$transaction(async (transaction) => {
    if (payment.data.status === 'approved') {
      const expiredInventory = order.inventoryStatus === 'RELEASED';
      await transaction.order.update({
        where: { id: order.id },
        data: {
          paymentProviderReference: payment.data.id,
          paymentStatus: 'PAID',
          status: expiredInventory ? 'PAID_REQUIRES_REVIEW' : 'PAID',
          inventoryStatus: order.inventoryStatus === 'HELD' ? 'COMMITTED' : order.inventoryStatus,
          inventoryReservationExpiresAt: null,
        },
      });
      await transaction.orderItem.updateMany({
        where: { orderId: order.id, inventoryReserved: true },
        data: { inventoryReserved: false },
      });
      return;
    }

    if (mapped && order.inventoryStatus === 'HELD' && ['REJECTED', 'CANCELLED'].includes(mapped.status)) {
      const released = await releaseOrderInventoryReservation(
        transaction,
        order.id,
        mapped.status,
        mapped.paymentStatus,
      );
      if (released) {
        await transaction.order.update({
          where: { id: order.id },
          data: { paymentProviderReference: payment.data.id },
        });
        return;
      }
    }

    const alreadyPaid = order.paymentStatus === 'PAID' &&
      payment.data.status !== 'refunded' &&
      payment.data.status !== 'charged_back';
    await transaction.order.update({
      where: { id: order.id },
      data: {
        paymentProviderReference: payment.data.id,
        ...(!alreadyPaid && mapped ? mapped : {}),
      },
    });
  });

  return NextResponse.json({ received: true });
}
