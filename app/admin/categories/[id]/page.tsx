import Link from 'next/link';
import { redirect } from 'next/navigation';

import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { updateCategoryAction, deleteCategoryAction } from '@/lib/admin-actions';

export const dynamic = 'force-dynamic';

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = await requireAdmin();

  if (!admin) {
    redirect('/login');
  }

  const category = await prisma.category.findUnique({ where: { id } });

  if (!category) {
    redirect('/admin/categories');
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:px-8 lg:px-12">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-[#656C57]">Categorias</p>
          <h1 className="mt-2 text-4xl font-semibold text-[#292A24]">Editar categoria</h1>
        </div>
        <Link href="/admin/categories" className="rounded-full border border-[#E7E3DC] bg-white px-4 py-2 text-sm font-medium text-[#292A24]">
          Voltar
        </Link>
      </div>

      <form action={updateCategoryAction} className="space-y-6 rounded-[1.75rem] border border-[#E7E3DC] bg-white p-6 md:p-8">
        <input type="hidden" name="id" value={category.id} />

        <div className="grid gap-6 md:grid-cols-2">
          <label className="space-y-2 text-sm text-[#292A24] md:col-span-2">
            <span>Nome</span>
            <input name="name" defaultValue={category.name} required className="w-full rounded-2xl border border-[#E7E3DC] bg-[#F7F4EF] px-4 py-3 outline-none focus:border-[#656C57]" />
          </label>

          <label className="space-y-2 text-sm text-[#292A24]">
            <span>Slug</span>
            <input name="slug" defaultValue={category.slug} className="w-full rounded-2xl border border-[#E7E3DC] bg-[#F7F4EF] px-4 py-3 outline-none focus:border-[#656C57]" />
          </label>

          <label className="space-y-2 text-sm text-[#292A24]">
            <span>Ordem</span>
            <input name="displayOrder" type="number" min="0" defaultValue={category.displayOrder} className="w-full rounded-2xl border border-[#E7E3DC] bg-[#F7F4EF] px-4 py-3 outline-none focus:border-[#656C57]" />
          </label>

          <label className="space-y-2 text-sm text-[#292A24] md:col-span-2">
            <span>Descrição</span>
            <textarea name="description" rows={4} defaultValue={category.description ?? ''} className="w-full rounded-2xl border border-[#E7E3DC] bg-[#F7F4EF] px-4 py-3 outline-none focus:border-[#656C57]" />
          </label>

          <label className="space-y-2 text-sm text-[#292A24] md:col-span-2">
            <span>Imagem de destaque</span>
            <input name="image" defaultValue={category.image ?? ''} className="w-full rounded-2xl border border-[#E7E3DC] bg-[#F7F4EF] px-4 py-3 outline-none focus:border-[#656C57]" />
          </label>
        </div>

        <label className="inline-flex items-center gap-2 text-sm text-[#292A24]">
          <input name="active" type="checkbox" defaultChecked={category.active} className="h-4 w-4" />
          Categoria ativa
        </label>

        <div className="flex justify-between gap-4">
          <button type="submit" formAction={deleteCategoryAction} className="rounded-full border border-[#B85C4A] bg-[#FFF7F3] px-5 py-3 text-sm font-medium text-[#B85C4A]">
            Excluir
          </button>

          <button type="submit" className="rounded-full bg-[#292A24] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#1f201c]">
            Salvar alterações
          </button>
        </div>
      </form>
    </div>
  );
}
