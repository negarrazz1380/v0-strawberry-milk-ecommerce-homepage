import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"

export const metadata = {
  title: "Shipping | Case Kiss",
  description: "Learn about our shipping policies, timelines, and delivery options.",
}

export default function ShippingPage() {
  return (
    <main className="relative">
      <Header />
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <h1 className="text-4xl md:text-5xl font-serif text-foreground mb-4 text-balance">
          Shipping Information
        </h1>
        <p className="text-lg text-muted-foreground mb-12 text-pretty">
          We&apos;re excited to get your order to you 💖
        </p>

        <div className="space-y-12">
          {/* Processing Time */}
          <section>
            <h2 className="text-2xl font-serif text-foreground mb-4">Processing Time</h2>
            <p className="text-foreground/80 leading-relaxed text-lg">
              All orders are processed within 1–3 business days.
            </p>
          </section>

          {/* Shipping Time */}
          <section>
            <h2 className="text-2xl font-serif text-foreground mb-4">Shipping Time</h2>
            <div className="space-y-4">
              <div className="bg-secondary/30 rounded-2xl p-6">
                <h3 className="font-semibold text-foreground mb-2">Canada & USA — Standard</h3>
                <p className="text-foreground/80 text-base">
                  5–10 business days
                </p>
              </div>
              <div className="bg-secondary/30 rounded-2xl p-6">
                <h3 className="font-semibold text-foreground mb-2">Canada & USA — Express</h3>
                <p className="text-foreground/80 text-base">
                  2–3 business days
                </p>
              </div>
              <div className="bg-secondary/30 rounded-2xl p-6">
                <h3 className="font-semibold text-foreground mb-2">International</h3>
                <p className="text-foreground/80 text-base">
                  7–15 business days
                </p>
              </div>
            </div>
            <p className="text-foreground/60 text-sm mt-4">
              Delivery times start once your order ships, and are in addition to processing time.
            </p>
          </section>

          {/* Shipping Cost */}
          <section>
            <h2 className="text-2xl font-serif text-foreground mb-4">Shipping Cost</h2>
            <div className="space-y-4">
              <div className="bg-secondary/30 rounded-2xl p-6">
                <h3 className="font-semibold text-foreground mb-2">Canada & USA — Standard</h3>
                <p className="text-foreground/80 text-base">
                  <strong className="text-primary">Free</strong> on every order — no minimum
                </p>
              </div>
              <div className="bg-secondary/30 rounded-2xl p-6">
                <h3 className="font-semibold text-foreground mb-2">Canada & USA — Express</h3>
                <p className="text-foreground/80 text-base">$13</p>
              </div>
              <div className="bg-secondary/30 rounded-2xl p-6">
                <h3 className="font-semibold text-foreground mb-2">International — Standard</h3>
                <p className="text-foreground/80 text-base">$14</p>
              </div>
              <div className="bg-secondary/30 rounded-2xl p-6">
                <h3 className="font-semibold text-foreground mb-2">International — Express</h3>
                <p className="text-foreground/80 text-base">$30</p>
              </div>
            </div>
            <p className="text-foreground/60 text-sm mt-4">
              Your exact shipping cost is shown at checkout before you pay.
            </p>
          </section>

          {/* Tracking */}
          <section>
            <h2 className="text-2xl font-serif text-foreground mb-4">Tracking</h2>
            <p className="text-foreground/80 leading-relaxed text-base">
              You will receive a tracking number via email once your order ships.
            </p>
          </section>

          {/* Questions */}
          <section>
            <h2 className="text-2xl font-serif text-foreground mb-4">Questions?</h2>
            <p className="text-foreground/80 leading-relaxed text-base mb-4">
              Contact us anytime at <a href="mailto:support@casekisses.com" className="text-primary hover:opacity-80 transition font-semibold">support@casekisses.com</a>
            </p>
            <div className="flex gap-4 flex-wrap">
              <Link href="/faq" className="bg-primary text-primary-foreground px-6 py-3 rounded-full font-semibold hover:opacity-90 transition">
                View FAQ
              </Link>
              <Link href="/contact" className="border border-primary text-primary px-6 py-3 rounded-full font-semibold hover:bg-primary/10 transition">
                Contact Us
              </Link>
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </main>
  )
}
