import { Metadata } from 'next'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import Link from 'next/link'

const BASE_URL = 'https://www.casekisses.com'
const CANONICAL = `${BASE_URL}/guides/do-clear-phone-cases-turn-yellow`

// Update this whenever the guide's content is meaningfully revised. AI engines
// and Google both favour content refreshed in the last ~30 days, and the
// dateModified below is generated from it.
const LAST_UPDATED = '2026-07-16'

const TITLE = 'Do Clear Phone Cases Turn Yellow? An Honest Guide'
const DESCRIPTION =
  'Yes — most clear phone cases yellow within 2–9 months. Here is the honest science of why, which yellowing you can clean off, which is permanent, and how to slow it down.'

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

/**
 * The FAQ pairs are the source for BOTH the visible Q&A section and the
 * FAQPage schema — keep them here so the two can never drift apart.
 */
const faqs = [
  {
    q: 'Do all clear phone cases turn yellow?',
    a: 'Almost all of them, yes. Clear cases are usually made from TPU (thermoplastic polyurethane) or silicone, and both are prone to oxidation. Budget TPU cases typically start yellowing within 2–4 months. Mid-range hybrid cases last around 6–9 months. Cases built with a polycarbonate (PC) back and dedicated anti-yellowing technology can stay clear for 12 months or longer.',
  },
  {
    q: 'Can you reverse a yellowed phone case?',
    a: 'It depends which kind of yellowing you have. If it is surface grime — oils, dirt, and sweat sitting on the case — then yes, cleaning helps a lot. If it is photo-oxidation, where UV light has broken the polymer chains inside the plastic, then no. The colour has formed within the material itself, and no cleaning method reaches it.',
  },
  {
    q: 'Does baking soda actually fix a yellow phone case?',
    a: 'Partly, and only for one kind of yellowing. Baking soda is a mild abrasive that lifts oils and dirt off the surface, so it genuinely helps with light, grime-based discolouration. It cannot touch oxidation inside the plastic. If your case still looks yellow after two proper cleaning attempts, that yellowing is permanent and cleaning again will not change it.',
  },
  {
    q: 'How long does it take for a clear case to turn yellow?',
    a: 'Between roughly 2 and 12 months, depending almost entirely on the material and how much UV and heat the case is exposed to. Budget TPU can start within 2–4 months, and heavy sun exposure can push visible yellowing to within 2–3 months. The material you buy matters more than any care habit afterwards.',
  },
  {
    q: 'What causes clear phone cases to turn yellow?',
    a: 'A chemical process called photo-oxidation. UV light breaks the molecular bonds in polymers like TPU and silicone. The broken chains form new compounds called chromophores, which absorb blue wavelengths and reflect yellow ones back to your eye. Heat and skin oils accelerate the same reaction.',
  },
  {
    q: 'How do I stop my clear case from turning yellow?',
    a: 'You cannot stop it permanently, but you can slow it meaningfully. Keep the case out of direct sunlight and hot cars, avoid leaving it on the phone during long wireless-charging sessions, and wipe it weekly with mild dish soap and warm water to remove oils before they penetrate. The single biggest factor, though, is the material you choose at purchase.',
  },
  {
    q: 'Do decorated or 3D clear cases yellow differently?',
    a: 'The clear base yellows on the same timeline as any other TPU case, because it is the same material. Coloured 3D details such as bows or charms hide ageing better than the clear areas around them, so on a decorated case the yellowing usually shows up first in the open clear sections and around the edges.',
  },
]

