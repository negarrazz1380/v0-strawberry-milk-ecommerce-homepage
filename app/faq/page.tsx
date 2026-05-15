'use client'

import { useState } from 'react'
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const faqs = [
    {
      category: "Orders & Shipping",
      items: [
        {
          q: "How long does shipping take?",
          a: "Orders ship within 1-2 business days. Standard shipping takes 5-7 business days, and express shipping takes 2-3 business days. You'll receive a tracking number once your order ships."
        },
        {
          q: "Do you ship internationally?",
          a: "Yes! We ship to Canada, the UK, Australia, and select other countries. International orders typically take 10-20 business days. Contact us for rates and availability."
        },
        {
          q: "Can I change my order after placing it?",
          a: "If your order hasn't shipped yet, we can usually help. Contact us immediately with your order number and we'll do our best to make changes."
        },
        {
          q: "What if my case arrives damaged?",
          a: "Contact us within 48 hours with photos and we'll replace it or refund you. We pack carefully, but accidents happen, and we'll make it right."
        }
      ]
    },
    {
      category: "Returns & Store Credit",
      items: [
        {
          q: "What's your return policy?",
          a: "You have 14 days from delivery to request a return. Items must be unused and in original condition with no damage, stains, or wear. Customers are responsible for return shipping costs."
        },
        {
          q: "What happens after I return my item?",
          a: "Once we receive and inspect your return, store credit is processed within 5–7 business days. We offer store credit so you can choose another style you love 💖"
        },
        {
          q: "Do you offer exchanges?",
          a: "We do not offer direct exchanges. However, you can use your store credit from a return to purchase a different case on our website."
        },
        {
          q: "Are sale items returnable?",
          a: "Sale and clearance items may be final sale. If they arrive defective, we'll replace them or offer store credit."
        }
      ]
    },
    {
      category: "Products",
      items: [
        {
          q: "What phone models do you support?",
          a: "We carry cases for iPhone, Samsung Galaxy, Google Pixel, and more. Check our shop to see all available models and designs."
        },
        {
          q: "Are your cases protective?",
          a: "Yes! Our cases feature protective edges and a slim design. They protect against drops and bumps while keeping your phone looking cute."
        },
        {
          q: "Can I customize a case?",
          a: "We offer select customization options. Check individual product pages for personalization options, or contact us about custom designs."
        },
        {
          q: "Are your cases durable?",
          a: "Our cases are made from high-quality materials designed to last. With proper care, they'll keep your phone protected for years."
        }
      ]
    },
    {
      category: "Account & Payment",
      items: [
        {
          q: "Do I need an account to shop?",
          a: "Nope! You can checkout as a guest. But creating an account lets you track orders and save your information for faster checkout next time."
        },
        {
          q: "What payment methods do you accept?",
          a: "We accept all major credit cards (Visa, Mastercard, American Express), Apple Pay, Google Pay, and more through our secure checkout."
        },
        {
          q: "Is my payment information secure?",
          a: "Yes! We use industry-standard SSL encryption and never store your full payment details. All transactions are secure and protected."
        },
        {
          q: "Will I be charged tax?",
          a: "Sales tax is calculated based on your shipping address and state/country regulations. It will be shown before you complete checkout."
        }
      ]
    }
  ]

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <main className="relative">
      <Header />
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <h1 className="text-4xl md:text-5xl font-serif text-foreground mb-4 text-balance">
          Frequently Asked Questions
        </h1>
        <p className="text-lg text-muted-foreground mb-12 text-pretty">
          Can&apos;t find an answer? Check out our other pages or <Link href="/contact" className="text-primary hover:opacity-80 transition">contact us</Link>.
        </p>

        <div className="space-y-12">
          {faqs.map((section, sectionIndex) => (
            <section key={sectionIndex}>
              <h2 className="text-2xl font-serif text-foreground mb-6">{section.category}</h2>
              <div className="space-y-3">
                {section.items.map((faq, itemIndex) => {
                  const globalIndex = sectionIndex * 100 + itemIndex
                  return (
                    <button
                      key={globalIndex}
                      onClick={() => toggleFAQ(globalIndex)}
                      className="w-full text-left bg-secondary/20 rounded-2xl p-6 hover:bg-secondary/30 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="font-semibold text-foreground text-pretty">
                          {faq.q}
                        </h3>
                        <span className={`flex-shrink-0 text-2xl text-primary transition-transform ${
                          openIndex === globalIndex ? 'rotate-45' : ''
                        }`}>
                          +
                        </span>
                      </div>
                      
                      {openIndex === globalIndex && (
                        <p className="text-foreground/80 mt-4 text-pretty leading-relaxed">
                          {faq.a}
                        </p>
                      )}
                    </button>
                  )
                })}
              </div>
            </section>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 bg-primary/5 rounded-2xl p-8 text-center">
          <h3 className="text-xl font-serif text-foreground mb-3">Didn&apos;t find what you need?</h3>
          <p className="text-foreground/80 mb-6">Our team is here to help! Reach out anytime.</p>
          <Link href="/contact" className="inline-block bg-primary text-primary-foreground px-8 py-3 rounded-full font-semibold hover:opacity-90 transition">
            Contact Us
          </Link>
        </div>

        {/* Quick Links */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
          <Link href="/shipping" className="text-primary hover:opacity-80 transition font-medium text-sm">
            Shipping Info
          </Link>
          <Link href="/returns" className="text-primary hover:opacity-80 transition font-medium text-sm">
            Returns Policy
          </Link>
          <Link href="/contact" className="text-primary hover:opacity-80 transition font-medium text-sm">
            Contact Us
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  )
}
