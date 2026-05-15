# Supabase Database Setup for CaseKisses

## Overview
This document describes the Supabase tables created for the CaseKisses e-commerce application.

## Tables Created

### 1. checkout_customers
Stores customer information from the checkout form. When a customer completes the checkout info form, their details are saved here.

**Fields:**
- `id` - UUID primary key
- `email` - Customer email (unique)
- `first_name` - First name
- `last_name` - Last name
- `phone` - Phone number
- `country` - Selected country
- `address_line1` - Street address
- `address_line2` - Apartment/suite (optional)
- `city` - City
- `state_province` - State or province
- `postal_code` - Postal/zip code
- `marketing_consent` - Newsletter opt-in (boolean)
- `created_at` - Timestamp
- `updated_at` - Timestamp

### 2. orders
Stores completed orders from Stripe webhook. Created when a checkout is successfully completed.

**Fields:**
- `id` - UUID primary key
- `order_number` - Unique order identifier (ORD-XXXXX-XXXX format)
- `customer_email` - Customer email
- `customer_name` - Customer name
- `phone` - Customer phone
- `shipping_address` - Full shipping address
- `shipping_country` - Country for shipping
- `shipping_method` - 'standard' or 'express'
- `shipping_cost` - Shipping amount in dollars
- `subtotal` - Order subtotal
- `tax` - Tax amount
- `total` - Total amount
- `order_status` - Current status (pending, processing, shipped, delivered, cancelled)
- `stripe_session_id` - Stripe checkout session ID
- `tracking_number` - Carrier tracking number
- `tracking_url` - Optional tracking URL
- `carrier` - Shipping carrier (UPS, FedEx, etc.)
- `created_at` - Order timestamp
- `shipped_at` - When order shipped

### 3. order_items
Stores individual items in each order.

**Fields:**
- `id` - UUID primary key
- `order_id` - Foreign key to orders table
- `product_id` - Product identifier
- `product_name` - Product name
- `quantity` - Quantity ordered
- `price` - Price per item
- `created_at` - Timestamp

### 4. newsletter_subscribers
Stores newsletter signup emails.

**Fields:**
- `id` - UUID primary key
- `email` - Subscriber email (unique)
- `source` - Where signup came from (default: 'website')
- `created_at` - Signup timestamp

### 5. contact_messages
Stores contact form submissions.

**Fields:**
- `id` - UUID primary key
- `name` - Sender name
- `email` - Sender email
- `message` - Message content
- `status` - Status (new, read, replied, spam)
- `created_at` - Submission timestamp

## Setup Instructions

### Step 1: Run Migration
Execute the SQL migration in your Supabase SQL editor:

```bash
# Copy the contents of scripts/create-tables.sql
# Paste into Supabase SQL Editor and run
```

Or use the Supabase CLI:

```bash
supabase db push
```

### Step 2: Verify Tables
Go to the Supabase dashboard > Tables and confirm all 5 tables exist with proper columns.

### Step 3: Environment Variables
Make sure your `.env.local` has the Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Data Flow

### Checkout Flow
1. Customer fills checkout form
2. Data saved to `checkout_customers` table
3. Checkout form submitted to Stripe
4. After payment, webhook creates order in `orders` table
5. Order items saved to `order_items` table

### Newsletter
1. Customer enters email in newsletter form
2. POST to `/api/newsletter`
3. Email saved to `newsletter_subscribers` table

### Contact
1. Customer submits contact form
2. POST to `/api/contact`
3. Message saved to `contact_messages` table

## Indexes
The migration creates indexes on frequently queried columns for better performance:
- `checkout_customers(email)` - Quick lookup by email
- `orders(customer_email, order_number, created_at)` - Order lookups
- `order_items(order_id)` - Order items by order
- `newsletter_subscribers(email)` - Newsletter lookups
- `contact_messages(email)` - Contact message lookups

## Row Level Security (RLS)
Tables are created without RLS policies. Consider enabling RLS in production and creating policies for:
- Customers can view their own orders
- Admin users can view all orders and messages
- Public can create new orders/messages but not read others' data
