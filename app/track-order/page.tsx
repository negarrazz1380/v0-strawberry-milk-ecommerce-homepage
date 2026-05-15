'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search } from 'lucide-react'

interface TrackingOrder {
  order_id: string
  customer_name: string
  customer_email: string
  order_status: string
  total: number
  shipping_address: string
  shipping_method: string
  tracking_number?: string
  tracking_url?: string
  carrier?: string
  created_at: string
  shipped_at?: string
  items: Array<{
    product_name: string
    quantity: number
    price: number
  }>
}

const statusColors: Record<string, { bg: string; text: string; icon: string }> = {
  pending: { bg: '#f5d5e6', text: '#d4456f', icon: '⏳' },
  paid: { bg: '#f5d5e6', text: '#d4456f', icon: '✓' },
  processing: { bg: '#fff3cd', text: '#856404', icon: '⚙️' },
  shipped: { bg: '#d1ecf1', text: '#0c5460', icon: '📦' },
  delivered: { bg: '#d4edda', text: '#155724', icon: '✓' },
  cancelled: { bg: '#f8d7da', text: '#721c24', icon: '✗' },
}

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  paid: 'Paid',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

export default function TrackOrderPage() {
  const [email, setEmail] = useState('')
  const [orderNumber, setOrderNumber] = useState('')
  const [order, setOrder] = useState<TrackingOrder | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searched, setSearched] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !orderNumber) {
      setError('Please enter both email and order number')
      return
    }

    setLoading(true)
    setError(null)
    setSearched(true)

    try {
      const response = await fetch('/api/track-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, orderNumber }),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.message || 'Order not found')
        setOrder(null)
        return
      }

      const data = await response.json()
      setOrder(data)
    } catch (err) {
      setError('Failed to fetch order. Please try again.')
      setOrder(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen px-4 py-12" style={{ backgroundColor: '#fef5f9' }}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/" className="inline-block mb-6 text-foreground/60 hover:text-foreground transition-colors text-sm">
            ← Back to home
          </Link>
          <h1 className="text-4xl font-light mb-2" style={{ fontFamily: 'var(--font-playfair)', color: '#d4456f' }}>
            Track Your Order
          </h1>
          <p className="text-gray-600">Enter your email and order number to see where your cute case is!</p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="bg-white rounded-3xl p-8 shadow-sm mb-8 border-2" style={{ borderColor: '#f5d5e6' }}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-2" style={{ color: '#d4456f', letterSpacing: '0.08em' }}>
                EMAIL ADDRESS
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-5 py-3 rounded-full border-2 bg-white transition-all focus:outline-none"
                style={{
                  borderColor: '#f5d5e6',
                  fontFamily: 'var(--font-sans)',
                }}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-2" style={{ color: '#d4456f', letterSpacing: '0.08em' }}>
                ORDER NUMBER
              </label>
              <input
                type="text"
                value={orderNumber}
                onChange={e => setOrderNumber(e.target.value)}
                placeholder="ORD-XXXX-XXXX or Stripe session ID"
                className="w-full px-5 py-3 rounded-full border-2 bg-white transition-all focus:outline-none"
                style={{
                  borderColor: '#f5d5e6',
                  fontFamily: 'var(--font-sans)',
                }}
              />
            </div>

            {error && (
              <p className="text-sm rounded-full py-2 px-4 text-center" style={{ backgroundColor: '#ffe0e6', color: '#d4456f' }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-full font-semibold text-white transition-all hover:shadow-lg disabled:opacity-50 hover:-translate-y-0.5 flex items-center justify-center gap-2"
              style={{ backgroundColor: '#d4456f' }}
            >
              <Search size={18} />
              {loading ? 'Searching...' : 'Find My Order'}
            </button>
          </div>
        </form>

        {/* Order Details */}
        {searched && order && (
          <div className="space-y-6 animate-in fade-in">
            {/* Status Card */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border-2" style={{ borderColor: '#f5d5e6' }}>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-xs font-semibold mb-2" style={{ color: '#999', letterSpacing: '0.08em' }}>
                    ORDER ID
                  </p>
                  <p className="text-2xl font-bold" style={{ color: '#333' }}>
                    {order.order_id}
                  </p>
                  <p className="text-xs text-gray-600 mt-2">
                    Placed on {new Date(order.created_at).toLocaleDateString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div
                  className="px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2"
                  style={{
                    backgroundColor: statusColors[order.order_status]?.bg || '#f5d5e6',
                    color: statusColors[order.order_status]?.text || '#d4456f',
                  }}
                >
                  <span>{statusColors[order.order_status]?.icon || '📦'}</span>
                  {statusLabels[order.order_status] || order.order_status}
                </div>
              </div>

              {/* Timeline */}
              <div className="space-y-3 mt-8 border-l-2" style={{ borderColor: '#f5d5e6', paddingLeft: '20px' }}>
                <div>
                  <p className="text-xs font-semibold" style={{ color: '#d4456f' }}>
                    ✓ Order Confirmed
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>

                {order.order_status !== 'pending' && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold" style={{ color: '#d4456f' }}>
                      {order.order_status === 'shipped' || order.order_status === 'delivered'
                        ? '✓ Shipped'
                        : order.order_status === 'processing'
                          ? '⚙️ Processing'
                          : '...'}
                    </p>
                    {order.shipped_at && (
                      <p className="text-xs text-gray-600 mt-1">
                        {new Date(order.shipped_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                )}

                {order.order_status === 'delivered' && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold" style={{ color: '#28a745' }}>
                      ✓ Delivered
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Tracking Info */}
            {order.tracking_number ? (
              <div className="bg-white rounded-3xl p-8 shadow-sm border-2" style={{ borderColor: '#f5d5e6' }}>
                <h3 className="text-xl font-light mb-4" style={{ fontFamily: 'var(--font-playfair)', color: '#d4456f' }}>
                  Tracking Information
                </h3>

                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-semibold" style={{ color: '#999', letterSpacing: '0.08em' }}>
                      CARRIER
                    </p>
                    <p className="text-lg font-semibold" style={{ color: '#333' }}>
                      {order.carrier || 'Standard Carrier'}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold" style={{ color: '#999', letterSpacing: '0.08em' }}>
                      TRACKING NUMBER
                    </p>
                    <p className="text-lg font-mono font-semibold" style={{ color: '#333' }}>
                      {order.tracking_number}
                    </p>
                  </div>

                  {order.tracking_url && (
                    <a
                      href={order.tracking_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-4 px-6 py-3 rounded-full font-semibold text-white transition-all hover:shadow-lg hover:-translate-y-0.5"
                      style={{ backgroundColor: '#d4456f' }}
                    >
                      Track Package ↗
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-8 shadow-sm border-2" style={{ borderColor: '#f5d5e6' }}>
                <p className="text-center text-gray-600">
                  Your order is being prepared 💕 Tracking will be emailed once available.
                </p>
              </div>
            )}

            {/* Items */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border-2" style={{ borderColor: '#f5d5e6' }}>
              <h3 className="text-xl font-light mb-4" style={{ fontFamily: 'var(--font-playfair)', color: '#d4456f' }}>
                Items Ordered
              </h3>

              <div className="space-y-3">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center pb-3 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="font-semibold" style={{ color: '#333' }}>
                        {item.product_name}
                      </p>
                      <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold" style={{ color: '#d4456f' }}>
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t-2" style={{ borderColor: '#f5d5e6' }}>
                <div className="flex justify-between items-center">
                  <p className="font-semibold" style={{ color: '#d4456f' }}>
                    Total:
                  </p>
                  <p className="text-2xl font-bold" style={{ color: '#d4456f' }}>
                    ${order.total.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border-2" style={{ borderColor: '#f5d5e6' }}>
              <h3 className="text-xl font-light mb-4" style={{ fontFamily: 'var(--font-playfair)', color: '#d4456f' }}>
                Shipping Address
              </h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{order.shipping_address}</p>
            </div>
          </div>
        )}

        {searched && !order && !error && (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-6">Order not found. Please check your email and order number.</p>
            <button
              onClick={() => {
                setSearched(false)
                setOrder(null)
                setEmail('')
                setOrderNumber('')
              }}
              className="px-6 py-3 rounded-full font-semibold text-white transition-all hover:shadow-lg"
              style={{ backgroundColor: '#d4456f' }}
            >
              Try Again
            </button>
          </div>
        )}

        {!searched && (
          <div className="text-center py-12">
            <p className="text-gray-600">
              Enter your email and order number to get started
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
