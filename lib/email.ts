import { Resend } from 'resend'

/**
 * Lazy Resend client.
 *
 * Do NOT do `const resend = new Resend(process.env.RESEND_API_KEY)` at module
 * scope. That runs at BUILD time, and the key only exists in Vercel's env —
 * so every local `npm run build` dies with "Missing API key" before it can
 * type-check anything. The getter defers creation until an email is actually
 * sent, which only ever happens at runtime where the key exists.
 */
let resendClient: Resend | null = null

const resend = {
  get emails() {
    if (!resendClient) {
      resendClient = new Resend(process.env.RESEND_API_KEY)
    }
    return resendClient.emails
  },
}

// Generic email sending function for contact form
export async function sendEmail(params: {
  name: string
  email: string
  subject: string
  message: string
}): Promise<void> {
  const { name, email, subject, message } = params
  await resend.emails.send({
    from: 'CaseKisses <orders@casekisses.com>',
    to: 'casekisses.support@gmail.com',
    subject: `New Contact Form Message: ${subject}`,
    html: `<h2>New message from your site</h2><p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Subject:</strong> ${subject}</p><p><strong>Message:</strong><br/>${message}</p>`,
  })
}

interface OrderItem {
  product_name: string
  quantity: number
  price: number
  product_id?: string
  product_image?: string | null
  device_model?: string | null
}

interface Order {
  order_id: string
  order_number?: string | null
  customer_id?: string | null
  customer_name: string
  customer_email: string
  customer_phone?: string | null
  firstName?: string | null
  lastName?: string | null
  total: number
  subtotal: number
  shipping_cost: number
  shipping_method?: string | null
  shipping_address?: string | null
  shipping_country?: string | null
  items: OrderItem[]
  tracking_number?: string | null
  tracking_url?: string | null
  carrier?: string | null
  shipped_at?: string | null
  order_status?: string | null
}

