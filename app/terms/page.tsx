import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export const metadata = {
  title: "Terms of Service | CaseKisses",
  description: "Our terms of service and conditions of use.",
}

export default function TermsPage() {
  return (
    <main className="relative">
      <Header />
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <h1 className="text-4xl md:text-5xl font-serif text-foreground mb-4 text-balance">
          Terms of Service
        </h1>
        <p className="text-lg text-muted-foreground mb-12 text-pretty">
          By using our website, you agree to the following terms.
        </p>

        <div className="space-y-12">
          {/* General */}
          <section>
            <h2 className="text-2xl font-serif text-foreground mb-4">General</h2>
            <p className="text-foreground/80 leading-relaxed">
              CaseKisses provides products and services subject to these terms. We may update them at any time.
            </p>
          </section>

          {/* Orders */}
          <section>
            <h2 className="text-2xl font-serif text-foreground mb-4">Orders</h2>
            <p className="text-foreground/80 leading-relaxed">
              We reserve the right to cancel or refuse any order for any reason.
            </p>
          </section>

          {/* Pricing */}
          <section>
            <h2 className="text-2xl font-serif text-foreground mb-4">Pricing</h2>
            <p className="text-foreground/80 leading-relaxed">
              Prices may change without notice.
            </p>
          </section>

          {/* Product Availability */}
          <section>
            <h2 className="text-2xl font-serif text-foreground mb-4">Product Availability</h2>
            <p className="text-foreground/80 leading-relaxed">
              We may limit or discontinue products at any time.
            </p>
          </section>

          {/* Accuracy */}
          <section>
            <h2 className="text-2xl font-serif text-foreground mb-4">Accuracy</h2>
            <p className="text-foreground/80 leading-relaxed">
              We do our best to display product colors accurately, but screens may vary.
            </p>
          </section>

          {/* Liability */}
          <section>
            <h2 className="text-2xl font-serif text-foreground mb-4">Liability</h2>
            <p className="text-foreground/80 leading-relaxed">
              We are not responsible for damages resulting from the use of our products or website.
            </p>
          </section>

          {/* Contact */}
          <section className="bg-primary/5 rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-serif text-foreground mb-4">Questions?</h2>
            <p className="text-foreground/80 leading-relaxed">
              Contact us at <a href="mailto:support@casekisses.com" className="text-primary hover:opacity-80 transition font-semibold">support@casekisses.com</a> 💖
            </p>
          </section>
        </div>
      </div>

      <Footer />
    </main>
  )
}
