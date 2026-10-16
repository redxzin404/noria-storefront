import { afterEach, describe, expect, it } from 'vitest';

import { getIntegrationStatuses } from './integrations';

const integrationVariables = [
  'MERCADOPAGO_ACCESS_TOKEN',
  'MERCADOPAGO_WEBHOOK_SECRET',
  'MERCADOPAGO_ENVIRONMENT',
  'NORIA_APP_URL',
  'MELHORENVIO_ACCESS_TOKEN',
  'MELHORENVIO_ENVIRONMENT',
  'STORE_ORIGIN_POSTAL_CODE',
  'STORE_CONTACT_EMAIL',
] as const;

const originalValues = new Map(integrationVariables.map((key) => [key, process.env[key]]));

afterEach(() => {
  for (const key of integrationVariables) {
    const original = originalValues.get(key);
    if (original === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = original;
    }
  }
});

describe('integration status', () => {
  it('marks each provider as not configured when required environment values are missing', () => {
    for (const key of integrationVariables) {
      delete process.env[key];
    }

    expect(getIntegrationStatuses().map(({ state }) => state)).toEqual([
      'not-configured',
      'not-configured',
      'manual-only',
    ]);
  });

  it('only reports credential presence and never returns secret values', () => {
    for (const key of integrationVariables) {
      process.env[key] = 'test-secret-value';
    }

    const statuses = getIntegrationStatuses();
    expect(statuses[0]?.configured && statuses[0].state === 'credentials-present').toBe(true);
    expect(statuses[1]?.configured && statuses[1].state === 'credentials-present').toBe(true);
    expect(JSON.stringify(statuses)).not.toContain('test-secret-value');
  });
});
