-- Migration: per-product image alt text
-- Run this in the Supabase SQL Editor BEFORE deploying the alt-text code.
--
-- Why this exists:
--   Alt text is the single highest-leverage signal for image visibility in AI
--   search. GPTBot / PerplexityBot / ClaudeBot read it to confirm what a photo
--   shows, and when ChatGPT surfaces an image, the wording around it often comes
--   straight from the alt attribute. Using the product NAME as alt (the old
--   behaviour) says nothing about what's actually in the picture.
--
-- Fill these in yourself — describe what is VISIBLE in each photo:
--   good: "Clear iPhone case with a 3D pink satin bow and two red cherries,
--          shown on a white iPhone against a pastel pink background"
--   bad:  "Cocoa Teddy Charm Case"  (that's the name, not the image)
--   bad:  "cute phone case bow cherry pink kawaii aesthetic"  (keyword stuffing)
--
-- Accuracy matters more than keywords: a wrong-but-specific description
-- contradicts what the AI's vision model already sees, and that costs you.

ALTER TABLE products ADD COLUMN IF NOT EXISTS image_alt TEXT;

COMMENT ON COLUMN products.image_alt IS
  'Describes what is visible in image_url, for accessibility and AI/search visibility. Falls back to name when null.';

-- Write your alt text here — one UPDATE per product:
--
-- UPDATE products SET image_alt = 'Clear iPhone case with ...'
--   WHERE slug = 'adorable-pink-bow-cherry-case-iphone-12-series';
-- UPDATE products SET image_alt = '...'
--   WHERE slug = 'cherry-bliss-cute-case-iphone-13-series';
-- UPDATE products SET image_alt = '...'
--   WHERE slug = 'cocoa-teddy-charm-case-iphone-12-series';
-- UPDATE products SET image_alt = '...'
--   WHERE slug = 'puppy-blush-case-iphone-13-series';
-- UPDATE products SET image_alt = '...'
--   WHERE slug = 'softie-charm-case-iphone-13-series';

-- Check which products still need alt text:
--   SELECT name, image_alt FROM products WHERE is_active AND image_alt IS NULL;