// Send order confirmation email to customer
export async function sendOrderConfirmationEmail(order: Order) {

  const itemsHtml = order.items
    .map(
      item => {
        const imgHtml = item.product_image
          ? `<img src="${item.product_image}" alt="${item.product_name}" width="140" height="140" style="width:140px;height:140px;object-fit:cover;border-radius:8px;display:block;" />`
          : `<div style="width:140px;height:140px;background-color:#f5d5e6;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:64px;">&#128248;</div>`
        return `
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef5f9; border-radius: 12px; padding: 20px; margin-bottom: 15px; border-collapse: collapse;">
        <tr>
          <!-- Product Image -->
          <td width="160" style="padding: 0 20px 0 0; vertical-align: top; text-align: center;">
            <div style="border-radius: 8px; overflow: hidden; display: inline-block;">
              ${imgHtml}
            </div>
          </td>
          <!-- Product Details -->
          <td style="padding: 5px 0; vertical-align: top;">
            <h3 style="margin: 0 0 8px 0; color: #111; font-size: 16px; font-weight: 600;">${item.product_name}</h3>
            ${item.device_model ? `<p style="margin: 0 0 12px 0; color: #888; font-size: 13px;">Model: ${item.device_model}</p>` : ''}
            <p style="margin: 0 0 6px 0; color: #666; font-size: 14px;">Qty: <strong style="color: #111;">${item.quantity}</strong></p>
            <p style="margin: 0 0 12px 0; color: #666; font-size: 14px;">Price: <strong style="color: #d4456f;">$${item.price.toFixed(2)}</strong></p>
            <div style="padding-top: 12px; border-top: 1px solid #f0d0df; font-size: 14px; font-weight: 600; color: #d4456f;">
              Total: $${(item.price * item.quantity).toFixed(2)}
            </div>
          </td>
        </tr>
      </table>
    `
      }
    )
    .join('')

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #fde7ef;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fde7ef;">
        <tr>
          <td align="center" style="padding: 40px 20px;">
            <table width="100%" maxwidth="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #fde7ef 0%, #fdf1f6 100%); padding: 40px 30px; text-align: center; border-bottom: 2px solid #f5d5e6;">
                  <h1 style="margin: 0; font-size: 36px; font-weight: 300; color: #d4456f; font-family: 'Playfair Display', serif;">Thank You 💕</h1>
                  <p style="margin: 10px 0 0 0; color: #d4456f; font-size: 16px; font-weight: 500;">Your order is confirmed!</p>
                </td>
              </tr>
              
              <!-- Main Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  
                  <!-- Greeting -->
                  <p style="margin: 0 0 20px 0; color: #333; font-size: 16px; line-height: 1.6;">
                    Hi ${order.customer_name},
                  </p>
                  
                  <p style="margin: 0 0 30px 0; color: #555; font-size: 15px; line-height: 1.7;">
                    We're getting everything ready for you! Your order has been confirmed and we'll send you a tracking number as soon as it ships. 📦
                  </p>
                  
                  <!-- Order ID Badge -->
                  <div style="background-color: #fef5f9; border-left: 4px solid #d4456f; border-radius: 8px; padding: 15px 20px; margin-bottom: 30px;">
                    <p style="margin: 0; color: #666; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Order Number</p>
                    <p style="margin: 8px 0 0 0; color: #111; font-size: 18px; font-weight: 600; font-family: 'Courier New', monospace;">${order.order_id}</p>
                  </div>
                  
                  <!-- Products Section -->
                  <h2 style="margin: 0 0 20px 0; color: #111; font-size: 16px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #d4456f;">What You Ordered</h2>
                  ${itemsHtml}
                  
                  <!-- Pricing Section -->
                  <div style="background-color: #f9fafb; border-radius: 12px; padding: 25px; margin: 30px 0;">
                    <h3 style="margin: 0 0 20px 0; color: #111; font-size: 16px; font-weight: 600;">Order Summary</h3>
                    
                    <div style="display: flex; justify-content: space-between; margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #e5e7eb;">
                      <span style="color: #666; font-size: 14px;">Subtotal:</span>
                      <span style="color: #111; font-weight: 500; font-size: 14px;">$${order.subtotal.toFixed(2)}</span>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; margin-bottom: 15px; padding-bottom: 15px; border-bottom: 2px solid #e5e7eb;">
                      <span style="color: #666; font-size: 14px;">
                        ${order.shipping_method === 'express' ? 'Express Shipping' : 'Standard Shipping'}:
                      </span>
                      <span style="color: ${order.shipping_cost === 0 ? '#16a34a' : '#111'}; font-weight: 500; font-size: 14px;">
                        ${order.shipping_cost === 0 ? 'FREE' : `$${order.shipping_cost.toFixed(2)}`}
                      </span>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                      <span style="color: #111; font-size: 16px; font-weight: 700;">Total:</span>
                      <span style="color: #d4456f; font-size: 24px; font-weight: 700;">$${order.total.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <!-- Shipping Address -->
                  <div style="background-color: #fef5f9; border-radius: 12px; padding: 20px; margin: 30px 0;">
                    <h3 style="margin: 0 0 15px 0; color: #d4456f; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">📍 Shipping Address</h3>
                    <p style="margin: 0; color: #333; font-size: 14px; line-height: 1.8; white-space: pre-wrap;">${order.shipping_address}</p>
                  </div>
                  
                  <!-- CTA Button -->
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="https://casekisses.com/account/orders/${order.order_id}" style="display: inline-block; background-color: #d4456f; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 50px; font-weight: 600; font-size: 15px; letter-spacing: 0.5px;">
                      View Your Order
                    </a>
                  </div>
                  
                  <!-- Additional Info -->
                  <p style="margin: 30px 0 0 0; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #666; font-size: 14px; line-height: 1.6;">
                    Once your order ships, we'll send you a tracking number so you can follow your package every step of the way. If you have any questions, feel free to reply to this email or contact us at <a href="mailto:support@casekisses.com" style="color: #d4456f; text-decoration: none;">support@casekisses.com</a>.
                  </p>
                  
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #fef5f9; padding: 30px; text-align: center; border-top: 1px solid #f5d5e6;">
                  <p style="margin: 0 0 15px 0; color: #d4456f; font-size: 16px; font-weight: 600;">💕 CaseKisses</p>
                  <p style="margin: 0; color: #999; font-size: 12px; line-height: 1.6;">
                    Protect Your Phone in Style
                  </p>
                  <p style="margin: 10px 0 0 0; color: #999; font-size: 11px;">
                    © 2026 CaseKisses. All rights reserved.
                  </p>
                </td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `

  try {
    await resend.emails.send({
      from: process.env.FROM_EMAIL || 'CaseKisses <orders@casekisses.com>',
      to: order.customer_email,
      subject: `Order Confirmed! ${order.order_id}`,
      html,
    })

    // Also send comprehensive email to admin
    if (process.env.ADMIN_EMAIL) {
      await sendAdminNewOrderEmail(order)
    }
  } catch (error) {
    console.error('Failed to send confirmation email:', error)
  }
}

// Send comprehensive new order email to admin for fulfillment
export async function sendAdminNewOrderEmail(order: Order) {
  const itemsHtml = order.items
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 16px; text-align: left;">
          <div style="font-weight: 600; color: #111; font-size: 15px;">${item.product_name}</div>
          <div style="color: #d4456f; font-size: 13px; margin-top: 4px; font-family: 'Courier New', monospace;">ID: ${item.product_id || 'N/A'}</div>
        </td>
        <td style="padding: 16px; text-align: center; color: #666; font-size: 14px;"><strong>${item.quantity}</strong></td>
        <td style="padding: 16px; text-align: right; color: #666; font-size: 14px;">$${item.price.toFixed(2)}</td>
        <td style="padding: 16px; text-align: right; font-weight: 600; color: #d4456f; font-size: 14px;">$${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `
    )
    .join('')

  const shippingLabel =
    order.shipping_method === 'express'
      ? `Express Shipping (${order.shipping_cost === 0 ? 'FREE' : `$${order.shipping_cost.toFixed(2)}`})`
      : `Standard Shipping (${order.shipping_cost === 0 ? 'FREE' : `$${order.shipping_cost.toFixed(2)}`})`

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Order - ${order.order_id}</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f0f0f0;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0f0f0;">
        <tr>
          <td align="center" style="padding: 40px 20px;">
            <table width="100%" maxwidth="900" cellpadding="0" cellspacing="0" style="max-width: 900px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border-top: 4px solid #d4456f;">
              
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #fde7ef 0%, #fdf1f6 100%); padding: 30px; text-align: center;">
                  <h1 style="margin: 0; font-size: 32px; font-weight: 300; color: #d4456f;">🎉 New Order</h1>
                  <p style="margin: 8px 0 0 0; color: #d4456f; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Received</p>
                </td>
              </tr>
              
              <!-- Main Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  
                  <!-- Order Status Cards -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                    <tr>
                      <td width="33%" style="padding: 0 10px 0 0;">
                        <div style="background-color: #fef5f9; border-radius: 8px; padding: 20px; text-align: center;">
                          <p style="margin: 0 0 8px 0; color: #999; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Order ID</p>
                          <p style="margin: 0; color: #d4456f; font-size: 16px; font-weight: 600; font-family: 'Courier New', monospace;">${order.order_id}</p>
                        </div>
                      </td>
                      <td width="33%" style="padding: 0 5px;">
                        <div style="background-color: #eff6ff; border-radius: 8px; padding: 20px; text-align: center;">
                          <p style="margin: 0 0 8px 0; color: #999; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Total</p>
                          <p style="margin: 0; color: #0284c7; font-size: 18px; font-weight: 700;">$${order.total.toFixed(2)}</p>
                        </div>
                      </td>
                      <td width="33%" style="padding: 0 0 0 10px;">
                        <div style="background-color: #e0f5e6; border-radius: 8px; padding: 20px; text-align: center;">
                          <p style="margin: 0 0 8px 0; color: #999; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Items</p>
                          <p style="margin: 0; color: #16a34a; font-size: 18px; font-weight: 700;">${order.items.reduce((sum, item) => sum + item.quantity, 0)}</p>
                        </div>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- Customer Information -->
                  <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                    <h2 style="margin: 0 0 16px 0; color: #111; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Customer</h2>
                    <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 14px;">
                      <tr>
                        <td width="50%" style="padding-bottom: 12px;">
                          <p style="margin: 0 0 4px 0; color: #999; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Name</p>
                          <p style="margin: 0; color: #111; font-weight: 500;">${order.customer_name}</p>
                        </td>
                        <td width="50%" style="padding-bottom: 12px; padding-left: 20px;">
                          <p style="margin: 0 0 4px 0; color: #999; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Email</p>
                          <p style="margin: 0;"><a href="mailto:${order.customer_email}" style="color: #0284c7; text-decoration: none; font-weight: 500;">${order.customer_email}</a></p>
                        </td>
                      </tr>
                      ${
                        order.customer_phone
                          ? `<tr>
                        <td width="50%" style="padding-bottom: 12px;">
                          <p style="margin: 0 0 4px 0; color: #999; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Phone</p>
                          <p style="margin: 0;"><a href="tel:${order.customer_phone}" style="color: #111; text-decoration: none; font-weight: 500;">${order.customer_phone}</a></p>
                        </td>
                        <td width="50%" style="padding-left: 20px;"></td>
                      </tr>`
                          : ''
                      }
                    </table>
                  </div>

                  <!-- Shipping Address -->
                  <div style="background-color: #fef5f9; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                    <h2 style="margin: 0 0 12px 0; color: #111; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Ship To</h2>
                    <p style="margin: 0; color: #333; font-size: 14px; line-height: 1.7; white-space: pre-wrap;">${order.shipping_address || 'N/A'}</p>
                    <p style="margin: 8px 0 0 0; color: #666; font-size: 13px;">${order.shipping_method === 'express' ? 'Express Shipping' : 'Standard Shipping'} &mdash; ${order.shipping_cost === 0 ? 'FREE' : `$${order.shipping_cost.toFixed(2)}`}</p>
                  </div>

                  <!-- Items Ordered -->
                  <h2 style="margin: 0 0 12px 0; color: #111; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Items Ordered</h2>
                  <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; margin-bottom: 30px; font-size: 14px;">
                    <thead>
                      <tr style="background-color: #f3f4f6;">
                        <th style="padding: 10px 16px; text-align: left; color: #666; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Product</th>
                        <th style="padding: 10px 16px; text-align: center; color: #666; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Qty</th>
                        <th style="padding: 10px 16px; text-align: right; color: #666; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Unit Price</th>
                        <th style="padding: 10px 16px; text-align: right; color: #666; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Line Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${itemsHtml}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colspan="3" style="padding: 14px 16px; text-align: right; font-size: 14px; color: #666;">Subtotal:</td>
                        <td style="padding: 14px 16px; text-align: right; font-weight: 600; color: #111;">$${order.subtotal.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td colspan="3" style="padding: 4px 16px; text-align: right; font-size: 14px; color: #666;">Shipping:</td>
                        <td style="padding: 4px 16px; text-align: right; font-weight: 600; color: ${order.shipping_cost === 0 ? '#16a34a' : '#111'};">${order.shipping_cost === 0 ? 'FREE' : `$${order.shipping_cost.toFixed(2)}`}</td>
                      </tr>
                      <tr style="border-top: 2px solid #e5e7eb;">
                        <td colspan="3" style="padding: 14px 16px; text-align: right; font-size: 16px; font-weight: 700; color: #111;">Total:</td>
                        <td style="padding: 14px 16px; text-align: right; font-size: 18px; font-weight: 700; color: #d4456f;">$${order.total.toFixed(2)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #f9fafb; padding: 20px 30px; border-top: 1px solid #e5e7eb; text-align: center;">
                  <p style="margin: 0; color: #999; font-size: 12px;">
                    This is an automated order notification. Admin portal only.
                  </p>
                  <p style="margin: 8px 0 0 0; color: #d4456f; font-size: 12px; font-weight: 600;">
                    CaseKisses Admin System
                  </p>
                </td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `

  try {
    await resend.emails.send({
      from: process.env.FROM_EMAIL || 'CaseKisses <orders@casekisses.com>',
      to: process.env.ADMIN_EMAIL!,
      subject: `🎉 New Order: ${order.order_id} | $${order.total.toFixed(2)}`,
      html,
    })
  } catch (error) {
    console.error('Failed to send admin order email:', error)
  }
}

// Send order shipped/tracking email to customer
export async function sendOrderShippedEmail(order: Order) {
  const trackingLink = order.tracking_url || '#'
  const carrier = order.carrier || 'your carrier'
  const carrierLabel = carrier.charAt(0).toUpperCase() + carrier.slice(1).toLowerCase()
  const trackingNumber = order.tracking_number || 'N/A'

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Order Shipped</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #fde7ef;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fde7ef;">
        <tr>
          <td align="center" style="padding: 40px 20px;">
            <table width="100%" maxwidth="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #fde7ef 0%, #fdf1f6 100%); padding: 40px 30px; text-align: center; border-bottom: 2px solid #f5d5e6;">
                  <h1 style="margin: 0; font-size: 36px; font-weight: 300; color: #d4456f;">Your Order Shipped 🚚</h1>
                  <p style="margin: 10px 0 0 0; color: #d4456f; font-size: 16px; font-weight: 500;">On its way to you!</p>
                </td>
              </tr>
              
              <!-- Main Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  
                  <!-- Greeting -->
                  <p style="margin: 0 0 20px 0; color: #333; font-size: 16px; line-height: 1.6;">
                    Hi ${order.customer_name},
                  </p>
                  
                  <p style="margin: 0 0 30px 0; color: #555; font-size: 15px; line-height: 1.7;">
                    Great news! Your order is on its way. You can track your package using the information below.
                  </p>
                  
                  <!-- Order ID Badge -->
                  <div style="background-color: #fef5f9; border-left: 4px solid #d4456f; border-radius: 8px; padding: 15px 20px; margin-bottom: 30px;">
                    <p style="margin: 0; color: #666; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Order Number</p>
                    <p style="margin: 8px 0 0 0; color: #111; font-size: 18px; font-weight: 600; font-family: 'Courier New', monospace;">${order.order_id}</p>
                  </div>
                  
                  <!-- Tracking Information -->
                  <div style="background-color: #f0fdf4; border-radius: 12px; padding: 25px; margin-bottom: 30px; border-left: 4px solid #16a34a;">
                    <h2 style="margin: 0 0 20px 0; color: #111; font-size: 16px; font-weight: 600;">📦 Tracking Information</h2>
                    
                    <div style="display: flex; justify-content: space-between; margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #d1fae5;">
                      <span style="color: #666; font-size: 14px;">Carrier:</span>
                      <span style="color: #111; font-weight: 500; font-size: 14px;">${carrierLabel}</span>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; margin-bottom: 15px; padding-bottom: 15px; border-bottom: 2px solid #d1fae5;">
                      <span style="color: #666; font-size: 14px;">Tracking Number:</span>
                      <span style="color: #16a34a; font-weight: 600; font-size: 14px; font-family: 'Courier New', monospace;">${trackingNumber}</span>
                    </div>
                    
                    ${
                      order.tracking_url
                        ? `<div style="text-align: center; margin-top: 20px;">
                      <a href="${order.tracking_url}" style="display: inline-block; background-color: #16a34a; color: #ffffff; text-decoration: none; padding: 14px 35px; border-radius: 50px; font-weight: 600; font-size: 15px; letter-spacing: 0.5px;">
                        Track Your Package
                      </a>
                    </div>`
                        : ''
                    }
                  </div>
                  
                  <!-- Delivery Estimate -->
                  <div style="background-color: #fef5f9; border-radius: 12px; padding: 20px; margin-bottom: 30px;">
                    <h3 style="margin: 0 0 12px 0; color: #d4456f; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">📅 Estimated Delivery</h3>
                    <p style="margin: 0; color: #333; font-size: 14px; line-height: 1.6;">
                      Your package should arrive within 5-7 business days. Delivery times may vary depending on your location and the carrier.
                    </p>
                  </div>
                  
                  <!-- Support Info -->
                  <p style="margin: 30px 0 0 0; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #666; font-size: 14px; line-height: 1.6;">
                    Have questions about your shipment? You can check your tracking information at any time, or contact us at <a href="mailto:support@casekisses.com" style="color: #d4456f; text-decoration: none;">support@casekisses.com</a>.
                  </p>
                  
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #fef5f9; padding: 30px; text-align: center; border-top: 1px solid #f5d5e6;">
                  <p style="margin: 0 0 15px 0; color: #d4456f; font-size: 16px; font-weight: 600;">💕 CaseKisses</p>
                  <p style="margin: 0; color: #999; font-size: 12px; line-height: 1.6;">
                    Protect Your Phone in Style
                  </p>
                  <p style="margin: 10px 0 0 0; color: #999; font-size: 11px;">
                    © 2026 CaseKisses. All rights reserved.
                  </p>
                </td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `

  try {
    await resend.emails.send({
      from: process.env.FROM_EMAIL || 'CaseKisses <orders@casekisses.com>',
      to: order.customer_email,
      subject: `Your Order Shipped - ${order.order_id} | Track Now`,
      html,
    })
  } catch (error) {
    console.error('Failed to send shipped email:', error)
  }
}

// Send shipping/tracking update email
export async function sendShippingUpdateEmail(order: Order) {
  if (!order.tracking_number) {
    console.warn('No tracking number provided')
    return
  }

  const trackingLink = order.tracking_url || `https://www.${order.carrier?.toLowerCase() || 'tracking'}.com/track/${order.tracking_number}`

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Your Order is On the Way!</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fef5f9;">
      <div style="background-color: #ffffff; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #d4456f; margin: 0; font-size: 28px; font-family: 'Playfair Display', serif;">On the Way! 📦</h1>
        </div>
        
        <p style="color: #333; font-size: 16px; line-height: 1.6;">
          Hi ${order.customer_name},
        </p>
        
        <p style="color: #333; font-size: 16px; line-height: 1.6;">
          Great news! Your order ${order.order_number ?? order.order_id} has been shipped and is on its way to you!
        </p>
        
        <div style="background-color: #f9e0eb; border-left: 4px solid #d4456f; border-radius: 8px; padding: 20px; margin: 30px 0;">
          <h2 style="color: #d4456f; margin: 0 0 15px 0; font-size: 18px;">Tracking Information</h2>
          
          <p style="color: #666; font-size: 14px; margin: 8px 0;">
            <strong>Carrier:</strong> ${order.carrier || 'Standard Carrier'}
          </p>
          <p style="color: #666; font-size: 14px; margin: 8px 0;">
            <strong>Tracking Number:</strong> ${order.tracking_number}
          </p>
          
          <a href="${trackingLink}" style="display: inline-block; margin-top: 15px; padding: 12px 24px; background-color: #d4456f; color: white; text-decoration: none; border-radius: 24px; font-weight: bold; font-size: 14px;">
            Track Your Package
          </a>
        </div>
        
        <div style="background-color: #fef5f9; border-radius: 12px; padding: 15px; margin: 20px 0;">
          <p style="color: #d4456f; font-weight: bold; margin: 0;">📍 Shipping To</p>
          <p style="color: #333; font-size: 14px; margin: 8px 0 0 0; line-height: 1.6;">${order.shipping_address}</p>
        </div>
        
        <p style="color: #666; font-size: 14px; line-height: 1.6; margin-top: 20px;">
          Your ${order.shipping_method === 'express' ? 'express' : 'standard'} shipping order should arrive within the estimated delivery window. Click the link above to track your package in real-time!
        </p>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px; margin: 0;">
            Questions? Reply to this email or contact us at support@casekisses.com
          </p>
          <p style="color: #d4456f; font-size: 14px; margin-top: 15px;">
            💖 CaseKisses - Protect Your Phone in Style
          </p>
        </div>
      </div>
    </body>
    </html>
  `

  try {
    await resend.emails.send({
      from: process.env.FROM_EMAIL || 'CaseKisses <orders@casekisses.com>',
      to: order.customer_email,
      subject: `Your Order is Shipping! ${order.order_number ?? order.order_id}`,
      html,
    })
  } catch (error) {
    console.error('Failed to send shipping email:', error)
  }
}