export default function ClearCaseYellowingGuide() {
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
      <Header />

      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <h1 className="text-4xl md:text-5xl font-serif text-foreground mb-4 text-balance">
          Do Clear Phone Cases Turn Yellow? An Honest Guide
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

        {/* Answer-first summary — the top of the page does the heavy lifting for
            both readers and AI engines, so the direct answer goes here. */}
        <div className="bg-primary/5 rounded-2xl p-6 sm:p-8 mb-12">
          <p className="text-foreground/90 leading-relaxed text-lg text-pretty">
            <strong>Short answer: yes.</strong> Almost every clear phone case
            yellows eventually — usually within <strong>2 to 9 months</strong>.
            It is not because you were careless, and it is not a manufacturing
            defect. It is a chemical reaction between UV light and the plastic
            itself.
          </p>
          <p className="text-foreground/80 leading-relaxed mt-4 text-pretty">
            But there are <strong>two different kinds of yellowing</strong>, and
            almost nobody separates them. One you can clean off completely. The
            other is permanent, and no amount of baking soda will touch it.
            Knowing which one you have saves you a lot of scrubbing.
          </p>
        </div>

        <div className="space-y-12">
          <section>
            <h2 className="text-2xl font-serif text-foreground mb-4">
              The two kinds of yellowing
            </h2>
            <p className="text-foreground/80 leading-relaxed mb-6 text-pretty">
              This is the part most guides skip, and it is the only thing that
              actually decides whether cleaning is worth your time.
            </p>

            <div className="space-y-4">
              <div className="bg-secondary/30 rounded-2xl p-6">
                <h3 className="font-semibold text-foreground mb-2">
                  1. Surface grime — fixable
                </h3>
                <p className="text-foreground/80 text-base leading-relaxed text-pretty">
                  Oils from your hands, sweat, makeup, pocket lint, and general
                  dirt build up <em>on top of</em> the plastic and tint it
                  yellow-brown. This sits on the surface. Soap or baking soda
                  genuinely removes it, and the case really does come back.
                </p>
              </div>

              <div className="bg-secondary/30 rounded-2xl p-6">
                <h3 className="font-semibold text-foreground mb-2">
                  2. Photo-oxidation — permanent
                </h3>
                <p className="text-foreground/80 text-base leading-relaxed text-pretty">
                  UV light breaks the molecular bonds inside the polymer. The
                  broken chains form compounds called{' '}
                  <strong>chromophores</strong>, which absorb blue light and
                  reflect yellow back at you. This colour forms{' '}
                  <em>within</em> the material. There is no surface to clean —
                  the plastic itself has changed.
                </p>
              </div>
            </div>

            <p className="text-foreground/80 leading-relaxed mt-6 text-pretty">
              <strong>The test:</strong> clean the case properly, twice. If it
              improves, it was grime. If it looks identical, it is oxidation —
              and no method, hack, or product will reverse it. Stop scrubbing.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-foreground mb-4">
              How long clear cases actually last
            </h2>
            <p className="text-foreground/80 leading-relaxed mb-6 text-pretty">
              Roughly, before yellowing becomes noticeable:
            </p>
            <div className="space-y-4">
              <div className="bg-secondary/30 rounded-2xl p-6">
                <h3 className="font-semibold text-foreground mb-2">
                  Budget TPU — 2 to 4 months
                </h3>
                <p className="text-foreground/80 text-base">
                  Soft, flexible, cheap to produce. The most common clear case
                  material, and the fastest to go.
                </p>
              </div>
              <div className="bg-secondary/30 rounded-2xl p-6">
                <h3 className="font-semibold text-foreground mb-2">
                  Mid-range hybrid — 6 to 9 months
                </h3>
                <p className="text-foreground/80 text-base">
                  A polycarbonate (PC) back with a TPU bumper. The PC section
                  stays clear noticeably longer than the TPU around it.
                </p>
              </div>
              <div className="bg-secondary/30 rounded-2xl p-6">
                <h3 className="font-semibold text-foreground mb-2">
                  Anti-yellow treated — 12+ months
                </h3>
                <p className="text-foreground/80 text-base">
                  UV-stabilised composites or anti-yellow coatings. Longer, but
                  still not forever — no clear plastic is permanent.
                </p>
              </div>
            </div>
            <p className="text-foreground/80 leading-relaxed mt-6 text-pretty">
              Heavy sun exposure compresses all of these. A case that lives on a
              car dashboard or a beach towel can yellow visibly in 2–3 months
              regardless of what it is made of.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-foreground mb-4">
              What actually causes it
            </h2>
            <ul className="space-y-3">
              <li className="flex gap-3 text-foreground/80">
                <span className="text-primary">•</span>
                <span>
                  <strong>UV light.</strong> The main driver. Sunlight through a
                  window counts.
                </span>
              </li>
              <li className="flex gap-3 text-foreground/80">
                <span className="text-primary">•</span>
                <span>
                  <strong>Heat.</strong> Wireless charging, hot cars, phones
                  running warm during gaming — heat radiates into the case and
                  accelerates oxidation from the inside.
                </span>
              </li>
              <li className="flex gap-3 text-foreground/80">
                <span className="text-primary">•</span>
                <span>
                  <strong>Skin oils and sweat.</strong> These both stain the
                  surface and speed up the chemical reaction underneath.
                </span>
              </li>
              <li className="flex gap-3 text-foreground/80">
                <span className="text-primary">•</span>
                <span>
                  <strong>Time.</strong> Oxidation happens even in a drawer,
                  just far more slowly.
                </span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-foreground mb-4">
              How to clean the fixable kind
            </h2>
            <p className="text-foreground/80 leading-relaxed mb-4 text-pretty">
              Worth doing weekly, before oils have time to settle in:
            </p>
            <ol className="space-y-3 text-foreground/80">
              <li className="flex gap-3">
                <span className="text-primary font-semibold">1.</span>
                <span>Take the case off the phone. Always.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-semibold">2.</span>
                <span>
                  Mix a few drops of mild dish soap into warm water and scrub
                  gently with a soft toothbrush — inside and out, including the
                  cutouts.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-semibold">3.</span>
                <span>
                  For stubborn spots, sprinkle baking soda on and scrub it into
                  a paste with a wet toothbrush, in circles.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-semibold">4.</span>
                <span>
                  Rinse thoroughly and let it air dry completely — at least an
                  hour — before it goes back on your phone.
                </span>
              </li>
            </ol>
            <p className="text-foreground/80 leading-relaxed mt-6 text-pretty">
              Be careful with rubbing alcohol on decorated cases: it can dull or
              lift printed and painted details. If you try it, test one hidden
              spot first. On a case with 3D bows, charms, or painted cherries,
              soap and water is the safer choice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-foreground mb-4">
              How to slow it down
            </h2>
            <ul className="space-y-3">
              <li className="flex gap-3 text-foreground/80">
                <span className="text-primary">✓</span>
                <span>Keep it out of direct sun when you are not using it.</span>
              </li>
              <li className="flex gap-3 text-foreground/80">
                <span className="text-primary">✓</span>
                <span>
                  Never leave your phone in a hot car or on a sunny windowsill.
                </span>
              </li>
              <li className="flex gap-3 text-foreground/80">
                <span className="text-primary">✓</span>
                <span>
                  Take the case off for long wireless-charging sessions if you
                  can — that heat goes straight into the plastic.
                </span>
              </li>
              <li className="flex gap-3 text-foreground/80">
                <span className="text-primary">✓</span>
                <span>Wipe it down weekly, before oils settle in.</span>
              </li>
            </ul>
            <p className="text-foreground/80 leading-relaxed mt-6 text-pretty">
              Honestly though: the material you pick at purchase has more impact
              than every care habit combined.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-foreground mb-4">
              What to look for when buying
            </h2>
            <ul className="space-y-3">
              <li className="flex gap-3 text-foreground/80">
                <span className="text-primary">•</span>
                <span>
                  <strong>Ask whether the back panel is PC or TPU.</strong>{' '}
                  Polycarbonate resists yellowing significantly longer. If the
                  product page does not say, it is almost certainly TPU.
                </span>
              </li>
              <li className="flex gap-3 text-foreground/80">
                <span className="text-primary">•</span>
                <span>
                  <strong>Look for a named technology, not a buzzword.</strong>{' '}
                  A brand that has genuinely solved this gives the solution a
                  name and uses it across a product line. A lone
                  &ldquo;anti-yellowing&rdquo; bullet with nothing behind it is
                  a label, not a solution.
                </span>
              </li>
              <li className="flex gap-3 text-foreground/80">
                <span className="text-primary">•</span>
                <span>
                  <strong>Check for a real test or a warranty.</strong> Some
                  brands publish UV exposure test results or cover yellowing for
                  a set period. That is a claim with something behind it.
                </span>
              </li>
              <li className="flex gap-3 text-foreground/80">
                <span className="text-primary">•</span>
                <span>
                  <strong>Be realistic about price.</strong> A $10 clear case is
                  not going to have UV-stabilised composites in it. That is fine
                  — just buy it knowing it is a 3–6 month case.
                </span>
              </li>
            </ul>
          </section>

          {/* Honesty section.

              Supplier has confirmed: PC back + UV stabiliser / anti-yellow
              additive. That supports the SPEC claims below.

              ⚠️ DO NOT upgrade this to a performance claim — no "stays clear
              for 12+ months", no "won't yellow", no timeline promise — unless a
              UV exposure test result from the supplier is on file. Stating the
              material is a fact; predicting the outcome is a claim, and an
              unbackable claim on THIS page destroys the trust it exists to
              build. */}
          <section className="bg-secondary/20 rounded-2xl p-6 sm:p-8">
            <h2 className="text-2xl font-serif text-foreground mb-4">
              Where CaseKisses stands on this
            </h2>
            <p className="text-foreground/80 leading-relaxed mb-4 text-pretty">
              We would rather give you the spec than a promise.
            </p>
            <p className="text-foreground/80 leading-relaxed mb-4 text-pretty">
              Our cases are built with a{' '}
              <strong>polycarbonate (PC) back</strong>, not the pure TPU used in
              most budget clear cases — and the material includes a{' '}
              <strong>UV stabiliser</strong>, the additive that slows the
              photo-oxidation described above. Those are the two things this
              whole guide tells you to look for, and they are the two things
              almost nobody in the cute-case aisle will tell you either way.
            </p>
            <p className="text-foreground/80 leading-relaxed mb-4 text-pretty">
              What we are not going to tell you is that they will never yellow.
              No clear plastic is permanent, and any brand promising otherwise is
              selling you something. Keep a clear case out of direct sun, wipe it
              weekly, and the material will do the rest.
            </p>
            <p className="text-foreground/80 leading-relaxed text-pretty">
              A cute case should make you happy every time you look at it. That
              is worth being straight with you about.
            </p>
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

        {/* CTA */}
        <div className="mt-16 bg-primary/5 rounded-2xl p-8 text-center">
          <h2 className="text-xl font-serif text-foreground mb-3">
            Looking for a cute case you will actually love?
          </h2>
          <p className="text-foreground/80 mb-6 text-pretty">
            Bows, cherries, teddy bears, and pastels — for iPhone 12 through
            iPhone 17.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/shop-all"
              className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-semibold hover:opacity-90 transition"
            >
              Shop All Cases
            </Link>
            <Link
              href="/faq"
              className="border border-primary text-primary px-8 py-3 rounded-full font-semibold hover:bg-primary/10 transition"
            >
              View FAQ
            </Link>
          </div>
        </div>
      </article>

      <Footer />
    </main>
  )
}
