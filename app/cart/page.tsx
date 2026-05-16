'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCart } from '@/hooks/use-cart'
import { cartItemKey } from '@/lib/cart-store'

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, total } = useCart()
  const router = useRouter()

  if (items.length === 0) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4" style={{ color: '#ec4899' }}>
            Your cart is empty
          </h1>
          <p className="text-muted-foreground mb-8">Add some cute cases to get started!</p>
          <Link
            href="/"
            className="inline-block px-8 py-3 rounded-2xl font-semibold"
            style={{ backgroundColor: '#ec4899', color: 'white' }}
          >
            Continue Shopping
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-8" style={{ color: '#ec4899' }}>
          Shopping Cart
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const key = cartItemKey(item)
              return (
                <div
                  key={key}
                  className="flex gap-4 p-4 rounded-2xl bg-[#fbcfe8]/10"
                >
                  {item.image_url && (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded-xl"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{item.name}</h3>
                    {item.device_model && (
                      <p className="text-sm text-muted-foreground">{item.device_model}</p>
                    )}
                    <p className="text-sm text-muted-foreground">${item.price.toFixed(2)}</p>
                    <div className="flex items-center gap-2 mt-4">
                      <button
                        onClick={() => updateQuantity(key, item.quantity - 1)}
                        className="px-3 py-1 rounded-lg hover:opacity-70"
                        style={{ backgroundColor: '#fbcfe8' }}
                      >
                        -
                      </button>
                      <span className="px-4">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(key, item.quantity + 1)}
                        className="px-3 py-1 rounded-lg hover:opacity-70"
                        style={{ backgroundColor: '#fbcfe8' }}
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeItem(key)}
                        className="ml-auto text-sm text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-1">
            <div className="p-6 rounded-2xl" style={{ backgroundColor: '#fbcfe8' }}>
              <h2 className="text-xl font-bold mb-4" style={{ color: '#ec4899' }}>
                Order Summary
              </h2>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${total().toFixed(2)}</span>
                </div>
                <div className="border-t border-black/10 pt-3 flex justify-between font-bold">
                  <span>Total:</span>
                  <span>${total().toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={() => router.push('/checkout')}
                className="w-full py-3 rounded-2xl font-bold text-white hover:opacity-90 transition-opacity"
                style={{ backgroundColor: '#ec4899' }}
              >
                Checkout
              </button>
              <button
                onClick={() => router.push('/')}
                className="w-full mt-3 py-2 rounded-2xl text-sm font-semibold hover:opacity-70"
                style={{ backgroundColor: '#ec4899', color: 'white' }}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
