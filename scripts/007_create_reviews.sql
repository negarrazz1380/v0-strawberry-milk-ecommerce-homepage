-- Migration: product reviews
-- Run this in the Supabase SQL Editor BEFORE deploying the review code.
--
-- Design notes:
--  * Reviews are moderated: new reviews land as is_approved = false and are
--    invisible until you approve them. This is spam protection, NOT a way to
--    hide bad reviews — approve honest 1-star reviews too. Filtered reviews are
--    obvious to customers and destroy the trust the reviews exist to build.
--  * Only approved reviews are readable by the public, so the star rating and
--    the AggregateRating schema always reflect real, published reviews.

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products (id) ON DELETE CASCADE,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title TEXT,
  body TEXT,
  reviewer_name TEXT NOT NULL,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  is_verified_purchase BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Fast lookup of a product's published reviews, newest first
CREATE INDEX IF NOT EXISTS idx_reviews_product_approved
  ON reviews (product_id, is_approved, created_at DESC);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can READ approved reviews (this is what renders on the product page
-- and feeds the AggregateRating schema).
DROP POLICY IF EXISTS "Approved reviews are publicly readable" ON reviews;
CREATE POLICY "Approved reviews are publicly readable"
  ON reviews FOR SELECT
  USING (is_approved = true);

-- Anyone can SUBMIT a review, but only as unapproved. The WITH CHECK clause
-- stops someone from POSTing is_approved = true and self-publishing.
DROP POLICY IF EXISTS "Anyone can submit a pending review" ON reviews;
CREATE POLICY "Anyone can submit a pending review"
  ON reviews FOR INSERT
  WITH CHECK (is_approved = false);

-- Moderation queue — run this in the SQL Editor to see what's waiting:
--   SELECT id, product_id, rating, reviewer_name, title, body, created_at
--   FROM reviews WHERE is_approved = false ORDER BY created_at DESC;
--
-- Approve one:
--   UPDATE reviews SET is_approved = true WHERE id = '<review-id>';
