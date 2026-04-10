-- ═══════════════════════════════════════════════
-- NEXLETRONICS — Supabase Setup (safe to re-run)
-- ═══════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── TABLES ──
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  short_description TEXT NOT NULL DEFAULT '',
  price NUMERIC NOT NULL DEFAULT 0,
  discount_price NUMERIC,
  stock_qty INTEGER NOT NULL DEFAULT 0,
  category TEXT NOT NULL DEFAULT '',
  images JSONB NOT NULL DEFAULT '[]'::jsonb,
  specs JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  featured_order INTEGER NOT NULL DEFAULT 0,
  tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT NOT NULL UNIQUE,
  user_id TEXT NOT NULL,
  user_email TEXT NOT NULL,
  user_name TEXT NOT NULL DEFAULT '',
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal NUMERIC NOT NULL DEFAULT 0,
  shipping NUMERIC NOT NULL DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_id TEXT,
  razorpay_order_id TEXT,
  shipping_address JSONB NOT NULL DEFAULT '{}'::jsonb,
  tracking_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL DEFAULT '',
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  body TEXT NOT NULL DEFAULT '',
  verified_purchase BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  delivery_rating INTEGER NOT NULL CHECK (delivery_rating >= 1 AND delivery_rating <= 5),
  product_rating INTEGER NOT NULL CHECK (product_rating >= 1 AND product_rating <= 5),
  comment TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS site_settings (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  announcement_text TEXT NOT NULL DEFAULT '',
  featured_panel_title TEXT NOT NULL DEFAULT 'Featured Products',
  show_announcement BOOLEAN NOT NULL DEFAULT true,
  contact_email TEXT NOT NULL DEFAULT '',
  contact_phone TEXT NOT NULL DEFAULT '',
  instagram_url TEXT NOT NULL DEFAULT '',
  twitter_url TEXT NOT NULL DEFAULT ''
);
INSERT INTO site_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS bank_settings (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  account_holder TEXT NOT NULL DEFAULT '',
  account_number TEXT NOT NULL DEFAULT '',
  ifsc_code TEXT NOT NULL DEFAULT '',
  bank_name TEXT NOT NULL DEFAULT '',
  razorpay_key TEXT NOT NULL DEFAULT '',
  razorpay_secret TEXT NOT NULL DEFAULT ''
);
INSERT INTO bank_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- ── DROP ALL EXISTING POLICIES (safe cleanup) ──
DO $$ 
DECLARE
  tbl TEXT;
  pol RECORD;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY['products','orders','reviews','order_feedback','site_settings','bank_settings']) LOOP
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = tbl LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, tbl);
    END LOOP;
  END LOOP;
END $$;

-- Also clean storage policies (both old and new names)
DROP POLICY IF EXISTS "Allow public read on product-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public upload to product-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public delete on product-images" ON storage.objects;
DROP POLICY IF EXISTS "storage_read" ON storage.objects;
DROP POLICY IF EXISTS "storage_upload" ON storage.objects;
DROP POLICY IF EXISTS "storage_delete" ON storage.objects;

-- ── ENABLE RLS + CREATE FRESH POLICIES ──
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products_select" ON products FOR SELECT USING (true);
CREATE POLICY "products_insert" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "products_update" ON products FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "products_delete" ON products FOR DELETE USING (true);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "orders_select" ON orders FOR SELECT USING (true);
CREATE POLICY "orders_insert" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "orders_update" ON orders FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "orders_delete" ON orders FOR DELETE USING (true);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reviews_select" ON reviews FOR SELECT USING (true);
CREATE POLICY "reviews_insert" ON reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "reviews_update" ON reviews FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "reviews_delete" ON reviews FOR DELETE USING (true);

ALTER TABLE order_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "feedback_select" ON order_feedback FOR SELECT USING (true);
CREATE POLICY "feedback_insert" ON order_feedback FOR INSERT WITH CHECK (true);
CREATE POLICY "feedback_update" ON order_feedback FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "feedback_delete" ON order_feedback FOR DELETE USING (true);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "site_select" ON site_settings FOR SELECT USING (true);
CREATE POLICY "site_insert" ON site_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "site_update" ON site_settings FOR UPDATE USING (true) WITH CHECK (true);

ALTER TABLE bank_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bank_select" ON bank_settings FOR SELECT USING (true);
CREATE POLICY "bank_insert" ON bank_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "bank_update" ON bank_settings FOR UPDATE USING (true) WITH CHECK (true);

-- ── STORAGE BUCKET ──
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "storage_read" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "storage_upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images');
CREATE POLICY "storage_delete" ON storage.objects FOR DELETE USING (bucket_id = 'product-images');
