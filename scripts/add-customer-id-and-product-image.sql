-- Add customer_id foreign key to orders table to link to checkout_customers
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES checkout_customers(id) ON DELETE SET NULL;

-- Add product_image to order_items table to store product image URLs
ALTER TABLE order_items
ADD COLUMN IF NOT EXISTS product_image TEXT;

-- Create index for faster lookups by customer_id
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
