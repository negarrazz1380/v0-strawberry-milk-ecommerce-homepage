import { createClient } from '@/lib/supabase/server'
import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { ProductPageClient } from './ProductPageClient'
import { isUUID } from '@/lib/product-slug'

const BASE_URL = 'https://www.casekisses.com'

interface Props {
  params: Promise<{ id: string }>
}

interface Product {
  id: string
  slug: string | null
  name: string
  description: string | null
  price: number
  image_url: string | null
  category: string | null
  device_models: string[] | null
  stock: number
}

/** Returns the canonical URL path for a product — slug-first, UUID fallback. */
function productCanonicalPath(product: Pick<Product, 'id' | 'slug'>): string {
  return `/product/${product.slug || product.id}`
}

/** Fetches a product by UUID or by slug — handles both transparently. */
async function fetchProduct(idOrSlug: string): Promise<Product | null> {
  const supabase = await createClient()

  if (isUUID(idOrSlug)) {
    const { data } = await supabase
      .from('products')
      .select('id, slug, name, description, price, image_url, category, device_models, stock')
      .eq('id', idOrSlug)
      .single()
    return data ?? null
  }

  // Treat as slug
  const { data } = await supabase
    .from('products')
    .select('id, slug, name, description, price, image_url, category, device_models, stock')
    .eq('slug', idOrSlug)
    .single()
  return data ?? null
}

function buildTitle(product: Pick<Product, 'name' | 'device_models'>): string {
  const model = product.device_models?.[0] ?? null
  return model
    ? `${product.name} for ${model} | CaseKisses`
    : `${product.name} | CaseKisses`
}

function buildDescription(product: Pick<Product, 'name' | 'description' | 'category' | 'device_models'>): string {
  if (product.description) {
    return product.description.length > 160
      ? product.description.slice(0, 157) + '...'
      : product.description
  }
  const model = product.device_models?.[0] ?? null
  return [
    `Shop ${product.name}`,
    model ? `for ${model}` : null,
    product.category ? `in the ${product.category} category` : null,
    'at CaseKisses. Cute phone cases for cute prices.',
  ]
    .filter(Boolean)
    .join(' ')
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { id } = await params
    const product = await fetchProduct(id)

    if (!product) {
      return {
        title: 'Product Not Found | CaseKisses',
        description: 'Cute phone cases for cute prices.',
      }
    }

    const title = buildTitle(product)
    const description = buildDescription(product)
    const canonicalUrl = `${BASE_URL}${productCanonicalPath(product)}`
    const imageUrl = product.image_url || `${BASE_URL}/images/casekiss-logo.png`

    return {
      title,
      description,
      alternates: { canonical: canonicalUrl },
      openGraph: {
        title,
        description,
        url: canonicalUrl,
        siteName: 'CaseKisses',
        images: [{ url: imageUrl, width: 1200, height: 630, alt: `${product.name} — CaseKisses` }],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [imageUrl],
      },
    }
  } catch {
    return {
      title: 'Product | CaseKisses',
      description: 'Cute phone cases for cute prices.',
    }
  }
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params
  const product = await fetchProduct(id)

  if (!product) {
    notFound()
  }

  // 301 redirect: if visitor used UUID and a slug exists, redirect to slug URL
  if (isUUID(id) && product.slug) {
    redirect(`/product/${product.slug}`)
  }

  const canonicalPath = productCanonicalPath(product)
  const canonicalUrl = `${BASE_URL}${canonicalPath}`
  const isInStock = product.stock > 0

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || '',
    image: product.image_url || '',
    sku: product.id,
    brand: { '@type': 'Brand', name: 'CaseKisses' },
    category: product.category || 'Phone Cases',
    url: canonicalUrl,
    offers: {
      '@type': 'Offer',
      price: product.price.toFixed(2),
      priceCurrency: 'USD',
      availability: isInStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      url: canonicalUrl,
      seller: { '@type': 'Organization', name: 'CaseKisses' },
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductPageClient productId={product.id} />
    </>
  )
}
