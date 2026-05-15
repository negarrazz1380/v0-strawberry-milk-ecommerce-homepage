import Link from "next/link"
import Image from "next/image"

const categories = [
  {
    label: "Pink Cases",
    href: "/category/pink",
    image: "/images/hero-cases.jpg",
  },
  {
    label: "Aesthetic Cases",
    href: "/category/aesthetic",
    image: "/images/iphone-cases.jpg",
  },
  {
    label: "Minimal Cases",
    href: "/category/minimal",
    image: "/images/accessories.jpg",
  },
  {
    label: "Accessories",
    href: "/category/accessories",
    image: "/images/airpods-cases.jpg",
  },
]

export function Categories() {
  return (
    <div>
      {/* Categories - Shop by Vibe */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl text-foreground text-balance">
            Shop by vibe
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.label}
              href={cat.href}
              className="group relative overflow-hidden rounded-3xl bg-card shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="relative aspect-square overflow-hidden">
                <Image
                  src={cat.image}
                  alt={cat.label}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-foreground/5 group-hover:bg-foreground/10 transition-colors" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <h3 className="font-serif text-xl md:text-2xl text-white font-semibold text-center text-balance px-4">
                  {cat.label}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Marquee / trust strip */}
      <div className="overflow-hidden bg-accent py-3">
        <div className="flex gap-12 animate-marquee whitespace-nowrap">
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} className="text-xs font-semibold tracking-widest text-primary/70 uppercase flex items-center gap-3">
              Free Shipping $35+
              <span className="w-1.5 h-1.5 rounded-full bg-primary/40 inline-block" />
              Easy Returns
              <span className="w-1.5 h-1.5 rounded-full bg-primary/40 inline-block" />
              New Drops Every Friday
              <span className="w-1.5 h-1.5 rounded-full bg-primary/40 inline-block" />
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
