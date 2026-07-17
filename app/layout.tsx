import type { Metadata } from 'next'
import { DM_Sans, DM_Serif_Display, Sarina, Dancing_Script, Playfair_Display } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { CartDrawer } from '@/components/cart-drawer'
import { EmailPopup } from '@/components/EmailPopup'
import { TiktokPixel } from '@/components/TiktokPixel'
import './globals.css'

const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-sans' });
const dmSerif = DM_Serif_Display({ subsets: ['latin'], weight: '400', variable: '--font-serif' });
const sarina = Sarina({ subsets: ['latin'], weight: '400', variable: '--font-sarina' });
const dancingScript = Dancing_Script({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-dancing' });
const playfairDisplay = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });

export const metadata: Metadata = {
  metadataBase: new URL('https://www.casekisses.com'),
  title: {
    default: 'CaseKisses — Cute Phone Cases for Cute Prices',
    template: '%s | CaseKisses',
  },
  description: 'Shop adorable, girly phone cases and AirPods cases. Free standard shipping to Canada and the USA.',
  alternates: {
    canonical: 'https://www.casekisses.com',
  },
  openGraph: {
    title: 'CaseKisses — Cute Phone Cases for Cute Prices',
    description: 'Shop adorable, girly phone cases and AirPods cases. Free standard shipping to Canada and the USA.',
    url: 'https://www.casekisses.com',
    siteName: 'CaseKisses',
    images: [
      {
        url: 'https://www.casekisses.com/images/casekiss-logo.png',
        width: 1200,
        height: 630,
        alt: 'CaseKisses — Cute Phone Cases',
      },
    ],
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CaseKisses — Cute Phone Cases for Cute Prices',
    description: 'Shop adorable, girly phone cases and AirPods cases. Free standard shipping to Canada and the USA.',
    images: ['https://www.casekisses.com/images/casekiss-logo.png'],
  },
  icons: {
    icon: '/icon.png',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

/**
 * Organization + WebSite structured data.
 *
 * This is what tells Google AND AI engines (ChatGPT/Bing) that CaseKisses is a
 * single, real, identifiable brand rather than a random store. `sameAs` ties all
 * our profiles into one entity — keep this list accurate and add new profiles.
 */
const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': 'https://www.casekisses.com/#organization',
  name: 'CaseKisses',
  url: 'https://www.casekisses.com',
  logo: 'https://www.casekisses.com/images/casekiss-logo.png',
  description:
    'CaseKisses is a cute, coquette-aesthetic phone case brand — bows, cherries, and pastel designs for iPhone.',
  slogan: 'Cute phone cases for cute prices.',
  // Only list profiles we actually own. A wrong URL here tells Google and AI
  // that someone else's account is us — worse than listing nothing.
  // TODO: add Pinterest once that account exists.
  sameAs: [
    'https://www.tiktok.com/@casekisses',
    'https://www.instagram.com/casekisses.shop/',
  ],
}

const webSiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': 'https://www.casekisses.com/#website',
  name: 'CaseKisses',
  url: 'https://www.casekisses.com',
  publisher: { '@id': 'https://www.casekisses.com/#organization' },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${dmSerif.variable} ${sarina.variable} ${dancingScript.variable} ${playfairDisplay.variable} bg-background`}>
      <body className="font-sans antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteJsonLd) }}
        />
        <TiktokPixel />
        {children}
        <CartDrawer />
        <EmailPopup />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
