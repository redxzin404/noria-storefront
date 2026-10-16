import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ShieldCheck, Truck } from 'lucide-react';

import { AddToCartButton } from '@/components/cart/AddToCartButton';
import { ProductCard } from '@/components/products/ProductCard';
import { getCatalogProducts, getProductBySlug } from '@/lib/store';
import { formatCurrency, parseJsonArray } from '@/lib/utils';

type ProductVariant = {
  label?: string;
  name?: string;
  value?: string;
};

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product || !product.active) {
    notFound();
  }

  const related = await getCatalogProducts({ category: product.category?.slug, page: 1, pageSize: 3 });

  const images = parseJsonArray<string>(product.images);
  const variants = parseJsonArray<ProductVariant>(product.variants);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 lg:px-12">
      <Link href="/catalog" className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-[#292A24]">
        <ArrowLeft size={16} /> Voltar ao catálogo
      </Link>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <div className="overflow-hidden rounded-[2rem] border border-[#E7E3DC] bg-white">
            <img
              src={images[0] ?? 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80'}
              alt={product.name}
              className="h-[520px] w-full object-cover"
            />
          </div>
          {images.length > 1 && (
            <div className="mt-4 grid grid-cols-3 gap-4">
              {images.slice(1, 4).map((image, index) => (
                <img key={`${image}-${index}`} src={image} alt={`${product.name} ${index + 2}`} className="h-28 w-full rounded-[1rem] object-cover" />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-[#656C57]">{product.category?.name ?? 'Peça essencial'}</p>
            <h1 className="mt-2 text-4xl font-semibold text-[#292A24]">{product.name}</h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-3xl font-semibold text-[#292A24]">{formatCurrency(product.price)}</span>
            {product.compareAtPrice && product.compareAtPrice > product.price ? (
              <span className="text-lg text-[#656C57] line-through">{formatCurrency(product.compareAtPrice)}</span>
            ) : null}
          </div>

          <p className="text-base leading-7 text-[#4A4D46]">{product.description}</p>

          <div className="rounded-[1.5rem] border border-[#E7E3DC] bg-white p-4">
            <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-[#656C57]">Variações</p>
            <div className="flex flex-wrap gap-2">
              {variants.length > 0 ? variants.map((variant) => (
                <span key={variant.name ?? variant.value ?? variant.label ?? 'variant'} className="rounded-full border border-[#E7E3DC] bg-[#F7F4EF] px-3 py-1.5 text-sm text-[#292A24]">
                  {variant.label ?? variant.name ?? variant.value ?? 'Opção'}
                </span>
              )) : <span className="text-sm text-[#4A4D46]">Sem variação de acabamento disponível no momento.</span>}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <AddToCartButton product={product} />
          </div>

          <div className="grid gap-4 rounded-[1.5rem] border border-[#E7E3DC] bg-[#F7F4EF] p-5 text-sm text-[#4A4D46]">
            <div className="flex items-center gap-3">
              <Truck size={18} className="text-[#656C57]" />
              <span>Entrega estimada em 3 a 7 dias úteis.</span>
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck size={18} className="text-[#656C57]" />
              <span>Troca facilitada em até 7 dias após entrega.</span>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-[#E7E3DC] bg-white p-5">
            <h2 className="text-lg font-semibold text-[#292A24]">Detalhes do produto</h2>
            <dl className="mt-4 space-y-3 text-sm text-[#4A4D46]">
              <div className="flex justify-between gap-4"><dt>Dimensões</dt><dd>{product.dimensions ?? 'Consultar tabela de medidas'}</dd></div>
              <div className="flex justify-between gap-4"><dt>Materiais</dt><dd>{product.material ?? 'Tecido, cerâmica ou madeira'}</dd></div>
              <div className="flex justify-between gap-4"><dt>Disponibilidade</dt><dd>{product.availabilityStatus}</dd></div>
              {product.careInstructions ? <div className="flex justify-between gap-4"><dt>Cuidados</dt><dd>{product.careInstructions}</dd></div> : null}
            </dl>
          </div>
        </div>
      </div>

      <section className="mt-16">
        <h2 className="mb-6 text-3xl font-semibold text-[#292A24]">Produtos relacionados</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {related.items.filter((item) => item.id !== product.id).slice(0, 3).map((item) => (
            <ProductCard key={item.id} product={item} />
          ))}
        </div>
      </section>
    </div>
  );
}
