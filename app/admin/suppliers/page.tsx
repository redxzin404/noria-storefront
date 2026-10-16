import Link from 'next/link';
import { redirect } from 'next/navigation';

import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function SuppliersPage() {
  const admin = await requireAdmin();

  if (!admin) {
    redirect('/login');
  }

  const suppliers = await prisma.supplier.findMany({
    orderBy: [{ active: 'desc' }, { name: 'asc' }],
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:px-8 lg:px-12">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-[#656C57]">Dropshipping</p>
          <h1 className="mt-2 text-4xl font-semibold text-[#292A24]">Fornecedores</h1>
        </div>
        <Link href="/admin" className="rounded-full border border-[#E7E3DC] bg-white px-4 py-2 text-sm font-medium text-[#292A24]">
          Voltar ao painel
        </Link>
      </div>

      <div className="mb-6 flex items-start justify-between gap-4">
        <p className="max-w-2xl text-sm leading-6 text-[#4A4D46]">
          Cadastro e acompanhamento são manuais. Este painel não sincroniza estoque nem transmite pedidos a fornecedores.
        </p>
        <Link href="/admin/suppliers/new" className="shrink-0 rounded-full bg-[#292A24] px-5 py-3 text-sm font-medium text-white">
          Novo fornecedor
        </Link>
      </div>

      <div className="overflow-hidden rounded-[1.5rem] border border-[#E7E3DC] bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[#F7F4EF] text-[#292A24]">
            <tr>
              <th className="px-5 py-4">Fornecedor</th>
              <th className="px-5 py-4">Contato</th>
              <th className="px-5 py-4">Prazo informado</th>
              <th className="px-5 py-4">Estado</th>
              <th className="px-5 py-4">Ação</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((supplier) => (
              <tr key={supplier.id} className="border-t border-[#E7E3DC]">
                <td className="px-5 py-4 font-medium text-[#292A24]">{supplier.name}</td>
                <td className="px-5 py-4 text-[#4A4D46]">{supplier.contactEmail ?? supplier.contactPhone ?? 'Não informado'}</td>
                <td className="px-5 py-4 text-[#4A4D46]">{supplier.processingTime ?? 'Não informado'}</td>
                <td className="px-5 py-4 text-[#4A4D46]">{supplier.active ? 'Ativo · manual' : 'Inativo'}</td>
                <td className="px-5 py-4">
                  <Link href={`/admin/suppliers/${supplier.id}`} className="font-medium text-[#656C57] underline-offset-4 hover:underline">
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
            {suppliers.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-[#656C57]">Nenhum fornecedor cadastrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
