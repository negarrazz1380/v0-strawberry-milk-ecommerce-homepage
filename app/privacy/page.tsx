import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export const metadata = {
  title: "Privacy Policy | Case Kiss",
  description: "Our privacy policy and how we handle your data.",
}

export default function PrivacyPage() {
  return (
    <main className="relative">
      <Header />
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <h1 className="text-4xl md:text-5xl font-serif text-foreground mb-4 text-balance">
          Privacy Policy
        </h1>


        <div className="space-y-12">
          <section>
            <h2 className="text-2xl font-serif text-foreground mb-4">Your Privacy Matters to Us</h2>
            <p className="text-foreground/80 leading-relaxed text-lg">
              We collect basic information (name, email, shipping address) to process your orders and improve your experience.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-foreground mb-4">We Never Sell Your Data</h2>
            <p className="text-foreground/80 leading-relaxed text-base">
              We never sell or share your data with third parties. Your information is used solely to serve you better.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-foreground mb-4">Questions?</h2>
            <p className="text-foreground/80 leading-relaxed text-base">
              Contact us anytime at <a href="mailto:support@casekisses.com" className="text-primary hover:opacity-80 transition font-semibold">support@casekisses.com</a>
            </p>
          </section>
        </div>
      </div>

      <Footer />
    </main>
  )
}
