export type IntegrationStatus = {
  key: string;
  title: string;
  description: string;
  configured: boolean;
  state: 'not-configured' | 'credentials-present' | 'manual-only';
  requiredVariables: readonly string[];
};

const integrationDefinitions = [
  {
    key: 'payments',
    title: 'Mercado Pago',
    description: 'Checkout Pro e confirmação confiável por webhook. Configure as credenciais de teste antes de qualquer teste de pagamento.',
    requiredVariables: ['MERCADOPAGO_ACCESS_TOKEN', 'MERCADOPAGO_WEBHOOK_SECRET', 'MERCADOPAGO_ENVIRONMENT', 'NORIA_APP_URL'],
  },
  {
    key: 'shipping',
    title: 'Melhor Envio',
    description: 'Cotação de serviços com CEP de origem e dimensões/peso reais cadastrados nos produtos. A geração de etiqueta não está habilitada.',
    requiredVariables: ['MELHORENVIO_ACCESS_TOKEN', 'MELHORENVIO_ENVIRONMENT', 'STORE_ORIGIN_POSTAL_CODE', 'STORE_CONTACT_EMAIL'],
  },
  {
    key: 'supplier',
    title: 'Fornecedores',
    description: 'Cadastro de fornecedores disponível para operação manual. Não há sincronização nem transmissão automática de pedidos.',
    requiredVariables: [],
  },
] as const;

export function getIntegrationStatuses(): IntegrationStatus[] {
  return integrationDefinitions.map((definition) => {
    const configured = definition.requiredVariables.length > 0 &&
      definition.requiredVariables.every((name) => Boolean(process.env[name]?.trim()));

    return {
      ...definition,
      configured,
      state: definition.key === 'supplier' ? 'manual-only' : configured ? 'credentials-present' : 'not-configured',
    };
  });
}
