import { StarRating } from '@/components/star-rating'
import { ReviewForm } from '@/components/review-form'
import type { ProductReviews } from '@/lib/reviews'

interface ProductReviewsSectionProps {
  productId: string
  productName: string
  data: ProductReviews
}

/**
 * Server component — the review list renders into the initial HTML so crawlers
 * and AI engines can read the ratings and the review text. Only the submission
 * form below is interactive (client).
 */
export function ProductReviewsSection({
  productId,
  productName,
  data,
}: ProductReviewsSectionProps) {
  const { reviews, count, average } = data

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16" id="reviews">
      <div className="border-t border-border/50 pt-12">
        <div className="flex flex-wrap items-center gap-4 mb-8">
          <h2 className="text-2xl font-serif text-foreground">Reviews</h2>
          {average !== null && (
            <div className="flex items-center gap-2">
              <StarRating rating={average} size={18} />
              <span className="text-sm text-foreground/70">
                {average} out of 5 · {count} {count === 1 ? 'review' : 'reviews'}
              </span>
            </div>
          )}
        </div>

        {reviews.length === 0 ? (
          <p className="text-foreground/60 mb-10">
            No reviews yet — be the first to review the {productName} 💕
          </p>
        ) : (
          <ul className="space-y-6 mb-12">
            {reviews.map((review) => (
              <li key={review.id} className="bg-secondary/20 rounded-2xl p-6">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <StarRating rating={review.rating} />
                  {review.title && (
                    <h3 className="font-semibold text-foreground">{review.title}</h3>
                  )}
                  {review.is_verified_purchase && (
                    <span className="text-xs font-medium text-primary bg-primary/10 rounded-full px-2 py-0.5">
                      Verified purchase
                    </span>
                  )}
                </div>
                {review.body && (
                  <p className="text-foreground/80 leading-relaxed text-pretty mb-3">
                    {review.body}
                  </p>
                )}
                <p className="text-xs text-foreground/50">
                  {review.reviewer_name} ·{' '}
                  <time dateTime={review.created_at}>
                    {new Date(review.created_at).toLocaleDateString('en-CA', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </time>
                </p>
              </li>
            ))}
          </ul>
        )}

        <ReviewForm productId={productId} />
      </div>
    </section>
  )
}
