import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let supabaseClient: SupabaseClient | null = null

export function getSupabaseClient(): SupabaseClient {
  // Prevent SSR from calling this function
  if (import.meta.env.SSR) {
    throw new Error(
      'getSupabaseClient() should only be called in the browser (client-side).'
    )
  }

  if (supabaseClient) {
    return supabaseClient
  }

  const supabaseUrl = import.meta.env['VITE_SUPABASE_URL']
  const supabaseAnonKey = import.meta.env['VITE_SUPABASE_ANON_KEY']

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env.local file.'
    )
  }

  supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
  return supabaseClient
}
