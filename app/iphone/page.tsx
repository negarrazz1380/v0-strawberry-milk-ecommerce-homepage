import { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'
import { ProductCard } from '@/components/product-card'
import { IPHONE_MODELS_MAP, getModelDisplayName } from '@/lib/iphone-models'
import Link from 'next/link'

const BASE_URL = 'https://www.casekisses.com'

export const metadata: Metadata = {
  title: 'Cute iPhone Cases',
  description:
    'Shop cute iPhone cases from CaseKisses. Find aesthetic, stylish, and protective iPhone cases for your favorite model.',
  alternates: {
    canonical: `${BASE_URL}/iphone`,
  },
  openGraph: {
    title: 'Cute iPhone Cases | CaseKisses',
    description:
      'Shop cute iPhone cases from CaseKisses. Find aesthetic, stylish, and protective iPhone cases for your favorite model.',
    url: `${BASE_URL}/iphone`,
    siteName: 'CaseKisses',
    images: [
      {
        url: `${BASE_URL}/images/iphone-cases.jpg`,
        width: 1200,
        height: 630,
        alt: 'Cute iPhone Cases — CaseKisses',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cute iPhone Cases | CaseKisses',
    description:
      'Shop cute iPhone cases from CaseKisses. Find aesthetic, stylish, and protective iPhone cases for your favorite model.',
    images: [`${BASE_URL}/images/iphone-cases.jpg`],
  },
}

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
  is_active: boolean
}

// Featured model pages shown as quick-filter links
const FEATURED_MODELS = [
  'iphone_16_pro_max',
  'iphone_16_pro',
  'iphone_16',
  'iphone_15_pro_max',
  'iphone_15_pro',
  'iphone_15',
  'iphone_14',
  'iphone_13',
  'iphone_12',
]

export default async function IPhonePage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // All iPhone model display names — used for the .overlaps() query
  const allModelDisplayNames = Object.values(IPHONE_MODELS_MAP)

  // Fetch all active products where device_models overlaps with any iPhone model
  const { data: products, error } = await supabase
    .from('products')
    .select(
      'id, slug, name, price, image_url, description, category, device_models, stock, sales_count, is_best_seller, is_active'
    )
    .eq('is_active', true)
    .overlaps('device_models', allModelDisplayNames)
    .order('sales_count', { ascending: false })

  if (error) {
    console.error('Error fetching iPhone products:', error.message)
  }

  const allProducts: Product[] = products || []

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Header */}
        <div className="mb-10">
          <h1
            className="text-4xl font-bold mb-3"
            style={{ color: '#c0304f', fontFamily: 'var(--font-dancing), cursive' }}
          >
            Cute iPhone Cases
          </h1>
          <p className="text-foreground/60 text-base max-w-2xl leading-relaxed">
            Find the perfect case for your iPhone — aesthetic, protective, and totally adorable.
            Pick your model below or browse the full collection.
          </p>
        </div>

        {/* Model quick-links */}
        <div className="flex flex-wrap gap-2 mb-10">
          {FEATURED_MODELS.map((slug) => (
            <Link
              key={slug}
              href={`/iphone/${slug}`}
              className="px-4 py-2 rounded-full text-sm font-semibold border border-primary/30 hover:bg-primary hover:text-white transition-colors"
              style={{ color: '#c0304f', borderColor: '#c0304f33' }}
            >
              {getModelDisplayName(slug)}
            </Link>
          ))}
        </div>

        {/* Product grid */}
        {allProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg text-foreground/50">No iPhone cases available right now.</p>
            <Link
              href="/shop-all"
              className="mt-4 inline-block text-sm font-semibold underline"
              style={{ color: '#c0304f' }}
            >
              Browse all products
            </Link>
          </div>
        ) : (
          <>
            <p className="text-sm text-foreground/50 mb-6">
              {allProducts.length} {allProducts.length === 1 ? 'product' : 'products'} available
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {allProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}

        {/* Browse by model — full list */}
        <div className="mt-16 pt-10 border-t border-border/40">
          <h2
            className="text-2xl font-bold mb-6"
            style={{ color: '#c0304f', fontFamily: 'var(--font-dancing), cursive' }}
          >
            Shop by iPhone Model
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {Object.entries(IPHONE_MODELS_MAP).map(([slug, displayName]) => (
              <Link
                key={slug}
                href={`/iphone/${slug}`}
                className="flex items-center justify-center px-4 py-3 rounded-2xl text-sm font-semibold text-center border transition-all hover:shadow-md"
                style={{
                  borderColor: '#f9a8c9',
                  color: '#c0304f',
                  backgroundColor: '#fff0f5',
                }}
              >
                {displayName}
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
