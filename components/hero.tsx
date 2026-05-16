import Link from "next/link"
import Image from "next/image"

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          {/* Text side */}
          <div className="flex flex-col gap-6 text-center md:text-left">
            <span className="inline-block text-xs font-semibold tracking-widest text-primary uppercase bg-accent px-4 py-1.5 rounded-full self-center md:self-start">
              Pick Your Personality
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-foreground leading-tight text-balance">
              Girly, Aesthetic Phone Cases That Match Your Vibe
            </h1>
            <p className="text-base text-muted-foreground leading-relaxed max-w-md mx-auto md:mx-0 text-pretty">
              Cute, trendy, and unique designs made to stand out.
            </p>
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <Link
                href="/shop-all"
                className="bg-primary text-primary-foreground px-7 py-3 rounded-2xl text-sm font-semibold hover:opacity-90 transition-opacity shadow-md shadow-primary/20"
              >
                Shop Now
              </Link>
              <Link
                href="/shop-all"
                className="bg-white/90 text-foreground px-7 py-3 rounded-2xl text-sm font-semibold hover:bg-white transition-colors"
              >
                Browse iPhone Cases
              </Link>
            </div>
            {/* Trust badges */}
            <div className="flex flex-wrap gap-4 justify-center md:justify-start mt-2">
              {[
                "Easy returns",
                "loved by cute girlies across Canada & USA 🎀",
              ].map((badge) => (
                <span key={badge} className="text-xs text-muted-foreground flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
                  {badge}
                </span>
              ))}
            </div>
          </div>

          {/* Image side */}
          <div className="relative flex items-center justify-center">
            <div className="relative w-full max-w-sm mx-auto aspect-square rounded-3xl overflow-hidden shadow-2xl shadow-primary/15">
              <Image
                src="https://jiybdkvylfaabznyqpes.supabase.co/storage/v1/object/public/product-images/cute_iphone_case.png"
                alt="Cute pastel pink phone cases collection"
                fill
                className="object-cover"
                priority
              />
            </div>
            {/* Floating badge */}
            <div className="absolute -bottom-2 -left-2 md:bottom-4 md:left-4 bg-white/90 rounded-2xl px-4 py-3 shadow-lg">
              <p className="text-xs text-muted-foreground">Must have</p>
            </div>
            <div className="absolute -top-2 -right-2 md:top-4 md:right-4 bg-primary text-primary-foreground rounded-2xl px-4 py-3 shadow-lg text-xs font-semibold">
              Made to stand out
            </div>
          </div>
        </div>
      </div>

      {/* Decorative subtle pattern */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-primary/5" />
        <div className="absolute bottom-10 right-10 w-60 h-60 rounded-full bg-primary/5" />
      </div>
    </section>
  )
}
