'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useCart } from '@/hooks/use-cart'
import Link from 'next/link'
import { CheckCircle } from 'lucide-react'

interface OrderInfo {
  order_number: string
  customer_name: string
  total: number
}

export function SuccessContent() {
  const searchParams = useSearchParams()
  const { clearCart } = useCart()
  const sessionId = searchParams.get('session_id')
  const [orderInfo, setOrderInfo] = useState<OrderInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const paymentTracked = useRef(false)

  // Fire the TikTok CompletePayment event once per confirmed order, after the
  // order lookup settles so we can include the real total when available.
  useEffect(() => {
    if (!sessionId || loading || paymentTracked.current) return
    paymentTracked.current = true
    window.ttq?.track('CompletePayment', {
      contents: orderInfo
        ? [{ content_id: orderInfo.order_number, content_name: 'Order' }]
        : undefined,
      content_type: 'product',
      value: orderInfo?.total,
      currency: 'CAD',
    })
  }, [sessionId, loading, orderInfo])

  useEffect(() => {
    if (!sessionId) {
      setLoading(false)
      return
    }

    clearCart()

    // Fetch real order number by session ID — retry a few times since the
    // webhook may not have fired yet when Stripe redirects back
    let attempts = 0
    const maxAttempts = 6
    const delay = 1500

    const fetchOrder = async () => {
      attempts++
      try {
        const res = await fetch(`/api/order-by-session?session_id=${sessionId}`)
        if (res.ok) {
          const data = await res.json()
          setOrderInfo(data)
          setLoading(false)
          return
        }
      } catch {
        // ignore fetch error, will retry
      }

      if (attempts < maxAttempts) {
        setTimeout(fetchOrder, delay)
      } else {
        // Give up — show without order number
        setLoading(false)
      }
    }

    setTimeout(fetchOrder, 1000)
  }, [sessionId, clearCart])

  if (!sessionId) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Payment Processing</h1>
          <p className="text-muted-foreground">Please wait...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="mb-6 flex justify-center">
          <CheckCircle size={64} style={{ color: '#ec4899' }} />
        </div>
        <h1 className="text-4xl font-bold mb-2" style={{ color: '#ec4899' }}>
          Order Confirmed!
        </h1>
        <p className="text-muted-foreground mb-2">
          {orderInfo ? `Thank you, ${orderInfo.customer_name.split(' ')[0]}!` : 'Thank you for your purchase'}
        </p>
        <p className="text-sm text-muted-foreground mb-6">
          Your order has been placed successfully. Check your email for a confirmation.
        </p>

        {/* Order number box */}
        <div className="mb-8 p-4 rounded-2xl border-2" style={{ borderColor: '#f5d5e6', backgroundColor: '#fef5f9' }}>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading order details...</p>
          ) : orderInfo ? (
            <>
              <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#d4456f' }}>Order Number</p>
              <p className="text-lg font-mono font-semibold" style={{ color: '#d4456f' }}>{orderInfo.order_number}</p>
              <p className="text-sm text-muted-foreground mt-1">Total: ${orderInfo.total.toFixed(2)}</p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Your order is confirmed. Check your email for your order number.
            </p>
          )}
        </div>

        <Link
          href="/"
          className="inline-block px-8 py-3 rounded-2xl font-semibold text-white"
          style={{ backgroundColor: '#ec4899' }}
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  )
}
