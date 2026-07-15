import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createServiceClient } from "@/lib/supabase";

/**
 * Prefer the anon key for public writes so RLS can constrain access.
 * Fall back to service role only when configured (legacy envs without RLS).
 */
export function publicWriteClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (url && anon) {
    return createClient(url, anon, { auth: { persistSession: false, autoRefreshToken: false } });
  }
  if (url && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return createServiceClient();
  }
  return null;
}

/** Public reads of published content — anon first, service fallback. */
export function publicReadClient(): SupabaseClient | null {
  return publicWriteClient();
}
