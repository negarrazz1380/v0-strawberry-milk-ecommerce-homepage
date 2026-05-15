'use client'

import { SHIPPING_RATES, getShippingRegion, getShippingDays } from '@/lib/shipping'

interface ShippingMethodProps {
  country: string
  selectedMethod: 'standard' | 'express'
  onSelect: (method: 'standard' | 'express') => void
  isLoading?: boolean
  onContinue: () => void
}

export function ShippingMethodSelector({
  country,
  selectedMethod,
  onSelect,
  isLoading = false,
  onContinue,
}: ShippingMethodProps) {
  const region = getShippingRegion(country)
  const rates = SHIPPING_RATES[region]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-light mb-2" style={{ fontFamily: 'var(--font-playfair)', color: '#d4456f' }}>
          Choose your delivery 💕
        </h2>
        <p className="text-sm text-gray-600">Select your preferred shipping speed</p>
      </div>

      <div className="space-y-3">
        {/* Standard Shipping */}
        <button
          onClick={() => onSelect('standard')}
          className={`w-full p-5 rounded-3xl border-2 transition-all text-left hover:shadow-md transform hover:scale-102`}
          style={{
            borderColor: selectedMethod === 'standard' ? '#d4456f' : '#f5d5e6',
            backgroundColor: selectedMethod === 'standard' ? '#f9e0eb' : '#ffffff',
          }}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <h3 className="font-semibold text-lg" style={{ color: '#d4456f', fontFamily: 'var(--font-sans)' }}>
                Standard Delivery
              </h3>
              <p className="text-sm text-gray-600 mt-1">Arrives in {rates.standard.days} days</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="font-bold text-lg" style={{ color: '#d4456f' }}>
                {rates.standard.cost === 0 ? 'FREE' : `$${rates.standard.cost.toFixed(2)}`}
              </p>
              <div className="mt-2 flex justify-end">
                <div
                  className="w-6 h-6 rounded-full border-2 flex items-center justify-center"
                  style={{
                    borderColor: selectedMethod === 'standard' ? '#d4456f' : '#e5e7eb',
                    backgroundColor: selectedMethod === 'standard' ? '#d4456f' : 'white',
                  }}
                >
                  {selectedMethod === 'standard' && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </button>

        {/* Express Shipping */}
        <button
          onClick={() => onSelect('express')}
          className={`w-full p-5 rounded-3xl border-2 transition-all text-left hover:shadow-md transform hover:scale-102`}
          style={{
            borderColor: selectedMethod === 'express' ? '#d4456f' : '#f5d5e6',
            backgroundColor: selectedMethod === 'express' ? '#f9e0eb' : '#ffffff',
          }}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-lg" style={{ color: '#d4456f', fontFamily: 'var(--font-sans)' }}>
                  Express Delivery
                </h3>
                <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: '#ffd1dc', color: '#d4456f' }}>
                  ⚡ Faster
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">Arrives faster ({rates.express.days} days)</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="font-bold text-lg" style={{ color: '#d4456f' }}>
                {rates.express.cost === 0 ? 'FREE' : `$${rates.express.cost.toFixed(2)}`}
              </p>
              <div className="mt-2 flex justify-end">
                <div
                  className="w-6 h-6 rounded-full border-2 flex items-center justify-center"
                  style={{
                    borderColor: selectedMethod === 'express' ? '#d4456f' : '#e5e7eb',
                    backgroundColor: selectedMethod === 'express' ? '#d4456f' : 'white',
                  }}
                >
                  {selectedMethod === 'express' && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </button>
      </div>

      <button
        onClick={onContinue}
        disabled={isLoading}
        className="w-full py-3.5 rounded-full font-semibold text-white transition-all hover:shadow-lg disabled:opacity-50 hover:-translate-y-0.5"
        style={{ backgroundColor: '#d4456f', fontFamily: 'var(--font-sans)' }}
      >
        {isLoading ? 'Processing...' : 'Continue to Payment 💳'}
      </button>
    </div>
  )
}
