// Local storage based data store - works without Supabase
// Replace with Supabase calls once you have your API keys

import { Product, Order, BankSettings, SiteSettings, Review, OrderFeedback } from './types';
import { broadcastUpdate } from './sync';

// ── PRODUCTS ──────────────────────────────────────────────
export function getProducts(): Product[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem('nxt_products');
  return data ? JSON.parse(data) : getSampleProducts();
}

export function saveProducts(products: Product[]) {
  localStorage.setItem('nxt_products', JSON.stringify(products));
  broadcastUpdate('nxt_products');
}

export function getProductById(id: string): Product | null {
  return getProducts().find(p => p.id === id) || null;
}

export function addProduct(product: Omit<Product, 'id' | 'created_at'>): Product {
  const products = getProducts();
  const newProduct: Product = {
    ...product,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
  };
  products.push(newProduct);
  saveProducts(products);
  return newProduct;
}

export function updateProduct(id: string, updates: Partial<Product>): Product | null {
  const products = getProducts();
  const idx = products.findIndex(p => p.id === id);
  if (idx === -1) return null;
  products[idx] = { ...products[idx], ...updates };
  saveProducts(products);
  return products[idx];
}

export function deleteProduct(id: string) {
  const products = getProducts().filter(p => p.id !== id);
  saveProducts(products);
}

export function getFeaturedProducts(): Product[] {
  return getProducts()
    .filter(p => p.is_featured && p.is_active)
    .sort((a, b) => a.featured_order - b.featured_order);
}

// ── ORDERS ──────────────────────────────────────────────
export function getOrders(): Order[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem('nxt_orders');
  return data ? JSON.parse(data) : [];
}

export function saveOrders(orders: Order[]) {
  localStorage.setItem('nxt_orders', JSON.stringify(orders));
  broadcastUpdate('nxt_orders');
}

export function addOrder(order: Omit<Order, 'id' | 'order_number' | 'created_at'>): Order {
  const orders = getOrders();
  const count = orders.length + 1;
  const year = new Date().getFullYear();
  const newOrder: Order = {
    ...order,
    id: crypto.randomUUID(),
    order_number: `NXT-${year}-${String(count).padStart(4, '0')}`,
    created_at: new Date().toISOString(),
  };
  orders.unshift(newOrder);
  saveOrders(orders);
  return newOrder;
}

export function updateOrderStatus(id: string, status: Order['status'], tracking_id?: string) {
  const orders = getOrders();
  const idx = orders.findIndex(o => o.id === id);
  if (idx === -1) return;
  orders[idx] = { ...orders[idx], status, ...(tracking_id ? { tracking_id } : {}) };
  saveOrders(orders);
}

// ── BANK SETTINGS ──────────────────────────────────────────────
export function getBankSettings(): BankSettings {
  if (typeof window === 'undefined') return defaultBankSettings;
  const data = localStorage.getItem('nxt_bank');
  return data ? JSON.parse(data) : defaultBankSettings;
}

export function saveBankSettings(settings: BankSettings) {
  localStorage.setItem('nxt_bank', JSON.stringify(settings));
  broadcastUpdate('nxt_bank');
}

const defaultBankSettings: BankSettings = {
  account_holder: '',
  account_number: '',
  ifsc_code: '',
  bank_name: '',
  razorpay_key: '',
  razorpay_secret: '',
};

// ── SITE SETTINGS ──────────────────────────────────────────────
export function getSiteSettings(): SiteSettings {
  if (typeof window === 'undefined') return defaultSiteSettings;
  const data = localStorage.getItem('nxt_site');
  return data ? JSON.parse(data) : defaultSiteSettings;
}

export function saveSiteSettings(settings: SiteSettings) {
  localStorage.setItem('nxt_site', JSON.stringify(settings));
  broadcastUpdate('nxt_site');
}

const defaultSiteSettings: SiteSettings = {
  announcement_text: '⚡ Free shipping on orders above ₹999! Use code NEXFREE',
  featured_panel_title: 'Featured Products',
  show_announcement: true,
  contact_email: 'support@nexletronics.in',
  contact_phone: '+91 98765 43210',
  instagram_url: '',
  twitter_url: '',
};

