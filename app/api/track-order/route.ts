import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const { email, orderNumber } = await request.json()

    if (!email || !orderNumber) {
      return new Response(
        JSON.stringify({ message: 'Email and order number are required' }),
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Find order by email and order_number or stripe_session_id
    // Use separate eq filters chained with .or() using parameterised column references only
    const sanitizedOrderNumber = String(orderNumber).trim()
    const { data: orders, error } = await supabase
      .from('orders')
      .select(
        `
        id,
        order_number,
        stripe_session_id,
        customer_email,
        customer_name,
        order_status,
        total,
        shipping_address,
        shipping_method,
        tracking_number,
        tracking_url,
        carrier,
        created_at,
        shipped_at,
        order_items:order_items(product_name, quantity, price)
      `
      )
      .eq('customer_email', email)
      .or(`order_number.eq.${sanitizedOrderNumber},stripe_session_id.eq.${sanitizedOrderNumber}`)
      .single()

    if (error) {
      console.error('Order lookup error:', error)
      return new Response(
        JSON.stringify({ message: 'Order not found' }),
        { status: 404 }
      )
    }

    if (!orders) {
      return new Response(
        JSON.stringify({ message: 'Order not found' }),
        { status: 404 }
      )
    }

    return new Response(
      JSON.stringify({
        order_number: orders.order_number,
        customer_name: orders.customer_name,
        customer_email: orders.customer_email,
        order_status: orders.order_status,
        total: orders.total,
        shipping_address: orders.shipping_address,
        shipping_method: orders.shipping_method,
        tracking_number: orders.tracking_number,
        tracking_url: orders.tracking_url,
        carrier: orders.carrier,
        created_at: orders.created_at,
        shipped_at: orders.shipped_at,
        items: orders.order_items || [],
      }),
      { status: 200 }
    )
  } catch (error) {
    console.error('Tracking API error:', error)
    return new Response(
      JSON.stringify({ message: 'Internal server error' }),
      { status: 500 }
    )
  }
}
