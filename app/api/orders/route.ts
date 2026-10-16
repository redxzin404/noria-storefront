import { randomBytes } from 'node:crypto';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { prisma } from '@/lib/db';
import {
  releaseOrderInventoryReservation,
  releaseExpiredInventoryReservations,
  reserveOrderInventory,
  StockUnavailableError,
} from '@/lib/integrations/inventory';
import { createMercadoPagoPreference } from '@/lib/integrations/mercadopago';
import { getMelhorEnvioQuotes } from '@/lib/integrations/melhorenvio';

const orderSchema = z.object({
  customerEmail: z.string().trim().email().max(254),
  items: z.array(z.object({
    productId: z.string().min(1),
    quantity: z.number().int().min(1).max(99),
    variant: z.string().trim().max(120).nullable().optional(),
  })).min(1).max(50),
  shippingServiceCode: z.string().trim().min(1).max(80),
  shippingQuotePriceInCents: z.number().int().min(0),
  subtotalQuoteInCents: z.number().int().min(0),
  shippingAddress: z.object({
    recipientName: z.string().trim().min(2).max(160),
    postalCode: z.string().trim().min(5).max(20),
    street: z.string().trim().min(2).max(200),
    number: z.string().trim().min(1).max(40),
    complement: z.string().trim().max(120).nullable().optional(),
    neighborhood: z.string().trim().min(2).max(120),
    city: z.string().trim().min(2).max(120),
    state: z.string().trim().min(2).max(80),
    country: z.string().trim().min(2).max(80),
  }),
});

function isPaymentConfigured() {
  return Boolean(
    process.env.MERCADOPAGO_ACCESS_TOKEN?.trim() &&
    process.env.MERCADOPAGO_WEBHOOK_SECRET?.trim() &&
    process.env.NORIA_APP_URL?.trim() &&
    process.env.MERCADOPAGO_ENVIRONMENT?.trim(),
  );
}

function existingOrderResponse(order: {
  id: string;
  orderNumber: string;
  subtotal: number;
  shippingCost: number;
  total: number;
  paymentCheckoutUrl: string | null;
  paymentPreferenceId: string | null;
}) {
  if (order.paymentCheckoutUrl) {
    return NextResponse.json({
      ok: true,
      simulated: false,
      orderId: order.id,
      orderNumber: order.orderNumber,
      paymentUrl: order.paymentCheckoutUrl,
      subtotal: order.subtotal,
      shippingCost: order.shippingCost,
      total: order.total,
    });
  }
  if (!order.paymentPreferenceId && process.env.NODE_ENV !== 'production') {
    return NextResponse.json({
      ok: true,
      simulated: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      subtotal: order.subtotal,
      shippingCost: order.shippingCost,
      total: order.total,
    });
  }
  return NextResponse.json({ error: 'Este pedido já está sendo processado. Atualize a página antes de tentar novamente.' }, { status: 409 });
}

async function getShippingSelection(
  serviceCode: string,
  postalCode: string,
  products: Array<{
    id: string;
    name: string;
    sku: string;
    price: number;
    quantity: number;
    shippingWidthCm: number | null;
    shippingHeightCm: number | null;
    shippingLengthCm: number | null;
    shippingWeightGrams: number | null;
  }>,
) {
  const hasToken = Boolean(process.env.MELHORENVIO_ACCESS_TOKEN?.trim());
  if (!hasToken && process.env.NODE_ENV !== 'production' && serviceCode === 'DEMO-LOCAL') {
    return {
      code: 'DEMO-LOCAL',
      name: 'Demonstração local',
      priceInCents: 0,
      deliveryDays: 0,
    };
  }

  if (!hasToken) {
    throw new Error('Melhor Envio is not configured.');
  }

  const quotes = await getMelhorEnvioQuotes(postalCode, products.map((product) => ({
    id: product.id,
    name: product.name,
    sku: product.sku,
    quantity: product.quantity,
    priceInCents: product.price,
    widthCm: product.shippingWidthCm,
    heightCm: product.shippingHeightCm,
    lengthCm: product.shippingLengthCm,
    weightGrams: product.shippingWeightGrams,
  })));
  const selectedQuote = quotes.find((quote) => quote.code === serviceCode);
  if (!selectedQuote) {
    throw new Error('The selected shipping service is no longer available. Request a new quote.');
  }

  return {
    code: selectedQuote.code,
    name: `${selectedQuote.carrier} · ${selectedQuote.name}`,
    priceInCents: selectedQuote.priceInCents,
    deliveryDays: selectedQuote.deliveryDays,
  };
}

