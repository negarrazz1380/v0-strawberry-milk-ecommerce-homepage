-- ============================================================================
-- MIGRATION: Add customer_id and product_image for complete order data
-- ============================================================================
-- This migration adds:
-- 1. customer_id FK to orders (links to checkout_customers for full address data)
-- 2. product_image to order_items (stores product image URLs)
-- ============================================================================

-- Add customer_id foreign key to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES public.checkout_customers(id) ON DELETE SET NULL;

-- Add product_image column to order_items table
ALTER TABLE public.order_items 
ADD COLUMN IF NOT EXISTS product_image TEXT;

-- Add device_model column to order_items for better product details
ALTER TABLE public.order_items 
ADD COLUMN IF NOT EXISTS device_model VARCHAR(100);

-- Create index on customer_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);

-- Create index on product_image for filtering
CREATE INDEX IF NOT EXISTS idx_order_items_product_image ON public.order_items(product_image);

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================
-- Schema updated successfully.
-- orders table now has customer_id FK to link with full checkout_customers data.
-- order_items table now stores product_image URLs and device_model details.
-- All existing orders will have NULL customer_id and product_image (backward compatible).
-- New orders from webhooks will populate these fields when they reference checkout_customers and cart items.
