import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"

export const metadata = {
  title: "Exchange Your Case | CaseKisses",
  description: "Process an exchange for your CaseKisses order.",
}

export default function ExchangePage() {
  return (
    <main className="relative">
      <Header />
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <h1 className="text-4xl md:text-5xl font-serif text-foreground mb-4 text-balance">
          Exchange Your Case
        </h1>
        <p className="text-lg text-muted-foreground mb-12 text-pretty">
          Found the perfect case but need a different model or color? We&apos;ll help you swap it out.
        </p>

        <div className="space-y-12">
          {/* Why Exchange */}
          <section>
            <h2 className="text-2xl font-serif text-foreground mb-4">Why Exchange?</h2>
            <p className="text-foreground/80 leading-relaxed">
              We don&apos;t offer direct exchanges. Instead, return your case for store credit and choose another style you love 💖. See our returns policy for more details.
            </p>
          </section>

          {/* How It Works */}
          <section>
            <h2 className="text-2xl font-serif text-foreground mb-4">How Store Credit Works</h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Request a Return</h3>
                  <p className="text-foreground/80 text-sm">
                    <Link href="/returns" className="text-primary hover:opacity-80 transition">Start a return</Link> with your order number. You have 14 days from delivery.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Ship Your Case</h3>
                  <p className="text-foreground/80 text-sm">
                    Pack up your case and ship it to us. You&apos;re responsible for return shipping costs.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Get Store Credit</h3>
                  <p className="text-foreground/80 text-sm">
                    Once we receive your return, you get store credit within 5-7 business days to shop another case you love.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Return Conditions */}
          <section>
            <h2 className="text-2xl font-serif text-foreground mb-4">Return Conditions</h2>
            <ul className="space-y-3">
              <li className="flex gap-3 text-foreground/80">
                <span className="text-primary">✓</span>
                <span>Must be within 14 days of delivery</span>
              </li>
              <li className="flex gap-3 text-foreground/80">
                <span className="text-primary">✓</span>
                <span>Item must be unused and in original condition</span>
              </li>
              <li className="flex gap-3 text-foreground/80">
                <span className="text-primary">✓</span>
                <span>No damage, stains, or wear</span>
              </li>
            </ul>
          </section>

          {/* Price Differences */}
          <section>
            <h2 className="text-2xl font-serif text-foreground mb-4">Store Credit Details</h2>
            <p className="text-foreground/80 leading-relaxed">
              Your store credit is based on the full original price of your case. Use it to shop another style you love within one year of issuance.
            </p>
          </section>

          {/* Sale Items */}
          <section>
            <h2 className="text-2xl font-serif text-foreground mb-4">Final Sale Items</h2>
            <p className="text-foreground/80 leading-relaxed">
              Sale and clearance items may be final sale. If an item arrives defective, we&apos;ll replace it or provide store credit.
            </p>
          </section>

          {/* Custom Cases */}
          <section>
            <h2 className="text-2xl font-serif text-foreground mb-4">Customized Cases</h2>
            <p className="text-foreground/80 leading-relaxed">
              Personalized or custom-designed cases cannot be exchanged, as they&apos;re made specifically for you. If there&apos;s a defect, reach out and we&apos;ll make it right.
            </p>
          </section>
        </div>

        {/* CTA */}
        <div className="mt-16 bg-primary/5 rounded-2xl p-8 text-center">
          <h3 className="text-xl font-serif text-foreground mb-3">Ready to return for store credit?</h3>
          <p className="text-foreground/80 mb-6">Check out our returns policy for the full process.</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/returns" className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-semibold hover:opacity-90 transition">
              View Returns Policy
            </Link>
            <Link href="/contact" className="border border-primary text-primary px-8 py-3 rounded-full font-semibold hover:bg-primary/10 transition">
              Contact Support
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
