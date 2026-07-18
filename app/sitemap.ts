import { MetadataRoute } from 'next'
import { fetchSitemapProducts } from '@/lib/sitemap-products'
import { IPHONE_MODELS_MAP } from '@/lib/iphone-models'

// Force dynamic rendering — without this, Next.js renders the sitemap at
// build time (before products exist in Supabase) and never updates it.
export const dynamic = 'force-dynamic'
export const revalidate = 3600 // re-fetch products every hour at most

const BASE_URL = 'https://www.casekisses.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch products using shared helper — same logic as debug route
  const { products, error } = await fetchSitemapProducts()

  if (error) {
    console.error('[sitemap] Error:', error.message)
  }

  console.log(`[sitemap] Products fetched: ${products.length}`)

  const productUrls: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${BASE_URL}/product/${product.slug || product.id}`,
    lastModified: product.created_at ? new Date(product.created_at) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  /**
   * Which iPhone models do we actually sell cases for right now?
   *
   * This is derived from live product data rather than a hardcoded list, so a
   * model page is listed the moment a product is tagged for it — and dropped
   * again if the last product for it goes inactive. A hardcoded exclusion list
   * silently goes stale and hides real pages from crawlers.
   */
  const modelsWithProducts = new Set(
    products.flatMap((product) => product.device_models ?? [])
  )

  const deviceUrls: MetadataRoute.Sitemap = [
    /**
     * NOTE: /iphone is deliberately NOT listed.
     *
     * It 307-redirects to / (see next.config.mjs). A redirecting URL in a
     * sitemap tells Google "index this" and then hands it something else —
     * which is exactly what shows up in Search Console as "Page with redirect".
     * Only ever list URLs that return 200.
     */
    ...Object.entries(IPHONE_MODELS_MAP)
      .filter(([, displayName]) => modelsWithProducts.has(displayName))
      .map(([slug]) => ({
        url: `${BASE_URL}/iphone/${slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.75,
      })),
  ]

  /**
   * Category pages, derived from live product data.
   *
   * Only categories that actually contain a product are listed. /category/airpods
   * and /category/accessories were previously hardcoded here while containing
   * zero products — Google crawled them, found nothing, and filed them under
   * "Crawled - currently not indexed". Empty pages in a sitemap spend crawl
   * budget that a new domain does not have to spare.
   */
  const categoriesWithProducts = new Set(
    products.map((product) => product.category).filter(Boolean) as string[]
  )

  const categoryUrls: MetadataRoute.Sitemap = Array.from(categoriesWithProducts).map(
    (category) => ({
      url: `${BASE_URL}/category/${category}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.85,
    })
  )

  // Static public-facing pages only — auth, admin, cart, checkout excluded
  const staticUrls: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE_URL}/shop-all`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/guides/do-clear-phone-cases-turn-yellow`, lastModified: new Date('2026-07-16'), changeFrequency: 'monthly', priority: 0.85 },
    { url: `${BASE_URL}/guides/what-is-the-coquette-aesthetic`, lastModified: new Date('2026-07-17'), changeFrequency: 'monthly', priority: 0.85 },
    { url: `${BASE_URL}/cute-kit`, lastModified: new Date('2026-07-17'), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/shop/best-sellers`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.85 },
    { url: `${BASE_URL}/shop/last-chance`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/faq`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/help`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/shipping`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/returns`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/exchange`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.4 },
    { url: `${BASE_URL}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.4 },
  ]

  return [...staticUrls, ...categoryUrls, ...deviceUrls, ...productUrls]
}
