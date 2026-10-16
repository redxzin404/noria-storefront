'use client';

import Link from 'next/link';
import { Heart, ShoppingBag } from 'lucide-react';

import { useCart } from '@/components/cart/CartProvider';
import { formatCurrency, parseJsonArray } from '@/lib/utils';

type ProductCardProduct = {
  id: string;
  slug: string;
  name: string;
  price: number;
  compareAtPrice?: number | null;
  shortDescription?: string | null;
  description?: string | null;
  images?: string | string[] | null;
  featured?: boolean;
  category?: { name?: string | null } | null;
};

export function ProductCard({ product }: { product: ProductCardProduct }) {
  const { addItem } = useCart();

  const images = parseJsonArray<string>(product.images);
  const image = images.length > 0
    ? images[0]
    : 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80';

  return (
    <article className="overflow-hidden rounded-[1.5rem] border border-[#E7E3DC] bg-white shadow-[0_18px_36px_rgba(41,42,36,0.04)]">
      <div className="relative">
        <Link href={`/product/${product.slug}`}>
          <img src={image} alt={product.name} className="h-72 w-full object-cover" />
        </Link>
        <button className="absolute right-4 top-4 inline-flex rounded-full bg-white/85 p-2 text-[#292A24] backdrop-blur-sm">
          <Heart size={16} />
        </button>
      </div>
      <div className="p-5">
        <div className="mb-2 flex items-center justify-between gap-3">
          <span className="text-xs uppercase tracking-[0.2em] text-[#656C57]">{product.category?.name ?? 'Coleção'}</span>
          {product.featured ? <span className="rounded-full bg-[#F7F4EF] px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-[#656C57]">Destaque</span> : null}
        </div>
        <Link href={`/product/${product.slug}`} className="block text-xl font-medium text-[#292A24] hover:text-[#656C57]">
          {product.name}
        </Link>
        <div className="mt-3 flex items-center gap-2">
          <span className="text-lg font-semibold text-[#292A24]">{formatCurrency(product.price)}</span>
          {product.compareAtPrice && product.compareAtPrice > product.price ? <span className="text-sm text-[#656C57] line-through">{formatCurrency(product.compareAtPrice)}</span> : null}
        </div>
        <p className="mt-3 text-sm text-[#4A4D46]">{product.shortDescription ?? product.description?.slice(0, 80)}</p>
        <div className="mt-5 flex items-center gap-3">
          <button
            type="button"
            onClick={() => addItem({ id: product.id, name: product.name, price: Number(product.price), image, variant: 'Padrão', quantity: 1 })}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#292A24] px-4 py-2.5 text-sm font-medium text-white"
          >
            <ShoppingBag size={16} /> Adicionar
          </button>
          <Link href={`/product/${product.slug}`} className="rounded-full border border-[#E7E3DC] px-4 py-2.5 text-sm font-medium text-[#292A24]">
            Ver
          </Link>
        </div>
      </div>
    </article>
  );
}
