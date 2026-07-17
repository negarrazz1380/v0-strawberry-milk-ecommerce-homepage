-- Migration: per-product hardware specs
-- Run in the Supabase SQL Editor, then fill in the values below.
--
-- Why this exists:
--   "MagSafe: some models, wireless charging: some models" is a true statement
--   that is useless to a shopper and unusable in schema. A shopper asking
--   "does the teddy one work with MagSafe?" needs a yes or a no, and structured
--   data can only carry a yes or a no. "Some" cannot be published anywhere.
--
--   These are nullable on purpose. NULL means "we haven't confirmed", and the
--   site will simply say nothing about it — which is correct. Only a real true
--   or false shows up on the page or in schema. Never guess a value here: an
--   incorrect MagSafe claim is a returned order.

ALTER TABLE products ADD COLUMN IF NOT EXISTS has_magsafe BOOLEAN;
ALTER TABLE products ADD COLUMN IF NOT EXISTS wireless_charging_ok BOOLEAN;
ALTER TABLE products ADD COLUMN IF NOT EXISTS back_material TEXT;

COMMENT ON COLUMN products.has_magsafe IS
  'True = built-in MagSafe magnet array. NULL = unconfirmed; nothing is claimed on the site.';
COMMENT ON COLUMN products.wireless_charging_ok IS
  'True = works with Qi wireless charging through the case. NULL = unconfirmed.';
COMMENT ON COLUMN products.back_material IS
  'e.g. "Polycarbonate (PC) back with TPU bumper". Supplier-confirmed only.';

-- Supplier confirmed a PC back + UV stabiliser.
--
-- ⚠️ Applied ONLY to the two CLEAR cases. The product photos show that Cherry
-- Bliss, Cocoa Teddy and Puppy Blush are opaque cream / brown-tinted, not clear
-- — yellowing is a clear-case problem, and the supplier's answer was given in
-- that context. Leaving their material NULL (= site says nothing) until it is
-- confirmed separately, rather than claiming a spec that may not apply.
UPDATE products SET back_material = 'Polycarbonate (PC) back with UV stabiliser'
  WHERE slug IN (
    'adorable-pink-bow-cherry-case-iphone-12-series',
    'softie-charm-case-iphone-13-series'
  );

-- ⬇️ FILL THESE IN. Replace NULL with true or false per product.
-- Leave NULL for anything you have not confirmed with the supplier.

UPDATE products SET has_magsafe = NULL, wireless_charging_ok = NULL
  WHERE slug = 'adorable-pink-bow-cherry-case-iphone-12-series';

UPDATE products SET has_magsafe = NULL, wireless_charging_ok = NULL
  WHERE slug = 'cherry-bliss-cute-case-iphone-13-series';

UPDATE products SET has_magsafe = NULL, wireless_charging_ok = NULL
  WHERE slug = 'cocoa-teddy-charm-case-iphone-12-series';

UPDATE products SET has_magsafe = NULL, wireless_charging_ok = NULL
  WHERE slug = 'puppy-blush-case-iphone-13-series';

UPDATE products SET has_magsafe = NULL, wireless_charging_ok = NULL
  WHERE slug = 'softie-charm-case-iphone-13-series';

-- Check what's still unconfirmed:
--   SELECT name, back_material, has_magsafe, wireless_charging_ok
--   FROM products WHERE is_active;
