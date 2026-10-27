import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const chave = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseConfigurado = Boolean(url && chave);

let cliente: SupabaseClient | null = null;

export function supabase(): SupabaseClient | null {
  if (!supabaseConfigurado) return null;
  if (!cliente) {
    cliente = createClient(url!, chave!, {
      auth: { persistSession: true, autoRefreshToken: true },
    });
  }
  return cliente;
}
