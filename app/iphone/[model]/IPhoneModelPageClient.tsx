'use client'

import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ProductCard } from '@/components/product-card'
import { getModelDisplayName } from '@/lib/iphone-models'
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

interface Props {
  model: string
  /**
   * Products are fetched and filtered on the SERVER in page.tsx.
   *
   * Do NOT re-fetch them here. Client-side fetching means the product grid is
   * missing from the initial HTML, so crawlers that don't run JavaScript see an
   * empty category page.
   */
  products: Product[]
}

export function IPhoneModelPageClient({ model, products }: Props) {
  const modelTitle = getModelDisplayName(model)

  return (
    <div className="min-h-screen pt-20">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/iphone" className="p-2 hover:bg-accent rounded-full transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-3xl font-bold" style={{ color: '#c0304f' }}>
            {modelTitle} Cases
          </h1>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg text-foreground/60">No products available for {modelTitle}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
