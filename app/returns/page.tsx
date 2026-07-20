import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"

export const metadata = {
  title: "Returns & Store Credit",
  description: "Our return policy and store credit options. 14-day returns for approved items.",
  alternates: { canonical: "/returns" },
}

export default function ReturnsPage() {
  return (
    <main className="relative">
      <Header />
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <h1 className="text-4xl md:text-5xl font-serif text-foreground mb-4 text-balance">
          Returns & Store Credit
        </h1>
        <p className="text-lg text-muted-foreground mb-12 text-pretty">
          We want you to love your case 💕
        </p>

        <div className="space-y-12">
          {/* Return Window */}
          <section>
            <h2 className="text-2xl font-serif text-foreground mb-4">Return Window</h2>
            <p className="text-foreground/80 leading-relaxed">
              You have 14 days from delivery to request a return.
            </p>
          </section>

          {/* Store Credit Only */}
          <section>
            <h2 className="text-2xl font-serif text-foreground mb-4">Store Credit Only</h2>
            <p className="text-foreground/80 leading-relaxed mb-4">
              We offer store credit for all approved returns. We do not offer direct exchanges or refunds to your original payment method.
            </p>
            <p className="text-foreground/80 leading-relaxed text-lg font-medium text-primary">
              We offer store credit so you can choose another style you love 💖
            </p>
          </section>

          {/* Final Sale Items */}
          <section>
            <h2 className="text-2xl font-serif text-foreground mb-4">Final Sale Items</h2>
            <p className="text-foreground/80 leading-relaxed">
              Items purchased on sale or with major discounts may be final sale.
            </p>
          </section>

          {/* Return Conditions */}
          <section>
            <h2 className="text-2xl font-serif text-foreground mb-4">Return Conditions</h2>
            <p className="text-foreground/80 leading-relaxed mb-4">
              To be eligible for a return:
            </p>
            <ul className="space-y-3">
              <li className="flex gap-3 text-foreground/80">
                <span className="text-primary">✓</span>
                <span>Item must be unused</span>
              </li>
              <li className="flex gap-3 text-foreground/80">
                <span className="text-primary">✓</span>
                <span>Must be in original condition</span>
              </li>
              <li className="flex gap-3 text-foreground/80">
                <span className="text-primary">✓</span>
                <span>No damage, stains, or wear</span>
              </li>
            </ul>
            <p className="text-foreground/80 leading-relaxed mt-4 text-sm italic">
              We reserve the right to refuse returns that do not meet these conditions.
            </p>
          </section>

          {/* How to Start a Return */}
          <section>
            <h2 className="text-2xl font-serif text-foreground mb-4">How to Start a Return</h2>
            <p className="text-foreground/80 leading-relaxed mb-4">
              Email us at <a href="mailto:casekissessupport@gmail.com" className="text-primary hover:opacity-80 transition font-semibold">casekissessupport@gmail.com</a> 💌
            </p>
            <p className="text-foreground/80 leading-relaxed text-sm mb-4">
              Please include:
            </p>
            <ul className="space-y-2 text-foreground/80 text-sm">
              <li>• Your order number</li>
              <li>• Your email used at checkout</li>
            </ul>
          </section>

          {/* Processing Time */}
          <section>
            <h2 className="text-2xl font-serif text-foreground mb-4">Processing Time</h2>
            <p className="text-foreground/80 leading-relaxed">
              Returns are processed within 5–7 business days after we receive your item.
            </p>
          </section>

          {/* Important Notes */}
          <section>
            <h2 className="text-2xl font-serif text-foreground mb-4">Important Notes</h2>
            <ul className="space-y-3">
              <li className="flex gap-3 text-foreground/80">
                <span className="text-primary">•</span>
                <span>Customers are responsible for return shipping costs</span>
              </li>
              <li className="flex gap-3 text-foreground/80">
                <span className="text-primary">•</span>
                <span>We are not responsible for lost return packages</span>
              </li>
            </ul>
          </section>

          {/* Thank You */}
          <section className="bg-primary/5 rounded-2xl p-8 text-center">
            <p className="text-foreground/80 leading-relaxed">
              Thank you for shopping with CaseKisses 💖
            </p>
          </section>
        </div>

        {/* CTA */}
        <div className="mt-12 flex gap-4 justify-center flex-wrap">
          <a href="mailto:casekissessupport@gmail.com" className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-semibold hover:opacity-90 transition">
            Start a Return
          </a>
          <Link href="/faq" className="border border-primary text-primary px-8 py-3 rounded-full font-semibold hover:bg-primary/10 transition">
            View FAQ
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  )
}
