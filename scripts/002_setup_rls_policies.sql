-- ============================================================================
-- RLS SECURITY MIGRATION FOR CASEKISSES
-- ============================================================================
-- This script implements row-level security policies to protect customer data
-- IMPORTANT: Before running this script, set your admin account:
--   UPDATE public.profiles SET role = 'admin' WHERE id = 'YOUR_USER_ID';
-- ============================================================================

-- Add role column to profiles if it doesn't exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin'));

-- ============================================================================
-- CREATE SECURITY DEFINER FUNCTION FOR ADMIN CHECKS
-- ============================================================================
-- This function executes with elevated privileges and does not trigger RLS,
-- preventing infinite recursion when checking admin status in policies.
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;
CREATE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;

-- Grant permission to call this function to authenticated users
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon;

-- ============================================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================================
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkout_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PRODUCTS TABLE POLICIES
-- ============================================================================
-- Anyone can read products
DROP POLICY IF EXISTS "products_public_read" ON public.products;
CREATE POLICY "products_public_read" ON public.products
  FOR SELECT USING (true);

-- Only admins can insert products
DROP POLICY IF EXISTS "products_admin_insert" ON public.products;
CREATE POLICY "products_admin_insert" ON public.products
  FOR INSERT WITH CHECK (public.is_admin());

-- Only admins can update products
DROP POLICY IF EXISTS "products_admin_update" ON public.products;
CREATE POLICY "products_admin_update" ON public.products
  FOR UPDATE USING (public.is_admin());

-- Only admins can delete products
DROP POLICY IF EXISTS "products_admin_delete" ON public.products;
CREATE POLICY "products_admin_delete" ON public.products
  FOR DELETE USING (public.is_admin());

-- ============================================================================
-- PROFILES TABLE POLICIES
-- ============================================================================
-- Admins can read all profiles
DROP POLICY IF EXISTS "profiles_admin_read" ON public.profiles;
CREATE POLICY "profiles_admin_read" ON public.profiles
  FOR SELECT USING (public.is_admin());

-- Users can read their own profile
DROP POLICY IF EXISTS "profiles_user_read" ON public.profiles;
CREATE POLICY "profiles_user_read" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
DROP POLICY IF EXISTS "profiles_user_update" ON public.profiles;
CREATE POLICY "profiles_user_update" ON public.profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- System and authenticated users can insert profiles
DROP POLICY IF EXISTS "profiles_insert" ON public.profiles;
CREATE POLICY "profiles_insert" ON public.profiles
  FOR INSERT WITH CHECK (true);

-- ============================================================================
-- ORDERS TABLE POLICIES
-- ============================================================================
-- Customers can read their own orders (by email)
DROP POLICY IF EXISTS "orders_customer_read" ON public.orders;
CREATE POLICY "orders_customer_read" ON public.orders
  FOR SELECT USING (
    auth.jwt() ->> 'email' = customer_email
  );

-- Admins can read all orders
DROP POLICY IF EXISTS "orders_admin_read" ON public.orders;
CREATE POLICY "orders_admin_read" ON public.orders
  FOR SELECT USING (public.is_admin());

-- Service role (backend/Stripe webhooks) can insert orders
DROP POLICY IF EXISTS "orders_backend_insert" ON public.orders;
CREATE POLICY "orders_backend_insert" ON public.orders
  FOR INSERT WITH CHECK (true);

-- Admins can update orders
DROP POLICY IF EXISTS "orders_admin_update" ON public.orders;
CREATE POLICY "orders_admin_update" ON public.orders
  FOR UPDATE USING (public.is_admin());

-- ============================================================================
-- ORDER_ITEMS TABLE POLICIES
-- ============================================================================
-- Customers can read order items for their own orders
DROP POLICY IF EXISTS "order_items_customer_read" ON public.order_items;
CREATE POLICY "order_items_customer_read" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id 
      AND o.customer_email = auth.jwt() ->> 'email'
    )
  );

-- Admins can read all order items
DROP POLICY IF EXISTS "order_items_admin_read" ON public.order_items;
CREATE POLICY "order_items_admin_read" ON public.order_items
  FOR SELECT USING (public.is_admin());

-- Service role (backend) can insert order items
DROP POLICY IF EXISTS "order_items_backend_insert" ON public.order_items;
CREATE POLICY "order_items_backend_insert" ON public.order_items
  FOR INSERT WITH CHECK (true);

-- ============================================================================
-- CHECKOUT_CUSTOMERS TABLE POLICIES
-- ============================================================================
-- Service role (backend) can insert checkout customers
DROP POLICY IF EXISTS "checkout_customers_backend_insert" ON public.checkout_customers;
CREATE POLICY "checkout_customers_backend_insert" ON public.checkout_customers
  FOR INSERT WITH CHECK (true);

-- Admins can read checkout customers
DROP POLICY IF EXISTS "checkout_customers_admin_read" ON public.checkout_customers;
CREATE POLICY "checkout_customers_admin_read" ON public.checkout_customers
  FOR SELECT USING (public.is_admin());

-- Admins can update checkout customers
DROP POLICY IF EXISTS "checkout_customers_admin_update" ON public.checkout_customers;
CREATE POLICY "checkout_customers_admin_update" ON public.checkout_customers
  FOR UPDATE USING (public.is_admin());

-- ============================================================================
-- CONTACT_MESSAGES TABLE POLICIES
-- ============================================================================
-- Public can insert contact messages
DROP POLICY IF EXISTS "contact_messages_public_insert" ON public.contact_messages;
CREATE POLICY "contact_messages_public_insert" ON public.contact_messages
  FOR INSERT WITH CHECK (true);

-- Admins can read contact messages
DROP POLICY IF EXISTS "contact_messages_admin_read" ON public.contact_messages;
CREATE POLICY "contact_messages_admin_read" ON public.contact_messages
  FOR SELECT USING (public.is_admin());

-- Admins can update contact message status
DROP POLICY IF EXISTS "contact_messages_admin_update" ON public.contact_messages;
CREATE POLICY "contact_messages_admin_update" ON public.contact_messages
  FOR UPDATE USING (public.is_admin());

-- ============================================================================
-- NEWSLETTER_SUBSCRIBERS TABLE POLICIES
-- ============================================================================
-- Public can insert newsletter subscriptions
DROP POLICY IF EXISTS "newsletter_public_insert" ON public.newsletter_subscribers;
CREATE POLICY "newsletter_public_insert" ON public.newsletter_subscribers
  FOR INSERT WITH CHECK (true);

-- Admins can read newsletter subscribers
DROP POLICY IF EXISTS "newsletter_admin_read" ON public.newsletter_subscribers;
CREATE POLICY "newsletter_admin_read" ON public.newsletter_subscribers
  FOR SELECT USING (public.is_admin());

-- Admins can update subscriber status
DROP POLICY IF EXISTS "newsletter_admin_update" ON public.newsletter_subscribers;
CREATE POLICY "newsletter_admin_update" ON public.newsletter_subscribers
  FOR UPDATE USING (public.is_admin());

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================
-- RLS setup complete. All tables are now protected.
-- The is_admin() security definer function prevents infinite recursion.
-- Service role key (backend/webhooks) bypasses RLS for API operations.
-- Admin users (role='admin') have full access to all tables.
-- Customers can only see their own data.
-- Public can read products and submit contact/newsletter forms.
