'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/hooks/use-cart'
import { cartItemKey } from '@/lib/cart-store'
import { X, ShoppingBag, Plus, Minus } from 'lucide-react'

export function CartDrawer() {
  const router = useRouter()
  const { items, drawerOpen, setDrawerOpen, removeItem, updateQuantity, total } = useCart()
  const [loading, setLoading] = useState(false)
  const isNavigating = useRef(false)

  // Reset loading whenever the drawer opens so it never reopens stuck on "Processing..."
  useEffect(() => {
    if (drawerOpen) {
      setLoading(false)
      isNavigating.current = false
    }
  }, [drawerOpen])

  // Reset loading when items change (add or remove) so state never stays stuck
  useEffect(() => {
    setLoading(false)
    isNavigating.current = false
  }, [items.length])

  const handleCheckout = () => {
    // Guard against duplicate taps
    if (isNavigating.current || loading) return
    isNavigating.current = true
    setLoading(true)
    setDrawerOpen(false)
    try {
      router.replace('/checkout')
    } catch {
      // Navigation failed — reset so the button is usable again
      setLoading(false)
      isNavigating.current = false
    }
  }

  if (!drawerOpen) return null

  return (
    <div className="fixed right-0 top-0 h-screen w-full max-w-md bg-white z-50 shadow-lg flex flex-col transition-transform duration-300 ease-out" style={{ transform: drawerOpen ? 'translateX(0)' : 'translateX(100%)' }}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <ShoppingBag size={20} style={{ color: '#d4456f' }} />
          <h2 className="text-lg font-semibold" style={{ color: '#d4456f' }}>
            Your Cart
          </h2>
        </div>
        <button
          onClick={() => setDrawerOpen(false)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">Your cart is empty</p>
            <button
              onClick={() => {
                setDrawerOpen(false)
                router.push('/')
              }}
              className="text-sm font-semibold rounded-full px-4 py-2 text-white"
              style={{ backgroundColor: '#d4456f' }}
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          items.map((item) => {
            const key = cartItemKey(item)
            return (
              <div
                key={key}
                className="flex gap-3 p-3 rounded-2xl"
                style={{ backgroundColor: '#f5d5e6' }}
              >
                {item.image_url && (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-xl flex-shrink-0"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-sm">{item.name}</h3>
                  {item.device_model && (
                    <p className="text-xs text-gray-500 mb-1">{item.device_model}</p>
                  )}
                  <p className="text-sm text-gray-600 mb-2">${item.price.toFixed(2)}</p>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(key, item.quantity - 1)}
                      className="p-1 rounded-lg hover:opacity-70 transition-opacity"
                      style={{ backgroundColor: '#fbcfe8' }}
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(key, item.quantity + 1)}
                      className="p-1 rounded-lg hover:opacity-70 transition-opacity"
                      style={{ backgroundColor: '#fbcfe8' }}
                    >
                      <Plus size={14} />
                    </button>
                    <button
                      onClick={() => removeItem(key)}
                      className="ml-auto text-xs text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Summary & Checkout */}
      {items.length > 0 && (
        <div className="border-t border-gray-200 p-4 space-y-4">
          {/* Subtotal */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-semibold">${total().toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-bold border-t pt-2">
              <span>Total:</span>
              <span style={{ color: '#d4456f' }}>${total().toFixed(2)}</span>
            </div>
          </div>

          {/* Buttons */}
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full py-3 rounded-full font-semibold text-white hover:shadow-lg transition-shadow disabled:opacity-50"
            style={{ backgroundColor: '#d4456f' }}
          >
            {loading ? 'Processing...' : 'Checkout'}
          </button>
          <button
            onClick={() => setDrawerOpen(false)}
            className="w-full py-2 rounded-full font-semibold hover:opacity-70 transition-opacity border-2"
            style={{ borderColor: '#d4456f', color: '#d4456f' }}
          >
            Continue Shopping
          </button>
        </div>
      )}
    </div>
  )
}
