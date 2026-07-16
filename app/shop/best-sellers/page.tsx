import { createClient } from '@/lib/supabase/server'
import { ProductCard } from '@/components/product-card'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface Product {
  id: string
  name: string
  price: number
  image_url: string
  description: string
  category: string
  device_model: string
  stock: number
  sales_count: number
  is_best_seller: boolean
}

/**
 * Server component — fetched on the server so the grid is in the initial HTML.
 * Do NOT convert back to a 'use client' + useEffect fetch: crawlers that don't
 * run JavaScript would see an empty page.
 */
export default async function BestSellersPage() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .eq('is_best_seller', true)
    .order('sales_count', { ascending: false })

  if (error) {
    console.error('Error fetching best sellers:', error.message)
  }

  const products: Product[] = data ?? []

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="p-2 hover:bg-accent rounded-full transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-3xl font-bold" style={{ color: '#c0304f' }}>
            Best Sellers
          </h1>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg text-foreground/60">No best sellers available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
