'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type CartItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  variant?: string;
};

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  total: number;
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === 'undefined') {
      return [];
    }

    const stored = window.localStorage.getItem('noria-cart');
    if (!stored) {
      return [];
    }

    try {
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed as CartItem[] : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('noria-cart', JSON.stringify(items));
    }
  }, [items]);

  const addItem = (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    setItems((current) => {
      const match = current.find((entry) => entry.id === item.id && (entry.variant ?? '') === (item.variant ?? ''));
      if (match) {
        return current.map((entry) =>
          entry.id === item.id && (entry.variant ?? '') === (item.variant ?? '')
            ? { ...entry, quantity: entry.quantity + (item.quantity ?? 1) }
            : entry,
        );
      }
      return [...current, { ...item, quantity: item.quantity ?? 1 }];
    });
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    setItems((current) =>
      current.flatMap((entry) => {
        if (entry.id !== itemId) return [entry];
        return quantity <= 0 ? [] : [{ ...entry, quantity }];
      }),
    );
  };

  const removeItem = (itemId: string) => {
    setItems((current) => current.filter((entry) => entry.id !== itemId));
  };

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity * item.price, 0),
    [items],
  );

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal,
      total: subtotal,
      addItem,
      updateQuantity,
      removeItem,
    }),
    [items, subtotal],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
