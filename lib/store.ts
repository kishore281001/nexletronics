// Supabase-backed data store
// All functions are async — data lives in the cloud, not localStorage

import { supabase } from './supabase';
import { Product, Order, BankSettings, SiteSettings, Review, OrderFeedback } from './types';

// ─────────────────────────────────────────────
// PRODUCTS
// ─────────────────────────────────────────────

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) { console.error('getProducts:', error); return []; }
  return data as Product[];
}

export async function getProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();
  if (error) { console.error('getProductById:', error); return null; }
  return data as Product;
}

export async function addProduct(product: Omit<Product, 'id' | 'created_at'>): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .insert(product)
    .select()
    .single();
  if (error) { console.error('addProduct:', error); return null; }
  return data as Product;
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) { console.error('updateProduct:', error); return null; }
  return data as Product;
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) console.error('deleteProduct:', error);
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_featured', true)
    .eq('is_active', true)
    .order('featured_order', { ascending: true });
  if (error) { console.error('getFeaturedProducts:', error); return []; }
  return data as Product[];
}

// ─────────────────────────────────────────────
// ORDERS
// ─────────────────────────────────────────────

export async function getOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) { console.error('getOrders:', error); return []; }
  return data as Order[];
}

export async function getOrdersByUser(userId: string): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) { console.error('getOrdersByUser:', error); return []; }
  return data as Order[];
}

export async function addOrder(order: Omit<Order, 'id' | 'order_number' | 'created_at'>): Promise<Order | null> {
  // Generate order number: NXT-2026-0001
  const { count } = await supabase.from('orders').select('*', { count: 'exact', head: true });
  const num = (count ?? 0) + 1;
  const year = new Date().getFullYear();
  const order_number = `NXT-${year}-${String(num).padStart(4, '0')}`;

  const { data, error } = await supabase
    .from('orders')
    .insert({ ...order, order_number })
    .select()
    .single();
  if (error) { console.error('addOrder:', error); return null; }
  return data as Order;
}

export async function updateOrderStatus(id: string, status: Order['status'], tracking_id?: string): Promise<void> {
  const updates: Partial<Order> = { status };
  if (tracking_id) updates.tracking_id = tracking_id;
  const { error } = await supabase.from('orders').update(updates).eq('id', id);
  if (error) console.error('updateOrderStatus:', error);
}

