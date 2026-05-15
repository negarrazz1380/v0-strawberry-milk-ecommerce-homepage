import { createClient } from '@/lib/supabase/server'
import { sendShippingUpdateEmail } from '@/lib/email'

// Update order tracking info (admin only)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { order_number, tracking_number, tracking_url, carrier } = body

    if (!order_number || !tracking_number || !carrier) {
      return Response.json(
        { error: 'Missing order_number', received_body: body },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // --- Auth check: must be a logged-in admin ---
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (!user) {
      return Response.json(
        { error: 'Unauthorized', authError: authError?.message ?? null },
        { status: 401 }
      )
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return Response.json(
        { error: 'Forbidden', userId: user.id, profile, profileError: profileError?.message ?? null },
        { status: 403 }
      )
    }
    // --- End auth check ---

    // Get order details by order_number (with customer data for email)
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select(
        `
        order_number,
        customer_id,
        customer_email,
        customer_name,
        order_status,
        total,
        subtotal,
        shipping_cost,
        shipping_address,
        shipping_method,
        order_items:order_items(product_name, quantity, price, product_image),
        checkout_customer:customer_id (
          first_name,
          last_name,
          address_line1,
          address_line2,
          city,
          state_province,
          postal_code,
          country,
          phone
        )
      `
      )
      .eq('order_number', order_number)
      .single()

    if (fetchError || !order) {
      return Response.json(
        {
          error: 'Order not found',
          order_number,
          supabaseError: fetchError?.message ?? null,
          supabaseCode: fetchError?.code ?? null,
          orderData: order ?? null,
        },
        { status: 404 }
      )
    }

    // Update order with tracking info
    const { data: updateData, error: updateError } = await supabase
      .from('orders')
      .update({
        tracking_number,
        tracking_url: tracking_url || null,
        carrier: carrier || null,
        order_status: 'shipped',
        shipped_at: new Date().toISOString(),
      })
      .eq('order_number', order_number)
      .select()

    if (updateError) {
      return Response.json(
        {
          error: 'Update failed',
          order_number,
          supabaseError: updateError.message,
          supabaseCode: updateError.code,
        },
        { status: 500 }
      )
    }

    // Send shipping email — isolated so an email failure doesn't block the success response
    let emailError: string | null = null
    try {
      // Build complete address from checkout_customer if available, fallback to shipping_address
      const checkoutCustomer = (order as any).checkout_customer
      let completeAddress = order.shipping_address
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
        completeAddress = addressParts.filter(Boolean).join('\n')
      }

      await sendShippingUpdateEmail({
        order_id: order.order_number,
        order_number: order.order_number,
        customer_id: order.customer_id || null,
        customer_name: order.customer_name,
        customer_email: order.customer_email,
        firstName: checkoutCustomer?.first_name || null,
        lastName: checkoutCustomer?.last_name || null,
        order_status: 'shipped',
        total: order.total,
        subtotal: order.subtotal ?? order.total,
        shipping_cost: order.shipping_cost ?? 0,
        shipping_address: completeAddress ?? null,
        shipping_method: order.shipping_method ?? null,
        tracking_number: tracking_number ?? null,
        tracking_url: tracking_url ?? null,
        carrier: carrier ?? null,
        items: order.order_items ?? [],
      })
    } catch (err) {
      emailError = err instanceof Error ? err.message : String(err)
    }

    if (emailError) {
      return Response.json(
        {
          error: 'Email failed',
          order_number,
          emailError,
          note: 'Order was marked shipped in database but confirmation email failed to send.',
        },
        { status: 500 }
      )
    }

    return Response.json(
      { message: 'Order tracking updated successfully', updated: updateData },
      { status: 200 }
    )
  } catch (error) {
    return Response.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
