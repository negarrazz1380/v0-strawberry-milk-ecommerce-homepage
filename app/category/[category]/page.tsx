import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { CategoryContent } from '@/components/category-content'

/**
 * Fetches a category's products — on the SERVER.
 *
 * Runs at request time so the grid ships in the initial HTML. The device filter
 * stays client-side, but the data must not: crawlers that don't run JavaScript
 * (OAI-SearchBot / ChatGPT, BingBot) would otherwise see an empty category.
 */
async function fetchCategoryProducts(category: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category', category)
    .eq('is_active', true)
    .order('sales_count', { ascending: false })

  if (error) {
    console.error('Error fetching category products:', error.message)
    return []
  }

  return data ?? []
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>
}) {
  const { category } = await params
  const products = await fetchCategoryProducts(category)

  return (
    <Suspense
      fallback={
        <div className="min-h-screen pt-20">
          <div className="max-w-7xl mx-auto px-4 py-16">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white/50 rounded-3xl h-80 animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      }
    >
      <CategoryContent category={category} products={products} />
    </Suspense>
  )
}
