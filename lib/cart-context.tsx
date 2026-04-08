'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
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

// Cart key is tied to the current logged-in user so guest and user carts are separate
function getCartKey(): string {
  if (typeof window === 'undefined') return 'nxt_cart_guest';
  const user = localStorage.getItem('nxt_user');
  if (user) {
    try {
      const parsed = JSON.parse(user);
      return `nxt_cart_${parsed.id}`;
    } catch {
      return 'nxt_cart_guest';
    }
  }
  return 'nxt_cart_guest';
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [cartKey, setCartKey] = useState('nxt_cart_guest');

  // Load cart from the correct key on mount
  useEffect(() => {
    const key = getCartKey();
    setCartKey(key);
    const saved = localStorage.getItem(key);
    setItems(saved ? JSON.parse(saved) : []);
  }, []);

  // Listen for auth changes (login / logout) and switch to the correct cart
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'nxt_user') {
        const newKey = getCartKey();
        setCartKey(newKey);
        const saved = localStorage.getItem(newKey);
        setItems(saved ? JSON.parse(saved) : []);
      }
    };

    // Also listen for same-tab auth changes via a custom event
    const handleAuthChange = () => {
      const newKey = getCartKey();
      setCartKey(newKey);
      const saved = localStorage.getItem(newKey);
      setItems(saved ? JSON.parse(saved) : []);
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('nxt_auth_change', handleAuthChange);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('nxt_auth_change', handleAuthChange);
    };
  }, []);

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
