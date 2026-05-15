-- Migration: Add SEO-friendly slug column to products table
-- Run this in Supabase SQL Editor before deploying the slug code changes.

-- Step 1: Add nullable slug column
ALTER TABLE products ADD COLUMN IF NOT EXISTS slug TEXT;

-- Step 2: Backfill slugs for existing products
-- Generates: lowercase(name + optional first device_model), strips special chars, spaces→hyphens
UPDATE products
SET slug = regexp_replace(
  regexp_replace(
    lower(
      CASE
        WHEN device_models IS NOT NULL
          AND jsonb_array_length(to_jsonb(device_models)) > 0
        THEN name || '-' || (to_jsonb(device_models) ->> 0)
        ELSE name
      END
    ),
    '[^a-z0-9\s-]', '', 'g'
  ),
  '\s+', '-', 'g'
)
WHERE slug IS NULL;

-- Step 3: Unique partial index — NULLs are not indexed, duplicates among non-null slugs are prevented
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_slug ON products (slug) WHERE slug IS NOT NULL;

-- Verify: check resulting slugs
-- SELECT id, name, slug FROM products ORDER BY name;
