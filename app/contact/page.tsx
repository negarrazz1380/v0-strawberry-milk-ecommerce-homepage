'use client'

import { useState } from 'react'
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setSubmitted(true)
        setFormData({ name: '', email: '', subject: '', message: '' })
        setTimeout(() => setSubmitted(false), 5000)
      } else {
        setError(data.error || 'Failed to send message')
      }
    } catch (error) {
      console.error('Form submission error:', error)
      setError('An error occurred while sending your message')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="relative">
      <Header />
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <h1 className="text-4xl md:text-5xl font-serif text-foreground mb-4 text-balance">
          Get in Touch
        </h1>
        <p className="text-lg text-muted-foreground mb-12 text-pretty">
          Have questions? We&apos;d love to hear from you. Send us a message and we&apos;ll respond as soon as possible.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Support */}
          <div className="md:col-span-1">
            <div className="bg-secondary/30 rounded-2xl p-6">
              <h3 className="font-semibold text-foreground mb-2">Support</h3>
              <p className="text-sm text-foreground/80 mb-3">
                For order issues
              </p>
              <a href="mailto:casekissessupport@gmail.com" className="text-primary hover:opacity-80 transition font-medium">
                casekissessupport@gmail.com
              </a>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-secondary/20 rounded-3xl p-8 md:p-12">
          <h2 className="text-2xl font-serif text-foreground mb-8">Send us a message</h2>
          
          {submitted && (
            <div className="bg-primary/10 text-primary rounded-2xl px-6 py-4 mb-6 font-medium">
              Thanks for reaching out! We&apos;ll get back to you soon. 💕
            </div>
          )}

          {error && (
            <div className="bg-red-100 text-red-700 rounded-2xl px-6 py-4 mb-6 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full bg-card rounded-2xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                placeholder="Your name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full bg-card rounded-2xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-2">
                Subject
              </label>
              <select
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="w-full bg-card rounded-2xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="">Select a subject (optional)</option>
                <option value="order">Order Question</option>
                <option value="shipping">Shipping Inquiry</option>
                <option value="returns">Return/Exchange</option>
                <option value="product">Product Question</option>
                <option value="collaboration">Collaboration</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={5}
                className="w-full bg-card rounded-2xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                placeholder="Tell us what's on your mind..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-2xl font-semibold hover:opacity-90 transition disabled:opacity-60"
            >
              {loading ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>

        {/* FAQ Link */}
        <div className="mt-12 text-center">
          <p className="text-foreground/80 mb-4">
            Most questions answered in our FAQ.
          </p>
          <a href="/faq" className="text-primary hover:opacity-80 transition font-medium">
            Check out the FAQ →
          </a>
        </div>
      </div>

      <Footer />
    </main>
  )
}
