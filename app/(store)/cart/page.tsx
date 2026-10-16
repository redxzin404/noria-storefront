'use client';

import Link from 'next/link';
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';

import { useCart } from '@/components/cart/CartProvider';
import { formatCurrency } from '@/lib/utils';

export default function CartPage() {
  const { items, subtotal, updateQuantity, removeItem, total } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center md:px-8 lg:px-12">
        <ShoppingBag className="mx-auto mb-5 text-[#656C57]" size={48} />
        <h1 className="text-3xl font-semibold text-[#292A24]">Seu carrinho está vazio.</h1>
        <p className="mt-3 text-[#4A4D46]">Escolha peças que tornem o seu cotidiano mais acolhedor.</p>
        <Link href="/catalog" className="mt-6 inline-flex rounded-full bg-[#292A24] px-6 py-3 text-sm font-medium text-white">
          Explorar catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:px-8 lg:px-12">
      <h1 className="text-4xl font-semibold text-[#292A24]">Carrinho</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-5">
          {items.map((item) => (
            <div key={`${item.id}-${item.variant ?? 'base'}`} className="flex flex-col gap-4 rounded-[1.5rem] border border-[#E7E3DC] bg-white p-4 md:flex-row md:items-center">
              <img src={item.image} alt={item.name} className="h-28 w-28 rounded-[1rem] object-cover" />
              <div className="flex-1">
                <h2 className="text-xl font-medium text-[#292A24]">{item.name}</h2>
                <p className="mt-1 text-sm text-[#4A4D46]">{item.variant ?? 'Item padrão'}</p>
                <p className="mt-2 text-lg font-semibold text-[#292A24]">{formatCurrency(item.price * item.quantity)}</p>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="rounded-full border border-[#E7E3DC] p-2 text-[#292A24]">
                  <Minus size={16} />
                </button>
                <span className="min-w-8 text-center text-sm font-medium text-[#292A24]">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="rounded-full border border-[#E7E3DC] p-2 text-[#292A24]">
                  <Plus size={16} />
                </button>
              </div>
              <button onClick={() => removeItem(item.id)} className="inline-flex items-center gap-2 rounded-full border border-[#E7E3DC] px-3 py-2 text-sm text-[#292A24]">
                <Trash2 size={16} /> Remover
              </button>
            </div>
          ))}
        </div>

        <aside className="rounded-[1.5rem] border border-[#E7E3DC] bg-white p-6">
          <h2 className="text-2xl font-semibold text-[#292A24]">Resumo</h2>
          <div className="mt-6 space-y-3 text-sm text-[#4A4D46]">
            <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
            <div className="flex justify-between"><span>Frete</span><span>{formatCurrency(0)}</span></div>
            <div className="flex justify-between"><span>Desconto</span><span>{formatCurrency(0)}</span></div>
          </div>
          <div className="mt-6 flex items-center justify-between border-t border-[#E7E3DC] pt-4 text-lg font-semibold text-[#292A24]">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
          <Link href="/checkout" className="mt-6 inline-flex w-full justify-center rounded-full bg-[#292A24] px-6 py-3 text-sm font-medium text-white">
            Finalizar compra
          </Link>
        </aside>
      </div>
    </div>
  );
}
