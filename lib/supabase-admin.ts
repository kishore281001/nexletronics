import { createClient } from '@supabase/supabase-js';

// This client uses the SERVICE_ROLE_KEY which bypasses all RLS policies.
// Use this ONLY in backend API routes (/app/api). NEVER use it in components.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
