import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '')

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { items, customerInfo, shippingMethod, shippingCost } = body

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'No items in cart' },
        { status: 400 }
      )
    }

    if (!customerInfo) {
      return NextResponse.json(
        { error: 'Customer information required' },
        { status: 400 }
      )
    }

    if (!shippingMethod || shippingCost === undefined || shippingCost === null) {
      return NextResponse.json(
        { error: 'Shipping information required' },
        { status: 400 }
      )
    }

    // Save customer info to Supabase and get the customer ID
    const supabase = await createClient()
    const { data: customerData, error: customerError } = await supabase
      .from('checkout_customers')
      .upsert(
        {
          email: customerInfo.email,
          first_name: customerInfo.firstName,
          last_name: customerInfo.lastName,
          phone: customerInfo.phone || null,
          country: customerInfo.shippingCountry,
          address_line1: customerInfo.shippingAddress,
          address_line2: customerInfo.shippingApartment || null,
          city: customerInfo.shippingCity,
          state_province: customerInfo.shippingState,
          postal_code: customerInfo.shippingPostalCode,
          marketing_consent: customerInfo.marketingConsent,
        },
        { onConflict: 'email' }
      )
      .select('id')
      .single()

    if (customerError) {
      console.error('[v0] Customer save error:', customerError)
      // Log but don't fail - proceed with payment
    }

    const checkoutCustomerId = customerData?.id

    // Convert cart items to Stripe line items
    // Also build a map of item images/models to pass in metadata (Stripe doesn't return these in listLineItems)
    const itemMetaMap: Record<string, string> = {}
    const line_items = items.map((item: any, idx: number) => {
      if (item.image_url) {
        itemMetaMap[`item_image_${idx}`] = item.image_url
      }
      if (item.device_model) {
        itemMetaMap[`item_model_${idx}`] = item.device_model
      }
      // Append model to product name so it shows clearly on the Stripe receipt
      const displayName = item.device_model
        ? `${item.name} — ${item.device_model}`
        : item.name
      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: displayName,
            images: item.image_url ? [item.image_url] : undefined,
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      }
    })

    // Add shipping as a line item
    line_items.push({
      price_data: {
        currency: 'usd',
        product_data: {
          name: `${shippingMethod === 'standard' ? 'Standard' : 'Express'} Shipping`,
        },
        unit_amount: Math.round(shippingCost * 100),
      },
      quantity: 1,
    })

    // Create Stripe session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      customer_creation: 'always',
      metadata: {
        customer_email: customerInfo.email,
        checkout_customer_id: checkoutCustomerId || '',
        shipping_method: shippingMethod,
        shipping_cost: String(shippingCost),
        // Image URLs and model names keyed by item index (item_image_0, item_model_0, ...)
        ...itemMetaMap,
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/cancel`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('[checkout] Error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session', details: String(error) },
      { status: 500 }
    )
  }
}
