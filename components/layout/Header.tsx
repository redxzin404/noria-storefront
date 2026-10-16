'use client';

import Link from 'next/link';
import { Heart, Search, ShoppingCart, UserRound } from 'lucide-react';

import { useCart } from '@/components/cart/CartProvider';

const navItems = [
  { label: 'Início', href: '/' },
  { label: 'Decoração', href: '/catalog?category=decoracao' },
  { label: 'Organização', href: '/catalog?category=organizacao' },
  { label: 'Cozinha', href: '/catalog?category=cozinha' },
  { label: 'Iluminação', href: '/catalog?category=iluminacao' },
  { label: 'Conforto', href: '/catalog?category=conforto' },
  { label: 'Novidades', href: '/catalog?sort=newest' },
];

export function Header() {
  const { itemCount } = useCart();

  return (
    <header className="border-b border-[#E7E3DC] bg-[#F7F4EF]/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-8 lg:px-12">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-2xl font-semibold tracking-[0.18em] text-[#292A24]">
            NÓRIA
          </Link>
          <nav className="hidden items-center gap-5 text-sm text-[#4A4D46] lg:flex">
            {navItems.map((item) => (
              <Link key={item.label} href={item.href} className="transition hover:text-[#292A24]">{item.label}</Link>
            ))}
          </nav>
        </div>

        <div className="flex flex-1 items-center justify-end gap-3">
          <form action="/catalog" className="hidden items-center gap-2 rounded-full border border-[#E7E3DC] bg-white px-3 py-2 md:flex">
            <Search size={16} className="text-[#656C57]" />
            <input name="search" placeholder="Buscar" className="w-36 bg-transparent text-sm outline-none placeholder:text-[#7A7D77]" />
          </form>
          <Link href="/login" className="inline-flex items-center gap-2 rounded-full border border-[#E7E3DC] bg-white p-2.5 text-[#292A24]">
            <UserRound size={16} />
          </Link>
          <Link href="/favorites" className="inline-flex items-center gap-2 rounded-full border border-[#E7E3DC] bg-white p-2.5 text-[#292A24]">
            <Heart size={16} />
          </Link>
          <Link href="/cart" className="inline-flex items-center gap-2 rounded-full bg-[#292A24] px-4 py-2.5 text-sm font-medium text-white">
            <ShoppingCart size={16} />
            <span>{itemCount}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
