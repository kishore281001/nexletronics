// Types for entire application

export interface Product {
  id: string;
  name: string;
  description: string;
  short_description: string;
  price: number;
  discount_price?: number;
  stock_qty: number;
  category: string;
  images: string[];
  specs: Record<string, string>;
  is_active: boolean;
  is_featured: boolean;
  featured_order: number;
  tags: string[];
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  user_email: string;
  user_name: string;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_id?: string;
  razorpay_order_id?: string;
  shipping_address: Address;
  tracking_id?: string;
  created_at: string;
}

export interface Address {
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface BankSettings {
  account_holder: string;
  account_number: string;
  ifsc_code: string;
  bank_name: string;
  razorpay_key: string;
  razorpay_secret: string;
}

export interface SiteSettings {
  announcement_text: string;
  featured_panel_title: string;
  show_announcement: boolean;
  contact_email: string;
  contact_phone: string;
  instagram_url: string;
  twitter_url: string;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  user_name: string;
  rating: 1 | 2 | 3 | 4 | 5;
  body: string;
  verified_purchase: boolean;
  created_at: string;
}

export interface OrderFeedback {
  id: string;
  order_id: string;
  user_id: string;
  delivery_rating: 1 | 2 | 3 | 4 | 5;  // How was the delivery experience?
  product_rating: 1 | 2 | 3 | 4 | 5;   // How were the products?
  comment: string;
  created_at: string;
}
