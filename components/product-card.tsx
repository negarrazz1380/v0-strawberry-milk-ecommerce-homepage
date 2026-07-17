'use client'

import Link from 'next/link'
import Image from 'next/image'
import { productUrl } from '@/lib/product-slug'

interface Product {
  id: string
  slug?: string | null
  name: string
  price: number
  image_url: string
  image_alt?: string | null
  stock: number
  sales_count?: number
  is_best_seller?: boolean
}

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const isOutOfStock = product.stock === 0
  const isLowStock = product.stock > 0 && product.stock <= 5

  return (
    <Link href={productUrl(product)} className="group">
      <div className="bg-card rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        {/* Product Image */}
        <div className="relative w-full aspect-square overflow-hidden bg-accent">
          {product.image_url ? (
            <Image
              src={product.image_url}
              /* Alt text is what AI crawlers actually read to understand the
                 image. Prefer the product's own written description of the
                 photo; fall back to the name only when none exists yet. */
              alt={product.image_alt || product.name}
              fill
              /* `sizes` tells Next which width to actually serve. Without it,
                 it assumes full-viewport and ships a needlessly large file to
                 phones. These match the grid: 2-up on mobile, 3-up on tablet,
                 4-up on desktop. */
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-foreground/30">
              No image
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 right-3 flex flex-col gap-2">
            {isLowStock && !isOutOfStock && (
              <span
                className="px-3 py-1 rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: '#f97316' }}
              >
                Only {product.stock} left
              </span>
            )}
            {isOutOfStock && (
              <span
                className="px-3 py-1 rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: '#6b7280' }}
              >
                Sold Out
              </span>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4">
          <h3 className="font-semibold text-foreground line-clamp-2 mb-2">
            {product.name}
          </h3>
          <p className="text-sm text-primary font-bold">
            ${parseFloat(product.price.toString()).toFixed(2)}
          </p>
        </div>
      </div>
    </Link>
  )
}
