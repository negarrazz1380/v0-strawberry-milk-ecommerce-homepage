import { createClient } from '@/lib/supabase/server'

export interface Review {
  id: string
  rating: number
  title: string | null
  body: string | null
  reviewer_name: string
  is_verified_purchase: boolean
  created_at: string
}

export interface ProductReviews {
  reviews: Review[]
  /** Number of published reviews. */
  count: number
  /** Mean rating rounded to 1 decimal, or null when there are no reviews yet. */
  average: number | null
}

/**
 * Fetches a product's APPROVED reviews on the server.
 *
 * Runs at request time so reviews and the star rating are present in the
 * initial HTML — that's what lets Google and AI engines read them. RLS on the
 * reviews table already restricts SELECT to approved rows.
 */
export async function fetchProductReviews(productId: string): Promise<ProductReviews> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('reviews')
    .select('id, rating, title, body, reviewer_name, is_verified_purchase, created_at')
    .eq('product_id', productId)
    .eq('is_approved', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching reviews:', error.message)
    return { reviews: [], count: 0, average: null }
  }

  const reviews: Review[] = data ?? []

  if (reviews.length === 0) {
    return { reviews, count: 0, average: null }
  }

  const total = reviews.reduce((sum, review) => sum + review.rating, 0)
  const average = Math.round((total / reviews.length) * 10) / 10

  return { reviews, count: reviews.length, average }
}
