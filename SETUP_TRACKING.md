# Order Tracking Setup Guide

## Quick Start

### 1. Run Database Migration

Execute the migration script in Supabase SQL editor:

```sql
-- Copy contents from: scripts/add-tracking-fields.sql
```

This adds:
- `order_id` column for customer-friendly order numbers
- `customer_email` and `customer_name` for easy lookup
- `shipping_address` field
- `order_status` with proper status tracking
- `tracking_number`, `tracking_url`, `carrier` for shipping updates
- `shipped_at` timestamp

### 2. Set Environment Variables

Add these to your `.env.local` (development) or Vercel project settings (production):

```env
# Email Configuration
FROM_EMAIL="CaseKisses <orders@casekisses.com>"
ADMIN_EMAIL="admin@casekisses.com"
RESEND_API_KEY="re_xxxxxxxxxxxxxxxxxxxxx"

# Admin API Security
ADMIN_SECRET_KEY="your_secret_key_minimum_32_chars"
```

**Where to find these:**
- `RESEND_API_KEY` - Get from [Resend.com](https://resend.com) dashboard
- `FROM_EMAIL` - Must match verified sender in Resend
- `ADMIN_EMAIL` - Your admin email for notifications
- `ADMIN_SECRET_KEY` - Create a strong random string, minimum 32 characters

### 3. Test the System

#### A. Order Tracking Page
- Navigate to `/track-order`
- Use email and order ID from a test Stripe order
- Verify order details display

#### B. Confirmation Email
- Complete a test checkout using Stripe test mode
- Check inbox for confirmation email
- Verify order ID format: `ORD-XXXXXX-XXXX`

#### C. Tracking Update
Use the admin API to add tracking (requires `ADMIN_SECRET_KEY`):

```bash
curl -X POST https://your-domain.com/api/admin/update-tracking \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "ORD-1704067200000-A5B2K9X",
    "tracking_number": "1Z999AA10123456784",
    "carrier": "UPS",
    "tracking_url": "https://tracking.ups.com/?tracknum=1Z999AA10123456784",
    "admin_secret": "your_admin_secret_key"
  }'
```

Expected response:
```json
{
  "message": "Order tracking updated successfully"
}
```

Then check customer email for shipping notification.

## Integration Points

### Webhook (Automatic)
- **Endpoint:** `/api/webhook`
- **Trigger:** Stripe `checkout.session.completed`
- **Action:** Creates order with all details, sends confirmation email

### Order Lookup (Customer)
- **Endpoint:** `/app/track-order/page.tsx` (UI)
- **Backend:** `POST /api/track-order`
- **Input:** email + order_id or stripe_session_id
- **Returns:** Order with tracking info

### Admin Tracking Update (Manual or Automated)
- **Endpoint:** `POST /api/admin/update-tracking`
- **Input:** order_id + tracking_number + carrier
- **Action:** Updates order status to "shipped", sends tracking email

## Email Flow

```
1. Customer completes checkout (Stripe)
   ↓
2. Webhook triggered → Order created in DB
   ↓
3. Confirmation email sent (Resend)
   ↓
4. Customer receives confirmation with Order ID
   ↓
5. Admin/fulfillment adds tracking via API
   ↓
6. Shipping email sent (Resend)
   ↓
7. Customer can track order at /track-order
```

## Admin Workflow

### Manual Tracking (Admin Panel)
1. Receive tracking info from fulfillment partner
2. Call `/api/admin/update-tracking` with order ID and tracking number
3. System automatically sends tracking email to customer
4. Order status changes to "shipped"

### Automated Tracking (Future)
1. Connect fulfillment API (Printful, Shopify, etc.)
2. Webhook from fulfillment → Your tracking API
3. Auto-update orders with tracking info
4. Auto-send customer emails

## Customer Experience

### Finding Orders
1. Customer goes to `/track-order`
2. Enters email and order number (from confirmation email)
3. Sees order status, items, shipping address
4. If shipped: sees tracking number and carrier info
5. If not shipped: sees "Your order is being prepared 💕"

### Email Updates
- **Confirmation:** Immediately after purchase
- **Shipping:** When admin adds tracking number
- **No fake tracking** - Only real carriers and numbers

## Troubleshooting

### Emails Not Sending
- Check `RESEND_API_KEY` is set correctly
- Verify `FROM_EMAIL` matches Resend verified sender
- Check Resend dashboard for failed deliveries

### Orders Not Found
- Verify email matches exactly (case-sensitive in DB)
- Use order_id format: `ORD-XXXXXX-XXXX`
- Alternative: Use Stripe session ID if order_id not available

### Tracking Not Updating
- Ensure `ADMIN_SECRET_KEY` matches in API call
- Check admin API response for error details
- Verify order exists in database first

### Database Errors
- Run migration script `scripts/add-tracking-fields.sql`
- Verify all new columns are added
- Check RLS policies allow admin updates

## Security Best Practices

1. **Never expose `ADMIN_SECRET_KEY`** - Keep only in backend env vars
2. **Validate all inputs** - Order IDs, emails, tracking numbers
3. **Rate limit admin API** - Prevent abuse of tracking updates
4. **Audit tracking changes** - Log who updated what and when
5. **Use HTTPS only** - All API calls must be encrypted
6. **No fake tracking** - Integrity depends on real data

## Customization

### Changing Email Template
Edit `/lib/email.ts`:
- `sendOrderConfirmationEmail()` - Confirmation email HTML
- `sendShippingUpdateEmail()` - Shipping update email HTML

### Changing Colors/Branding
- Primary color: `#d4456f` (pink)
- Light pink: `#f5d5e6`, `#f9e0eb`, `#fef5f9`
- Font: `Playfair Display` for headings

### Adding Phone Notifications
1. Create `sendSMS()` function in `/lib/email.ts`
2. Use Twilio or similar service
3. Call from tracking update endpoint

## Support

For issues or questions:
- Check `ORDER_TRACKING.md` for detailed documentation
- Review email logs in Resend dashboard
- Check Supabase database queries and RLS policies
- Test with Stripe test mode first
