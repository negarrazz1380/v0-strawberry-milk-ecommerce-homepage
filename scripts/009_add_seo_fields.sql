-- Migration: search-language titles and descriptions for products
-- Run this in the Supabase SQL Editor BEFORE deploying the SEO title code.
--
-- The problem this solves:
--   Our product names are invented brand names — "Cocoa Teddy Charm Case",
--   "Cherry Bliss Cute Case". Nobody searches those. They search
--   "cute teddy bear iphone case". Page titles built from product names target
--   keywords with zero search volume.
--
--   seo_title / seo_description let a product keep its cute brand name on the
--   page while the <title> and meta description target what people actually
--   type. Both fall back to the product name when null, so this is safe to
--   fill in gradually.
--
-- Rules for seo_title:
--   * Lead with the words people search: "Cute Teddy Bear iPhone Case"
--   * Keep it under ~60 characters — "| CaseKisses" is appended automatically
--   * The brand name goes at the END if at all, never the front
--   * One product, one honest title. Don't stuff every keyword into every page.

ALTER TABLE products ADD COLUMN IF NOT EXISTS seo_title TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS seo_description TEXT;

COMMENT ON COLUMN products.seo_title IS
  'Search-language page title, e.g. "Cute Teddy Bear iPhone Case". Falls back to name. "| CaseKisses" is appended by the app — do not include it.';
COMMENT ON COLUMN products.seo_description IS
  'Meta description, ~150-160 chars. Should answer what it is, what it fits, and what is included. Falls back to the product description.';

-- Suggested starting titles, derived from your existing product names.
-- Review these — change anything that misdescribes the product.

UPDATE products SET seo_title = 'Cute Pink Bow & Cherry iPhone Case'
  WHERE slug = 'adorable-pink-bow-cherry-case-iphone-12-series';

UPDATE products SET seo_title = 'Cute Cherry iPhone Case'
  WHERE slug = 'cherry-bliss-cute-case-iphone-13-series';

UPDATE products SET seo_title = 'Cute Teddy Bear iPhone Case with Charm Strap'
  WHERE slug = 'cocoa-teddy-charm-case-iphone-12-series';

UPDATE products SET seo_title = 'Cute Puppy iPhone Case'
  WHERE slug = 'puppy-blush-case-iphone-13-series';

UPDATE products SET seo_title = 'Cute Charm iPhone Case with Strap'
  WHERE slug = 'softie-charm-case-iphone-13-series';

-- seo_description is left NULL on purpose — write these yourself once you can
-- state the real specs (material, MagSafe, wireless charging, what's included).
-- A description that answers questions is what gets cited; one that only sets a
-- mood is not.
--
-- Example shape:
--   'Clear TPU iPhone case with a 3D pink bow and cherry details. Fits iPhone
--    12-15 series. Includes a matching heart wrist strap. Ships free from
--    Toronto.'
--
-- Check progress:
--   SELECT name, seo_title, seo_description FROM products WHERE is_active;
