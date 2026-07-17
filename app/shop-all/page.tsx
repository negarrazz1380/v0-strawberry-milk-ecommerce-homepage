import { createClient } from '@/lib/supabase/server'
import { ProductCard } from '@/components/product-card'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import type { Metadata } from 'next'

/**
 * This page previously had NO metadata export, so it inherited the layout's
 * default title — meaning /shop-all and the homepage shipped identical titles
 * and competed with each other. Search language goes first; the layout appends
 * "| CaseKisses".
 */
export const metadata: Metadata = {
  title: 'Cute Phone Cases — Shop All',
  description:
    'Browse every CaseKisses design — cute, coquette iPhone cases with 3D bows, cherries, teddy bear charms and pastel finishes. Fits iPhone 12 through iPhone 17. Free standard shipping to Canada and the USA.',
  alternates: { canonical: 'https://www.casekisses.com/shop-all' },
  openGraph: {
    title: 'Cute Phone Cases — Shop All | CaseKisses',
    description:
      'Browse every CaseKisses design — cute, coquette iPhone cases with bows, cherries and charms.',
    url: 'https://www.casekisses.com/shop-all',
    type: 'website',
  },
}

interface Product {
  id: string
  slug: string | null
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
 * Server component — products are fetched on the server so the grid is in the
 * initial HTML. Do NOT convert this back to a 'use client' + useEffect fetch:
 * crawlers that don't run JavaScript (OAI-SearchBot / ChatGPT, BingBot) would
 * see an empty page instead of our catalogue.
 */
export default async function ShopAllPage() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching products:', error.message)
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
            Shop All
          </h1>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg text-foreground/60">No products available</p>
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
