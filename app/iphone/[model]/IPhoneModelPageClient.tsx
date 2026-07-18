'use client'

import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ProductCard } from '@/components/product-card'
import { getModelDisplayName } from '@/lib/iphone-models'
import type { ModelNote } from '@/lib/iphone-model-notes'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface Product {
  id: string
  slug: string | null
  name: string
  price: number
  image_url: string
  image_alt?: string | null
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
  /**
   * The model-specific fit note — the one thing that makes this page different
   * from every other model page. See lib/iphone-model-notes.ts for why.
   */
  note: ModelNote | null
}

export function IPhoneModelPageClient({ model, products, note }: Props) {
  const modelTitle = getModelDisplayName(model)

  return (
    <div className="min-h-screen pt-20">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center gap-4 mb-8">
          {/* Points to /shop-all, NOT /iphone — /iphone 307-redirects to the
              homepage (see next.config.mjs), so linking there sent visitors
              somewhere they didn't ask to go and leaked a redirect into the
              internal link graph. */}
          <Link href="/shop-all" className="p-2 hover:bg-accent rounded-full transition-colors">
            <ArrowLeft size={20} />
          </Link>
          {/* H1 matches the <title> ("Cute {model} Cases") — they used to
              disagree, and the H1 is one of the strongest on-page signals. */}
          <h1 className="text-3xl font-bold" style={{ color: '#c0304f' }}>
            Cute {modelTitle} Cases
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

        {/* The fit note.
            This is the only content on the page that isn't shared with every
            other model page, so it carries the whole "why does this URL deserve
            to exist" argument. It sits below the grid because shoppers came to
            look at cases first — but it's in the initial HTML either way, which
            is what matters for crawlers. */}
        {note && (
          <section className="mt-16 max-w-3xl">
            <h2 className="text-2xl font-serif text-foreground mb-3">
              {note.heading}
            </h2>
            <p className="text-foreground/80 leading-relaxed text-pretty">
              {note.body}
            </p>
            <p className="text-foreground/60 text-sm mt-4 text-pretty">
              Every case above lists the exact models it fits. If your model
              isn&rsquo;t named, it isn&rsquo;t a fit — we&rsquo;d rather tell you
              than sell you the wrong thing.
            </p>
          </section>
        )}
      </div>
      <Footer />
    </div>
  )
}
