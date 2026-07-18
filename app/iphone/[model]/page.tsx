import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getModelDisplayName } from '@/lib/iphone-models'
import { getModelNote } from '@/lib/iphone-model-notes'
import { buildBreadcrumbJsonLd } from '@/lib/breadcrumbs'
import { IPhoneModelPageClient } from './IPhoneModelPageClient'

const BASE_URL = 'https://www.casekisses.com'

interface Props {
  params: Promise<{ model: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { model } = await params
  const modelTitle = getModelDisplayName(model)
  const note = getModelNote(model)
  const title = `Cute ${modelTitle} Cases`
  /**
   * The description leads with the model-specific fit fact where we have one.
   *
   * Every model page used to ship the same boilerplate description with only
   * the model name swapped — which is part of why Google treated these pages as
   * duplicates and left them unindexed. The fit note is genuinely different per
   * model, so it goes first.
   */
  const description = note
    ? `${note.body.split('.')[0]}. Shop cute ${modelTitle} cases from CaseKisses — free standard shipping to Canada and the USA.`
    : `Shop cute ${modelTitle} cases from CaseKisses. Find aesthetic, protective, and stylish phone cases with secure checkout and free standard shipping to Canada and the USA.`
  const canonicalUrl = `${BASE_URL}/iphone/${model}`

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'CaseKisses',
      images: [
        {
          url: `${BASE_URL}/images/iphone-cases.jpg`,
          width: 1200,
          height: 630,
          alt: `Cute ${modelTitle} Cases — CaseKisses`,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${BASE_URL}/images/iphone-cases.jpg`],
    },
  }
}

/**
 * Fetches the cases that fit a given iPhone model — on the SERVER.
 *
 * This runs at request time so the product grid is present in the initial HTML.
 * Do NOT move this back into the client component: crawlers that don't run
 * JavaScript (OAI-SearchBot / ChatGPT, BingBot) would see an empty page.
 */
async function fetchProductsForModel(model: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('products')
    .select(
      'id, slug, name, price, image_url, image_alt, description, category, device_models, stock, sales_count, is_best_seller'
    )
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching products for model:', error.message)
    return []
  }

  const modelDisplayName = getModelDisplayName(model)

  return (data || []).filter((product) =>
    (product.device_models || []).includes(modelDisplayName)
  )
}

export default async function IPhoneModelPage({ params }: Props) {
  const { model } = await params
  const products = await fetchProductsForModel(model)
  const modelTitle = getModelDisplayName(model)
  const note = getModelNote(model)

  /**
   * FAQ schema built from the model's own fit note.
   *
   * "Will my iPhone 14 case fit an iPhone 15" is a real, high-volume question.
   * Answering it here — in schema, on the page that sells those cases — is what
   * gives this page a reason to exist that /iphone/iphone_13 doesn't share.
   * Only emitted when a real note exists; never invent one to fill the slot.
   */
  const faqJsonLd = note
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: note.heading,
            acceptedAnswer: { '@type': 'Answer', text: note.body },
          },
        ],
      }
    : null

  return (
    <>
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            buildBreadcrumbJsonLd([
              { name: 'Home', path: '/' },
              { name: 'Shop All', path: '/shop-all' },
              { name: `Cute ${modelTitle} Cases` },
            ])
          ),
        }}
      />
      <IPhoneModelPageClient model={model} products={products} note={note} />
    </>
  )
}
