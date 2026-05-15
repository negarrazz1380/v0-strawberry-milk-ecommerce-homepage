# Admin Order Management System

## Overview

CaseKisses admin panel provides a clean, minimal interface for managing customer orders. Built with Supabase and Next.js, it allows admins to view all orders, manage shipping, and communicate with customers.

## Features

### Orders List (`/admin/orders`)

- **Table View**: All orders displayed in a clean table format
- **Columns**: Order ID, Customer, Email, Total, Status, Date, Action
- **Status Badges**: Color-coded status indicators
  - `paid`: Soft pink (#d4456f)
  - `processing`: Soft pink (#d4456f)
  - `shipped`: Green (#047857)
  - `delivered`: Green (#047857)
  - `cancelled`: Red (#dc2626)
- **Quick Navigation**: Click any row to view full order details

### Order Details (`/admin/orders/[orderId]`)

Complete order information page with three main sections:

#### Left Panel (Main Content)
1. **Customer Information**
   - Name
   - Email address

2. **Shipping Address**
   - Full address in editable format

3. **Order Items**
   - Product names
   - Quantities
   - Individual prices
   - Total per item

4. **Shipping Form** (conditional)
   - Appears when order hasn't shipped yet
   - Fields: Tracking Number, Carrier, Tracking URL (optional)
   - Automatically sends tracking email to customer

#### Right Panel (Summary & Actions)
1. **Order Status Badge**
   - Visual status indicator
   - Order date

2. **Order Summary**
   - Shipping method (Standard/Express)
   - Total amount

3. **Tracking Information** (when available)
   - Carrier name
   - Tracking number
   - Link to carrier's tracking page

#### Action Buttons
All buttons are soft pink (`#d4456f`) with print-hidden class:

1. **Print Packing Slip**
   - Opens browser print dialog
   - Shows order ID, customer name, address, and items
   - Clean layout suitable for warehouse printing

2. **Copy Address**
   - Copies shipping address to clipboard
   - Shows confirmation ("Copied!")

3. **Mark as Shipped**
   - Shows shipping form to enter tracking details
   - Sends automated email to customer with tracking link

## Database Schema

### Orders Table

```sql
orders {
  id: UUID (primary key)
  order_id: VARCHAR(255) -- Customer-friendly identifier (ORD-XXXXXX-XXXX)
  customer_id: UUID
  customer_email: VARCHAR(255) -- For quick lookup
  customer_name: VARCHAR(255)
  shipping_address: TEXT -- Full address (multiline)
  shipping_method: VARCHAR(50) -- 'standard' or 'express'
  order_status: VARCHAR(50) -- pending, paid, processing, shipped, delivered, cancelled
  total: INTEGER -- Amount in cents
  subtotal: INTEGER
  shipping_cost: INTEGER
  tax: INTEGER
  tracking_number: VARCHAR(255) -- Carrier tracking number
  tracking_url: VARCHAR(255) -- Direct link to carrier tracking
  carrier: VARCHAR(100) -- UPS, FedEx, USPS, DHL, etc.
  shipped_at: TIMESTAMP -- When tracking was added
  created_at: TIMESTAMP
  updated_at: TIMESTAMP
}

order_items {
  id: UUID
  order_id: UUID (foreign key)
  product_name: VARCHAR(255)
  quantity: INTEGER
  price: DECIMAL -- Price per unit
  created_at: TIMESTAMP
}
```

## Workflow

### Standard Order Processing

1. **Order Placed** → Order appears in list with `paid` status
2. **Admin Reviews** → Clicks order to view details
3. **Prepare Shipment** → Prints packing slip, picks/packs items
4. **Add Tracking** → 
   - Clicks "Mark as Shipped"
   - Enters tracking number, carrier, (optional) tracking URL
   - System automatically:
     - Updates order status to `shipped`
     - Saves tracking info
     - Sends tracking email to customer
5. **Customer Receives** → Can track package via email link

### Email Flow

When admin adds tracking:
- **Customer Email**: Sent via Resend with:
  - Order ID and summary
  - Tracking number and carrier
  - Direct tracking link
  - Shipping address confirmation
  - Soft pink design matching brand

## API Endpoints

### GET `/admin/orders`
Returns paginated list of all orders
- Requires authentication
- Filters: status, date range, customer email (future)

### GET `/admin/orders/[orderId]`
Returns detailed order information including items

### POST `/api/admin/update-tracking`
Updates order with tracking information
```json
{
  "order_id": "ORD-XXXXX-XXXX",
  "tracking_number": "1Z999AA10123456784",
  "carrier": "UPS",
  "tracking_url": "https://www.ups.com/track?tracknum=..."
}
```

Response:
```json
{
  "message": "Order tracking updated successfully",
  "order": { ...updated order }
}
```

## Authentication & Security

### Current Implementation
- Uses Supabase authentication
- Admin check: Validates user exists in profiles table
- Service role operations via server-side API routes

### Future Enhancements
Recommended admin-specific fields in profiles table:
```sql
ALTER TABLE profiles ADD COLUMN is_admin BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN admin_role VARCHAR(50); -- 'order_manager', 'full_admin'
```

## Design System

### Colors
- **Primary**: #d4456f (soft pink)
- **Accent**: #f5d5e6 (light pink backgrounds)
- **Success**: #047857 (green for shipped)
- **Error**: #dc2626 (red for cancelled)
- **Neutral**: #f3f4f6 (borders), #666666 (text)

### Typography
- **Headers**: Playfair Display (elegant serif)
- **Body**: Inter/DM Sans (clean sans-serif)
- **Mono**: Font-mono for order IDs and tracking numbers

### Layout
- Max-width: 4xl (56rem)
- Spacing: 8px grid (p-4, p-6, p-8, etc.)
- Border radius: 2xl (16px) for cards
- Shadows: shadow-sm for subtle depth

## Printing

The packing slip (print view) includes:
- Page break handling for multi-page orders
- All customer and shipping details
- Complete item list with quantities
- Clean layout suitable for warehouse

Print styles:
- Hides all UI buttons and controls
- Ensures proper page breaks
- White background for printing

## Best Practices

1. **Before Shipping**
   - Review shipping address for accuracy
   - Verify quantities match order
   - Double-check customer email

2. **When Marking as Shipped**
   - Enter tracking number exactly as provided by carrier
   - Select correct carrier (affects tracking link format)
   - Include tracking URL if available

3. **Copy Address**
   - Useful for printing labels
   - Maintains original formatting
   - One-click copy for efficiency

## Troubleshooting

### Order Not Loading
- Check order ID format (ORD-XXXXXX-XXXX)
- Verify order exists in Supabase
- Check browser console for errors

### Tracking Email Not Sent
- Verify RESEND_API_KEY is set
- Check Resend account for email activity
- Review order email address

### Print Dialog Issues
- Use Ctrl+P (Windows) or Cmd+P (Mac)
- Select appropriate printer
- PDF print option available

## Future Enhancements

- [ ] Bulk order operations (bulk mark as shipped)
- [ ] Order status timeline/history
- [ ] Email preview before sending
- [ ] Refund management interface
- [ ] Analytics dashboard
- [ ] Inventory integration
- [ ] Multi-user admin support with role-based access
- [ ] Order search and filtering
- [ ] Export orders to CSV
