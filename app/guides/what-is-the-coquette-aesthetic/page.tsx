import { Metadata } from 'next'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { buildBreadcrumbJsonLd } from '@/lib/breadcrumbs'
import Link from 'next/link'

const BASE_URL = 'https://www.casekisses.com'
const CANONICAL = `${BASE_URL}/guides/what-is-the-coquette-aesthetic`

// Bump this when the content is meaningfully revised — it feeds dateModified,
// and both Google and AI engines favour recently-refreshed pages.
const LAST_UPDATED = '2026-07-17'

const TITLE = 'What Is the Coquette Aesthetic? A Complete Guide'
const DESCRIPTION =
  'Coquette is a hyper-feminine aesthetic built on bows, lace, pearls and pastels. Here is where it actually came from — 1600s France to Marie Antoinette to TikTok — and how it differs from soft girl and Lolita.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: CANONICAL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: CANONICAL,
    siteName: 'CaseKisses',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
  },
}

/** Source of truth for BOTH the visible Q&A and the FAQPage schema. */
const faqs = [
  {
    q: 'What does coquette mean?',
    a: 'Coquette is a French word meaning a flirtatious woman. It dates to the 1600s, when it described women at the French court who used charm and dress as a form of social influence. Today it names an aesthetic rather than a person — a style built around romantic, playful femininity.',
  },
  {
    q: 'What defines the coquette aesthetic?',
    a: 'Bows above everything else. Then lace, pearls, ribbons, ballet references, and soft colours — especially baby pink, cream and pastel blue. It borrows from the Rococo period, the Victorian era and 1950s–60s femininity, filtered through a modern lens.',
  },
  {
    q: 'When did the coquette aesthetic become popular?',
    a: 'It built slowly and then all at once. The look circulated on Tumblr in the early 2010s, drawing on Lana Del Rey and Sofia Coppola\u2019s 2006 film Marie Antoinette. It exploded on TikTok around 2022, hit the runways in 2023 when Simone Rocha placed bows beneath models\u2019 eyes, and by 2024 people were tying bows onto everything from croissants to water bottles.',
  },
  {
    q: 'What is the difference between coquette and soft girl?',
    a: 'Coquette is more specific, more vintage and more romantic — bows, lace, pearls and ballet. Soft girl is broader and more casual, leaning into pastel hoodies, flower clips and Y2K influences. Both are feminine; coquette is the dressier, more nostalgic of the two.',
  },
  {
    q: 'Is coquette the same as Lolita fashion?',
    a: 'No. Coquette borrows visual elements from Japanese Lolita fashion — lace, bows, feminine silhouettes — but it is far looser. Lolita is a structured subculture with its own rules, brands and community. Coquette asks nothing of you beyond a ribbon.',
  },
  {
    q: 'What colours are coquette?',
    a: 'Traditionally baby pink, cream, white and pastel blue, with red as the accent — cherries, ribbon, lipstick. More recently the palette has widened into deeper shades like dark cherry and even black, sometimes called messy coquette.',
  },
  {
    q: 'How do I make my phone coquette?',
    a: 'A clear case with 3D bows, cherries or a pearl-beaded strap is the fastest route, since your phone is the accessory you hold most often. Pair it with a pastel or ballet-inspired wallpaper and a matching charm. The aesthetic lives in small repeated details, not one big statement.',
  },
]

