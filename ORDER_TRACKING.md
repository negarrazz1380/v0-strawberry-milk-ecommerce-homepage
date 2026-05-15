# Order Tracking & Email Automation

This guide covers the complete order tracking and email automation system for CaseKisses.

## Overview

The system includes:
1. **Order Tracking Page** - Customer-facing page to look up orders
2. **Email Automation** - Confirmation and shipping update emails
3. **Admin Tracking API** - Backend endpoint to update order tracking info
4. **Database Schema** - Enhanced orders table with tracking fields

## Database Schema

### Orders Table Updates

The orders table now includes the following fields for tracking:

```sql
-- New fields added
order_id VARCHAR(255) UNIQUE              -- Customer-facing order number (ORD-XXXXXX-XXXX)
user_id UUID                              -- User ID if authentication is added later
customer_email VARCHAR(255)               -- Customer email address
customer_name VARCHAR(255)                -- Full customer name
shipping_address TEXT                     -- Complete shipping address
order_status VARCHAR(50)                  -- Order status (see below)
tracking_number VARCHAR(255)              -- Carrier tracking number
tracking_url VARCHAR(255)                 -- Direct link to tracking (optional)
carrier VARCHAR(100)                      -- Shipping carrier (FedEx, UPS, USPS, etc)
shipped_at TIMESTAMP                      -- When order was marked as shipped
```

### Order Status Options

Valid status values:
- `pending` - Order placed, awaiting payment
- `paid` - Payment received, awaiting fulfillment
- `processing` - Picking and packing items
- `shipped` - Order has been handed off to carrier
- `delivered` - Order delivered to customer
- `cancelled` - Order cancelled

## Customer-Facing: Order Tracking Page

**URL:** `/track-order`

### Features

Customers can look up orders by:
- Email address (required)
- Order number (ORD-XXXXXX-XXXX) OR Stripe session ID

### What Customers See

- **Order Status** - Visual status badge with timeline
- **Order Details** - Items purchased, total, order ID
- **Shipping Address** - Full delivery address
- **Tracking Info** (when available):
  - Carrier name
  - Tracking number
  - Direct tracking link
  - "Your order is being prepared" message if not yet shipped

### Implementation

```typescript
// Customers submit form with email + order number
POST /api/track-order
Body: { email: string, orderNumber: string }
Response: {
  order_id: string
  customer_name: string
  order_status: string
  items: Array<{ product_name, quantity, price }>
  tracking_number?: string
  tracking_url?: string
  // ... other fields
}
```

## Email Automation

### 1. Order Confirmation Email

**Trigger:** `checkout.session.completed` webhook

**Sent To:** Customer + Admin

**Customer Email Contains:**
- Order confirmation
- Order ID
- Items purchased with prices
- Total amount and shipping method
- Shipping address
- Message: "We'll send tracking info when your order ships"

**Admin Email Contains:**
- Customer name and email
- Total amount
- Session ID
- Link to Stripe dashboard for full details

### 2. Shipping Update Email

**Trigger:** When admin updates order with tracking number via API

**Sent To:** Customer only

**Contains:**
- Carrier name
- Tracking number
- Direct link to track package
- Shipping address
- Expected delivery window

## Admin APIs

### Update Order Tracking

Use this endpoint to update an order with tracking information when it ships.

```bash
POST /api/admin/update-tracking
Headers:
  Content-Type: application/json

Body: {
  order_id: string,                    # Customer order ID (ORD-XXXXXX-XXXX)
  tracking_number: string,             # Carrier tracking number
  tracking_url?: string,               # Optional direct tracking URL
  carrier?: string,                    # Carrier name (USPS, FedEx, UPS)
  admin_secret: string                 # Set ADMIN_SECRET_KEY env var
}

Response: {
  message: "Order tracking updated successfully"
}
```

**Security:**
- Requires `ADMIN_SECRET_KEY` environment variable
- Should only be called from authenticated admin panel or automated fulfillment system
- Never expose this endpoint to frontend without authentication

### Example Usage (from Admin Panel)

```typescript
async function updateOrderTracking(orderId: string, trackingNumber: string) {
  const response = await fetch('/api/admin/update-tracking', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      order_id: orderId,
      tracking_number: trackingNumber,
      carrier: 'USPS',
      admin_secret: process.env.ADMIN_SECRET_KEY,
    }),
  })
  
  if (!response.ok) {
    throw new Error('Failed to update tracking')
  }
}
```

## Implementation Details

### Order ID Generation

Order IDs are generated when the order is created:
```typescript
const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`
```

Example: `ORD-1704067200000-A5B2K9X`

This format is customer-friendly and includes a timestamp for sorting.

### Email Formatting

All emails use:
- Soft pink color scheme (#d4456f, #f5d5e6)
- Playfair Display font for headings
- Responsive HTML for all email clients
- Both HTML and plain text versions

### Shipping Address Capture

Shipping address is captured from Stripe's checkout session:
```typescript
const shippingAddress = [
  session.customer_details?.address?.line1,
  session.customer_details?.address?.line2,
  session.customer_details?.address?.city,
  session.customer_details?.address?.state,
  session.customer_details?.address?.postal_code,
  session.customer_details?.address?.country,
]
  .filter(Boolean)
  .join('\n')
```

## Environment Variables Required

```env
# Email/Notification
FROM_EMAIL=CaseKisses <orders@casekisses.com>
ADMIN_EMAIL=admin@casekisses.com
RESEND_API_KEY=your_resend_api_key
ADMIN_SECRET_KEY=your_secret_key_for_admin_apis
```

## Testing

### Test Order Lookup

1. Go to `/track-order`
2. Enter email from a test order
3. Enter order ID (format: ORD-XXXXXX-XXXX) or Stripe session ID
4. Verify order details display correctly

### Test Emails

Use test Stripe keys to create test orders:
```bash
# In Stripe test mode, create a checkout session
# This will trigger webhook and send test emails
```

### Test Tracking Update

```bash
curl -X POST http://localhost:3000/api/admin/update-tracking \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "ORD-1234567890-ABC123",
    "tracking_number": "1Z999AA10123456784",
    "carrier": "UPS",
    "admin_secret": "your_admin_secret"
  }'
```

## Important: No Fake Tracking

- **Never** create fake tracking numbers
- **Only** update tracking when the order is actually handed off to the carrier
- If tracking is unavailable, the order shows "Your order is being prepared" message
- This builds trust and prevents customer confusion

## Future Enhancements

1. **Automated Fulfillment Integration**
   - Connect to Shopify/print-on-demand fulfillment APIs
   - Auto-generate order IDs with fulfillment partners

2. **SMS Tracking Updates**
   - Send SMS to customers when order ships
   - Include tracking link in text message

3. **Order Status Webhooks**
   - Allow customers to subscribe to webhook notifications
   - Integrate with customer communication preferences

4. **Analytics**
   - Track average fulfillment time
   - Monitor tracking update latency
   - Customer tracking page engagement metrics
