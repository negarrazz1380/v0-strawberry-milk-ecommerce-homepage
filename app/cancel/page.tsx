'use client'

import Link from 'next/link'

export default function CancelPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
            style={{ backgroundColor: '#f97316' }}
          >
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-4xl font-bold mb-2" style={{ color: '#ec4899' }}>
          Payment Cancelled
        </h1>
        <p className="text-muted-foreground mb-8">
          Your payment was cancelled. No charges were made to your account.
        </p>

        <Link
          href="/cart"
          className="inline-block px-8 py-3 rounded-2xl font-semibold text-white mr-4"
          style={{ backgroundColor: '#ec4899' }}
        >
          Back to Cart
        </Link>
        <Link
          href="/"
          className="inline-block px-8 py-3 rounded-2xl font-semibold text-white"
          style={{ backgroundColor: '#ec4899' }}
        >
          Continue Shopping
        </Link>
      </div>
    </main>
  )
}
