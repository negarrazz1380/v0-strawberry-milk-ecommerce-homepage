import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

/**
 * Lazy Stripe client.
 *
 * Do NOT do `const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '')` at
 * module scope. That runs at BUILD time with an empty key, so every local
 * `npm run build` dies with "Neither apiKey nor config.authenticator provided"
 * before it can type-check anything. The getter defers creation until a real
 * checkout runs, which only happens at runtime where the key exists.
 */
let stripeClient: Stripe | null = null

const stripe = {
  get checkout() {
    if (!stripeClient) {
      stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY || '')
    }
    return stripeClient.checkout
  },
}

/**
 * Currency for all Stripe charges.
 *
 * ⚠️ THIS WAS 'usd' AND IS NOW 'cad'. Read this before changing it back.
 *
 * Everything else in this codebase says the prices are Canadian dollars:
 *   - Product JSON-LD           → priceCurrency: 'CAD'
 *   - TikTok pixel events       → currency: 'CAD'
 *   - public/llms.txt           → "Currency: CAD"
 *   - The business is in Toronto and shipping rates are quoted in CAD.
 *
 * Only the Stripe call said 'usd' — almost certainly a leftover default from
 * the v0 template this repo started as. Charging USD while advertising a CAD
 * price means a customer sees $29.99 and is billed ~$41 CAD, which is both a
 * chargeback risk and a broken promise.
 *
 * Defined ONCE here because it was previously hardcoded in two places (line
 * items and shipping) and those must never disagree.
 */
const CURRENCY = 'cad'

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

    // Never trust client-supplied prices — look up the real price for every
    // product server-side and use that when building the Stripe line items.
    const productIds = [...new Set(items.map((item: any) => item.id))]
    const { data: dbProducts, error: priceError } = await supabase
      .from('products')
      .select('id, price')
      .in('id', productIds)

    if (priceError) {
      console.error('[checkout] Price lookup error:', priceError)
      return NextResponse.json(
        { error: 'Failed to verify product prices' },
        { status: 500 }
      )
    }

    const priceMap = new Map<string, number>()
    for (const p of dbProducts ?? []) {
      priceMap.set(p.id, Number(p.price))
    }

    for (const item of items) {
      if (!priceMap.has(item.id)) {
        return NextResponse.json(
          { error: `Product not found: ${item.id}` },
          { status: 400 }
        )
      }
    }

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
      // priceMap is guaranteed to contain item.id — every cart item was
      // verified against the DB above (404 -> 400 otherwise).
      const unitAmount = Math.round(priceMap.get(item.id)! * 100)
      return {
        price_data: {
          currency: CURRENCY,
          product_data: {
            name: displayName,
            images: item.image_url ? [item.image_url] : undefined,
          },
          unit_amount: unitAmount,
        },
        quantity: item.quantity,
      }
    })

    // Add shipping as a line item
    line_items.push({
      price_data: {
        currency: CURRENCY,
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
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://casekisses.com'}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://casekisses.com'}/cancel`,
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
