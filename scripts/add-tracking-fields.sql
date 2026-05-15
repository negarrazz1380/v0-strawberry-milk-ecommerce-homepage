-- Add missing columns to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_id VARCHAR(255) UNIQUE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_address TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_status VARCHAR(50) DEFAULT 'pending';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_url VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS carrier VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMP;

-- Update existing orders to have order_id
UPDATE orders SET order_id = 'ORD-' || SUBSTRING(id::text, 1, 8) || '-' || SUBSTRING(id::text, 25, 8)
WHERE order_id IS NULL;

-- Create index for order lookup
CREATE INDEX IF NOT EXISTS idx_orders_order_id ON orders(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);

-- Allow admins to update orders with tracking info (service role)
CREATE POLICY "Allow service role to update orders" ON orders
  FOR UPDATE USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