export async function POST(request: Request) {
  if (process.env.NORIA_DEMO_MODE === 'true') {
    return NextResponse.json(
      { error: 'O checkout está desativado nesta demonstração.' },
      { status: 503 },
    );
  }

  const idempotencyKey = request.headers.get('idempotency-key');
  if (!idempotencyKey || !z.string().uuid().safeParse(idempotencyKey).success) {
    return NextResponse.json({ error: 'Chave de idempotência ausente ou inválida.' }, { status: 400 });
  }

  await releaseExpiredInventoryReservations();
  const existingOrder = await prisma.order.findUnique({ where: { idempotencyKey } });
  if (existingOrder) {
    return existingOrderResponse(existingOrder);
  }

  let rawPayload: unknown;
  try {
    rawPayload = await request.json();
  } catch {
    return NextResponse.json({ error: 'O corpo da solicitação deve conter JSON válido.' }, { status: 400 });
  }

  const parsed = orderSchema.safeParse(rawPayload);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Revise o e-mail, endereço, frete e itens do pedido.' }, { status: 400 });
  }

  if (process.env.NODE_ENV === 'production' && (
    !isPaymentConfigured() ||
    !process.env.MELHORENVIO_ACCESS_TOKEN?.trim() ||
    process.env.MELHORENVIO_ENVIRONMENT !== 'production' ||
    process.env.MERCADOPAGO_ENVIRONMENT !== 'production'
  )) {
    return NextResponse.json(
      { error: 'Checkout indisponível: configure Mercado Pago e Melhor Envio antes de aceitar pedidos.' },
      { status: 503 },
    );
  }
  if (process.env.MERCADOPAGO_ACCESS_TOKEN && !isPaymentConfigured()) {
    return NextResponse.json(
      { error: 'O Mercado Pago precisa de token, webhook secret e URL pública configurados juntos.' },
      { status: 503 },
    );
  }

  const payload = parsed.data;
  const paymentToken = process.env.MERCADOPAGO_ACCESS_TOKEN?.trim();
  const reserveInventory = Boolean(paymentToken);
  const quantitiesByProduct = new Map<string, number>();
  for (const item of payload.items) {
    quantitiesByProduct.set(item.productId, (quantitiesByProduct.get(item.productId) ?? 0) + item.quantity);
  }

  const dbProducts = await prisma.product.findMany({
    where: { id: { in: [...quantitiesByProduct.keys()] }, active: true },
  });
  const productById = new Map(dbProducts.map((product) => [product.id, product]));

  if (productById.size !== quantitiesByProduct.size) {
    return NextResponse.json({ error: 'Um ou mais produtos não estão mais disponíveis.' }, { status: 409 });
  }

  for (const [productId, quantity] of quantitiesByProduct) {
    const product = productById.get(productId);
    if (!product || (product.trackInventory && product.stockQuantity < quantity)) {
      return NextResponse.json({ error: 'Estoque insuficiente para um ou mais produtos.' }, { status: 409 });
    }
  }

  const shippingProducts = [...quantitiesByProduct.entries()].flatMap(([productId, quantity]) => {
    const product = productById.get(productId);
    return product ? [{
      id: product.id,
      name: product.name,
      sku: product.sku,
      price: product.price,
      quantity,
      shippingWidthCm: product.shippingWidthCm,
      shippingHeightCm: product.shippingHeightCm,
      shippingLengthCm: product.shippingLengthCm,
      shippingWeightGrams: product.shippingWeightGrams,
    }] : [];
  });

  let shipping;
  try {
    shipping = await getShippingSelection(
      payload.shippingServiceCode,
      payload.shippingAddress.postalCode,
      shippingProducts,
    );
  } catch (error) {
    console.error('Shipping selection validation failed:', error);
    const message = error instanceof Error && error.message === 'Melhor Envio is not configured.'
      ? 'Cotação de frete indisponível. Configure Melhor Envio.'
      : 'A opção de frete expirou ou não pôde ser validada. Calcule novamente.';
    return NextResponse.json({ error: message }, { status: 409 });
  }
  if (shipping.priceInCents !== payload.shippingQuotePriceInCents) {
    return NextResponse.json({ error: 'O preço do frete mudou. Calcule novamente antes de pagar.' }, { status: 409 });
  }

  const subtotal = payload.items.reduce((sum, item) => {
    const product = productById.get(item.productId);
    return sum + (product?.price ?? 0) * item.quantity;
  }, 0);
  if (subtotal !== payload.subtotalQuoteInCents) {
    return NextResponse.json({ error: 'O preço de um produto mudou. Revise o carrinho e calcule o frete novamente.' }, { status: 409 });
  }
  const total = subtotal + shipping.priceInCents;
  const orderNumber = `N-${randomBytes(5).toString('hex').toUpperCase()}`;
  const reservationExpiresAt = new Date(Date.now() + 30 * 60 * 1000);
  const trackedItems = reserveInventory && payload.items.some((item) => productById.get(item.productId)?.trackInventory);

  try {
    const order = await prisma.$transaction(async (transaction) => {
      if (reserveInventory) {
        await reserveOrderInventory(transaction, payload.items.map((item) => {
          const product = productById.get(item.productId);
          if (!product) {
            throw new Error('Product disappeared while reserving stock.');
          }
          return {
            productId: product.id,
            quantity: item.quantity,
            trackInventory: product.trackInventory,
          };
        }));
      }

      const created = await transaction.order.create({
        data: {
          orderNumber,
          idempotencyKey,
          customerEmail: payload.customerEmail.toLowerCase(),
          status: 'PENDING',
          paymentStatus: 'PENDING',
          fulfillmentStatus: 'PENDING',
          subtotal,
          shippingCost: shipping.priceInCents,
          total,
          shippingServiceName: shipping.name,
          shippingServiceCode: shipping.code,
          shippingEstimatedDays: shipping.deliveryDays,
          shippingAddressSnapshot: JSON.stringify(payload.shippingAddress),
          inventoryStatus: trackedItems ? 'HELD' : 'NONE',
          inventoryReservationExpiresAt: trackedItems ? reservationExpiresAt : null,
        },
      });

      await transaction.orderItem.createMany({
        data: payload.items.map((item) => {
          const product = productById.get(item.productId);
          if (!product) {
            throw new Error('Produto do pedido indisponível após validação.');
          }

          return {
            orderId: created.id,
            productId: product.id,
            productName: product.name,
            sku: product.sku,
            variant: item.variant ?? null,
            quantity: item.quantity,
            inventoryReserved: reserveInventory && product.trackInventory,
            unitPrice: product.price,
            unitCost: product.costPrice,
            lineTotal: product.price * item.quantity,
          };
        }),
      });

      return created;
    });

    if (!paymentToken) {
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: 'Pagamento indisponível.' }, { status: 503 });
      }

      return NextResponse.json({
        ok: true,
        simulated: true,
        orderId: order.id,
        orderNumber: order.orderNumber,
        subtotal,
        shippingCost: shipping.priceInCents,
        total,
      });
    }

    let preference;
    try {
      preference = await createMercadoPagoPreference({
        orderId: order.id,
        orderNumber: order.orderNumber,
        customerEmail: order.customerEmail,
        shippingCostInCents: shipping.priceInCents,
        shippingName: shipping.name,
        items: payload.items.map((item) => {
          const product = productById.get(item.productId);
          if (!product) {
            throw new Error('Product disappeared while preparing payment.');
          }

          return {
            name: product.name,
            sku: product.sku,
            quantity: item.quantity,
            unitPriceInCents: product.price,
          };
        }),
        expiresAt: reservationExpiresAt,
      });
    } catch (error) {
      console.error('Mercado Pago preference creation failed:', error);
      await prisma.$transaction(async (transaction) => {
        const released = await releaseOrderInventoryReservation(
          transaction,
          order.id,
          'PAYMENT_SETUP_FAILED',
          'FAILED',
        );
        if (!released) {
          await transaction.order.update({
            where: { id: order.id },
            data: { status: 'PAYMENT_SETUP_FAILED', paymentStatus: 'FAILED' },
          });
        }
      });
      return NextResponse.json(
        { error: 'Não foi possível iniciar o pagamento. O pedido não foi pago; tente novamente ou contate a loja.' },
        { status: 502 },
      );
    }

    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentPreferenceId: preference.id,
        paymentCheckoutUrl: preference.checkoutUrl,
      },
    });

    return NextResponse.json({
      ok: true,
      simulated: false,
      orderId: order.id,
      orderNumber: order.orderNumber,
      paymentUrl: preference.checkoutUrl,
      subtotal,
      shippingCost: shipping.priceInCents,
      total,
    });
  } catch (error) {
    if (error instanceof StockUnavailableError) {
      return NextResponse.json({ error: 'O estoque foi alterado durante o checkout. Revise o carrinho.' }, { status: 409 });
    }
    const duplicateRequest = await prisma.order.findUnique({ where: { idempotencyKey } });
    if (duplicateRequest) {
      return existingOrderResponse(duplicateRequest);
    }
    console.error('Order creation failed:', error);
    return NextResponse.json({ error: 'Não foi possível criar este pedido.' }, { status: 500 });
  }
}
