import { createHmac } from 'node:crypto';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createMercadoPagoPreference } from './mercadopago';
import { verifyMercadoPagoSignature } from './mercadopago-webhook';
import { getMelhorEnvioQuotes } from './melhorenvio';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('Mercado Pago Checkout Pro adapter', () => {
  it('creates a sandbox preference using server-calculated product and shipping prices', async () => {
    vi.stubEnv('MERCADOPAGO_ACCESS_TOKEN', 'TEST-token');
    vi.stubEnv('MERCADOPAGO_ENVIRONMENT', 'sandbox');
    vi.stubEnv('NORIA_APP_URL', 'http://localhost:3000');
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      id: 'preference-123',
      init_point: 'https://www.mercadopago.com/checkout/start',
      sandbox_init_point: 'https://sandbox.mercadopago.com/checkout/start',
    }), { status: 201 }));
    vi.stubGlobal('fetch', fetchMock);

    const preference = await createMercadoPagoPreference({
      orderId: 'order-1',
      orderNumber: 'N-123',
      customerEmail: 'customer@example.com',
      shippingCostInCents: 1200,
      shippingName: 'PAC',
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      items: [{ name: 'Vaso', sku: 'NO-1', quantity: 2, unitPriceInCents: 17900 }],
    });

    expect(preference).toEqual({
      id: 'preference-123',
      checkoutUrl: 'https://sandbox.mercadopago.com/checkout/start',
    });
    const [, request] = fetchMock.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(String(request.body)) as {
      external_reference: string;
      items: Array<{ title: string; quantity: number; unit_price: number }>;
    };
    expect(body.external_reference).toBe('order-1');
    expect(body.items).toHaveLength(2);
    expect(body.items[0]).toMatchObject({ title: 'Vaso', quantity: 2, unit_price: 179 });
    expect(body.items[1]).toMatchObject({ title: 'Frete - PAC', unit_price: 12 });
  });
});

describe('Mercado Pago webhook signatures', () => {
  it('verifies the documented request manifest and rejects tampering', () => {
    const secret = 'webhook-test-secret';
    const dataId = '98765';
    const requestId = 'request-123';
    const timestamp = '1704908010';
    const manifest = `id:${dataId};request-id:${requestId};ts:${timestamp};`;
    const signature = createHmac('sha256', secret).update(manifest).digest('hex');

    expect(verifyMercadoPagoSignature({
      dataId,
      requestId,
      signature: `ts=${timestamp},v1=${signature}`,
      secret,
    })).toBe(true);
    expect(verifyMercadoPagoSignature({
      dataId,
      requestId,
      signature: `ts=${timestamp},v1=${'0'.repeat(64)}`,
      secret,
    })).toBe(false);
  });
});

describe('Melhor Envio quote adapter', () => {
  it('uses custom account quote values when returned and sends physical package data', async () => {
    vi.stubEnv('MELHORENVIO_ACCESS_TOKEN', 'sandbox-token');
    vi.stubEnv('MELHORENVIO_ENVIRONMENT', 'sandbox');
    vi.stubEnv('STORE_ORIGIN_POSTAL_CODE', '96020360');
    vi.stubEnv('STORE_CONTACT_EMAIL', 'support@example.com');
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify([{
      id: 1,
      name: 'PAC',
      price: '25.90',
      custom_price: '22.50',
      delivery_time: 8,
      custom_delivery_time: 6,
      company: { name: 'Correios' },
    }]), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    const quotes = await getMelhorEnvioQuotes('01018020', [{
      id: 'product-1',
      name: 'Vaso',
      sku: 'NO-1',
      quantity: 2,
      priceInCents: 17900,
      widthCm: 20,
      heightCm: 15,
      lengthCm: 20,
      weightGrams: 500,
    }]);

    expect(quotes).toEqual([{
      code: '1',
      name: 'PAC',
      carrier: 'Correios',
      priceInCents: 2250,
      deliveryDays: 6,
    }]);
    expect(fetchMock.mock.calls[0]?.[0]).toBe('https://sandbox.melhorenvio.com.br/api/v2/me/shipment/calculate');
    const request = fetchMock.mock.calls[0]?.[1] as RequestInit;
    const body = JSON.parse(String(request.body)) as { products: Array<{ weight: number; insurance_value: number }> };
    expect(body.products[0]).toMatchObject({ weight: 0.5, insurance_value: 179 });
  });
});
