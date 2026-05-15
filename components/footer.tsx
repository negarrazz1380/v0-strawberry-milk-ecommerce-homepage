"use client"

import { useState } from "react"
import Link from "next/link"

const footerLinks = [
  {
    heading: "Quick Links",
    links: [
      { label: "Shipping", href: "/shipping" },
      { label: "Returns", href: "/returns" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    heading: "Support",
    links: [
      { label: "Help & Support", href: "/help" },
      { label: "Returns & Store Credit", href: "/returns" },
      { label: "Questions", href: "/faq" },
    ],
  },
  {
    heading: "About",
    links: [
      { label: "About", href: "/about" },
    ],
  },
]

export function Footer() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setSubmitted(true)
        setEmail("")
        setTimeout(() => setSubmitted(false), 5000)
      } else {
        setError(data.error || 'Failed to subscribe')
      }
    } catch (err) {
      console.error('Newsletter subscription error:', err)
      setError('An error occurred while subscribing')
    } finally {
      setLoading(false)
    }
  }

  return (
    <footer>
      {/* Newsletter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="max-w-md mx-auto text-center flex flex-col gap-4">
          <h3 className="font-serif text-2xl md:text-3xl text-foreground text-balance">Subscribe to our emails</h3>
          <p className="text-sm text-muted-foreground text-pretty">
            Be the first to know about new drops, exclusive deals, and cute things in your inbox.
          </p>
          {submitted ? (
            <div className="bg-accent text-primary rounded-2xl px-6 py-4 text-sm font-medium">
              Thanks for subscribing! Check your inbox for a welcome gift.
            </div>
          ) : error ? (
            <div className="bg-red-100 text-red-700 rounded-2xl px-6 py-4 text-sm font-medium">
              {error}
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex gap-2 w-full">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                className="flex-1 min-w-0 bg-card rounded-2xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                aria-label="Email address"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-primary text-primary-foreground px-5 py-3 rounded-2xl text-sm font-semibold hover:opacity-90 transition-opacity shrink-0 disabled:opacity-60"
              >
                {loading ? 'Loading...' : 'Subscribe'}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Links + Logo */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1 flex flex-col gap-3">
            <Link href="/" className="font-serif text-2xl text-primary">
              casekisses
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed text-pretty max-w-xs">
              Cute, girly phone cases for people who care about the details. Made with love, shipped with care.
            </p>
          </div>

          {/* Link columns */}
          {footerLinks.map((col) => (
            <div key={col.heading} className="flex flex-col gap-3">
              <h4 className="text-xs font-bold uppercase tracking-widest text-foreground/60">{col.heading}</h4>
              <ul className="flex flex-col gap-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>&copy; {new Date().getFullYear()} CaseKisses. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
