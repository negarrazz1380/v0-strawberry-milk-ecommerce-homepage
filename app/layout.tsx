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
  description: 'Shop adorable, girly phone cases and AirPods cases. Free shipping on orders over $35.',
  alternates: {
    canonical: 'https://www.casekisses.com',
  },
  openGraph: {
    title: 'CaseKisses — Cute Phone Cases for Cute Prices',
    description: 'Shop adorable, girly phone cases and AirPods cases. Free shipping on orders over $35.',
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
    description: 'Shop adorable, girly phone cases and AirPods cases. Free shipping on orders over $35.',
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${dmSerif.variable} ${sarina.variable} ${dancingScript.variable} ${playfairDisplay.variable} bg-background`}>
      <body className="font-sans antialiased">
        <TiktokPixel />
        {children}
        <CartDrawer />
        <EmailPopup />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
