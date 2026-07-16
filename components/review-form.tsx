'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'

interface ReviewFormProps {
  productId: string
}

export function ReviewForm({ productId }: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [name, setName] = useState('')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)

  const handleSubmit = async () => {
    setMessage(null)
    setFailed(false)

    if (rating === 0) {
      setFailed(true)
      setMessage('Please choose a star rating.')
      return
    }
    if (!name.trim()) {
      setFailed(true)
      setMessage('Please add your name.')
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: productId,
          rating,
          title,
          review_body: body,
          reviewer_name: name,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        setFailed(true)
        setMessage(result.error || 'Something went wrong. Please try again.')
        return
      }

      setMessage(result.message)
      setRating(0)
      setName('')
      setTitle('')
      setBody('')
    } catch {
      setFailed(true)
      setMessage('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-primary/5 rounded-2xl p-6 sm:p-8 max-w-2xl">
      <h3 className="text-lg font-serif text-foreground mb-1">Write a review</h3>
      <p className="text-sm text-foreground/60 mb-6">
        Reviews are published after a quick check for spam.
      </p>

      <div className="mb-5">
        <label className="block text-sm font-semibold text-foreground/70 mb-2">
          Your rating
        </label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              aria-label={`${star} ${star === 1 ? 'star' : 'stars'}`}
              className="p-1 transition-transform hover:scale-110"
            >
              <Star
                size={28}
                className={
                  star <= (hovered || rating)
                    ? 'fill-primary text-primary'
                    : 'text-foreground/25'
                }
              />
            </button>
          ))}
        </div>
      </div>

      <div className="mb-5">
        <label htmlFor="review-name" className="block text-sm font-semibold text-foreground/70 mb-2">
          Your name
        </label>
        <input
          id="review-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={60}
          placeholder="e.g. Sarah M."
          className="w-full border-2 border-border rounded-xl px-4 py-3 text-sm bg-background text-foreground focus:outline-none focus:border-primary transition-colors"
        />
      </div>

      <div className="mb-5">
        <label htmlFor="review-title" className="block text-sm font-semibold text-foreground/70 mb-2">
          Headline <span className="font-normal text-foreground/50">(optional)</span>
        </label>
        <input
          id="review-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={120}
          placeholder="Sum it up in a few words"
          className="w-full border-2 border-border rounded-xl px-4 py-3 text-sm bg-background text-foreground focus:outline-none focus:border-primary transition-colors"
        />
      </div>

      <div className="mb-6">
        <label htmlFor="review-body" className="block text-sm font-semibold text-foreground/70 mb-2">
          Your review <span className="font-normal text-foreground/50">(optional)</span>
        </label>
        <textarea
          id="review-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={2000}
          rows={4}
          placeholder="How does it look? How does it feel? Would you buy it again?"
          className="w-full border-2 border-border rounded-xl px-4 py-3 text-sm bg-background text-foreground focus:outline-none focus:border-primary transition-colors resize-y"
        />
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={submitting}
        className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-semibold hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {submitting ? 'Submitting…' : 'Submit review'}
      </button>

      {message && (
        <p
          role="status"
          className={`mt-4 text-sm ${failed ? 'text-red-600' : 'text-primary'}`}
        >
          {message}
        </p>
      )}
    </div>
  )
}
