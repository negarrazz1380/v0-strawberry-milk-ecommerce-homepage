-- Remove best_seller column from products table
ALTER TABLE products DROP COLUMN IF EXISTS is_best_seller;
