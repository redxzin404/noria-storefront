import Link from 'next/link';
import { PackageCheck, ShoppingBag, UserRound, Warehouse } from 'lucide-react';
import { redirect } from 'next/navigation';

import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const admin = await requireAdmin();

  if (!admin) {
    redirect('/login');
  }

  const [products, orders, users, categories] = await Promise.all([
    prisma.product.count({ where: { active: true } }),
    prisma.order.count(),
    prisma.user.count(),
    prisma.category.count(),
  ]);

  const cards = [
    { title: 'Produtos ativos', value: products.toString(), icon: PackageCheck },
    { title: 'Pedidos', value: orders.toString(), icon: ShoppingBag },
    { title: 'Usuários', value: users.toString(), icon: UserRound },
    { title: 'Categorias', value: categories.toString(), icon: Warehouse },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-8 lg:px-12">
      <div className="mb-10 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-[#656C57]">Painel administrativo</p>
          <h1 className="mt-2 text-4xl font-semibold text-[#292A24]">Visão geral</h1>
        </div>
        <Link href="/catalog" className="rounded-full border border-[#E7E3DC] bg-white px-4 py-2 text-sm font-medium text-[#292A24]">
          Ver loja pública
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ icon: Icon, title, value }) => (
          <div key={title} className="rounded-[1.5rem] border border-[#E7E3DC] bg-white p-6">
            <div className="mb-4 inline-flex rounded-full bg-[#F7F4EF] p-3 text-[#292A24]">
              <Icon size={18} />
            </div>
            <p className="text-sm text-[#656C57]">{title}</p>
            <p className="mt-3 text-3xl font-semibold text-[#292A24]">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <Link href="/admin/products" className="rounded-[1.5rem] border border-[#E7E3DC] bg-white p-6 hover:bg-[#F7F4EF]">
          <h2 className="text-xl font-semibold text-[#292A24]">Produtos</h2>
          <p className="mt-2 text-[#4A4D46]">Gerenciar catálogo, estoque, preços, imagens e SEO.</p>
        </Link>
        <Link href="/admin/products/new" className="rounded-[1.5rem] border border-[#E7E3DC] bg-white p-6 hover:bg-[#F7F4EF]">
          <h2 className="text-xl font-semibold text-[#292A24]">Novo produto</h2>
          <p className="mt-2 text-[#4A4D46]">Cadastrar um item do catálogo em poucos passos.</p>
        </Link>
        <Link href="/admin/categories" className="rounded-[1.5rem] border border-[#E7E3DC] bg-white p-6 hover:bg-[#F7F4EF]">
          <h2 className="text-xl font-semibold text-[#292A24]">Categorias</h2>
          <p className="mt-2 text-[#4A4D46]">Organizar a navegação e a apresentação da loja.</p>
        </Link>
        <Link href="/admin/orders" className="rounded-[1.5rem] border border-[#E7E3DC] bg-white p-6 hover:bg-[#F7F4EF]">
          <h2 className="text-xl font-semibold text-[#292A24]">Pedidos</h2>
          <p className="mt-2 text-[#4A4D46]">Acompanhar status financeiro e logístico.</p>
        </Link>
        <Link href="/admin/suppliers" className="rounded-[1.5rem] border border-[#E7E3DC] bg-white p-6 hover:bg-[#F7F4EF]">
          <h2 className="text-xl font-semibold text-[#292A24]">Fornecedores</h2>
          <p className="mt-2 text-[#4A4D46]">Manter contatos e referências em operação manual.</p>
        </Link>
      </div>

      <div className="mt-6">
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/settings" className="inline-flex items-center rounded-full border border-[#E7E3DC] bg-[#F7F4EF] px-4 py-2 text-sm font-medium text-[#292A24]">
            Ajustes da loja
          </Link>
          <Link href="/admin/integrations" className="inline-flex items-center rounded-full border border-[#E7E3DC] bg-[#F7F4EF] px-4 py-2 text-sm font-medium text-[#292A24]">
            Status das integrações
          </Link>
        </div>
      </div>
    </div>
  );
}
