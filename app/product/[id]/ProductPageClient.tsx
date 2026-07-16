'use client'

import { useEffect, useState } from 'react'
import { useCart } from '@/hooks/use-cart'
import { StarRating } from '@/components/star-rating'
import Link from 'next/link'
import { ArrowLeft, ShoppingBag } from 'lucide-react'

interface Product {
  id: string
  name: string
  price: number
  image_url: string | null
  image_alt?: string | null
  description: string | null
  device_models?: string[] | null
  stock: number
}

interface ProductPageClientProps {
  /**
   * The product is fetched on the SERVER in page.tsx and passed in here.
   *
   * Do NOT re-fetch it on the client. Client-side fetching leaves the product
   * name, price and description out of the initial HTML, which makes this page
   * look empty to crawlers that don't run JavaScript (OAI-SearchBot / ChatGPT,
   * BingBot, etc.) and kills our search + AI visibility.
   */
  product: Product
  /** Review summary from the server. Rendered as a jump-link to the reviews section. */
  reviewSummary: {
    count: number
    average: number | null
  }
}

export function ProductPageClient({ product, reviewSummary }: ProductPageClientProps) {
  const { addItem } = useCart()
  const [adding, setAdding] = useState(false)
  const [selectedModel, setSelectedModel] = useState<string>('')

  // Analytics only — runs after hydration and never gates what gets rendered.
  useEffect(() => {
    window.ttq?.track('ViewContent', {
      contents: [{ content_id: product.id, content_name: product.name }],
      content_type: 'product',
      value: product.price,
      currency: 'CAD',
    })
  }, [product.id, product.name, product.price])

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
                alt={product.image_alt || product.name}
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
              {reviewSummary.average !== null && (
                <a
                  href="#reviews"
                  className="inline-flex items-center gap-2 mb-2 hover:opacity-80 transition-opacity"
                >
                  <StarRating rating={reviewSummary.average} />
                  <span className="text-sm text-foreground/60">
                    {reviewSummary.average} ({reviewSummary.count})
                  </span>
                </a>
              )}
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
                      image_url: product.image_url ?? undefined,
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
                Free standard shipping to Canada and the USA
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
