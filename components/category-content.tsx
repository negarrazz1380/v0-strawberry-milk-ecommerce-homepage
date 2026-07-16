'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
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
  /**
   * Products are fetched on the SERVER in page.tsx and passed in here.
   *
   * The device filter below is client-side (it needs interactivity), but the
   * DATA must arrive as a prop. Re-fetching in useEffect would leave the grid
   * out of the initial HTML and hide the catalogue from non-JS crawlers.
   */
  products: Product[]
}

export function CategoryContent({ category, products }: CategoryContentProps) {
  const searchParams = useSearchParams()
  const deviceParam = searchParams.get('device')
  const [selectedDevice, setSelectedDevice] = useState<string>(deviceParam || 'all')

  const devices =
    category === 'iphone' || category === 'airpods'
      ? ([...new Set(products.flatMap((p) => p.device_models || []))].filter(
          Boolean
        ) as string[])
      : []

  const filteredProducts =
    selectedDevice === 'all'
      ? products
      : products.filter((p) => p.device_models?.includes(selectedDevice))

  const categoryTitle =
    { iphone: 'iPhone', airpods: 'AirPods', accessories: 'Accessories' }[category] ||
    category.charAt(0).toUpperCase() + category.slice(1)

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
