import { z } from 'zod';

const quoteResponseSchema = z.array(z.object({
  id: z.union([z.string(), z.number()]).transform(String),
  name: z.string(),
  price: z.union([z.string(), z.number()]).transform(Number).optional(),
  custom_price: z.union([z.string(), z.number()]).transform(Number).optional(),
  delivery_time: z.number().int().nonnegative().optional(),
  custom_delivery_time: z.number().int().nonnegative().optional(),
  company: z.object({ name: z.string() }).optional(),
}));

export type ShippingQuoteItem = {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  priceInCents: number;
  widthCm: number | null;
  heightCm: number | null;
  lengthCm: number | null;
  weightGrams: number | null;
};

export type ShippingQuote = {
  code: string;
  name: string;
  carrier: string;
  priceInCents: number;
  deliveryDays: number;
};

export async function getMelhorEnvioQuotes(
  destinationPostalCode: string,
  items: ShippingQuoteItem[],
): Promise<ShippingQuote[]> {
  const token = process.env.MELHORENVIO_ACCESS_TOKEN;
  const originPostalCode = process.env.STORE_ORIGIN_POSTAL_CODE?.replace(/\D/g, '');
  if (!token || !originPostalCode) {
    throw new Error('Melhor Envio token or store origin postal code is not configured.');
  }

  const destination = destinationPostalCode.replace(/\D/g, '');
  if (originPostalCode.length !== 8 || destination.length !== 8) {
    throw new Error('Origin and destination postal codes must contain 8 digits.');
  }
  if (!items.length || items.some((item) =>
    !item.widthCm || !item.heightCm || !item.lengthCm || !item.weightGrams
  )) {
    throw new Error('Every product must have package dimensions and weight before shipping can be quoted.');
  }

  const environment = process.env.MELHORENVIO_ENVIRONMENT ?? 'sandbox';
  if (environment !== 'sandbox' && environment !== 'production') {
    throw new Error('MELHORENVIO_ENVIRONMENT must be sandbox or production.');
  }
  const host = environment === 'sandbox'
    ? 'https://sandbox.melhorenvio.com.br'
    : 'https://melhorenvio.com.br';
  const contactEmail = process.env.STORE_CONTACT_EMAIL;
  if (!contactEmail) {
    throw new Error('STORE_CONTACT_EMAIL is required for the Melhor Envio User-Agent.');
  }

  const response = await fetch(`${host}/api/v2/me/shipment/calculate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'User-Agent': `NORIA (${contactEmail})`,
    },
    body: JSON.stringify({
      from: { postal_code: originPostalCode },
      to: { postal_code: destination },
      products: items.map((item) => ({
        id: item.id,
        width: item.widthCm,
        height: item.heightCm,
        length: item.lengthCm,
        weight: (item.weightGrams ?? 0) / 1000,
        insurance_value: item.priceInCents / 100,
        quantity: item.quantity,
      })),
    }),
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    throw new Error(`Melhor Envio quote request failed with HTTP ${response.status}.`);
  }

  const parsed = quoteResponseSchema.safeParse(await response.json());
  if (!parsed.success) {
    throw new Error('Melhor Envio returned an invalid quote response.');
  }

  return parsed.data.flatMap((quote) => {
    const price = quote.custom_price ?? quote.price;
    if (price === undefined || !Number.isFinite(price) || price < 0) {
      return [];
    }

    return [{
      code: quote.id,
      name: quote.name,
      carrier: quote.company?.name ?? 'Transportadora',
      priceInCents: Math.round(price * 100),
      deliveryDays: quote.custom_delivery_time ?? quote.delivery_time ?? 0,
    }];
  });
}
