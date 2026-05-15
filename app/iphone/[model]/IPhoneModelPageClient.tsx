'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
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
}

export function IPhoneModelPageClient({ model }: Props) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('products')
        .select('id, slug, name, price, image_url, description, category, device_models, stock, sales_count, is_best_seller')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching products:', error)
        setLoading(false)
        return
      }

      const modelDisplayName = getModelDisplayName(model)
      const filtered = (data || []).filter((product) => {
        const deviceModels = product.device_models || []
        return deviceModels.includes(modelDisplayName)
      })

      setProducts(filtered)
      setLoading(false)
    }

    fetchProducts()
  }, [model])

  const modelTitle = getModelDisplayName(model)

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
    </div>
  )
}
