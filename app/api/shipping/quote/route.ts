import { NextResponse } from 'next/server';
import { z } from 'zod';

import { prisma } from '@/lib/db';
import { releaseExpiredInventoryReservations } from '@/lib/integrations/inventory';
import { getMelhorEnvioQuotes } from '@/lib/integrations/melhorenvio';

const quoteRequestSchema = z.object({
  postalCode: z.string().trim().min(5).max(20).refine((value) => value.replace(/\D/g, '').length === 8),
  items: z.array(z.object({
    productId: z.string().min(1),
    quantity: z.number().int().min(1).max(99),
  })).min(1).max(50),
});

export async function POST(request: Request) {
  try {
    await releaseExpiredInventoryReservations();
  } catch (error) {
    console.error('Could not release expired stock reservations:', error);
    return NextResponse.json({ error: 'Não foi possível iniciar a cotação. Tente novamente.' }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'O corpo da solicitação deve conter JSON válido.' }, { status: 400 });
  }

  const parsed = quoteRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Informe um CEP válido e os produtos do carrinho.' }, { status: 400 });
  }

  const quantities = new Map<string, number>();
  for (const item of parsed.data.items) {
    quantities.set(item.productId, (quantities.get(item.productId) ?? 0) + item.quantity);
  }

  const products = await prisma.product.findMany({
    where: { id: { in: [...quantities.keys()] }, active: true },
  });
  if (products.length !== quantities.size) {
    return NextResponse.json({ error: 'Um ou mais produtos não estão mais disponíveis.' }, { status: 409 });
  }

  const items = products.map((product) => ({
    id: product.id,
    name: product.name,
    sku: product.sku,
    quantity: quantities.get(product.id) ?? 0,
    priceInCents: product.price,
    widthCm: product.shippingWidthCm,
    heightCm: product.shippingHeightCm,
    lengthCm: product.shippingLengthCm,
    weightGrams: product.shippingWeightGrams,
  }));
  const subtotalInCents = products.reduce(
    (sum, product) => sum + product.price * (quantities.get(product.id) ?? 0),
    0,
  );

  const hasToken = Boolean(process.env.MELHORENVIO_ACCESS_TOKEN?.trim());
  if (!hasToken && process.env.NODE_ENV !== 'production') {
    return NextResponse.json({
      demo: true,
      subtotalInCents,
      items: products.map((product) => ({
        productId: product.id,
        unitPriceInCents: product.price,
      })),
      options: [{
        code: 'DEMO-LOCAL',
        name: 'Demonstração local',
        carrier: 'Não contratado',
        priceInCents: 0,
        deliveryDays: 0,
      }],
    });
  }

  if (!hasToken) {
    return NextResponse.json({ error: 'Cotação indisponível: Melhor Envio não está configurado.' }, { status: 503 });
  }

  try {
    const options = await getMelhorEnvioQuotes(parsed.data.postalCode, items);
    if (options.length === 0) {
      return NextResponse.json({ error: 'Nenhuma opção de frete foi retornada para este endereço.' }, { status: 422 });
    }

    return NextResponse.json({
      demo: false,
      subtotalInCents,
      items: products.map((product) => ({
        productId: product.id,
        unitPriceInCents: product.price,
      })),
      options,
    });
  } catch (error) {
    console.error('Melhor Envio quote failed:', error);
    return NextResponse.json({ error: 'Não foi possível obter a cotação de frete. Confira CEPs e dados de embalagem.' }, { status: 502 });
  }
}
