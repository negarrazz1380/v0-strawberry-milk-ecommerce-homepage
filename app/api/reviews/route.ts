import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Accepts a customer review submission.
 *
 * Reviews always land unapproved (is_approved defaults to false, and RLS
 * rejects any insert that tries to set it true). Approve them in the Supabase
 * SQL Editor — see scripts/007_create_reviews.sql.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { product_id, rating, title, review_body, reviewer_name } = body

    if (!product_id || typeof product_id !== 'string') {
      return NextResponse.json({ error: 'Missing product' }, { status: 400 })
    }

    const parsedRating = Number(rating)
    if (!Number.isInteger(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return NextResponse.json({ error: 'Please choose a rating from 1 to 5 stars' }, { status: 400 })
    }

    const name = typeof reviewer_name === 'string' ? reviewer_name.trim() : ''
    if (name.length < 1 || name.length > 60) {
      return NextResponse.json({ error: 'Please add your name' }, { status: 400 })
    }

    const text = typeof review_body === 'string' ? review_body.trim() : ''
    if (text.length > 2000) {
      return NextResponse.json({ error: 'Review is too long (2000 characters max)' }, { status: 400 })
    }

    const reviewTitle = typeof title === 'string' ? title.trim().slice(0, 120) : null

    const supabase = await createClient()

    const { error } = await supabase.from('reviews').insert({
      product_id,
      rating: parsedRating,
      title: reviewTitle || null,
      body: text || null,
      reviewer_name: name,
      is_approved: false,
    })

    if (error) {
      console.error('Review insert failed:', error.message)
      return NextResponse.json({ error: 'Could not save your review' }, { status: 500 })
    }

    return NextResponse.json({
      ok: true,
      message: 'Thank you! Your review has been submitted and will appear once approved.',
    })
  } catch (error) {
    console.error('Review route error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
