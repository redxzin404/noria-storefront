import Link from 'next/link';
import { redirect } from 'next/navigation';

import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function AdminCategoriesPage() {
  const admin = await requireAdmin();

  if (!admin) {
    redirect('/login');
  }

  const categories = await prisma.category.findMany({ orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }] });

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:px-8 lg:px-12">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-[#656C57]">Administração</p>
          <h1 className="mt-2 text-4xl font-semibold text-[#292A24]">Categorias</h1>
        </div>
        <Link href="/admin" className="rounded-full border border-[#E7E3DC] bg-white px-4 py-2 text-sm font-medium text-[#292A24]">
          Voltar ao painel
        </Link>
      </div>

      <div className="mb-6 flex justify-end">
        <Link href="/admin/categories/new" className="rounded-full bg-[#292A24] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#1f201c]">
          Nova categoria
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {categories.map((category) => (
          <div key={category.id} className="rounded-[1.5rem] border border-[#E7E3DC] bg-white p-5">
            <h2 className="text-xl font-semibold text-[#292A24]">{category.name}</h2>
            <p className="mt-2 text-sm text-[#4A4D46]">{category.description ?? 'Sem descrição cadastrada'}</p>
            <div className="mt-4">
              <Link href={`/admin/categories/${category.id}`} className="text-sm font-medium text-[#656C57] underline-offset-4 hover:underline">
                Editar categoria
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