// ── REVIEWS ──────────────────────────────────────────────
export function getReviews(productId: string): Review[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem('nxt_reviews');
  const all: Review[] = data ? JSON.parse(data) : [];
  return all.filter(r => r.product_id === productId).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

function getAllReviews(): Review[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem('nxt_reviews');
  return data ? JSON.parse(data) : [];
}

export function addReview(review: Omit<Review, 'id' | 'created_at'>): Review {
  const all = getAllReviews();
  const newReview: Review = {
    ...review,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
  };
  all.unshift(newReview);
  localStorage.setItem('nxt_reviews', JSON.stringify(all));
  broadcastUpdate('nxt_reviews');
  return newReview;
}

export function getUserReview(productId: string, userId: string): Review | null {
  return getAllReviews().find(r => r.product_id === productId && r.user_id === userId) || null;
}

// Check if user has bought this product (for "Verified Purchase" badge)
export function isVerifiedPurchase(productId: string, userId: string): boolean {
  const orders = getOrders();
  return orders.some(o =>
    o.user_id === userId &&
    (o.status === 'delivered' || o.status === 'shipped' || o.status === 'processing' || o.status === 'paid') &&
    o.items.some(item => item.product.id === productId)
  );
}

export interface RatingSummary {
  avg: number;
  total: number;
  counts: Record<1 | 2 | 3 | 4 | 5, number>;
}

export function getRatingSummary(productId: string): RatingSummary {
  const reviews = getReviews(productId);
  const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let sum = 0;
  reviews.forEach(r => { counts[r.rating]++; sum += r.rating; });
  return {
    avg: reviews.length ? Math.round((sum / reviews.length) * 10) / 10 : 0,
    total: reviews.length,
    counts: counts as Record<1 | 2 | 3 | 4 | 5, number>,
  };
}

// ── ORDER FEEDBACK ──────────────────────────────────────────────
export function getOrderFeedback(orderId: string): OrderFeedback | null {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem('nxt_feedback');
  const all: OrderFeedback[] = data ? JSON.parse(data) : [];
  return all.find(f => f.order_id === orderId) || null;
}

export function addOrderFeedback(feedback: Omit<OrderFeedback, 'id' | 'created_at'>): OrderFeedback {
  const data = localStorage.getItem('nxt_feedback');
  const all: OrderFeedback[] = data ? JSON.parse(data) : [];
  const newFeedback: OrderFeedback = {
    ...feedback,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
  };
  all.unshift(newFeedback);
  localStorage.setItem('nxt_feedback', JSON.stringify(all));
  return newFeedback;
}

// ── SAMPLE DATA ──────────────────────────────────────────────
function getSampleProducts(): Product[] {
  const samples: Product[] = [
    {
      id: 'sample-1',
      name: 'Arduino Nano V3.0',
      short_description: 'Compact microcontroller for prototyping',
      description: 'The Arduino Nano V3.0 is a compact, breadboard-friendly development board based on the ATmega328P. Perfect for small-scale projects and prototyping. Comes with USB-B mini connector and all standard Arduino pins accessible.',
      price: 349,
      discount_price: 299,
      stock_qty: 50,
      category: 'Microcontrollers',
      images: [],
      specs: { 'Microcontroller': 'ATmega328P', 'Clock Speed': '16 MHz', 'Flash Memory': '32KB', 'Operating Voltage': '5V', 'Digital I/O': '22', 'Analog Input': '8' },
      is_active: true,
      is_featured: true,
      featured_order: 1,
      tags: ['arduino', 'microcontroller', 'atmega'],
      created_at: new Date().toISOString(),
    },
    {
      id: 'sample-2',
      name: 'HC-SR04 Ultrasonic Sensor',
      short_description: 'Distance measurement 2cm to 400cm',
      description: 'The HC-SR04 ultrasonic sensor module provides 2cm to 400cm non-contact measurement with ranging accuracy of up to 3mm. Includes ultrasonic transmitter, receiver and control circuit.',
      price: 149,
      discount_price: 119,
      stock_qty: 120,
      category: 'Sensors',
      images: [],
      specs: { 'Operating Voltage': '5V DC', 'Range': '2cm - 400cm', 'Accuracy': '3mm', 'Frequency': '40Hz', 'Trigger Input': '10µS TTL pulse' },
      is_active: true,
      is_featured: true,
      featured_order: 2,
      tags: ['sensor', 'ultrasonic', 'distance'],
      created_at: new Date().toISOString(),
    },
    {
      id: 'sample-3',
      name: 'ESP32 Dev Kit V1',
      short_description: 'WiFi + Bluetooth dual-core microcontroller',
      description: 'The ESP32 Development Kit is a powerful dual-core microcontroller with built-in WiFi and Bluetooth. Ideal for IoT projects, home automation, and wireless communication applications.',
      price: 599,
      discount_price: 499,
      stock_qty: 35,
      category: 'Microcontrollers',
      images: [],
      specs: { 'CPU': 'Dual-core 240MHz', 'Flash': '4MB', 'RAM': '520KB', 'WiFi': '802.11 b/g/n', 'Bluetooth': '4.2 BLE', 'GPIO': '34' },
      is_active: true,
      is_featured: true,
      featured_order: 3,
      tags: ['esp32', 'wifi', 'iot', 'bluetooth'],
      created_at: new Date().toISOString(),
    },
    {
      id: 'sample-4',
      name: '0.96" OLED Display Module',
      short_description: 'I2C SSD1306 128x64 pixel display',
      description: 'Compact 0.96 inch OLED display module with SSD1306 driver chip. 128x64 pixel resolution with I2C interface. Works with Arduino, ESP32, Raspberry Pi. High contrast, wide viewing angle.',
      price: 229,
      discount_price: 189,
      stock_qty: 75,
      category: 'Displays',
      images: [],
      specs: { 'Size': '0.96 inch', 'Resolution': '128x64', 'Protocol': 'I2C (SPI optional)', 'Voltage': '3.3V-5V', 'Driver': 'SSD1306', 'Color': 'White/Blue' },
      is_active: true,
      is_featured: true,
      featured_order: 4,
      tags: ['oled', 'display', 'i2c', 'ssd1306'],
      created_at: new Date().toISOString(),
    },
    {
      id: 'sample-5',
      name: 'L298N Motor Driver Module',
      short_description: 'Dual H-Bridge motor driver for DC & stepper motors',
      description: 'The L298N motor driver module uses the L298N dual H-Bridge IC to control 2 DC motors or 1 stepper motor. Supports 5V to 35V motor supply and up to 2A per channel.',
      price: 179,
      stock_qty: 60,
      category: 'Motor Drivers',
      images: [],
      specs: { 'Input Voltage': '5V-35V', 'Output Current': '2A per channel', 'Logic Voltage': '5V', 'Max Power': '25W', 'Control': 'TTL compatible' },
      is_active: true,
      is_featured: false,
      featured_order: 0,
      tags: ['motor', 'driver', 'l298n', 'robotics'],
      created_at: new Date().toISOString(),
    },
    {
      id: 'sample-6',
      name: 'Resistor Kit — 600 pcs',
      short_description: '30 values, 1/4W carbon film resistors',
      description: 'Complete resistor kit with 600 pieces across 30 common values from 10Ω to 1MΩ. 1/4 Watt, 5% tolerance carbon film resistors. Organized in a labeled storage box.',
      price: 249,
      stock_qty: 200,
      category: 'Passive Components',
      images: [],
      specs: { 'Count': '600 pcs', 'Values': '30 types', 'Power Rating': '1/4W', 'Tolerance': '5%', 'Type': 'Carbon Film' },
      is_active: true,
      is_featured: false,
      featured_order: 0,
      tags: ['resistor', 'kit', 'passive', 'components'],
      created_at: new Date().toISOString(),
    },
  ];
  saveProducts(samples);
  return samples;
}
