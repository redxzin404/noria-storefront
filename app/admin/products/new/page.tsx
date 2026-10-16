import Link from 'next/link';
import { redirect } from 'next/navigation';

import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { createProductAction } from '@/lib/admin-actions';

export const dynamic = 'force-dynamic';

export default async function NewProductPage() {
  const admin = await requireAdmin();

  if (!admin) {
    redirect('/login');
  }

  const categories = await prisma.category.findMany({
    where: { active: true },
    orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
  });
  const suppliers = await prisma.supplier.findMany({
    where: { active: true },
    orderBy: { name: 'asc' },
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 md:px-8 lg:px-12">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-[#656C57]">Catálogo</p>
          <h1 className="mt-2 text-4xl font-semibold text-[#292A24]">Novo produto</h1>
        </div>
        <Link href="/admin/products" className="rounded-full border border-[#E7E3DC] bg-white px-4 py-2 text-sm font-medium text-[#292A24]">
          Voltar
        </Link>
      </div>

      <form action={createProductAction} className="space-y-6 rounded-[1.75rem] border border-[#E7E3DC] bg-white p-6 md:p-8">
        <div className="grid gap-6 md:grid-cols-2">
          <label className="space-y-2 text-sm text-[#292A24]">
            <span>Nome</span>
            <input name="name" required className="w-full rounded-2xl border border-[#E7E3DC] bg-[#F7F4EF] px-4 py-3 outline-none focus:border-[#656C57]" />
          </label>

          <label className="space-y-2 text-sm text-[#292A24]">
            <span>Slug</span>
            <input name="slug" className="w-full rounded-2xl border border-[#E7E3DC] bg-[#F7F4EF] px-4 py-3 outline-none focus:border-[#656C57]" />
          </label>

          <label className="space-y-2 text-sm text-[#292A24] md:col-span-2">
            <span>Descrição</span>
            <textarea name="description" required rows={5} className="w-full rounded-2xl border border-[#E7E3DC] bg-[#F7F4EF] px-4 py-3 outline-none focus:border-[#656C57]" />
          </label>

          <label className="space-y-2 text-sm text-[#292A24]">
            <span>Resumo curto</span>
            <input name="shortDescription" className="w-full rounded-2xl border border-[#E7E3DC] bg-[#F7F4EF] px-4 py-3 outline-none focus:border-[#656C57]" />
          </label>

          <label className="space-y-2 text-sm text-[#292A24]">
            <span>SKU</span>
            <input name="sku" required className="w-full rounded-2xl border border-[#E7E3DC] bg-[#F7F4EF] px-4 py-3 outline-none focus:border-[#656C57]" />
          </label>

          <label className="space-y-2 text-sm text-[#292A24]">
            <span>Categoria</span>
            <select name="categoryId" className="w-full rounded-2xl border border-[#E7E3DC] bg-[#F7F4EF] px-4 py-3 outline-none focus:border-[#656C57]">
              <option value="">Sem categoria</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm text-[#292A24]">
            <span>Fornecedor (operação manual)</span>
            <select name="supplierId" className="w-full rounded-2xl border border-[#E7E3DC] bg-[#F7F4EF] px-4 py-3 outline-none focus:border-[#656C57]">
              <option value="">Sem fornecedor</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm text-[#292A24]">
            <span>Referência externa do produto</span>
            <input name="supplierProductReference" className="w-full rounded-2xl border border-[#E7E3DC] bg-[#F7F4EF] px-4 py-3 outline-none focus:border-[#656C57]" />
          </label>

          <label className="space-y-2 text-sm text-[#292A24]">
            <span>Preço</span>
            <input name="price" type="number" min="1" required className="w-full rounded-2xl border border-[#E7E3DC] bg-[#F7F4EF] px-4 py-3 outline-none focus:border-[#656C57]" />
          </label>

          <label className="space-y-2 text-sm text-[#292A24]">
            <span>Preço de comparação</span>
            <input name="compareAtPrice" type="number" min="0" className="w-full rounded-2xl border border-[#E7E3DC] bg-[#F7F4EF] px-4 py-3 outline-none focus:border-[#656C57]" />
          </label>

          <label className="space-y-2 text-sm text-[#292A24]">
            <span>Custo</span>
            <input name="costPrice" type="number" min="0" className="w-full rounded-2xl border border-[#E7E3DC] bg-[#F7F4EF] px-4 py-3 outline-none focus:border-[#656C57]" />
          </label>

          <label className="space-y-2 text-sm text-[#292A24]">
            <span>Estoque</span>
            <input name="stockQuantity" type="number" min="0" defaultValue={0} className="w-full rounded-2xl border border-[#E7E3DC] bg-[#F7F4EF] px-4 py-3 outline-none focus:border-[#656C57]" />
          </label>

          <div className="grid grid-cols-2 gap-3 md:col-span-2">
            <label className="space-y-2 text-sm text-[#292A24]">
              <span>Largura da embalagem (cm)</span>
              <input name="shippingWidthCm" type="number" min="1" className="w-full rounded-2xl border border-[#E7E3DC] bg-[#F7F4EF] px-4 py-3 outline-none focus:border-[#656C57]" />
            </label>
            <label className="space-y-2 text-sm text-[#292A24]">
              <span>Altura da embalagem (cm)</span>
              <input name="shippingHeightCm" type="number" min="1" className="w-full rounded-2xl border border-[#E7E3DC] bg-[#F7F4EF] px-4 py-3 outline-none focus:border-[#656C57]" />
            </label>
            <label className="space-y-2 text-sm text-[#292A24]">
              <span>Comprimento da embalagem (cm)</span>
              <input name="shippingLengthCm" type="number" min="1" className="w-full rounded-2xl border border-[#E7E3DC] bg-[#F7F4EF] px-4 py-3 outline-none focus:border-[#656C57]" />
            </label>
            <label className="space-y-2 text-sm text-[#292A24]">
              <span>Peso da embalagem (g)</span>
              <input name="shippingWeightGrams" type="number" min="1" className="w-full rounded-2xl border border-[#E7E3DC] bg-[#F7F4EF] px-4 py-3 outline-none focus:border-[#656C57]" />
            </label>
          </div>

          <label className="space-y-2 text-sm text-[#292A24]">
            <span>Material</span>
            <input name="material" className="w-full rounded-2xl border border-[#E7E3DC] bg-[#F7F4EF] px-4 py-3 outline-none focus:border-[#656C57]" />
          </label>

          <label className="space-y-2 text-sm text-[#292A24]">
            <span>Dimensões</span>
            <input name="dimensions" className="w-full rounded-2xl border border-[#E7E3DC] bg-[#F7F4EF] px-4 py-3 outline-none focus:border-[#656C57]" />
          </label>

          <label className="space-y-2 text-sm text-[#292A24] md:col-span-2">
            <span>Imagens (uma URL por linha ou separadas por vírgula)</span>
            <textarea name="images" rows={4} className="w-full rounded-2xl border border-[#E7E3DC] bg-[#F7F4EF] px-4 py-3 outline-none focus:border-[#656C57]" />
          </label>

          <label className="space-y-2 text-sm text-[#292A24]">
            <span>SEO: título</span>
            <input name="seoTitle" className="w-full rounded-2xl border border-[#E7E3DC] bg-[#F7F4EF] px-4 py-3 outline-none focus:border-[#656C57]" />
          </label>

          <label className="space-y-2 text-sm text-[#292A24]">
            <span>SEO: descrição</span>
            <input name="seoDescription" className="w-full rounded-2xl border border-[#E7E3DC] bg-[#F7F4EF] px-4 py-3 outline-none focus:border-[#656C57]" />
          </label>
        </div>

        <div className="flex flex-wrap gap-4 pt-4">
          <label className="inline-flex items-center gap-2 text-sm text-[#292A24]">
            <input name="active" type="checkbox" defaultChecked className="h-4 w-4" />
            Ativo
          </label>
          <label className="inline-flex items-center gap-2 text-sm text-[#292A24]">
            <input name="featured" type="checkbox" className="h-4 w-4" />
            Destaque
          </label>
          <label className="inline-flex items-center gap-2 text-sm text-[#292A24]">
            <input name="trackInventory" type="checkbox" defaultChecked className="h-4 w-4" />
            Controlar estoque
          </label>
        </div>

        <div className="flex justify-end">
          <button type="submit" className="rounded-full bg-[#292A24] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#1f201c]">
            Salvar produto
          </button>
        </div>
      </form>
    </div>
  );
}
