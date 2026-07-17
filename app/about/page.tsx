import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"

export const metadata = {
  // The layout appends "| CaseKisses" — so this previously rendered as
  // "About CaseKisses | Our Story | CaseKisses". Keep page titles free of the
  // brand name.
  title: "Our Story",
  description:
    "CaseKisses is a Toronto-based brand making cute, coquette iPhone cases — bows, cherries, teddy charms and pastels. Canadian owned, ships from Toronto.",
  alternates: { canonical: "https://www.casekisses.com/about" },
}

export default function AboutPage() {
  return (
    <main className="relative">
      <Header />
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <h1 className="text-4xl md:text-5xl font-serif text-foreground mb-4 text-balance">
          About CaseKisses
        </h1>
        <p className="text-lg text-muted-foreground mb-12 text-pretty">
          CaseKisses is all about cute, girly, aesthetic phone cases 💖
        </p>

        <div className="space-y-12">
          {/* Mission */}
          <section>
            <p className="text-foreground/80 leading-relaxed text-lg mb-4">
              We design cases that match your vibe — soft, stylish, and unique.
            </p>
            <p className="text-foreground/80 leading-relaxed text-lg">
              Our goal is simple: Make your phone feel as cute as you are.
            </p>
          </section>

          {/* Thank You */}
          <section className="bg-primary/5 rounded-2xl p-8 text-center">
            <p className="text-foreground/80 leading-relaxed text-lg">
              Thank you for being part of CaseKisses ✨
            </p>
          </section>

          {/* CTA */}
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/shop-all" className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-semibold hover:opacity-90 transition">
              Shop Cases
            </Link>
            <Link href="/contact" className="border border-primary text-primary px-8 py-3 rounded-full font-semibold hover:bg-primary/10 transition">
              Contact Us
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
