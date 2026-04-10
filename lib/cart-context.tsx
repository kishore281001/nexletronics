'use client';
import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { supabase } from './supabase';
import { CartItem, Product } from '@/lib/types';

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, qty: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [cartKey, setCartKey] = useState('nxt_cart_guest');

  // Derive the correct cart key from the Supabase session
  const syncCartKey = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const key = session?.user ? `nxt_cart_${session.user.id}` : 'nxt_cart_guest';
    setCartKey(key);
    const saved = localStorage.getItem(key);
    setItems(saved ? JSON.parse(saved) : []);
  }, []);

  // Load the correct cart on mount
  useEffect(() => { syncCartKey(); }, [syncCartKey]);

  // Re-sync cart on auth changes (login / logout) via custom event from AuthProvider
  useEffect(() => {
    const handleAuthChange = () => { syncCartKey(); };

    window.addEventListener('nxt_auth_change', handleAuthChange);
    return () => {
      window.removeEventListener('nxt_auth_change', handleAuthChange);
    };
  }, [syncCartKey]);

  const save = (newItems: CartItem[]) => {
    setItems(newItems);
    localStorage.setItem(cartKey, JSON.stringify(newItems));
  };

  const addItem = (product: Product) => {
    const existing = items.find(i => i.product.id === product.id);
    if (existing) {
      save(items.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      save([...items, { product, quantity: 1 }]);
    }
  };

  const removeItem = (productId: string) => save(items.filter(i => i.product.id !== productId));

  const updateQuantity = (productId: string, qty: number) => {
    if (qty < 1) { removeItem(productId); return; }
    save(items.map(i => i.product.id === productId ? { ...i, quantity: qty } : i));
  };

  const clearCart = () => save([]);

  const total = items.reduce((sum, i) => sum + (i.product.discount_price || i.product.price) * i.quantity, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, total, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
