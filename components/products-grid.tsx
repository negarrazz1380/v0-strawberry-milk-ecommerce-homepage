'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ProductCard } from '@/components/product-card'

interface Product {
  id: string
  slug: string | null
  name: string
  price: number
  image_url: string
  stock: number
  sales_count?: number
  is_best_seller?: boolean
  show_on_homepage?: boolean
}

export function ProductsGrid() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('products')
        .select('id, slug, name, price, image_url, stock, sales_count, is_best_seller, show_on_homepage')
        .eq('is_active', true)
        .eq('show_on_homepage', true)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching products:', error)
        setLoading(false)
        return
      }

      setProducts(data || [])
      setLoading(false)
    }

    fetchProducts()
  }, [])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white/50 rounded-3xl h-80 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <p className="text-lg text-foreground/60">No products yet 💕</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}
