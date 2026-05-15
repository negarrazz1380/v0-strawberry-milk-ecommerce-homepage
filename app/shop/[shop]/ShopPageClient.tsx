'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
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
}

export function ShopPageClient({ shop, title }: ShopPageClientProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      const supabase = createClient()
      let query = supabase
        .from('products')
        .select('id, slug, name, price, image_url, description, category, device_models, stock, sales_count, is_best_seller')
        .eq('is_active', true)

      if (shop === 'best-sellers') {
        query = query.eq('is_best_seller', true).order('sales_count', { ascending: false })
      } else if (shop === 'last-chance') {
        query = query
          .lt('stock', 6)
          .gt('stock', 0)
          .order('stock', { ascending: true })
      } else if (shop === 'all') {
        query = query.order('created_at', { ascending: false })
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching products:', error)
        setLoading(false)
        return
      }

      setProducts(data || [])
      setLoading(false)
    }

    fetchProducts()
  }, [shop])

  if (loading) {
    return (
      <div className="min-h-screen pt-20">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white/50 rounded-3xl h-80 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

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
