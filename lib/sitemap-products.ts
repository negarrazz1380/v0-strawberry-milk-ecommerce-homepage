import { createClient } from '@supabase/supabase-js'

export interface FetchProductsResult {
  products: Array<{
    id: string
    name: string
    slug: string | null
    is_active: boolean
    created_at: string | null
    device_models: string[] | null
  }>
  error: Error | null
}

/**
 * Fetches all active products from Supabase using the public anon key.
 * Used by both sitemap.ts and debug routes to ensure consistent product queries.
 * Returns env var status separately so callers can diagnose connection issues.
 */
export async function fetchSitemapProducts(): Promise<FetchProductsResult> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    const error = new Error(
      'Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY'
    )
    return { products: [], error }
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  const { data, error: dbError } = await supabase
    .from('products')
    .select('id, name, slug, is_active, created_at, device_models')
    .eq('is_active', true)

  if (dbError) {
    const error = new Error(`Supabase query failed: ${dbError.message} (code: ${dbError.code})`)
    return { products: [], error }
  }

  return {
    products: data ?? [],
    error: null,
  }
}
