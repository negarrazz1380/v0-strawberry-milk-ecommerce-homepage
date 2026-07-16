'use client'

import { ProductCard } from '@/components/product-card'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface Product {
  id: string
  slug: string | null
  name: string
  price: number
  image_url: string
  description: string
  category: string
  device_models: string[] | null
  stock: number
  sales_count: number
  is_best_seller: boolean
}

interface ShopPageClientProps {
  shop: string
  title: string
  /**
   * Products are fetched on the SERVER in page.tsx and passed in here.
   *
   * Do NOT re-fetch them on the client — that leaves the grid out of the
   * initial HTML and hides the catalogue from non-JS crawlers.
   */
  products: Product[]
}

export function ShopPageClient({ shop, title, products }: ShopPageClientProps) {

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="p-2 hover:bg-accent rounded-full transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-3xl font-bold" style={{ color: '#c0304f' }}>
            {title}
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
