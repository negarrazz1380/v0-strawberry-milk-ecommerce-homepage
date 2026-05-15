import { Metadata } from 'next'
import { getModelDisplayName } from '@/lib/iphone-models'
import { IPhoneModelPageClient } from './IPhoneModelPageClient'

const BASE_URL = 'https://www.casekisses.com'

interface Props {
  params: Promise<{ model: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { model } = await params
  const modelTitle = getModelDisplayName(model)
  const title = `Cute ${modelTitle} Cases | CaseKisses`
  const description = `Shop cute ${modelTitle} cases from CaseKisses. Find aesthetic, protective, and stylish phone cases with secure checkout and free shipping over $35.`
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

export default async function IPhoneModelPage({ params }: Props) {
  const { model } = await params
  return <IPhoneModelPageClient model={model} />
}
