-- ═══════════════════════════════════════════════
-- NEXLETRONICS V2 — Secure Database Setup
-- ═══════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── 1. PROFILES (USER ROLES) ──
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger to create profile automatically on signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role)
  VALUES (new.id, 'user');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── 2. CART TABLE ──
CREATE TABLE IF NOT EXISTS cart (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 3. UPDATE RLS FOR EXISTING TABLES (STRICT SECURITY) ──
-- Only drop the permissive policies we need to lock down
DROP POLICY IF EXISTS "products_insert" ON products;
DROP POLICY IF EXISTS "products_update" ON products;
DROP POLICY IF EXISTS "products_delete" ON products;
DROP POLICY IF EXISTS "site_insert" ON site_settings;
DROP POLICY IF EXISTS "site_update" ON site_settings;
DROP POLICY IF EXISTS "bank_insert" ON bank_settings;
DROP POLICY IF EXISTS "bank_update" ON bank_settings;

-- Create Profile RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_read_own" ON profiles FOR SELECT USING (auth.uid() = id);

-- Create Cart RLS
ALTER TABLE cart ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cart_read_own" ON cart FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "cart_write_own" ON cart FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Secure Products (Admins only for write)
CREATE POLICY "products_insert_admin" ON products FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "products_update_admin" ON products FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
) WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "products_delete_admin" ON products FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Secure Settings (Admins only for write)
CREATE POLICY "site_insert_admin" ON site_settings FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "site_update_admin" ON site_settings FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
) WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "bank_insert_admin" ON bank_settings FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "bank_update_admin" ON bank_settings FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
) WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ── 4. ORDERS RLS UPDATE ──
-- Only admins can UPDATE orders (status changes, tracking id). 
-- Users can still insert new ones via the secure backend (service role bypasses RLS) or directly for now.
DROP POLICY IF EXISTS "orders_update" ON orders;
CREATE POLICY "orders_update_admin" ON orders FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
) WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
