import Link from "next/link"
import Image from "next/image"

/**
 * Homepage tiles.
 *
 * ⚠️ EVERY DESTINATION HERE MUST HAVE CONTENT. This section used to be "Shop by
 * vibe" and linked to /category/pink, /category/aesthetic, /category/minimal
 * and /category/accessories — none of which have any products. Four large,
 * prominent tiles on the homepage, all leading to empty pages. The only
 * category with products is `iphone`.
 *
 * Before adding a tile, load its URL and confirm something is on it. A dead
 * tile here costs more than any amount of SEO work earns.
 *
 * When there are enough products to fill real aesthetic collections
 * (~20+ — cherry, bow, teddy etc.), those become worth building. At five
 * products they'd be near-empty doorway pages.
 */
const tiles = [
  {
    label: "Shop All Cases",
    href: "/shop-all",
    image: "/images/hero-cases.jpg",
    alt: "A collection of cute phone cases",
  },
  {
    label: "iPhone Cases",
    href: "/category/iphone",
    image: "/images/iphone-cases.jpg",
    alt: "Cute iPhone cases",
  },
  {
    label: "Free Cute Kit 🎀",
    href: "/cute-kit",
    image: "/images/accessories.jpg",
    alt: "Free coquette iPhone wallpapers",
  },
  {
    label: "Do Cases Turn Yellow?",
    href: "/guides/do-clear-phone-cases-turn-yellow",
    image: "/images/airpods-cases.jpg",
    alt: "Guide to clear phone cases and yellowing",
  },
]

export function Categories() {
  return (
    <div>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl text-foreground text-balance">
            Have a look around
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {tiles.map((tile) => (
            <Link
              key={tile.label}
              href={tile.href}
              className="group relative overflow-hidden rounded-3xl bg-card shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="relative aspect-square overflow-hidden">
                <Image
                  src={tile.image}
                  alt={tile.alt}
                  fill
                  /* Without `sizes`, a `fill` image defaults to 100vw and Next
                     ships a full-width file to phones. This grid is 1-up on
                     mobile, 2-up on small, 4-up on large. */
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-foreground/25 group-hover:bg-foreground/35 transition-colors" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <h3 className="font-serif text-xl md:text-2xl text-white font-semibold text-center text-balance px-4 drop-shadow-lg">
                  {tile.label}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Trust strip.
          ⚠️ Everything in this marquee must be TRUE — it scrolls past every
          visitor on the homepage. It previously claimed "Free Shipping $35+"
          (there is no minimum — it's free full stop) and "New Drops Every
          Friday" (there are no weekly drops). Don't put a promise here that
          the business isn't actually keeping. */}
      <div className="overflow-hidden bg-accent py-3">
        <div className="flex gap-12 animate-marquee whitespace-nowrap">
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} className="text-xs font-semibold tracking-widest text-primary/70 uppercase flex items-center gap-3">
              Free Shipping to Canada &amp; USA
              <span className="w-1.5 h-1.5 rounded-full bg-primary/40 inline-block" />
              Ships from Toronto
              <span className="w-1.5 h-1.5 rounded-full bg-primary/40 inline-block" />
              14-Day Returns
              <span className="w-1.5 h-1.5 rounded-full bg-primary/40 inline-block" />
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
