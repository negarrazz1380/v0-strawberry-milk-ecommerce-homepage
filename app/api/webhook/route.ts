import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { sendOrderConfirmationEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

// Diagnostic: GET handler to test webhook URL connectivity
// This helps identify if 307 is from Vercel domain settings, trailing slash, or another layer
// Remove this handler once confirmed webhook URL responds without redirect
export async function GET(request: Request) {
  return new Response(
    JSON.stringify({
      status: 'ok',
      message: 'Webhook route reached without redirect',
      timestamp: new Date().toISOString(),
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  )
}

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('[webhook] Signature verification failed:', err)
    return new Response('Invalid signature', { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id)

    const customerEmail = session.customer_details?.email
    // customerName is a fallback — will be overridden below once we have checkout form data
    const stripeCustomerName = session.customer_details?.name || null
    const amountTotal = (session.amount_total || 0) / 100
    const shippingCost = Number(session.metadata?.shipping_cost) || 0

    if (!customerEmail) {
      console.error('[webhook] No customer email found')
      return new Response('No customer email', { status: 400 })
    }

    try {
      // Create Supabase client with service role key (for server-side only)
      // This bypasses RLS to allow webhook to insert orders and items
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        }
      )

      // Try to get full customer details using checkout_customer_id (preferred)
      let checkoutCustomer: any = null
      const checkoutCustomerId = session.metadata?.checkout_customer_id

      if (checkoutCustomerId) {
        const { data, error } = await supabase
          .from('checkout_customers')
          .select('*')
          .eq('id', checkoutCustomerId)
          .single()

        if (!error && data) {
          checkoutCustomer = data
        }
      }

      // Fallback: fetch by email if customer_id lookup failed or was empty
      if (!checkoutCustomer) {
        const { data, error } = await supabase
          .from('checkout_customers')
          .select('*')
          .eq('email', customerEmail)
          .single()

        if (!error && data) {
          checkoutCustomer = data
        }
      }

      // Derive customer name: prefer checkout form (first + last name) over Stripe name
      const customerName = checkoutCustomer
        ? [checkoutCustomer.first_name, checkoutCustomer.last_name].filter(Boolean).join(' ') || stripeCustomerName || 'Valued Customer'
        : stripeCustomerName || 'Valued Customer'

      // Build complete shipping address from checkout_customer data (if available) or Stripe fallback
      let shippingAddress: string
      if (checkoutCustomer) {
        const addressParts = [
          checkoutCustomer.first_name,
          checkoutCustomer.last_name,
          checkoutCustomer.address_line1,
          checkoutCustomer.address_line2,
          checkoutCustomer.city,
          checkoutCustomer.state_province,
          checkoutCustomer.postal_code,
          checkoutCustomer.country,
        ]
        shippingAddress = addressParts.filter(Boolean).join('\n')
      } else {
        // Fallback to Stripe's partial address
        shippingAddress = [
          session.customer_details?.address?.line1,
          session.customer_details?.address?.line2,
          session.customer_details?.address?.city,
          session.customer_details?.address?.state,
          session.customer_details?.address?.postal_code,
          session.customer_details?.address?.country,
        ]
          .filter(Boolean)
          .join('\n')
      }

      // Generate order number
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`

      // Create order with customer_id link
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          customer_id: checkoutCustomer?.id || null,
          customer_email: customerEmail,
          customer_name: customerName,
          phone: checkoutCustomer?.phone || session.customer_details?.phone,
          shipping_address: shippingAddress,
          shipping_country: checkoutCustomer?.country || session.customer_details?.address?.country,
          shipping_method: session.metadata?.shipping_method || 'standard',
          shipping_cost: shippingCost,
          subtotal: amountTotal - shippingCost,
          tax: 0,
          total: amountTotal,
          order_status: 'pending',
          stripe_session_id: session.id,
        })
        .select('id')
        .single()

      if (orderError) {
        console.error('[webhook] Failed to create order - Details:', {
          message: orderError.message,
          code: orderError.code,
          details: (orderError as any).details,
          hint: (orderError as any).hint,
          fullError: orderError,
        })
        throw orderError
      }

      console.log('[webhook] Order created successfully:', orderNumber, 'ID:', orderData.id)

      // Save order items — read image URLs from session metadata by item index
      // (Stripe listLineItems does not return product images, so we pass them via metadata)
      const productLineItems = lineItems.data.filter(item => !item.description?.includes('Shipping'))
      const orderItems = productLineItems.map((item, idx) => {
        const productImage = session.metadata?.[`item_image_${idx}`] ?? null
        const deviceModel = session.metadata?.[`item_model_${idx}`] ?? null
        return {
          order_id: orderData.id,
          product_name: item.description || 'Unknown Product',
          quantity: item.quantity || 1,
          price: ((item.amount_total || 0) / 100) / (item.quantity || 1),
          product_id: item.id,
          product_image: productImage,
          device_model: deviceModel,
        }
      })

      if (orderItems.length > 0) {
        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItems)

        if (itemsError) {
          console.error('[webhook] Failed to save order items - Details:', {
            message: itemsError.message,
            code: itemsError.code,
            details: (itemsError as any).details,
            hint: (itemsError as any).hint,
            fullError: itemsError,
          })
          throw itemsError
        }

        console.log('[webhook] Order items saved successfully:', orderItems.length, 'items')
      }

      // Normalize order data for email — use complete address from checkout_customer
      const subtotal = amountTotal - shippingCost
      const orderForEmail = {
        order_id: orderNumber,
        order_number: orderNumber,
        customer_id: checkoutCustomer?.id ?? null,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: checkoutCustomer?.phone ?? session.customer_details?.phone ?? null,
        subtotal,
        shipping_cost: shippingCost,
        total: amountTotal,
        shipping_method: session.metadata?.shipping_method ?? 'standard',
        shipping_address: shippingAddress ?? null,
        shipping_country: checkoutCustomer?.country ?? session.customer_details?.address?.country ?? null,
        items: orderItems ?? [],
        order_status: 'pending',
        // Include full customer details for email formatting
        firstName: checkoutCustomer?.first_name ?? null,
        lastName: checkoutCustomer?.last_name ?? null,
      }

      // Send confirmation email using email utility
      await sendOrderConfirmationEmail(orderForEmail)

      console.log('[webhook] Order processed successfully:', orderNumber)
    } catch (error) {
      console.error('[webhook] Failed to process order:', error)
      return new Response('Failed to process order', { status: 500 })
    }
  }

  return new Response('ok', { status: 200 })
}
