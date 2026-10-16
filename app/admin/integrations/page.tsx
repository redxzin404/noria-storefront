import Link from 'next/link';
import { redirect } from 'next/navigation';

import { requireAdmin } from '@/lib/auth';
import { getIntegrationStatuses } from '@/lib/integrations';

export const dynamic = 'force-dynamic';

export default async function IntegrationsPage() {
  const admin = await requireAdmin();

  if (!admin) {
    redirect('/login');
  }

  const integrations = getIntegrationStatuses();

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 md:px-8 lg:px-12">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-[#656C57]">Operação</p>
          <h1 className="mt-2 text-4xl font-semibold text-[#292A24]">Integrações</h1>
        </div>
        <Link href="/admin" className="rounded-full border border-[#E7E3DC] bg-white px-4 py-2 text-sm font-medium text-[#292A24]">
          Voltar ao painel
        </Link>
      </div>

      <div role="status" className="mb-8 rounded-2xl border border-[#E7E3DC] bg-[#F7F4EF] p-5 text-sm leading-6 text-[#4A4D46]">
        Esta tela informa apenas se as variáveis de configuração estão presentes no servidor. A presença de credenciais não testa nem confirma conexão com um serviço. Nenhuma chave secreta é exibida no navegador.
      </div>

      <div className="grid gap-5">
        {integrations.map((integration) => (
          <section key={integration.key} className="rounded-[1.5rem] border border-[#E7E3DC] bg-white p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-[#292A24]">{integration.title}</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#4A4D46]">{integration.description}</p>
              </div>
              <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${integration.state === 'credentials-present' ? 'bg-[#F0F2EC] text-[#4E5A3D]' : 'bg-[#FFF4E8] text-[#8C5B25]'}`}>
                {integration.state === 'manual-only' ? 'Somente operação manual' : integration.configured ? 'Credenciais presentes — conexão não testada' : 'Não configurado'}
              </span>
            </div>
            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#656C57]">Variáveis necessárias no servidor</p>
              <ul className="mt-2 grid gap-2 sm:grid-cols-2">
                {integration.requiredVariables.map((variable) => (
                  <li key={variable} className="rounded-xl bg-[#F7F4EF] px-3 py-2 font-mono text-xs text-[#4A4D46]">
                    <span aria-hidden="true">{process.env[variable]?.trim() ? '●' : '○'}</span>{' '}
                    {variable}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ))}
      </div>

      <section className="mt-8 rounded-[1.5rem] border border-[#E7E3DC] bg-white p-6">
        <h2 className="text-lg font-semibold text-[#292A24]">Estado do checkout</h2>
        <p className="mt-2 text-sm leading-6 text-[#4A4D46]">
          O checkout local de demonstração não cobra pagamentos, não gera etiquetas e não envia pedidos a fornecedores. As integrações devem ser testadas em sandbox; presença de credenciais não significa que o serviço respondeu ou está apto para produção.
        </p>
      </section>
    </div>
  );
}
