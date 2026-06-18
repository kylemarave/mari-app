import { createClient, SupabaseClient } from '@supabase/supabase-js';

let adminClient: SupabaseClient | null = null;

function supabaseUrl(): string {
  return (
    process.env['SUPABASE_URL'] ??
    process.env['NG_APP_SUPABASE_URL'] ??
    ''
  ).trim();
}

function serviceRoleKey(): string {
  return (process.env['SUPABASE_SERVICE_ROLE_KEY'] ?? '').trim();
}

export function getSupabaseAdmin(): SupabaseClient {
  const url = supabaseUrl();
  const key = serviceRoleKey();
  if (!url || !key) {
    throw new Error(
      'Supabase admin is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.',
    );
  }
  if (!adminClient) {
    adminClient = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return adminClient;
}

export function isSupabaseAdminConfigured(): boolean {
  return !!(supabaseUrl() && serviceRoleKey());
}
