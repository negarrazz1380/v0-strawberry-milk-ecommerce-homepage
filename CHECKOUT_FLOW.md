# Checkout Flow Implementation

This document describes the multi-step checkout flow with customer information, shipping methods, and payment processing.

## Overview

The checkout process follows these steps:

1. **Customer Information Form** - Collect contact and shipping details
2. **Shipping Method Selection** - Choose between Standard and Express shipping
3. **Payment Review** - Review order details before payment
4. **Payment Processing** - Stripe Checkout Session

## Database Schema

### Customers Table
Stores customer information collected during checkout:
- `id` - UUID primary key
- `email` - Unique email address
- `first_name`, `last_name` - Customer name
- `phone` - Optional phone number
- `shipping_*` - Shipping address fields
- `marketing_consent` - Newsletter opt-in
- `created_at`, `updated_at` - Timestamps

### Orders Table
Stores completed orders:
- `id` - UUID primary key
- `customer_id` - Foreign key to customers
- `stripe_session_id` - Stripe session identifier
- `status` - Order status (pending, completed, failed)
- `subtotal`, `shipping_cost`, `tax`, `total` - Pricing
- `shipping_method` - standard or express
- `created_at`, `updated_at` - Timestamps

### Order Items Table
Stores items within each order:
- `id` - UUID primary key
- `order_id` - Foreign key to orders
- `product_name`, `quantity`, `price` - Item details
- `created_at` - Timestamp

## Setup Instructions

### 1. Create Database Tables

Run the migration script in Supabase SQL Editor:

```bash
# Copy contents of scripts/setup-checkout-tables.sql
# Paste into Supabase SQL Editor and execute
```

### 2. Environment Variables

Required variables (should be auto-configured):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_BASE_URL`
- `FROM_EMAIL` (e.g., "CaseKisses <orders@casekisses.com>")
- `ADMIN_EMAIL` (for order notifications)
- `RESEND_API_KEY`

### 3. Shipping Rates

Shipping costs are configured in `lib/shipping.ts`:

**Canada:**
- Standard: $6.99 (5-10 days)
- Express: $13.99 (2-4 days)

**United States:**
- Standard: $8.99 (5-10 days)
- Express: $16.99 (2-5 days)

**International:**
- Standard: $14.99 (7-15 days)
- Express: $26.99 (3-7 days)

## Components

### CustomerInfoForm
Located in `components/customer-info-form.tsx`

Collects:
- Email, phone
- First name, last name
- Shipping address (country, address, apartment, city, state, postal code)
- Marketing consent checkbox

### ShippingMethodSelector
Located in `components/shipping-method-selector.tsx`

Displays:
- Standard and Express shipping options
- Delivery time estimates
- Shipping costs (calculated dynamically based on country)

### CheckoutPage
Located in `app/checkout/page.tsx`

Multi-step flow:
1. Customer Info → Shipping → Payment
2. Progress indicator showing current step
3. Order summary sidebar with live total calculation
4. Form validation and error handling

## API Endpoints

### POST /api/checkout

Handles the final checkout submission:

**Request:**
```json
{
  "items": [...],
  "customerInfo": {
    "email": "...",
    "firstName": "...",
    "lastName": "...",
    "phone": "...",
    "shippingCountry": "...",
    "shippingAddress": "...",
    "shippingApartment": "...",
    "shippingCity": "...",
    "shippingState": "...",
    "shippingPostalCode": "...",
    "marketingConsent": true/false
  },
  "shippingMethod": "standard" | "express",
  "shippingCost": 6.99
}
```

**Process:**
1. Save/upsert customer to Supabase
2. Create Stripe line items with shipping
3. Create Stripe Checkout Session
4. Return checkout URL to client

### POST /api/webhook

Handles Stripe webhook events:

**On checkout.session.completed:**
1. Fetch customer by email
2. Save order to Supabase with customer_id
3. Save order items to order_items table
4. Send confirmation email to customer
5. Send notification email to admin

## Webhook Configuration

In Stripe Dashboard:
1. Navigate to Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhook`
3. Select events: `checkout.session.completed`
4. Copy signing secret to `STRIPE_WEBHOOK_SECRET`

## Testing

### Local Testing with Stripe CLI

```bash
# Install Stripe CLI
# https://stripe.com/docs/stripe-cli

# Listen for webhooks
stripe listen --forward-to localhost:3000/api/webhook

# Copy signing secret to .env.local
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Test webhook
stripe trigger checkout.session.completed
```

### Test Cards
- Visa: `4242 4242 4242 4242`
- Amex: `3782 822463 10005`
- Declined: `4000 0000 0000 0002`

Expiry: Any future date
CVC: Any 3 digits

## Customer Order History

Logged-in customers can view their past orders at `/account`:

- Lists all orders associated with their email
- Shows order date, total, status, and shipping method
- Sorted by most recent first

## Notes

- Single customer info form eliminates duplicate address collection
- Shipping costs are calculated server-side for accuracy
- RLS policies allow any customer to create/read orders (basic security)
- Production should implement user authentication to restrict order viewing
- Email notifications use Resend service for reliability
