# Manual Fulfillment Workflow for CaseKisses

Your admin panel supports a complete manual fulfillment workflow. No carrier APIs, no automation—just you managing shipments directly.

## Order Lifecycle

### Step 1: Customer Checkout (Automatic)
- Customer completes checkout
- **Order Status**: `paid`
- Webhook automatically creates order in `/admin/orders` with status `processing`
- Confirmation email sent to customer with order details

### Step 2: Admin Review Orders
Navigate to **`/admin/orders`**
- View all orders in a clean table
- See Order ID, Customer Name, Email, Total, Status, and Date
- Status badges: `paid`, `processing`, `shipped`, `delivered`, `cancelled`
- Click any row to view full order details

### Step 3: Prepare Order
Open order details page for any order with status `processing`:
- ✅ **Customer Information** - Name, email
- ✅ **Shipping Address** - Full formatted address
- ✅ **Order Items** - All products with quantities and prices
- ✅ **Copy Shipping Address Button** - Copies address to clipboard for label entry
- ✅ **Print Packing Slip** - Printer-friendly slip for picking/packing

### Step 4: Mark as Shipped
After you've physically shipped the package:

1. Click **"Mark as Shipped"** button (pink button, appears only if status is `processing`)
2. A form appears with required fields:
   - **Tracking Number** - From your carrier (UPS, FedEx, USPS, DHL, Canada Post, etc.)
   - **Carrier** - Select from dropdown or "Other"
   - **Tracking URL** (optional) - Link to carrier tracking page

3. Click **"Save Tracking"**

When you submit:
- ✅ Order status updates to `shipped`
- ✅ `shipped_at` timestamp is recorded
- ✅ Customer receives **shipping confirmation email** with tracking info
- ✅ Order appears on `/track-order` page for customer lookup

## Buttons & Features

### Copy Shipping Address Button
- Copies full address to clipboard
- Use for Canada Post, Chit Chats, or any shipping label website
- No API integration needed

### Print Packing Slip Button
- Opens print dialog (Ctrl+P or Cmd+P)
- Shows order ID, customer name, address, and all items
- Proper page breaks for printing
- Excludes sidebar and buttons from print

### Mark as Shipped Button
- Only appears when order status is `processing`
- Disabled after order is `shipped` or `delivered`
- Opens inline form for tracking details

## Security

- Admin panel requires Supabase authentication
- Only authenticated users can access `/admin/orders`
- Tracking updates use server-side API (no secrets exposed to frontend)
- All changes are logged and traceable

## Email Automation

### Order Confirmation (Automatic after checkout)
Sent immediately when customer completes payment:
- Order ID and total
- All items with quantities
- Shipping address
- Estimated delivery time based on shipping method
- Link to track order

### Shipping Confirmation (When you mark as shipped)
Sent when you add tracking info:
- Carrier name
- Tracking number
- Clickable tracking link (if provided)
- Shipping address reminder
- Customer name and email

Both emails maintain your brand's soft pink aesthetic using Playfair Display typography.

## Typical Daily Workflow

1. **Morning**: Log in to `/admin/orders`
2. **Review**: Check for new orders with `processing` status
3. **Pick & Pack**: Print packing slips, gather items
4. **Ship**: Get tracking numbers from your carrier
5. **Update**: Click "Mark as Shipped" for each order
6. **Done**: Customers get tracking emails automatically

## Database Fields

All order tracking info is stored and searchable:
- `order_id` - Customer-friendly order identifier
- `customer_email` - For customer lookups on `/track-order`
- `customer_name` - Shipping recipient name
- `shipping_address` - Full formatted address
- `order_status` - Current status (processing, shipped, delivered, etc.)
- `tracking_number` - Carrier tracking number
- `tracking_url` - Link to carrier tracking page
- `carrier` - Shipping carrier name
- `shipped_at` - Timestamp when marked as shipped

## No Carrier API Integration

This is intentionally kept simple for manual control:
- No Shippo, EasyPost, or carrier API integration
- No automatic label generation
- No live tracking data sync
- You control all shipping decisions
- Perfect for small-batch, artisanal fulfillment

When you're ready to automate in the future, you can integrate carrier APIs without changing this core workflow.
