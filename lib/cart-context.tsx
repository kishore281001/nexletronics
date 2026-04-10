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
  const { user } = useAuth();

  // Load the correct cart
  const syncCart = useCallback(async () => {
    if (user) {
      // 1. User is logged in -> fetch from Supabase
      const { data } = await supabase.from('cart').select('items').eq('user_id', user.id).single();
      
      // Merge guest cart if it exists
      const savedGuest = localStorage.getItem('nxt_cart_guest');
      const guestItems = savedGuest ? JSON.parse(savedGuest) : [];
      
      let finalItems = data?.items || [];
      if (guestItems.length > 0) {
        // Merge guest items into final items (simple append for now)
        finalItems = [...finalItems, ...guestItems];
        localStorage.removeItem('nxt_cart_guest');
        await supabase.from('cart').upsert({ user_id: user.id, items: finalItems });
      }
      
      setItems(finalItems);
    } else {
      // 2. User is guest -> read from localStorage
      const saved = localStorage.getItem('nxt_cart_guest');
      setItems(saved ? JSON.parse(saved) : []);
    }
  }, [user]);

  useEffect(() => { syncCart(); }, [syncCart]);

  const save = async (newItems: CartItem[]) => {
    setItems(newItems);
    if (user) {
      await supabase.from('cart').upsert({ user_id: user.id, items: newItems });
    } else {
      localStorage.setItem('nxt_cart_guest', JSON.stringify(newItems));
    }
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
