'use client'

import { useCart } from '@/hooks/use-cart'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { CustomerInfoForm, type CustomerInfo } from '@/components/customer-info-form'
import { ShippingMethodSelector } from '@/components/shipping-method-selector'
import { getShippingCost } from '@/lib/shipping'

type CheckoutStep = 'customer' | 'shipping' | 'payment'

interface CheckoutState {
  customerInfo?: CustomerInfo
  shippingMethod?: 'standard' | 'express'
  shippingCost?: number
}

export default function CheckoutPage() {
  const { items, total } = useCart()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('customer')
  const [checkoutState, setCheckoutState] = useState<CheckoutState>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')

  if (items.length === 0) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4" style={{ backgroundColor: '#fef5f9' }}>
        <div className="text-center">
          <h1 className="text-4xl font-light mb-4" style={{ fontFamily: 'var(--font-playfair)', color: '#d4456f' }}>
            Your cart is empty
          </h1>
          <p className="text-gray-600 mb-8 font-light">Add some cute cases to get started!</p>
          <button
            onClick={() => router.push('/')}
            className="inline-block px-8 py-3 rounded-full font-semibold text-white transition-all hover:shadow-lg hover:-translate-y-0.5"
            style={{ backgroundColor: '#d4456f', fontFamily: 'var(--font-sans)' }}
          >
            Continue Shopping
          </button>
        </div>
      </main>
    )
  }

  const handleCustomerInfo = async (info: CustomerInfo) => {
    try {
      setLoading(true)
      setError('')
      setCheckoutState(prev => ({ ...prev, customerInfo: info }))
      setCurrentStep('shipping')
    } catch (err) {
      setError('Failed to save customer information')
      console.error('Customer info error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleShippingMethod = async (method: 'standard' | 'express') => {
    try {
      setLoading(true)
      setError('')
      const cost = getShippingCost(checkoutState.customerInfo?.shippingCountry || 'US', method)
      setCheckoutState(prev => ({ ...prev, shippingMethod: method, shippingCost: cost }))
      setCurrentStep('payment')
    } catch (err) {
      setError('Failed to select shipping method')
      console.error('Shipping method error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handlePayment = async () => {
    try {
      setLoading(true)
      setError('')

      if (!checkoutState.customerInfo || !checkoutState.shippingMethod) {
        setError('Missing checkout information')
        return
      }

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items,
          customerInfo: checkoutState.customerInfo,
          shippingMethod: checkoutState.shippingMethod,
          shippingCost: checkoutState.shippingCost,
        }),
      })

      const data = await response.json()

      if (data.error) {
        setError(data.error)
        return
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch (err) {
      setError('Failed to process payment')
      console.error('Payment error:', err)
    } finally {
      setLoading(false)
    }
  }

  const subtotal = total()
  const shippingCost = checkoutState.shippingCost || 0
  const finalTotal = subtotal + shippingCost

  return (
    <main className="min-h-screen py-8 md:py-16" style={{ backgroundColor: '#fef5f9' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 md:mb-12">
          <button
            onClick={() => router.push('/')}
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors mb-8 font-light"
          >
            ← Back to shopping
          </button>

          {/* Progress Indicator */}
          <div>
            <div className="flex items-center gap-2 md:gap-4">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-white"
                style={{
                  backgroundColor: currentStep === 'customer' || currentStep === 'shipping' || currentStep === 'payment' ? '#d4456f' : '#ddd',
                }}
              >
                1
              </div>
              <div className="flex-1 h-0.5" style={{ backgroundColor: currentStep === 'shipping' || currentStep === 'payment' ? '#d4456f' : '#e5e7eb' }}></div>
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-white"
                style={{
                  backgroundColor: currentStep === 'shipping' || currentStep === 'payment' ? '#d4456f' : '#ddd',
                }}
              >
                2
              </div>
              <div className="flex-1 h-0.5" style={{ backgroundColor: currentStep === 'payment' ? '#d4456f' : '#e5e7eb' }}></div>
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-white"
                style={{
                  backgroundColor: currentStep === 'payment' ? '#d4456f' : '#ddd',
                }}
              >
                3
              </div>
            </div>
            <div className="flex justify-between text-xs text-gray-600 mt-3">
              <span>Information</span>
              <span>Shipping</span>
              <span>Payment</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Main Form - 2 columns on large screens */}
          <div className="lg:col-span-2 bg-white p-8 md:p-10 rounded-3xl shadow-sm">
            {error && (
              <div className="mb-6 p-4 rounded-2xl text-sm" style={{ backgroundColor: '#fee2e2', color: '#991b1b' }}>
                {error}
              </div>
            )}

            {currentStep === 'customer' && (
              <CustomerInfoForm onSubmit={handleCustomerInfo} isLoading={loading} />
            )}

            {currentStep === 'shipping' && checkoutState.customerInfo && (
              <div className="space-y-6">
                <div className="p-4 rounded-2xl text-sm" style={{ backgroundColor: '#f9e0eb' }}>
                  <p>
                    <strong style={{ color: '#d4456f' }}>Ship to:</strong> <span className="text-gray-700">{checkoutState.customerInfo.firstName} {checkoutState.customerInfo.lastName}</span>
                  </p>
                  <p className="text-gray-700 text-xs mt-1 leading-relaxed">
                    {checkoutState.customerInfo.shippingAddress}
                    {checkoutState.customerInfo.shippingApartment && ` ${checkoutState.customerInfo.shippingApartment}`}
                    <br />
                    {checkoutState.customerInfo.shippingCity}, {checkoutState.customerInfo.shippingState} {checkoutState.customerInfo.shippingPostalCode}
                  </p>
                </div>
                <ShippingMethodSelector
                  country={checkoutState.customerInfo.shippingCountry}
                  selectedMethod={checkoutState.shippingMethod || 'standard'}
                  onSelect={handleShippingMethod}
                  isLoading={loading}
                  onContinue={() => {}}
                />
              </div>
            )}

            {currentStep === 'payment' && checkoutState.customerInfo && (
              <div className="space-y-8">
                {/* Order Review */}
                <div>
                  <h2 className="text-2xl font-light mb-6" style={{ fontFamily: 'var(--font-playfair)', color: '#d4456f' }}>
                    Order Review
                  </h2>

                  {/* Address */}
                  <div className="mb-6">
                    <h3 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#d4456f' }}>Ship to</h3>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {checkoutState.customerInfo.firstName} {checkoutState.customerInfo.lastName}<br />
                      {checkoutState.customerInfo.shippingAddress}
                      {checkoutState.customerInfo.shippingApartment && ` ${checkoutState.customerInfo.shippingApartment}`}
                      <br />
                      {checkoutState.customerInfo.shippingCity}, {checkoutState.customerInfo.shippingState} {checkoutState.customerInfo.shippingPostalCode}<br />
                      {checkoutState.customerInfo.shippingCountry}
                    </p>
                  </div>

                  {/* Contact */}
                  <div className="mb-6 pb-6 border-b border-gray-200">
                    <h3 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#d4456f' }}>Contact</h3>
                    <p className="text-sm text-gray-700">{checkoutState.customerInfo.email}</p>
                    {checkoutState.customerInfo.phone && (
                      <p className="text-sm text-gray-700">{checkoutState.customerInfo.phone}</p>
                    )}
                  </div>

                  {/* Shipping Method */}
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#d4456f' }}>Shipping Method</h3>
                    <p className="text-sm text-gray-700">
                      {checkoutState.shippingMethod === 'standard' ? 'Standard' : 'Express'} Shipping — ${checkoutState.shippingCost?.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={handlePayment}
                    disabled={loading}
                    className="w-full py-3.5 rounded-full font-semibold text-white transition-all hover:shadow-lg disabled:opacity-50 hover:-translate-y-0.5"
                    style={{ backgroundColor: '#d4456f', fontFamily: 'var(--font-sans)' }}
                  >
                    {loading ? 'Processing...' : 'Proceed to Payment 💳'}
                  </button>

                  <button
                    onClick={() => setCurrentStep('shipping')}
                    className="w-full py-2.5 rounded-full text-sm font-semibold transition-all hover:shadow-md"
                    style={{ backgroundColor: '#f5d5e6', color: '#d4456f', fontFamily: 'var(--font-sans)' }}
                  >
                    Back to Shipping
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="p-6 md:p-8 rounded-3xl bg-white shadow-sm sticky top-8">
              <h2 className="text-xl font-light mb-6" style={{ fontFamily: 'var(--font-playfair)', color: '#d4456f' }}>
                Order Summary
              </h2>

              <div className="space-y-3 mb-6">
                <div className="space-y-2">
                  {items.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-700">{item.name} × {item.quantity}</span>
                      <span className="font-medium text-gray-900">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 pt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Subtotal</span>
                    <span className="font-medium text-gray-900">${subtotal.toFixed(2)}</span>
                  </div>
                  {currentStep !== 'customer' && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700">Shipping</span>
                      <span className="font-medium text-gray-900">
                        {shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}
                      </span>
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-200 pt-3 flex justify-between">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="font-bold text-lg" style={{ color: '#d4456f' }}>
                    ${(currentStep === 'customer' ? subtotal : finalTotal).toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                onClick={() => router.push('/cart')}
                className="w-full py-2.5 rounded-full text-sm font-semibold transition-all hover:shadow-md"
                style={{ backgroundColor: '#f5d5e6', color: '#d4456f', fontFamily: 'var(--font-sans)' }}
              >
                Edit Cart
              </button>

              {/* Trust Badge */}
              <div className="mt-6 pt-6 border-t border-gray-200 text-center text-xs">
                <p className="text-gray-600 leading-relaxed">
                  🔒 Secure checkout powered by Stripe
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
