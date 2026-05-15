-- Add last_chance and show_on_homepage boolean columns to products table
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS last_chance BOOLEAN DEFAULT FALSE;

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS show_on_homepage BOOLEAN DEFAULT FALSE;
