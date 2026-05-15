'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
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

interface CategoryContentProps {
  category: string
}

export function CategoryContent({ category }: CategoryContentProps) {
  const searchParams = useSearchParams()
  const deviceParam = searchParams.get('device')
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [devices, setDevices] = useState<string[]>([])
  const [selectedDevice, setSelectedDevice] = useState<string>(deviceParam || 'all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', category)
        .eq('is_active', true)
        .order('sales_count', { ascending: false })

      if (error) {
        console.error('Error fetching products:', error)
        setLoading(false)
        return
      }

      const productsData = data || []
      setProducts(productsData)

      if (category === 'iphone' || category === 'airpods') {
        // Extract unique device models from all products
        const uniqueDevices = [...new Set(productsData.flatMap(p => p.device_models || []))]
        setDevices(uniqueDevices.filter(Boolean) as string[])
      }

      setFilteredProducts(productsData)
      setLoading(false)
    }

    fetchProducts()
  }, [category])

  useEffect(() => {
    if (selectedDevice === 'all') {
      setFilteredProducts(products)
    } else {
      // Filter products where device_models array contains the selected device
      setFilteredProducts(products.filter(p => p.device_models?.includes(selectedDevice)))
    }
  }, [selectedDevice, products])

  const categoryTitle =
    { iphone: 'iPhone', airpods: 'AirPods', accessories: 'Accessories' }[category] ||
    category.charAt(0).toUpperCase() + category.slice(1)

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
          <Link href="/" className="p-2 hover:bg-accent rounded-full transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-3xl font-bold" style={{ color: '#c0304f' }}>
            {categoryTitle} Cases
          </h1>
        </div>

        {(category === 'iphone' || category === 'airpods') && devices.length > 0 && (
          <div className="mb-8">
            <label className="text-sm font-semibold text-foreground/70 block mb-3">
              Filter by Device
            </label>
            <select
              value={selectedDevice}
              onChange={(e) => setSelectedDevice(e.target.value)}
              className="px-4 py-2 rounded-xl border-[1.5px] border-[#f5a8c2] focus:outline-none focus:ring-2 focus:ring-red-600"
            >
              <option value="all">All Devices</option>
              {devices.map((device) => (
                <option key={device} value={device}>
                  {device.replace(/_/g, ' ').toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        )}

        {filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg text-foreground/60">No products available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
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
