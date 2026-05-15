'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CountrySelector } from '@/components/country-selector'

export interface CustomerInfo {
  email: string
  firstName: string
  lastName: string
  phone?: string
  shippingCountry: string
  shippingAddress: string
  shippingApartment?: string
  shippingCity: string
  shippingState: string
  shippingPostalCode: string
  marketingConsent: boolean
}

interface CustomerFormProps {
  onSubmit: (info: CustomerInfo) => void
  isLoading?: boolean
}

export function CustomerInfoForm({ onSubmit, isLoading = false }: CustomerFormProps) {
  const [formData, setFormData] = useState<CustomerInfo>({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    shippingCountry: 'US',
    shippingAddress: '',
    shippingApartment: '',
    shippingCity: '',
    shippingState: '',
    shippingPostalCode: '',
    marketingConsent: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saveError, setSaveError] = useState<string>('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.email) newErrors.email = 'Email is required'
    if (!formData.firstName) newErrors.firstName = 'First name is required'
    if (!formData.lastName) newErrors.lastName = 'Last name is required'
    if (!formData.shippingAddress) newErrors.shippingAddress = 'Address is required'
    if (!formData.shippingCity) newErrors.shippingCity = 'City is required'
    if (!formData.shippingPostalCode) newErrors.shippingPostalCode = 'Postal code is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    try {
      setSaveError('')
      // Save to Supabase checkout_customers table
      const supabase = createClient()
      const { error } = await supabase
        .from('checkout_customers')
        .upsert(
          {
            email: formData.email,
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone: formData.phone,
            country: formData.shippingCountry,
            address_line1: formData.shippingAddress,
            address_line2: formData.shippingApartment,
            city: formData.shippingCity,
            state_province: formData.shippingState,
            postal_code: formData.shippingPostalCode,
            marketing_consent: formData.marketingConsent,
          },
          { onConflict: 'email' }
        )

      if (error) {
        console.error('[v0] Supabase error:', error)
        setSaveError(`Failed to save customer info: ${error.message}`)
        // Don't block checkout - still call onSubmit
      }

      onSubmit(formData)
    } catch (err) {
      console.error('[v0] Failed to save customer info:', err)
      setSaveError('Failed to save customer information')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-3xl font-light mb-2" style={{ fontFamily: 'var(--font-playfair)', color: '#d4456f' }}>
          Where should we send your order? 💌
        </h2>
        <p className="text-sm text-gray-600">Fill in your details below</p>
      </div>

      {saveError && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200">
          <p className="text-sm text-red-700">{saveError}</p>
        </div>
      )}

      {/* Contact Section */}
      <div className="space-y-4 pt-2">
        <h3 className="font-semibold text-xs uppercase tracking-widest" style={{ color: '#d4456f', letterSpacing: '0.08em' }}>
          Contact Information
        </h3>

        <div>
          <label className="block text-xs font-semibold mb-2" style={{ color: '#d4456f' }}>
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@example.com"
            className="w-full px-5 py-3 rounded-full border-2 bg-white transition-all focus:outline-none focus:shadow-md"
            style={{
              borderColor: errors.email ? '#ef4444' : '#f5d5e6',
              fontFamily: 'var(--font-sans)',
            }}
          />
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold mb-2" style={{ color: '#d4456f' }}>
              First Name
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Jane"
              className="w-full px-5 py-3 rounded-full border-2 bg-white transition-all focus:outline-none focus:shadow-md"
              style={{
                borderColor: errors.firstName ? '#ef4444' : '#f5d5e6',
                fontFamily: 'var(--font-sans)',
              }}
            />
            {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold mb-2" style={{ color: '#d4456f' }}>
              Last Name
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Doe"
              className="w-full px-5 py-3 rounded-full border-2 bg-white transition-all focus:outline-none focus:shadow-md"
              style={{
                borderColor: errors.lastName ? '#ef4444' : '#f5d5e6',
                fontFamily: 'var(--font-sans)',
              }}
            />
            {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold mb-2" style={{ color: '#d4456f' }}>
            Phone (Optional)
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+1 (555) 000-0000"
            className="w-full px-5 py-3 rounded-full border-2 bg-white transition-all focus:outline-none focus:shadow-md"
            style={{
              borderColor: '#f5d5e6',
              fontFamily: 'var(--font-sans)',
            }}
          />
        </div>
      </div>

      {/* Shipping Address Section */}
      <div className="space-y-4 pt-2 border-t border-gray-200">
        <div className="pt-2">
          <h3 className="font-semibold text-xs uppercase tracking-widest" style={{ color: '#d4456f', letterSpacing: '0.08em' }}>
            Shipping Address
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
          <label className="block text-xs font-semibold mb-2" style={{ color: '#d4456f' }}>
            Country
          </label>
          <CountrySelector
            value={formData.shippingCountry}
            onChange={(country) => {
              setFormData(prev => ({ ...prev, shippingCountry: country }))
              if (errors.shippingCountry) {
                setErrors(prev => ({ ...prev, shippingCountry: '' }))
              }
            }}
            name="shippingCountry"
          />
          </div>

          <div className="col-span-2">
            <label className="block text-xs font-semibold mb-2" style={{ color: '#d4456f' }}>
              Address
            </label>
            <input
              type="text"
              name="shippingAddress"
              value={formData.shippingAddress}
              onChange={handleChange}
              placeholder="123 Main Street"
              className="w-full px-5 py-3 rounded-full border-2 bg-white transition-all focus:outline-none focus:shadow-md"
              style={{
                borderColor: errors.shippingAddress ? '#ef4444' : '#f5d5e6',
                fontFamily: 'var(--font-sans)',
              }}
            />
            {errors.shippingAddress && <p className="text-xs text-red-500 mt-1">{errors.shippingAddress}</p>}
          </div>

          <div className="col-span-2">
            <label className="block text-xs font-semibold mb-2" style={{ color: '#d4456f' }}>
              Apartment, Suite, etc. (Optional)
            </label>
            <input
              type="text"
              name="shippingApartment"
              value={formData.shippingApartment}
              onChange={handleChange}
              placeholder="Apt. 42"
              className="w-full px-5 py-3 rounded-full border-2 bg-white transition-all focus:outline-none focus:shadow-md"
              style={{
                borderColor: '#f5d5e6',
                fontFamily: 'var(--font-sans)',
              }}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-2" style={{ color: '#d4456f' }}>
              City
            </label>
            <input
              type="text"
              name="shippingCity"
              value={formData.shippingCity}
              onChange={handleChange}
              placeholder="Los Angeles"
              className="w-full px-5 py-3 rounded-full border-2 bg-white transition-all focus:outline-none focus:shadow-md"
              style={{
                borderColor: errors.shippingCity ? '#ef4444' : '#f5d5e6',
                fontFamily: 'var(--font-sans)',
              }}
            />
            {errors.shippingCity && <p className="text-xs text-red-500 mt-1">{errors.shippingCity}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold mb-2" style={{ color: '#d4456f' }}>
              State/Province
            </label>
            <input
              type="text"
              name="shippingState"
              value={formData.shippingState}
              onChange={handleChange}
              placeholder="CA"
              className="w-full px-5 py-3 rounded-full border-2 bg-white transition-all focus:outline-none focus:shadow-md"
              style={{
                borderColor: '#f5d5e6',
                fontFamily: 'var(--font-sans)',
              }}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-2" style={{ color: '#d4456f' }}>
              Postal Code
            </label>
            <input
              type="text"
              name="shippingPostalCode"
              value={formData.shippingPostalCode}
              onChange={handleChange}
              placeholder="90210"
              className="w-full px-5 py-3 rounded-full border-2 bg-white transition-all focus:outline-none focus:shadow-md"
              style={{
                borderColor: errors.shippingPostalCode ? '#ef4444' : '#f5d5e6',
                fontFamily: 'var(--font-sans)',
              }}
            />
            {errors.shippingPostalCode && <p className="text-xs text-red-500 mt-1">{errors.shippingPostalCode}</p>}
          </div>
        </div>
      </div>

      {/* Marketing Consent */}
      <div className="flex items-start gap-3 pt-2">
        <input
          type="checkbox"
          name="marketingConsent"
          id="marketing"
          checked={formData.marketingConsent}
          onChange={handleChange}
          className="w-5 h-5 rounded-md cursor-pointer mt-0.5"
          style={{ accentColor: '#d4456f' }}
        />
        <label htmlFor="marketing" className="text-xs text-gray-700 cursor-pointer leading-relaxed">
          Send me cute updates and special offers (optional)
        </label>
      </div>

      {/* Trust Badge */}
      <div className="mt-6 p-4 rounded-2xl text-center" style={{ backgroundColor: '#f5d5e6' }}>
        <p className="text-xs font-semibold" style={{ color: '#d4456f' }}>
          🔒 Secure checkout
        </p>
        <p className="text-xs text-gray-700 mt-1 leading-relaxed">
          We&apos;ll send your order confirmation by email 💌
        </p>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3.5 rounded-full font-semibold text-white transition-all hover:shadow-lg disabled:opacity-50 hover:-translate-y-0.5"
        style={{ backgroundColor: '#d4456f', fontFamily: 'var(--font-sans)' }}
      >
        {isLoading ? 'Saving...' : 'Continue to Shipping 💕'}
      </button>
    </form>
  )
}