export async function sendOrderEmail(order: Order): Promise<void> {
  try {
    const settings = await getSiteSettings();
    const adminEmail = settings.contact_email || 'admin@nexletronics.in';
    // Ensure we use an absolute URL if running on the server
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
    
    await fetch(`${baseUrl}/api/send-order-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order, adminEmail }),
    });
  } catch (error) {
    console.error('Failed to trigger order email:', error);
  }
}

export async function decrementStock(items: { product: { id: string }; quantity: number }[]): Promise<void> {
  for (const item of items) {
    // Fetch current stock then decrement
    const { data } = await supabase.from('products').select('stock_qty').eq('id', item.product.id).single();
    if (data) {
      const newQty = Math.max(0, (data.stock_qty || 0) - item.quantity);
      await supabase.from('products').update({ stock_qty: newQty }).eq('id', item.product.id);
    }
  }
}

// ─────────────────────────────────────────────
// SITE SETTINGS
// ─────────────────────────────────────────────

const defaultSiteSettings: SiteSettings = {
  announcement_text: '⚡ Free shipping on orders above ₹999! Use code NEXFREE',
  featured_panel_title: 'Featured Products',
  show_announcement: true,
  contact_email: 'support@nexletronics.in',
  contact_phone: '+91 98765 43210',
  instagram_url: '',
  twitter_url: '',
};

export async function getSiteSettings(): Promise<SiteSettings> {
  const { data, error } = await supabase
    .from('site_settings')
    .select('*')
    .eq('id', 1)
    .single();
  if (error || !data) return defaultSiteSettings;
  return data as SiteSettings;
}

export async function saveSiteSettings(settings: SiteSettings): Promise<void> {
  const { error } = await supabase
    .from('site_settings')
    .upsert({ id: 1, ...settings });
  if (error) console.error('saveSiteSettings:', error);
}

// ─────────────────────────────────────────────
// BANK / PAYMENT SETTINGS (stored in Supabase, not client)
// ─────────────────────────────────────────────

const defaultBankSettings: BankSettings = {
  account_holder: '', account_number: '', ifsc_code: '',
  bank_name: '', razorpay_key: '', razorpay_secret: '',
};

export async function getBankSettings(): Promise<BankSettings> {
  const { data, error } = await supabase
    .from('bank_settings')
    .select('*')
    .eq('id', 1)
    .single();
  if (error || !data) return defaultBankSettings;
  return data as BankSettings;
}

export async function saveBankSettings(settings: BankSettings): Promise<void> {
  const { error } = await supabase
    .from('bank_settings')
    .upsert({ id: 1, ...settings });
  if (error) console.error('saveBankSettings:', error);
}

// ─────────────────────────────────────────────
// REVIEWS
// ─────────────────────────────────────────────

export async function getReviews(productId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('product_id', productId)
    .order('created_at', { ascending: false });
  if (error) { console.error('getReviews:', error); return []; }
  return data as Review[];
}

export async function addReview(review: Omit<Review, 'id' | 'created_at'>): Promise<Review | null> {
  const { data, error } = await supabase
    .from('reviews')
    .insert(review)
    .select()
    .single();
  if (error) { console.error('addReview:', error); return null; }
  return data as Review;
}

export async function getUserReview(productId: string, userId: string): Promise<Review | null> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('product_id', productId)
    .eq('user_id', userId)
    .single();
  if (error) return null;
  return data as Review;
}

export async function isVerifiedPurchase(productId: string, userId: string): Promise<boolean> {
  const { data } = await supabase
    .from('orders')
    .select('id')
    .eq('user_id', userId)
    .in('status', ['delivered', 'shipped', 'processing', 'paid'])
    .contains('items', [{ product: { id: productId } }])
    .limit(1);
  return (data?.length ?? 0) > 0;
}

export interface RatingSummary {
  avg: number;
  total: number;
  counts: Record<1 | 2 | 3 | 4 | 5, number>;
}

export async function getRatingSummary(productId: string): Promise<RatingSummary> {
  const reviews = await getReviews(productId);
  const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let sum = 0;
  reviews.forEach(r => { counts[r.rating]++; sum += r.rating; });
  return {
    avg: reviews.length ? Math.round((sum / reviews.length) * 10) / 10 : 0,
    total: reviews.length,
    counts: counts as Record<1 | 2 | 3 | 4 | 5, number>,
  };
}

// ─────────────────────────────────────────────
// ORDER FEEDBACK
// ─────────────────────────────────────────────

export async function getOrderFeedback(orderId: string): Promise<OrderFeedback | null> {
  const { data, error } = await supabase
    .from('order_feedback')
    .select('*')
    .eq('order_id', orderId)
    .single();
  if (error) return null;
  return data as OrderFeedback;
}

export async function addOrderFeedback(feedback: Omit<OrderFeedback, 'id' | 'created_at'>): Promise<OrderFeedback | null> {
  const { data, error } = await supabase
    .from('order_feedback')
    .insert(feedback)
    .select()
    .single();
  if (error) { console.error('addOrderFeedback:', error); return null; }
  return data as OrderFeedback;
}

// ─────────────────────────────────────────────
// IMAGE STORAGE (Supabase Storage — free 1GB)
// ─────────────────────────────────────────────

export async function uploadProductImage(file: File): Promise<string | null> {
  // Compress/resize is done client-side before calling this
  const ext = file.name.split('.').pop() ?? 'jpg';
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const path = `products/${filename}`;

  const { error } = await supabase.storage
    .from('product-images')
    .upload(path, file, { cacheControl: '3600', upsert: false });

  if (error) { console.error('uploadProductImage:', error); return null; }

  const { data } = supabase.storage.from('product-images').getPublicUrl(path);
  return data.publicUrl;
}

export async function deleteProductImage(url: string): Promise<void> {
  // Extract path from URL like: .../product-images/products/filename.jpg
  const match = url.match(/product-images\/(.+)$/);
  if (!match) return;
  const { error } = await supabase.storage.from('product-images').remove([match[1]]);
  if (error) console.error('deleteProductImage:', error);
}
