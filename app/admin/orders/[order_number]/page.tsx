'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Printer, Copy, CheckCircle, Loader } from 'lucide-react'

interface OrderItem {
  product_name: string
  quantity: number
  price: number
  product_image?: string | null
  device_model?: string | null
}

interface Order {
  id: string
  order_id: string
  order_number: string
  customer_id?: string
  customer_name: string
  customer_email: string
  customer_phone?: string
  shipping_address: string
  shipping_country?: string
  total: number
  subtotal: number
  shipping_cost: number
  order_status: string
  shipping_method: string
  tracking_number?: string
  tracking_url?: string
  carrier?: string
  created_at: string
  shipped_at?: string
  order_items: OrderItem[]
  // From checkout_customers join
  checkout_customer?: {
    first_name?: string
    last_name?: string
    address_line1?: string
    address_line2?: string
    city?: string
    state_province?: string
    postal_code?: string
    country?: string
    phone?: string
  }
}

export default function OrderDetailPage() {
  const router = useRouter()
  const params = useParams()
  const order_number = params.order_number as string

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showShippingForm, setShowShippingForm] = useState(false)
  const [shippingData, setShippingData] = useState({
    tracking_number: '',
    carrier: '',
    tracking_url: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)

  useEffect(() => {
    async function loadOrder() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          router.push('/auth/login')
          return
        }

        // Query 1: Fetch order with items
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select(`
            *,
            order_items (
              product_name,
              quantity,
              price,
              product_image,
              device_model
            )
          `)
          .eq('order_number', order_number)
          .single()

        if (orderError || !orderData) {
          setError('Order not found')
          return
        }

        // Query 2: Fetch checkout customer by customer_id if available
        let checkoutCustomer = null
        if (orderData.customer_id) {
          const { data: customerData } = await supabase
            .from('checkout_customers')
            .select('first_name, last_name, address_line1, address_line2, city, state_province, postal_code, country, phone')
            .eq('id', orderData.customer_id)
            .single()
          checkoutCustomer = customerData
        }

        setOrder({ ...orderData, checkout_customer: checkoutCustomer })
      } catch (err) {
        setError('Failed to load order')
        console.error('Error:', err)
      } finally {
        setLoading(false)
      }
    }

    loadOrder()
  }, [order_number, router])

  async function handleMarkAsShipped(e: React.FormEvent) {
    e.preventDefault()

    if (!shippingData.tracking_number || !shippingData.carrier) {
      alert('Please fill in all required fields')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/admin/update-tracking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_number: order_number,
          tracking_number: shippingData.tracking_number,
          tracking_url: shippingData.tracking_url || null,
          carrier: shippingData.carrier,
        }),
      })

      const responseData = await response.json()

      if (!response.ok) {
        const detail = responseData.error ?? responseData.message ?? 'Unknown error'
        const extra = responseData.supabaseError ? ` (${responseData.supabaseError})` : ''
        alert(`Error ${response.status}: ${detail}${extra}`)
        return
      }

      // Refresh order
      const supabase = createClient()
      const { data: updatedOrder } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            product_name,
            quantity,
            price
          )
        `)
        .eq('order_number', order_number)
        .single()

      if (updatedOrder) {
        setOrder(updatedOrder)
        setShowShippingForm(false)
        setShippingData({ tracking_number: '', carrier: '', tracking_url: '' })
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update order')
    } finally {
      setSubmitting(false)
    }
  }

  function handleCopyAddress() {
    if (order?.shipping_address) {
      navigator.clipboard.writeText(order.shipping_address)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    }
  }

  function handlePrint() {
    window.print()
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
        <p className="text-gray-600">Loading order...</p>
      </main>
    )
  }

  if (error || !order) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Order not found'}</p>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
            style={{ color: '#d4456f' }}
          >
            <ArrowLeft size={18} />
            Back to Orders
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen px-4 py-8 bg-gradient-to-br from-white via-gray-50 to-gray-100">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-8 print:mb-6">
          <div className="flex-1">
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full hover:bg-gray-200 transition-colors mb-4"
            >
              <ArrowLeft size={18} />
              <span className="text-sm font-semibold">Back to Orders</span>
            </Link>
            <div className="mt-4">
              <p className="text-sm text-gray-600 font-medium mb-2">ORDER</p>
              <h1 className="text-4xl font-light" style={{ fontFamily: 'var(--font-playfair)', color: '#d4456f' }}>
                {order.order_number}
              </h1>
              <p className="text-gray-600 mt-2">
                Placed on {new Date(order.created_at).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
          
          {/* Status Badge */}
          <div className="text-right">
            <div className="inline-block px-4 py-2 rounded-full font-semibold text-white" 
              style={{ backgroundColor: order.order_status === 'shipped' ? '#047857' : '#d4456f' }}>
              {order.order_status === 'pending' ? '⏳ Pending' : order.order_status === 'shipped' ? '✓ Shipped' : order.order_status.toUpperCase()}
            </div>
            {order.shipped_at && (
              <p className="text-sm text-gray-600 mt-2">
                Shipped on {new Date(order.shipped_at).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-8 flex-wrap print:hidden">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors hover:shadow-md"
            style={{ backgroundColor: '#fef5f9', color: '#d4456f' }}
          >
            <Printer size={18} />
            Print Packing Slip
          </button>
          <button
            onClick={handleCopyAddress}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors hover:shadow-md"
            style={{ backgroundColor: '#fef5f9', color: '#d4456f' }}
          >
            <Copy size={18} />
            {copySuccess ? 'Copied!' : 'Copy Address'}
          </button>
          {order.order_status !== 'shipped' && order.order_status !== 'delivered' && (
            <button
              onClick={() => setShowShippingForm(!showShippingForm)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-white transition-colors hover:shadow-md"
              style={{ backgroundColor: '#d4456f' }}
            >
              {showShippingForm ? 'Cancel' : 'Mark as Shipped'}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content - Span 3 columns */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Customer Information Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border-l-4" style={{ borderColor: '#d4456f' }}>
              <h2 className="text-lg font-semibold mb-4" style={{ color: '#d4456f' }}>
                👤 Customer Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-bold uppercase text-gray-500 mb-1">Name</p>
                  <p className="text-lg font-medium">{order.customer_name}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-gray-500 mb-1">Email</p>
                  <p className="text-base"><a href={`mailto:${order.customer_email}`} className="text-blue-600 hover:underline">{order.customer_email}</a></p>
                </div>
                {order.customer_phone && (
                  <div>
                    <p className="text-xs font-bold uppercase text-gray-500 mb-1">Phone</p>
                    <p className="text-base"><a href={`tel:${order.customer_phone}`} className="text-blue-600 hover:underline">{order.customer_phone}</a></p>
                  </div>
                )}
              </div>
            </div>

            {/* Shipping Address Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border-l-4" style={{ borderColor: '#16a34a' }}>
              <h2 className="text-lg font-semibold mb-4" style={{ color: '#16a34a' }}>
                📍 Shipping Address
              </h2>
              <div className="bg-green-50 rounded-lg p-4 font-mono text-sm leading-relaxed whitespace-pre-wrap">
                {order.shipping_address}
              </div>
            </div>

            {/* Products Section */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border-l-4" style={{ borderColor: '#0284c7' }}>
              <h2 className="text-lg font-semibold mb-4" style={{ color: '#0284c7' }}>
                📦 Products ({order.order_items.reduce((sum, item) => sum + item.quantity, 0)} items)
              </h2>
              <div className="space-y-4">
                {order.order_items.map((item, idx) => (
                  <div key={idx} className="flex gap-4 pb-4 border-b last:border-b-0 last:pb-0">
                    {/* Product Image */}
                    <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-gradient-to-br from-pink-100 to-pink-50 flex items-center justify-center">
                      {item.product_image ? (
                        <img
                          src={item.product_image}
                          alt={item.product_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl">&#128248;</span>
                      )}
                    </div>
                    {/* Product Details */}
                    <div className="flex-1">
                      <p className="font-semibold text-lg text-gray-900">{item.product_name}</p>
                      {item.device_model && (
                        <p className="text-sm text-gray-500 mt-0.5">{item.device_model}</p>
                      )}
                      <div className="mt-2 flex gap-6 text-sm">
                        <div>
                          <p className="text-gray-600">Quantity</p>
                          <p className="font-semibold">{item.quantity}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Unit Price</p>
                          <p className="font-semibold">${item.price.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Line Total</p>
                          <p className="font-semibold" style={{ color: '#d4456f' }}>${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Form */}
            {showShippingForm && order.order_status !== 'shipped' && (
              <div className="bg-blue-50 rounded-2xl p-6 border-2" style={{ borderColor: '#0284c7' }}>
                <h3 className="text-lg font-semibold mb-4" style={{ color: '#0284c7' }}>
                  Add Tracking Information
                </h3>
                <form onSubmit={handleMarkAsShipped} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">
                      Tracking Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={shippingData.tracking_number}
                      onChange={e => setShippingData({ ...shippingData, tracking_number: e.target.value })}
                      placeholder="e.g., 1Z999AA10123456784"
                      className="w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2"
                      style={{ borderColor: '#e0e7ff', '--tw-ring-color': '#0284c7' } as any}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-700">
                        Carrier *
                      </label>
                      <select
                        required
                        value={shippingData.carrier}
                        onChange={e => setShippingData({ ...shippingData, carrier: e.target.value })}
                        className="w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2"
                        style={{ borderColor: '#e0e7ff' }}
                      >
                        <option value="">Select Carrier</option>
                        <option value="UPS">UPS</option>
                        <option value="FedEx">FedEx</option>
                        <option value="USPS">USPS</option>
                        <option value="DHL">DHL Express</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">
                      Tracking URL (Optional)
                    </label>
                    <input
                      type="url"
                      value={shippingData.tracking_url}
                      onChange={e => setShippingData({ ...shippingData, tracking_url: e.target.value })}
                      placeholder="https://tracking.carrier.com/..."
                      className="w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2"
                      style={{ borderColor: '#e0e7ff' }}
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 py-3 rounded-lg font-semibold text-white transition-opacity disabled:opacity-50"
                      style={{ backgroundColor: '#0284c7' }}
                    >
                      {submitting ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader size={18} className="animate-spin" />
                          Saving...
                        </span>
                      ) : (
                        'Mark as Shipped & Send Email'
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowShippingForm(false)}
                      className="flex-1 py-3 rounded-lg font-semibold transition-colors"
                      style={{ backgroundColor: '#e0f2fe', color: '#0284c7' }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Sidebar - Right Column */}
          <div className="lg:col-span-1 space-y-6 print:hidden">
            
            {/* Order Status Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border-t-4" style={{ borderColor: '#d4456f' }}>
              <h3 className="text-sm font-bold uppercase text-gray-600 mb-4">Status</h3>
              <div className="space-y-3">
                <div className="px-3 py-2 rounded-lg text-center font-semibold text-white" 
                  style={{ backgroundColor: order.order_status === 'shipped' ? '#047857' : '#d4456f' }}>
                  {order.order_status === 'pending' ? 'PENDING' : 'SHIPPED'}
                </div>
                <p className="text-xs text-gray-600 text-center">
                  {order.order_status === 'shipped' 
                    ? `Shipped ${order.shipped_at ? new Date(order.shipped_at).toLocaleDateString() : 'today'}`
                    : 'Awaiting shipment'}
                </p>
              </div>
            </div>

            {/* Shipping Method Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-bold uppercase text-gray-600 mb-4">Shipping</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 text-sm">Method:</span>
                  <span className="font-semibold capitalize">{order.shipping_method}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 text-sm">Cost:</span>
                  <span className="font-semibold">${order.shipping_cost.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Price Summary Card */}
            <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl p-6 shadow-sm border-2" style={{ borderColor: '#f5d5e6' }}>
              <h3 className="text-sm font-bold uppercase text-gray-600 mb-4">Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-700">Subtotal:</span>
                  <span className="font-medium">${order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pb-3 border-b" style={{ borderColor: '#f5d5e6' }}>
                  <span className="text-gray-700">Shipping:</span>
                  <span className="font-medium">${order.shipping_cost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-gray-900 font-bold">TOTAL:</span>
                  <span className="text-2xl font-bold" style={{ color: '#d4456f' }}>
                    ${order.total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Tracking Info */}
            {order.tracking_number && (
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 shadow-sm border-2 border-green-200">
                <h3 className="text-sm font-bold uppercase text-green-900 mb-4">Tracking</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-green-700 text-xs font-semibold mb-1">Carrier</p>
                    <p className="font-bold">{order.carrier}</p>
                  </div>
                  <div>
                    <p className="text-green-700 text-xs font-semibold mb-1">Number</p>
                    <p className="font-mono text-xs">{order.tracking_number}</p>
                  </div>
                  {order.tracking_url && (
                    <a
                      href={order.tracking_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-center mt-3 py-2 rounded-lg font-semibold text-white transition-opacity hover:opacity-90"
                      style={{ backgroundColor: '#047857' }}
                    >
                      Track Package →
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          .print\\:hidden {
            display: none !important;
          }
          
          body {
            background: white;
          }
          
          main {
            background: white;
          }
        }
      `}</style>
    </main>
  )
}
