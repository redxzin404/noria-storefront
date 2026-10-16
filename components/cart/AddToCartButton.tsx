'use client';

import { ShoppingBag } from 'lucide-react';

import { useCart } from '@/components/cart/CartProvider';
import { parseJsonArray } from '@/lib/utils';

type ProductLike = {
  id: string;
  name: string;
  price: number;
  images?: string | string[] | null;
};

export function AddToCartButton({ product }: { product: ProductLike }) {
  const { addItem } = useCart();

  const images = parseJsonArray<string>(product.images);
  const image = images[0] ?? 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80';

  return (
    <button
      type="button"
      onClick={() =>
        addItem({
          id: product.id,
          name: product.name,
          price: Number(product.price),
          image,
          variant: 'Padrão',
          quantity: 1,
        })
      }
      className="inline-flex items-center gap-2 rounded-full bg-[#292A24] px-6 py-3 text-sm font-medium text-white"
    >
      <ShoppingBag size={16} /> Adicionar ao carrinho
    </button>
  );
}
