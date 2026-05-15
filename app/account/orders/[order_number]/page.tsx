'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Package, ArrowLeft, Truck } from 'lucide-react'

interface OrderItem {
  product_name: string
  quantity: number
  price: number
  product_image?: string | null
}

interface Order {
  id: string
  order_number: string
  created_at: string
  total: number
  subtotal: number
  shipping_cost: number
  order_status: string
  shipping_method?: string
  shipping_address?: string
  tracking_number?: string
  tracking_url?: string
  carrier?: string
  shipped_at?: string
  order_items: OrderItem[]
}

export default function CustomerOrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const order_number = params.order_number as string

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadOrder() {
      try {
        const supabase = createClient()

        // Require auth
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
          router.push('/auth/login')
          return
        }

        // Get user email from profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', user.id)
          .single()

        const userEmail = profile?.email ?? user.email

        // Fetch order — only return it if the logged-in user's email matches
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select(`
            id,
            order_number,
            created_at,
            total,
            subtotal,
            shipping_cost,
            order_status,
            shipping_method,
            shipping_address,
            tracking_number,
            tracking_url,
            carrier,
            shipped_at,
            customer_email,
            order_items (
              product_name,
              quantity,
              price,
              product_image
            )
          `)
          .eq('order_number', order_number)
          .eq('customer_email', userEmail)
          .single()

        if (orderError || !orderData) {
          setError('Order not found or does not belong to your account.')
          return
        }

        setOrder(orderData)
      } catch (err) {
        setError('An unexpected error occurred.')
      } finally {
        setLoading(false)
      }
    }

    loadOrder()
  }, [order_number, router])

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-foreground/60">Loading order...</p>
      </main>
    )
  }

  if (error || !order) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error ?? 'Order not found.'}</p>
          <Link href="/account" className="text-sm font-semibold" style={{ color: '#ec4899' }}>
            Back to Account
          </Link>
        </div>
      </main>
    )
  }

  const statusColors: Record<string, { bg: string; text: string }> = {
    pending:   { bg: '#fef9c3', text: '#854d0e' },
    shipped:   { bg: '#dcfce7', text: '#166534' },
    delivered: { bg: '#dbeafe', text: '#1e40af' },
    cancelled: { bg: '#fee2e2', text: '#991b1b' },
  }
  const statusStyle = statusColors[order.order_status] ?? { bg: '#fbcfe8', text: '#ec4899' }

  return (
    <main className="min-h-screen px-4 py-12 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        {/* Back link */}
        <Link
          href="/account"
          className="inline-flex items-center gap-2 text-sm text-foreground/60 hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Account
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#ec4899' }}>Order Details</h1>
            <p className="font-mono text-sm text-foreground/60 mt-1">{order.order_number}</p>
            <p className="text-xs text-foreground/60 mt-1">
              Placed on {new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <span
            className="px-4 py-1.5 rounded-full text-sm font-semibold capitalize"
            style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}
          >
            {order.order_status}
          </span>
        </div>

        {/* Tracking info */}
        {order.tracking_number && (
          <div className="bg-white rounded-2xl p-5 shadow-sm mb-5 border-l-4" style={{ borderColor: '#16a34a' }}>
            <div className="flex items-center gap-2 mb-2">
              <Truck size={18} style={{ color: '#16a34a' }} />
              <h2 className="font-semibold" style={{ color: '#16a34a' }}>Tracking Information</h2>
            </div>
            <p className="text-sm text-foreground/70">Carrier: <span className="font-medium text-foreground capitalize">{order.carrier}</span></p>
            <p className="text-sm text-foreground/70 mt-1">
              Tracking Number:{' '}
              {order.tracking_url ? (
                <a href={order.tracking_url} target="_blank" rel="noopener noreferrer" className="font-mono font-medium underline" style={{ color: '#ec4899' }}>
                  {order.tracking_number}
                </a>
              ) : (
                <span className="font-mono font-medium">{order.tracking_number}</span>
              )}
            </p>
          </div>
        )}

        {/* Products */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-5">
          <div className="flex items-center gap-2 mb-4">
            <Package size={18} style={{ color: '#ec4899' }} />
            <h2 className="font-semibold" style={{ color: '#ec4899' }}>
              Products ({order.order_items.reduce((s, i) => s + i.quantity, 0)} items)
            </h2>
          </div>
          <div className="space-y-4">
            {order.order_items.map((item, idx) => (
              <div key={idx} className="flex gap-4 pb-4 border-b last:border-b-0 last:pb-0">
                <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-pink-100 to-pink-50 flex items-center justify-center">
                  {item.product_image ? (
                    <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xl">&#128248;</span>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{item.product_name}</p>
                  <div className="flex gap-4 text-sm text-foreground/60 mt-1">
                    <span>Qty: <strong className="text-foreground">{item.quantity}</strong></span>
                    <span>Price: <strong style={{ color: '#ec4899' }}>${item.price.toFixed(2)}</strong></span>
                  </div>
                </div>
                <p className="font-semibold text-sm self-center" style={{ color: '#ec4899' }}>
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary & Shipping */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Pricing */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="font-semibold mb-4" style={{ color: '#ec4899' }}>Order Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-foreground/60">Subtotal</span>
                <span className="font-medium">${order.subtotal?.toFixed(2) ?? '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground/60">Shipping</span>
                <span className="font-medium">
                  {order.shipping_cost === 0 ? <span className="text-green-600">FREE</span> : `$${order.shipping_cost.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between pt-3 border-t font-bold text-base">
                <span>Total</span>
                <span style={{ color: '#ec4899' }}>${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Shipping address */}
          {order.shipping_address && (
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="font-semibold mb-3" style={{ color: '#ec4899' }}>Shipping Address</h2>
              <p className="text-sm text-foreground/70 whitespace-pre-wrap leading-relaxed font-mono">
                {order.shipping_address}
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
