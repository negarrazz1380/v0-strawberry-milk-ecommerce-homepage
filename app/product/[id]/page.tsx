import { createClient } from '@/lib/supabase/server'
import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { ProductPageClient } from './ProductPageClient'
import { ProductReviewsSection } from '@/components/product-reviews'
import { fetchProductReviews } from '@/lib/reviews'
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
  image_alt: string | null
  seo_title: string | null
  seo_description: string | null
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
      .select('id, slug, name, description, price, image_url, image_alt, seo_title, seo_description, category, device_models, stock')
      .eq('id', idOrSlug)
      .single()
    return data ?? null
  }

  // Treat as slug
  const { data } = await supabase
    .from('products')
    .select('id, slug, name, description, price, image_url, image_alt, seo_title, seo_description, category, device_models, stock')
    .eq('slug', idOrSlug)
    .single()
  return data ?? null
}

/**
 * Builds the <title> for a product page.
 *
 * Prefers seo_title — search language people actually type ("Cute Teddy Bear
 * iPhone Case"). Our product NAMES are invented brand names ("Cocoa Teddy Charm
 * Case") with no search volume, so they're only a fallback.
 *
 * The layout appends "| CaseKisses", so don't add it here.
 */
function buildTitle(product: Pick<Product, 'name' | 'seo_title' | 'device_models'>): string {
  if (product.seo_title) {
    return product.seo_title
  }

  const model = product.device_models?.[0] ?? null
  return model ? `${product.name} for ${model}` : product.name
}

function buildDescription(
  product: Pick<Product, 'name' | 'description' | 'seo_description' | 'category' | 'device_models'>
): string {
  if (product.seo_description) {
    return product.seo_description
  }

  if (product.description) {
    // Strip newlines so the meta description stays a single clean line.
    const flat = product.description.replace(/\s+/g, ' ').trim()
    return flat.length > 160 ? flat.slice(0, 157) + '...' : flat
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

  // Reviews are fetched on the server so both the visible list AND the
  // AggregateRating schema below are in the initial HTML.
  const reviewData = await fetchProductReviews(product.id)

  /**
   * Product image as a full ImageObject rather than a bare URL string.
   *
   * Schema is how AI engines confirm what an image shows — roughly 65-71% of
   * pages cited by AI search carry structured data. The `caption` mirrors the
   * visible alt text on purpose: when the explicit description and the vision
   * model's own read agree, confidence (and citation odds) go up.
   */
  const imageAlt = product.image_alt || product.name
  const imageObject = product.image_url
    ? {
        '@type': 'ImageObject',
        contentUrl: product.image_url,
        url: product.image_url,
        caption: imageAlt,
        description: imageAlt,
        representativeOfPage: true,
      }
    : undefined

  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || '',
    image: imageObject ? [imageObject] : [],
    sku: product.id,
    brand: { '@type': 'Brand', name: 'CaseKisses' },
    category: product.category || 'Phone Cases',
    url: canonicalUrl,
    /**
     * Explicit entity links to the devices this case fits.
     *
     * This is what lets an AI answer "cute iPhone 15 case" with THIS product
     * instead of guessing from prose. Generated from device_models, so it stays
     * true automatically — never hardcode it.
     */
    ...(product.device_models && product.device_models.length > 0
      ? {
          isAccessoryOrSparePartFor: product.device_models.map((model) => ({
            '@type': 'Product',
            name: model,
          })),
        }
      : {}),
    offers: {
      '@type': 'Offer',
      price: product.price.toFixed(2),
      priceCurrency: 'CAD',
      availability: isInStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      url: canonicalUrl,
      seller: { '@type': 'Organization', name: 'CaseKisses' },
      /**
       * Shipping + returns as structured data.
       *
       * These must match lib/shipping.ts and app/returns/page.tsx exactly — AI
       * reads this as fact and will state it back to shoppers.
       */
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: '0',
          currency: 'CAD',
        },
        shippingDestination: [
          { '@type': 'DefinedRegion', addressCountry: 'CA' },
          { '@type': 'DefinedRegion', addressCountry: 'US' },
        ],
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: {
            '@type': 'QuantitativeValue',
            minValue: 1,
            maxValue: 3,
            unitCode: 'DAY',
          },
          transitTime: {
            '@type': 'QuantitativeValue',
            minValue: 5,
            maxValue: 10,
            unitCode: 'DAY',
          },
        },
      },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: ['CA', 'US'],
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 14,
        returnMethod: 'https://schema.org/ReturnByMail',
        returnFees: 'https://schema.org/ReturnShippingFees',
        refundType: 'https://schema.org/StoreCreditRefund',
      },
    },
  }

  /**
   * AggregateRating + Review are added ONLY when real approved reviews exist.
   *
   * Never fabricate or hardcode these. Rating schema without matching visible
   * reviews is a Google structured-data violation and can get the whole site's
   * rich results suppressed — and AI engines cross-check it against the page.
   */
  if (reviewData.average !== null && reviewData.count > 0) {
    jsonLd.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: reviewData.average,
      reviewCount: reviewData.count,
      bestRating: 5,
      worstRating: 1,
    }

    jsonLd.review = reviewData.reviews.slice(0, 10).map((review) => ({
      '@type': 'Review',
      reviewRating: {
        '@type': 'Rating',
        ratingValue: review.rating,
        bestRating: 5,
        worstRating: 1,
      },
      author: { '@type': 'Person', name: review.reviewer_name },
      datePublished: review.created_at,
      ...(review.title ? { name: review.title } : {}),
      ...(review.body ? { reviewBody: review.body } : {}),
    }))
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductPageClient product={product} reviewSummary={{ count: reviewData.count, average: reviewData.average }} />
      <ProductReviewsSection
        productId={product.id}
        productName={product.name}
        data={reviewData}
      />
    </>
  )
}
