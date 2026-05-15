'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [noAccountError, setNoAccountError] = useState(false)

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)
    setNoAccountError(false)

    try {
      // First, check if email exists in profiles using server API
      const checkResponse = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const checkData = await checkResponse.json()

      // If email doesn't exist, show error with sign-up option
      if (!checkData.exists) {
        setNoAccountError(true)
        setEmail('')
        setLoading(false)
        return
      }

      // Email exists, proceed with password reset
      const supabase = createClient()
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }

      setSuccess(true)
      setEmail('')
      setLoading(false)
    } catch (err) {
      console.error('[v0] Unexpected error:', err)
      setError('An unexpected error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "#fbcfe8" }}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <Link href="/">
            <span
              className="text-5xl font-bold select-none"
              style={{
                background: "linear-gradient(135deg, #ec4899 0%, #f472b6 50%, #fbcfe8 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                fontFamily: "var(--font-dancing), cursive",
                lineHeight: "1.4",
                display: "inline-block",
              }}
            >
              CaseKisses
            </span>
          </Link>
          <p
            className="text-xs font-bold tracking-widest uppercase mt-1"
            style={{ color: "#ec4899", letterSpacing: "0.1em", fontFamily: "'Fredoka', sans-serif" }}
          >
            cute cases. cute prices.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/80 rounded-3xl px-8 py-10 shadow-sm">
          <h1 className="text-2xl font-bold text-center mb-1" style={{ color: "#ec4899", fontFamily: "var(--font-dancing), cursive" }}>
            Reset password
          </h1>
          <p className="text-sm text-center text-foreground/60 mb-8">
            Enter your email address and we&apos;ll send you a link to reset your password.
          </p>

          {success ? (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
              <p className="text-sm font-medium text-green-700 mb-3">
                Check your email!
              </p>
              <p className="text-xs text-green-600 mb-4">
                We&apos;ve sent a password reset link to {email}. Check your inbox and follow the link to reset your password.
              </p>
              <Link href="/auth/login" className="text-sm font-semibold hover:underline" style={{ color: "#ec4899" }}>
                Back to login
              </Link>
            </div>
          ) : noAccountError ? (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center">
              <p className="text-sm font-medium text-red-700 mb-3">
                Account not found
              </p>
              <p className="text-xs text-red-600 mb-4">
                You don&apos;t have an account with us. Please sign up first.
              </p>
              <div className="flex flex-col gap-2">
                <Link 
                  href="/auth/sign-up" 
                  className="text-sm font-semibold rounded-2xl py-2 px-4 text-white transition-opacity hover:opacity-90"
                  style={{ background: "linear-gradient(135deg, #ec4899, #f472b6)", display: "block" }}
                >
                  Sign up now
                </Link>
                <button
                  onClick={() => setNoAccountError(false)}
                  className="text-sm font-semibold hover:underline"
                  style={{ color: "#ec4899" }}
                >
                  Try another email
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleForgotPassword} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-sm font-medium" style={{ color: "#ec4899" }}>
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full rounded-2xl px-4 py-3 text-sm bg-white border-[1.5px] border-[#fbcfe8] focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              {error && (
                <p className="text-xs text-center rounded-xl py-2 px-3 bg-pink-50 text-pink-600">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-2xl text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60 mt-2"
                style={{ background: "linear-gradient(135deg, #ec4899, #f472b6)" }}
              >
                {loading ? 'Sending...' : 'Send reset link'}
              </button>
            </form>
          )}

          <p className="text-center text-sm mt-6 text-foreground/60">
            Remember your password?{' '}
            <Link href="/auth/login" className="font-semibold hover:underline" style={{ color: "#ec4899" }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
