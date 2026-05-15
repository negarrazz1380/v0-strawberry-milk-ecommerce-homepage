import { Metadata } from 'next'
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
    title: `${title} - CaseKisses`,
    description: description,
    openGraph: {
      title: `${title} - CaseKisses`,
      description: description,
    },
  }
}

export default async function ShopPage({ params }: { params: Promise<{ shop: string }> }) {
  const { shop } = await params
  const title = titles[shop] || 'Shop'

  return <ShopPageClient shop={shop} title={title} />
}
