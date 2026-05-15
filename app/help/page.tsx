'use client'

import { useState } from 'react'
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"

export default function HelpPage() {
  const [openTopic, setOpenTopic] = useState<string | null>(null)

  const topics = [
    {
      id: "track-order",
      title: "📦 Track My Order",
      content: (
        <div className="space-y-3">
          <p>You can track your order by:</p>
          <ul className="list-disc list-inside space-y-2 text-foreground/80">
            <li>Check your email for the tracking number we sent when your order shipped</li>
            <li>Log into your account and visit "Orders" to see tracking details</li>
            <li>Contact us with your order number and we'll help you track it down</li>
          </ul>
          <p className="text-sm text-muted-foreground mt-4">Tracking numbers can take 24 hours to update after shipment.</p>
        </div>
      )
    },
    {
      id: "return-policy",
      title: "🔁 Return Policy",
      content: (
        <div className="space-y-3">
          <p><strong>14-day returns from delivery date</strong></p>
          <ul className="list-disc list-inside space-y-2 text-foreground/80">
            <li>Items must be unused and in original condition</li>
            <li>Customers pay for return shipping</li>
            <li>Store credit processed within 5-7 business days after we receive your return</li>
            <li>We offer store credit so you can choose another style you love 💖</li>
          </ul>
          <div className="mt-4 pt-4 border-t border-primary/20">
            <p className="text-sm"><Link href="/returns" className="text-primary hover:opacity-80 transition font-semibold">View full return policy →</Link></p>
          </div>
        </div>
      )
    },
    {
      id: "shipping-info",
      title: "🚚 Shipping Info",
      content: (
        <div className="space-y-3">
          <p><strong>Processing: 1-3 business days</strong></p>
          <div className="space-y-2 text-foreground/80 text-sm">
            <p><strong className="text-foreground">Canada & USA:</strong> 5-10 business days</p>
            <p><strong className="text-foreground">International:</strong> 7-15 business days</p>
          </div>
          <p className="mt-4"><strong>Free shipping on orders over $35!</strong></p>
          <div className="mt-4 pt-4 border-t border-primary/20">
            <p className="text-sm"><Link href="/shipping" className="text-primary hover:opacity-80 transition font-semibold">View full shipping info →</Link></p>
          </div>
        </div>
      )
    },
    {
      id: "product-questions",
      title: "📏 Product Questions",
      content: (
        <div className="space-y-3">
          <p><strong>Common questions about our cases:</strong></p>
          <ul className="list-disc list-inside space-y-2 text-foreground/80 text-sm">
            <li><strong>Are they protective?</strong> Yes! Our cases feature protective edges and a slim, cute design</li>
            <li><strong>What materials do you use?</strong> High-quality materials designed to last and protect your phone</li>
            <li><strong>Do you have my phone model?</strong> Check the shop to see all available models</li>
            <li><strong>Can I customize?</strong> Some designs offer personalization — check the product page</li>
          </ul>
          <div className="mt-4 pt-4 border-t border-primary/20">
            <p className="text-sm"><Link href="/faq" className="text-primary hover:opacity-80 transition font-semibold">View all FAQs →</Link></p>
          </div>
        </div>
      )
    },
    {
      id: "contact-support",
      title: "💌 Contact Support",
      content: (
        <div className="space-y-3">
          <p>We&apos;re here to help! Reach out using any of these methods:</p>
          <ul className="space-y-2 text-foreground/80 text-sm">
            <li><strong>Email:</strong> <a href="mailto:support@casekisses.com" className="text-primary hover:opacity-80 transition">support@casekisses.com</a></li>
            <li><strong>Contact Form:</strong> <Link href="/contact" className="text-primary hover:opacity-80 transition">Fill out our form</Link></li>
            <li><strong>Response time:</strong> We reply within 24 hours (usually faster!)</li>
          </ul>
        </div>
      )
    }
  ]

  return (
    <main className="relative">
      <Header />
      
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        {/* Chat-style greeting */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-serif text-foreground mb-4 text-balance">
            Hi 💖 how can we help you?
          </h1>
          <p className="text-base text-muted-foreground">
            Click on any topic below to find answers to common questions.
          </p>
        </div>

        {/* Support Topics */}
        <div className="space-y-3 mb-12">
          {topics.map((topic) => (
            <button
              key={topic.id}
              onClick={() => setOpenTopic(openTopic === topic.id ? null : topic.id)}
              className="w-full text-left bg-gradient-to-r from-secondary/40 to-secondary/20 hover:from-secondary/50 hover:to-secondary/30 rounded-3xl p-6 transition-all duration-200 border border-primary/10"
            >
              <div className="flex items-center justify-between gap-4">
                <span className="text-lg font-semibold text-foreground">
                  {topic.title}
                </span>
                <span className={`flex-shrink-0 text-2xl text-primary transition-transform duration-300 ${
                  openTopic === topic.id ? 'rotate-45' : ''
                }`}>
                  +
                </span>
              </div>
              
              {openTopic === topic.id && (
                <div className="mt-6 pt-6 border-t border-primary/20 text-foreground/80 text-sm leading-relaxed animate-in fade-in slide-in-from-top-2">
                  {topic.content}
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="my-12 flex items-center gap-4">
          <div className="flex-1 h-px bg-primary/20"></div>
          <span className="text-muted-foreground text-sm">or</span>
          <div className="flex-1 h-px bg-primary/20"></div>
        </div>

        {/* Email CTA */}
        <div className="bg-accent rounded-3xl p-8 md:p-10 text-center">
          <p className="text-foreground/80 text-lg mb-4 text-pretty">
            If you still need help, email us at <br className="hidden sm:block" />
            <a href="mailto:support@casekisses.com" className="text-primary hover:opacity-80 transition font-semibold">
              support@casekisses.com
            </a>
          </p>
          <p className="text-primary text-2xl">💕</p>
        </div>

        {/* Quick Links */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-3 gap-3">
          <Link href="/faq" className="text-center py-3 text-primary hover:opacity-80 transition font-medium text-sm bg-secondary/20 rounded-2xl">
            See All FAQs
          </Link>
          <Link href="/contact" className="text-center py-3 text-primary hover:opacity-80 transition font-medium text-sm bg-secondary/20 rounded-2xl">
            Contact Form
          </Link>
          <Link href="/shipping" className="text-center py-3 text-primary hover:opacity-80 transition font-medium text-sm bg-secondary/20 rounded-2xl">
            Shipping Info
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  )
}
