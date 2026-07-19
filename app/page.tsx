import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { SocialProof } from "@/components/social-proof"
import { WhyCaseKisses } from "@/components/why-casekisses"
import { Categories } from "@/components/categories"
import { ProductsGrid } from "@/components/products-grid"
import { BrandMessage } from "@/components/brand-message"
import { Footer } from "@/components/footer"
import type { Metadata } from "next"

export const metadata: Metadata = {
  alternates: { canonical: "https://www.casekisses.com" },
}

export default function HomePage() {
  return (
    <main className="relative">
      <Header />
      <Hero />
      <SocialProof />
      <WhyCaseKisses />
      <Categories />
      <ProductsGrid />
      <BrandMessage />
      <Footer />
    </main>
  )
}
