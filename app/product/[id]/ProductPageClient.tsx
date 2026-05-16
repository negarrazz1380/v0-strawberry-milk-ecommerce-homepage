'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useCart } from '@/hooks/use-cart'
import Link from 'next/link'
import { ArrowLeft, ShoppingBag } from 'lucide-react'

interface Product {
  id: string
  name: string
  price: number
  image_url: string
  description: string
  device_models?: string[] | null
  stock: number
}

interface ProductPageClientProps {
  productId: string
}

export function ProductPageClient({ productId }: ProductPageClientProps) {
  const router = useRouter()
  const { addItem } = useCart()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [selectedModel, setSelectedModel] = useState<string>('')

  useEffect(() => {
    const fetchProduct = async () => {
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single()

      if (error) {
        console.error('Product fetch error:', error.message, error.code)
        setError('Product not found')
        setLoading(false)
        return
      }

      setProduct(data)
      setLoading(false)

      window.ttq?.track('ViewContent', {
        contents: [{ content_id: data.id, content_name: data.name }],
        content_type: 'product',
        value: data.price,
        currency: 'CAD',
      })
    }

    fetchProduct()
  }, [productId])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="aspect-square bg-white/50 rounded-3xl animate-pulse" />
          <div className="space-y-4">
            <div className="h-8 bg-white/50 rounded-lg w-3/4 animate-pulse" />
            <div className="h-12 bg-white/50 rounded-lg w-1/2 animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <p className="text-lg text-foreground/60 mb-6">{error || 'Product not found'}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium"
          >
            <ArrowLeft size={20} />
            Back to shop
          </Link>
        </div>
      </div>
    )
  }

  return (
    <main>
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-foreground/70 hover:text-primary transition-colors"
        >
          <ArrowLeft size={20} />
          Back to shop
        </Link>
      </div>

      {/* Product Details */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          {/* Product Image */}
          <div className="flex items-center justify-center bg-accent rounded-3xl overflow-hidden aspect-square">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-foreground/30 text-lg">No image available</div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">{product.name}</h1>
              <p className="text-2xl font-bold text-primary">
                ${product.price.toFixed(2)}
              </p>
            </div>

            {product.description && (
              <div>
                <h2 className="text-sm font-semibold text-foreground/70 mb-2">Description</h2>
                <p className="text-foreground/80 leading-relaxed text-pretty">
                  {product.description}
                </p>
              </div>
            )}

            {/* Device Model Selector */}
            {product.device_models && product.device_models.length > 0 && (
              <div>
                <label
                  htmlFor="device-model"
                  className="block text-sm font-semibold text-foreground/70 mb-2"
                >
                  Select Your iPhone Model
                </label>
                <select
                  id="device-model"
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full border-2 border-border rounded-xl px-4 py-3 text-sm bg-background text-foreground focus:outline-none focus:border-primary transition-colors"
                >
                  <option value="">-- Choose a model --</option>
                  {product.device_models.map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Stock Status */}
            {product.stock === 0 && (
              <div className="w-full bg-red-50 border-2 border-red-200 rounded-2xl px-4 py-3 text-center">
                <p className="text-red-700 font-semibold">Sold Out</p>
                <p className="text-red-600 text-sm">This item is currently unavailable.</p>
              </div>
            )}

            {/* Add to Cart / Pre-order Button */}
            {(() => {
              const hasModels = product.device_models && product.device_models.length > 0
              const needsModel = hasModels && !selectedModel
              const isOutOfStock = product.stock === 0
              const isPreorder = isOutOfStock

              return (
                <button
                  onClick={() => {
                    if (needsModel) return
                    setAdding(true)
                    addItem({
                      id: product.id,
                      name: product.name,
                      price: product.price,
                      image_url: product.image_url,
                      device_model: selectedModel || undefined,
                      is_preorder: isPreorder,
                    })
                    window.ttq?.track('AddToCart', {
                      contents: [{ content_id: product.id, content_name: product.name }],
                      content_type: 'product',
                      value: product.price,
                      currency: 'CAD',
                    })
                    setTimeout(() => setAdding(false), 300)
                  }}
                  disabled={adding || !!needsModel}
                  className="w-full flex items-center justify-center gap-2 bg-primary text-white px-6 py-4 rounded-2xl font-semibold hover:bg-primary/90 transition-colors mt-4 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <ShoppingBag size={20} />
                  {adding ? 'Adding...' : needsModel ? 'Select a model to continue' : isPreorder ? 'Pre-order Now' : 'Add to Cart'}
                </button>
              )
            })()}

            {/* Additional Info */}
            <div className="border-t border-border/50 pt-6">
              <p className="text-xs text-foreground/50">
                Free shipping on orders over $35
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
