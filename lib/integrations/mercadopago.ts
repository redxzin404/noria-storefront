import { z } from 'zod';

const preferenceResponseSchema = z.object({
  id: z.string(),
  init_point: z.string().url(),
  sandbox_init_point: z.string().url().optional(),
});

export type MercadoPagoPreferenceInput = {
  orderId: string;
  orderNumber: string;
  customerEmail: string;
  shippingCostInCents: number;
  shippingName: string;
  expiresAt: Date;
  items: Array<{
    name: string;
    sku: string;
    quantity: number;
    unitPriceInCents: number;
  }>;
};

export type MercadoPagoPreference = {
  id: string;
  checkoutUrl: string;
};

function isMercadoPagoUrl(value: string) {
  const parsed = new URL(value);
  if (parsed.protocol !== 'https:') {
    return false;
  }
  const hostname = parsed.hostname.toLowerCase();
  return hostname === 'mercadopago.com' ||
    hostname.endsWith('.mercadopago.com') ||
    hostname === 'mercadopago.com.br' ||
    hostname.endsWith('.mercadopago.com.br');
}

function getPublicBaseUrl() {
  const configuredUrl = process.env.NORIA_APP_URL;
  if (!configuredUrl) {
    throw new Error('NORIA_APP_URL is required to create a payment preference.');
  }

  const parsedUrl = new URL(configuredUrl);
  const environment = process.env.MERCADOPAGO_ENVIRONMENT ?? 'sandbox';
  if (environment === 'production' && parsedUrl.protocol !== 'https:') {
    throw new Error('NORIA_APP_URL must use HTTPS for production payments.');
  }
  if (environment === 'sandbox' && parsedUrl.protocol !== 'https:' &&
    !['localhost', '127.0.0.1'].includes(parsedUrl.hostname)) {
    throw new Error('Sandbox NORIA_APP_URL must use HTTPS or a local development hostname.');
  }

  return parsedUrl.origin;
}

export async function createMercadoPagoPreference(input: MercadoPagoPreferenceInput): Promise<MercadoPagoPreference> {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error('MERCADOPAGO_ACCESS_TOKEN is not configured.');
  }

  const environment = process.env.MERCADOPAGO_ENVIRONMENT ?? 'sandbox';
  if (environment !== 'sandbox' && environment !== 'production') {
    throw new Error('MERCADOPAGO_ENVIRONMENT must be sandbox or production.');
  }
  if (environment === 'production' && accessToken.startsWith('TEST-')) {
    throw new Error('A sandbox token cannot be used in production mode.');
  }
  if (environment === 'sandbox' && !accessToken.startsWith('TEST-')) {
    throw new Error('Sandbox mode requires a Mercado Pago TEST- access token.');
  }

  const baseUrl = getPublicBaseUrl();
  const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Idempotency-Key': input.orderId,
    },
    body: JSON.stringify({
      external_reference: input.orderId,
      statement_descriptor: 'NORIA',
      payer: { email: input.customerEmail },
      items: input.items.map((item) => ({
        id: item.sku,
        title: item.name,
        quantity: item.quantity,
        unit_price: item.unitPriceInCents / 100,
        currency_id: 'BRL',
      })).concat(input.shippingCostInCents > 0 ? [{
        id: 'shipping',
        title: `Frete - ${input.shippingName}`,
        quantity: 1,
        unit_price: input.shippingCostInCents / 100,
        currency_id: 'BRL',
      }] : []),
      back_urls: {
        success: `${baseUrl}/order/${input.orderId}?payment=success`,
        pending: `${baseUrl}/order/${input.orderId}?payment=pending`,
        failure: `${baseUrl}/order/${input.orderId}?payment=failure`,
      },
      auto_return: 'approved',
      expires: true,
      expiration_date_from: new Date().toISOString(),
      expiration_date_to: input.expiresAt.toISOString(),
      notification_url: `${baseUrl}/api/webhooks/mercadopago`,
      metadata: {
        order_id: input.orderId,
        order_number: input.orderNumber,
      },
    }),
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    throw new Error(`Mercado Pago preference request failed with HTTP ${response.status}.`);
  }

  const parsed = preferenceResponseSchema.safeParse(await response.json());
  if (!parsed.success) {
    throw new Error('Mercado Pago returned an invalid preference response.');
  }

  const checkoutUrl = environment === 'sandbox'
    ? parsed.data.sandbox_init_point
    : parsed.data.init_point;
  if (!checkoutUrl || !isMercadoPagoUrl(checkoutUrl)) {
    throw new Error('Mercado Pago returned an invalid checkout URL for the selected environment.');
  }

  return { id: parsed.data.id, checkoutUrl };
}
