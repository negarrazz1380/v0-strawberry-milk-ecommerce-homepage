-- Add device_models array to products table
-- Stores supported phone models e.g. {'iPhone 12','iPhone 15 Pro Max'}
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS device_models TEXT[] DEFAULT NULL;

-- Add device_model to order_items table
-- Stores the specific model the customer selected at checkout
ALTER TABLE order_items
  ADD COLUMN IF NOT EXISTS device_model TEXT DEFAULT NULL;
