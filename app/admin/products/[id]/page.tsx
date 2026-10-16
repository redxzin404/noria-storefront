import Link from 'next/link';
import { redirect } from 'next/navigation';

import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { updateProductAction, deleteProductAction } from '@/lib/admin-actions';

export const dynamic = 'force-dynamic';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = await requireAdmin();

  if (!admin) {
    redirect('/login');
  }

  const product = await prisma.product.findUnique({ where: { id }, include: { supplier: true } });
  const categories = await prisma.category.findMany({
    where: { active: true },
    orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
  });
  if (!product) {
    redirect('/admin/products');
  }

  const suppliers = await prisma.supplier.findMany({
    where: product.supplierId
      ? { OR: [{ active: true }, { id: product.supplierId }] }
      : { active: true },
    orderBy: { name: 'asc' },
  });

  let imageText = '';
  try {
    const parsed = JSON.parse(product.images || '[]');
    imageText = Array.isArray(parsed) ? parsed.join('\n') : '';
  } catch {
    imageText = '';
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 md:px-8 lg:px-12">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-[#656C57]">Catálogo</p>
          <h1 className="mt-2 text-4xl font-semibold text-[#292A24]">Editar produto</h1>
        </div>
        <Link href="/admin/products" className="rounded-full border border-[#E7E3DC] bg-white px-4 py-2 text-sm font-medium text-[#292A24]">
          Voltar
        </Link>
      </div>

      <form action={updateProductAction} className="space-y-6 rounded-[1.75rem] border border-[#E7E3DC] bg-white p-6 md:p-8">
        <input type="hidden" name="id" value={product.id} />

        <div className="grid gap-6 md:grid-cols-2">
          <label className="space-y-2 text-sm text-[#292A24]">
            <span>Nome</span>
            <input name="name" defaultValue={product.name} required className="w-full rounded-2xl border border-[#E7E3DC] bg-[#F7F4EF] px-4 py-3 outline-none focus:border-[#656C57]" />
          </label>

          <label className="space-y-2 text-sm text-[#292A24]">
            <span>Slug</span>
            <input name="slug" defaultValue={product.slug} className="w-full rounded-2xl border border-[#E7E3DC] bg-[#F7F4EF] px-4 py-3 outline-none focus:border-[#656C57]" />
          </label>

          <label className="space-y-2 text-sm text-[#292A24] md:col-span-2">
            <span>Descrição</span>
            <textarea name="description" defaultValue={product.description} rows={5} required className="w-full rounded-2xl border border-[#E7E3DC] bg-[#F7F4EF] px-4 py-3 outline-none focus:border-[#656C57]" />
          </label>

          <label className="space-y-2 text-sm text-[#292A24]">
            <span>Resumo curto</span>
            <input name="shortDescription" defaultValue={product.shortDescription ?? ''} className="w-full rounded-2xl border border-[#E7E3DC] bg-[#F7F4EF] px-4 py-3 outline-none focus:border-[#656C57]" />
          </label>

          <label className="space-y-2 text-sm text-[#292A24]">
            <span>SKU</span>
            <input name="sku" defaultValue={product.sku} required className="w-full rounded-2xl border border-[#E7E3DC] bg-[#F7F4EF] px-4 py-3 outline-none focus:border-[#656C57]" />
          </label>

          <label className="space-y-2 text-sm text-[#292A24]">
            <span>Categoria</span>
            <select name="categoryId" defaultValue={product.categoryId ?? ''} className="w-full rounded-2xl border border-[#E7E3DC] bg-[#F7F4EF] px-4 py-3 outline-none focus:border-[#656C57]">
              <option value="">Sem categoria</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm text-[#292A24]">
            <span>Fornecedor (operação manual)</span>
            <select name="supplierId" defaultValue={product.supplierId ?? ''} className="w-full rounded-2xl border border-[#E7E3DC] bg-[#F7F4EF] px-4 py-3 outline-none focus:border-[#656C57]">
              <option value="">Sem fornecedor</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm text-[#292A24]">
            <span>Referência externa do produto</span>
            <input name="supplierProductReference" defaultValue={product.supplierProductReference ?? ''} className="w-full rounded-2xl border border-[#E7E3DC] bg-[#F7F4EF] px-4 py-3 outline-none focus:border-[#656C57]" />
          </label>

          <label className="space-y-2 text-sm text-[#292A24]">
            <span>Preço</span>
            <input name="price" type="number" min="1" defaultValue={product.price} required className="w-full rounded-2xl border border-[#E7E3DC] bg-[#F7F4EF] px-4 py-3 outline-none focus:border-[#656C57]" />
          </label>

          <label className="space-y-2 text-sm text-[#292A24]">
            <span>Preço de comparação</span>
            <input name="compareAtPrice" type="number" min="0" defaultValue={product.compareAtPrice ?? ''} className="w-full rounded-2xl border border-[#E7E3DC] bg-[#F7F4EF] px-4 py-3 outline-none focus:border-[#656C57]" />
          </label>

          <label className="space-y-2 text-sm text-[#292A24]">
            <span>Custo</span>
            <input name="costPrice" type="number" min="0" defaultValue={product.costPrice ?? ''} className="w-full rounded-2xl border border-[#E7E3DC] bg-[#F7F4EF] px-4 py-3 outline-none focus:border-[#656C57]" />
          </label>

          <label className="space-y-2 text-sm text-[#292A24]">
            <span>Estoque</span>
            <input name="stockQuantity" type="number" min="0" defaultValue={product.stockQuantity} className="w-full rounded-2xl border border-[#E7E3DC] bg-[#F7F4EF] px-4 py-3 outline-none focus:border-[#656C57]" />
          </label>

          <div className="grid grid-cols-2 gap-3 md:col-span-2">
            <label className="space-y-2 text-sm text-[#292A24]">
              <span>Largura da embalagem (cm)</span>
              <input name="shippingWidthCm" type="number" min="1" defaultValue={product.shippingWidthCm ?? ''} className="w-full rounded-2xl border border-[#E7E3DC] bg-[#F7F4EF] px-4 py-3 outline-none focus:border-[#656C57]" />
            </label>
            <label className="space-y-2 text-sm text-[#292A24]">
              <span>Altura da embalagem (cm)</span>
              <input name="shippingHeightCm" type="number" min="1" defaultValue={product.shippingHeightCm ?? ''} className="w-full rounded-2xl border border-[#E7E3DC] bg-[#F7F4EF] px-4 py-3 outline-none focus:border-[#656C57]" />
            </label>
            <label className="space-y-2 text-sm text-[#292A24]">
              <span>Comprimento da embalagem (cm)</span>
              <input name="shippingLengthCm" type="number" min="1" defaultValue={product.shippingLengthCm ?? ''} className="w-full rounded-2xl border border-[#E7E3DC] bg-[#F7F4EF] px-4 py-3 outline-none focus:border-[#656C57]" />
            </label>
            <label className="space-y-2 text-sm text-[#292A24]">
              <span>Peso da embalagem (g)</span>
              <input name="shippingWeightGrams" type="number" min="1" defaultValue={product.shippingWeightGrams ?? ''} className="w-full rounded-2xl border border-[#E7E3DC] bg-[#F7F4EF] px-4 py-3 outline-none focus:border-[#656C57]" />
            </label>
          </div>

          <label className="space-y-2 text-sm text-[#292A24]">
            <span>Material</span>
            <input name="material" defaultValue={product.material ?? ''} className="w-full rounded-2xl border border-[#E7E3DC] bg-[#F7F4EF] px-4 py-3 outline-none focus:border-[#656C57]" />
          </label>

          <label className="space-y-2 text-sm text-[#292A24]">
            <span>Dimensões</span>
            <input name="dimensions" defaultValue={product.dimensions ?? ''} className="w-full rounded-2xl border border-[#E7E3DC] bg-[#F7F4EF] px-4 py-3 outline-none focus:border-[#656C57]" />
          </label>

          <label className="space-y-2 text-sm text-[#292A24] md:col-span-2">
            <span>Imagens</span>
            <textarea name="images" rows={4} defaultValue={imageText} className="w-full rounded-2xl border border-[#E7E3DC] bg-[#F7F4EF] px-4 py-3 outline-none focus:border-[#656C57]" />
          </label>

          <label className="space-y-2 text-sm text-[#292A24]">
            <span>SEO: título</span>
            <input name="seoTitle" defaultValue={product.seoTitle ?? ''} className="w-full rounded-2xl border border-[#E7E3DC] bg-[#F7F4EF] px-4 py-3 outline-none focus:border-[#656C57]" />
          </label>

          <label className="space-y-2 text-sm text-[#292A24]">
            <span>SEO: descrição</span>
            <input name="seoDescription" defaultValue={product.seoDescription ?? ''} className="w-full rounded-2xl border border-[#E7E3DC] bg-[#F7F4EF] px-4 py-3 outline-none focus:border-[#656C57]" />
          </label>
        </div>

        <div className="flex flex-wrap gap-4 pt-4">
          <label className="inline-flex items-center gap-2 text-sm text-[#292A24]">
            <input name="active" type="checkbox" defaultChecked={product.active} className="h-4 w-4" />
            Ativo
          </label>
          <label className="inline-flex items-center gap-2 text-sm text-[#292A24]">
            <input name="featured" type="checkbox" defaultChecked={product.featured} className="h-4 w-4" />
            Destaque
          </label>
          <label className="inline-flex items-center gap-2 text-sm text-[#292A24]">
            <input name="trackInventory" type="checkbox" defaultChecked={product.trackInventory} className="h-4 w-4" />
            Controlar estoque
          </label>
        </div>

        <div className="flex justify-between gap-4">
          <button type="submit" formAction={deleteProductAction} className="rounded-full border border-[#B85C4A] bg-[#FFF7F3] px-5 py-3 text-sm font-medium text-[#B85C4A]">
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
