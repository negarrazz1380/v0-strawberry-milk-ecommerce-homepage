import { Metadata } from 'next'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { buildBreadcrumbJsonLd } from '@/lib/breadcrumbs'
import { WALLPAPERS } from '@/lib/wallpapers'
import Link from 'next/link'

const BASE_URL = 'https://www.casekisses.com'
const CANONICAL = `${BASE_URL}/cute-kit`

const TITLE = 'Free Cute iPhone Wallpapers — The CaseKisses Cute Kit'
const DESCRIPTION =
  'Free coquette iPhone wallpapers — bows, cherries, pastels and teddy bears. No signup, no email required. Download and keep them.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: CANONICAL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: CANONICAL,
    siteName: 'CaseKisses',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
  },
}

export default function CuteKitPage() {
  const hasWallpapers = WALLPAPERS.length > 0

  /**
   * CollectionPage + ImageObject for each wallpaper.
   *
   * Only emitted when wallpapers actually exist — never describe a collection
   * that isn't there. The ImageObject entries are what give these a chance in
   * Google Images and in AI answers to "cute iphone wallpaper".
   */
  const collectionJsonLd = hasWallpapers
    ? {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: TITLE,
        description: DESCRIPTION,
        url: CANONICAL,
        isPartOf: { '@id': `${BASE_URL}/#website` },
        mainEntity: {
          '@type': 'ItemList',
          numberOfItems: WALLPAPERS.length,
          itemListElement: WALLPAPERS.map((wallpaper, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            item: {
              '@type': 'ImageObject',
              name: `${wallpaper.name} iPhone wallpaper`,
              contentUrl: `${BASE_URL}${wallpaper.file}`,
              caption: wallpaper.alt,
              description: wallpaper.alt,
              creditText: 'CaseKisses',
              creator: { '@type': 'Organization', name: 'CaseKisses' },
              // Free to download and use personally — stated explicitly so
              // it's machine-readable, not just implied by the page copy.
              acquireLicensePage: CANONICAL,
            },
          })),
        },
      }
    : null

  return (
    <main className="relative">
      {collectionJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            buildBreadcrumbJsonLd([
              { name: 'Home', path: '/' },
              { name: 'Free Cute Kit' },
            ])
          ),
        }}
      />
      <Header />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-serif text-foreground mb-4 text-balance">
            The Cute Kit 🎀
          </h1>
          <p className="text-lg text-muted-foreground mb-4 text-pretty">
            Free coquette iPhone wallpapers. Bows, cherries, pastels — made by us,
            yours to keep.
          </p>
          <p className="text-foreground/70 mb-12 text-pretty">
            No email, no signup, no &ldquo;share to unlock.&rdquo; A cute case
            deserves a matching screen, and charging you for a background would be
            silly.
          </p>
        </div>

        {hasWallpapers ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {WALLPAPERS.map((wallpaper) => (
              <div key={wallpaper.id} className="group">
                <div className="relative rounded-2xl overflow-hidden bg-secondary/30 aspect-[9/19.5] mb-3">
                  <img
                    src={wallpaper.file}
                    alt={wallpaper.alt}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-sm font-semibold text-foreground mb-2">
                  {wallpaper.name}
                </p>
                {/* The `download` attribute makes this save the file rather than
                    navigate to it — on mobile Safari it may still open the image,
                    which is why the hint below exists. */}
                <a
                  href={wallpaper.file}
                  download={`casekisses-${wallpaper.id}-wallpaper.png`}
                  className="inline-block w-full text-center bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-semibold hover:opacity-90 transition"
                >
                  Download
                </a>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-secondary/30 rounded-2xl p-8 text-center">
            <p className="text-foreground/80 text-pretty">
              Wallpapers are on the way — check back shortly. 🎀
            </p>
          </div>
        )}

        {hasWallpapers && (
          <p className="text-sm text-muted-foreground mt-8 text-pretty">
            On iPhone: tap Download, then open Photos → select the wallpaper →
            Share → Use as Wallpaper. If it opens in a new tab instead of saving,
            press and hold the image and choose Save to Photos.
          </p>
        )}

        <div className="mt-16 bg-primary/5 rounded-2xl p-8">
          <h2 className="text-xl font-serif text-foreground mb-3">
            Free to use, one small ask
          </h2>
          <p className="text-foreground/80 mb-4 text-pretty">
            These are free for your own phone — no strings. Please don&rsquo;t
            resell them or pass them off as your own. If you post a screenshot,
            a tag is always appreciated but never required.
          </p>
          <div className="flex gap-4 flex-wrap">
            <Link
              href="/shop-all"
              className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-semibold hover:opacity-90 transition"
            >
              Shop Matching Cases
            </Link>
            <Link
              href="/guides/what-is-the-coquette-aesthetic"
              className="border border-primary text-primary px-8 py-3 rounded-full font-semibold hover:bg-primary/10 transition"
            >
              What Is Coquette?
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
