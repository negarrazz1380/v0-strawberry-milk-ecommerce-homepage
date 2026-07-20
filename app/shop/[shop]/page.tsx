import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { ShopPageClient } from './ShopPageClient'

const titles: { [key: string]: string } = {
  'best-sellers': 'Best Sellers',
  'last-chance': 'Last Chance',
  'all': 'Shop All',
}

const descriptions: { [key: string]: string } = {
  'best-sellers': 'Our most popular phone cases - customer favorites',
  'last-chance': 'Limited stock phone cases at great prices',
  'all': 'Browse our complete collection of cute phone cases',
}

export async function generateMetadata({ params }: { params: Promise<{ shop: string }> }): Promise<Metadata> {
  const { shop } = await params
  const title = titles[shop] || 'Shop'
  const description = descriptions[shop] || 'Cute phone cases for cute prices'

  return {
    title,
    alternates: { canonical: `https://www.casekisses.com/shop/${shop}` },
    description: description,
    openGraph: {
      title: `${title} - CaseKisses`,
      description: description,
    },
  }
}

/**
 * Fetches the products for a shop collection — on the SERVER.
 *
 * Runs at request time so the grid is present in the initial HTML. Do NOT move
 * this into the client component: crawlers that don't run JavaScript
 * (OAI-SearchBot / ChatGPT, BingBot) would see an empty page.
 */
async function fetchShopProducts(shop: string) {
  const supabase = await createClient()

  let query = supabase
    .from('products')
    .select(
      'id, slug, name, price, image_url, description, category, device_models, stock, sales_count, is_best_seller'
    )
    .eq('is_active', true)

  if (shop === 'best-sellers') {
    query = query.eq('is_best_seller', true).order('sales_count', { ascending: false })
  } else if (shop === 'last-chance') {
    query = query.lt('stock', 6).gt('stock', 0).order('stock', { ascending: true })
  } else if (shop === 'all') {
    query = query.order('created_at', { ascending: false })
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching shop products:', error.message)
    return []
  }

  return data ?? []
}

export default async function ShopPage({ params }: { params: Promise<{ shop: string }> }) {
  const { shop } = await params
  const title = titles[shop] || 'Shop'
  const products = await fetchShopProducts(shop)

  return <ShopPageClient shop={shop} title={title} products={products} />
}