export default function CoquetteGuide() {
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: TITLE,
    description: DESCRIPTION,
    url: CANONICAL,
    datePublished: LAST_UPDATED,
    dateModified: LAST_UPDATED,
    author: { '@type': 'Organization', name: 'CaseKisses' },
    publisher: {
      '@type': 'Organization',
      name: 'CaseKisses',
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/images/casekiss-logo.png`,
      },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': CANONICAL },
    about: { '@type': 'Thing', name: 'Coquette aesthetic' },
  }

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: { '@type': 'Answer', text: faq.a },
    })),
  }

  return (
    <main className="relative">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            buildBreadcrumbJsonLd([
              { name: 'Home', path: '/' },
              { name: 'Guides', path: '/guides/what-is-the-coquette-aesthetic' },
              { name: 'What Is the Coquette Aesthetic?' },
            ])
          ),
        }}
      />
      <Header />

      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <h1 className="text-4xl md:text-5xl font-serif text-foreground mb-4 text-balance">
          What Is the Coquette Aesthetic?
        </h1>
        <p className="text-sm text-muted-foreground mb-8">
          Last updated{' '}
          <time dateTime={LAST_UPDATED}>
            {new Date(LAST_UPDATED).toLocaleDateString('en-CA', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </time>{' '}
          · by CaseKisses
        </p>

        {/* Answer-first. The direct definition goes at the top for readers and
            AI engines alike — not four paragraphs down. */}
        <div className="bg-primary/5 rounded-2xl p-6 sm:p-8 mb-12">
          <p className="text-foreground/90 leading-relaxed text-lg text-pretty">
            <strong>
              Coquette is a hyper-feminine aesthetic built on bows, lace, pearls
              and pastels
            </strong>{' '}
            — romantic, a little playful, and unapologetically soft. The word is
            French for <em>flirtatious</em>.
          </p>
          <p className="text-foreground/80 leading-relaxed mt-4 text-pretty">
            It looks like a TikTok trend from 2022. It is actually about{' '}
            <strong>four hundred years old</strong>.
          </p>
        </div>

        <div className="space-y-12">
          <section>
            <h2 className="text-2xl font-serif text-foreground mb-4">
              Where it actually came from
            </h2>
            <p className="text-foreground/80 leading-relaxed mb-6 text-pretty">
              Most explainers start at TikTok. The real timeline is longer, and
              it is the reason the aesthetic keeps coming back rather than
              burning out like most trends.
            </p>

            <div className="space-y-4">
              <div className="bg-secondary/30 rounded-2xl p-6">
                <h3 className="font-semibold text-foreground mb-2">
                  1600s — the French court
                </h3>
                <p className="text-foreground/80 text-base leading-relaxed text-pretty">
                  <em>Coquette</em> described a woman who was playful and
                  charming in a way that won admiration. Fashion and flirtation
                  as a form of social power, in a court where women had few
                  others.
                </p>
              </div>

              <div className="bg-secondary/30 rounded-2xl p-6">
                <h3 className="font-semibold text-foreground mb-2">
                  1700s — Rococo and Marie Antoinette
                </h3>
                <p className="text-foreground/80 text-base leading-relaxed text-pretty">
                  The Rococo era brought frills, ruffles, pastels and ornate
                  detail to their peak. Marie Antoinette — ribboned hair, excess
                  as self-expression — is usually named as the aesthetic&rsquo;s
                  spiritual ancestor.
                </p>
              </div>

              <div className="bg-secondary/30 rounded-2xl p-6">
                <h3 className="font-semibold text-foreground mb-2">
                  Victorian era, then the 1950s–60s
                </h3>
                <p className="text-foreground/80 text-base leading-relaxed text-pretty">
                  The look resurfaced twice more, each time reworking the same
                  ingredients: lace, ribbon, a soft silhouette.
                </p>
              </div>

              <div className="bg-secondary/30 rounded-2xl p-6">
                <h3 className="font-semibold text-foreground mb-2">
                  2006–2010s — Tumblr, Lana, Lolita
                </h3>
                <p className="text-foreground/80 text-base leading-relaxed text-pretty">
                  Sofia Coppola&rsquo;s <em>Marie Antoinette</em> landed in 2006.
                  Tumblr spent the early 2010s circulating hyper-feminine imagery
                  built around Lana Del Rey, while Japanese Lolita fashion
                  contributed the lace and bows.
                </p>
              </div>

              <div className="bg-secondary/30 rounded-2xl p-6">
                <h3 className="font-semibold text-foreground mb-2">
                  2022–2024 — TikTok, then the runway
                </h3>
                <p className="text-foreground/80 text-base leading-relaxed text-pretty">
                  It broke wide on TikTok around 2022. In 2023 Simone Rocha sent
                  models out with bows beneath their eyes. By 2024 bows were tied
                  around everything — croissants included — and Miu Miu and Sandy
                  Liang had folded coquette details into their collections.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-foreground mb-4">
              The defining elements
            </h2>
            <ul className="space-y-3">
              <li className="flex gap-3 text-foreground/80">
                <span className="text-primary">🎀</span>
                <span>
                  <strong>Bows.</strong> If one thing defines coquette, it is the
                  bow. Everything else is optional.
                </span>
              </li>
              <li className="flex gap-3 text-foreground/80">
                <span className="text-primary">•</span>
                <span>
                  <strong>Lace and ribbon.</strong> Trim, edges, ties — texture
                  over pattern.
                </span>
              </li>
              <li className="flex gap-3 text-foreground/80">
                <span className="text-primary">•</span>
                <span>
                  <strong>Pearls.</strong> Beaded straps, clustered detail,
                  anything with a vintage-jewellery echo.
                </span>
              </li>
              <li className="flex gap-3 text-foreground/80">
                <span className="text-primary">•</span>
                <span>
                  <strong>Ballet.</strong> Pointe shoes, ribbon ties, tulle — the
                  single strongest visual reference after the bow.
                </span>
              </li>
              <li className="flex gap-3 text-foreground/80">
                <span className="text-primary">•</span>
                <span>
                  <strong>Soft colour, red accents.</strong> Baby pink, cream and
                  pastel blue, punctuated by cherry red.
                </span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-foreground mb-4">
              Coquette vs. soft girl vs. Lolita
            </h2>
            <p className="text-foreground/80 leading-relaxed mb-6 text-pretty">
              These get used interchangeably. They are not the same thing.
            </p>
            <div className="space-y-4">
              <div className="bg-secondary/30 rounded-2xl p-6">
                <h3 className="font-semibold text-foreground mb-2">
                  Coquette vs. soft girl
                </h3>
                <p className="text-foreground/80 text-base leading-relaxed text-pretty">
                  Coquette is more vintage and more romantic: bows, lace, pearls,
                  ballet. Soft girl is broader and more everyday — pastel
                  hoodies, flower clips, a Y2K tilt. Coquette is the dressier of
                  the two.
                </p>
              </div>
              <div className="bg-secondary/30 rounded-2xl p-6">
                <h3 className="font-semibold text-foreground mb-2">
                  Coquette vs. Lolita
                </h3>
                <p className="text-foreground/80 text-base leading-relaxed text-pretty">
                  Coquette borrows Lolita&rsquo;s lace, bows and silhouettes, but
                  Lolita is a structured subculture with rules, specific brands
                  and a real community behind it. Coquette asks nothing of you
                  beyond a ribbon.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-foreground mb-4">
              Why it stuck
            </h2>
            <p className="text-foreground/80 leading-relaxed mb-4 text-pretty">
              Most aesthetics burn out in a season. This one has come back four
              times across four centuries, which suggests it is answering
              something more durable than an algorithm.
            </p>
            <p className="text-foreground/80 leading-relaxed text-pretty">
              Stylists describe it as a quiet rebellion — femininity treated as a
              strength rather than a fragility, and softness chosen on purpose in
              a culture that usually rewards the opposite. That reading explains
              the staying power better than &ldquo;bows are trending&rdquo; does.
              Ribbons are not new. Wanting to romanticise your own ordinary day
              is not new either.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-foreground mb-4">
              How to make your phone coquette
            </h2>
            <p className="text-foreground/80 leading-relaxed mb-4 text-pretty">
              Your phone is the accessory you hold more than any other, and it is
              in most of your photos. It is also the cheapest thing to change.
            </p>
            <ul className="space-y-3">
              <li className="flex gap-3 text-foreground/80">
                <span className="text-primary">•</span>
                <span>
                  <strong>Start with the case.</strong> 3D bows, cherries, or a
                  pearl-beaded strap — the aesthetic lives in small repeated
                  details rather than one big statement.
                </span>
              </li>
              <li className="flex gap-3 text-foreground/80">
                <span className="text-primary">•</span>
                <span>
                  <strong>Match the wallpaper.</strong> Pastel, ballet, or
                  soft-focus florals. A cute case over a default background is a
                  half-finished thought.
                </span>
              </li>
              <li className="flex gap-3 text-foreground/80">
                <span className="text-primary">•</span>
                <span>
                  <strong>Add a charm or strap.</strong> Movement and texture are
                  what make it read as intentional rather than bought.
                </span>
              </li>
              <li className="flex gap-3 text-foreground/80">
                <span className="text-primary">•</span>
                <span>
                  <strong>Check the material.</strong> If it is a clear case, ask
                  what the back is made of — a polycarbonate back with a UV
                  stabiliser resists yellowing far longer than plain TPU. We wrote{' '}
                  <Link
                    href="/guides/do-clear-phone-cases-turn-yellow"
                    className="text-primary hover:opacity-80 underline"
                  >
                    an honest guide to that
                  </Link>
                  , because nobody else in this space will tell you.
                </span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-foreground mb-6">
              Frequently asked questions
            </h2>
            <div className="space-y-6">
              {faqs.map((faq) => (
                <div key={faq.q} className="bg-secondary/20 rounded-2xl p-6">
                  <h3 className="font-semibold text-foreground mb-3 text-pretty">
                    {faq.q}
                  </h3>
                  <p className="text-foreground/80 leading-relaxed text-pretty">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-16 bg-primary/5 rounded-2xl p-8 text-center">
          <h2 className="text-xl font-serif text-foreground mb-3">
            Want the look on your phone?
          </h2>
          <p className="text-foreground/80 mb-6 text-pretty">
            Bows, cherries, pearls and pastels — for iPhone 12 through iPhone 17.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/shop-all"
              className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-semibold hover:opacity-90 transition"
            >
              Shop All Cases
            </Link>
            <Link
              href="/cute-kit"
              className="border border-primary text-primary px-8 py-3 rounded-full font-semibold hover:bg-primary/10 transition"
            >
              Free Cute Kit
            </Link>
          </div>
        </div>
      </article>

      <Footer />
    </main>
  )
}
