import { Star } from 'lucide-react'

interface StarRatingProps {
  /** Rating from 0-5. Halves are rounded to the nearest whole star. */
  rating: number
  size?: number
}

/**
 * Renders a 1-5 star rating.
 *
 * Deliberately NOT a client component — the stars must be in the initial HTML
 * so search and AI crawlers can see the rating, not just hydrated users.
 */
export function StarRating({ rating, size = 16 }: StarRatingProps) {
  const rounded = Math.round(rating)

  return (
    <span
      className="inline-flex items-center gap-0.5"
      aria-label={`${rating} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          aria-hidden="true"
          className={
            star <= rounded ? 'fill-primary text-primary' : 'text-foreground/20'
          }
        />
      ))}
    </span>
  )
}
