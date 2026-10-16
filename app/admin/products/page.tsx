import Link from 'next/link';
import { redirect } from 'next/navigation';

import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { formatCurrency } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function AdminProductsPage() {
  const admin = await requireAdmin();

  if (!admin) {
    redirect('/login');
  }

  const products = await prisma.product.findMany({
    include: { category: true, supplier: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-8 lg:px-12">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-[#656C57]">Administração</p>
          <h1 className="mt-2 text-4xl font-semibold text-[#292A24]">Produtos</h1>
        </div>
        <Link href="/admin" className="rounded-full border border-[#E7E3DC] bg-white px-4 py-2 text-sm font-medium text-[#292A24]">
          Voltar ao painel
        </Link>
      </div>

      <div className="mb-6 flex justify-end">
        <Link href="/admin/products/new" className="rounded-full bg-[#292A24] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#1f201c]">
          Novo produto
        </Link>
      </div>

      <div className="overflow-hidden rounded-[1.5rem] border border-[#E7E3DC] bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[#F7F4EF] text-[#292A24]">
            <tr>
              <th className="px-5 py-4">Produto</th>
              <th className="px-5 py-4">Categoria</th>
              <th className="px-5 py-4">Preço</th>
              <th className="px-5 py-4">Estoque</th>
              <th className="px-5 py-4">Fornecedor</th>
              <th className="px-5 py-4">Ações</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-t border-[#E7E3DC] align-top">
                <td className="px-5 py-4 font-medium text-[#292A24]">{product.name}</td>
                <td className="px-5 py-4 text-[#4A4D46]">{product.category?.name ?? 'Sem categoria'}</td>
                <td className="px-5 py-4 text-[#4A4D46]">{formatCurrency(product.price)}</td>
                <td className="px-5 py-4 text-[#4A4D46]">{product.stockQuantity}</td>
                <td className="px-5 py-4 text-[#4A4D46]">{product.supplier?.name ?? '—'}</td>
                <td className="px-5 py-4">
                  <Link href={`/admin/products/${product.id}`} className="text-sm font-medium text-[#656C57] underline-offset-4 hover:underline">
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
