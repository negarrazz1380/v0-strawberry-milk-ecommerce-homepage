'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Suspense } from 'react'

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [hasSession, setHasSession] = useState(false)
  const [isExpired, setIsExpired] = useState(false)
  const [sessionLoading, setSessionLoading] = useState(true)

  useEffect(() => {
    // Check for error_code=otp_expired in URL immediately
    const errorCode = searchParams.get('error_code')
    if (errorCode === 'otp_expired') {
      setIsExpired(true)
      setSessionLoading(false)
      return
    }

    const supabase = createClient()

    // Listen for PASSWORD_RECOVERY event — fires when verifyOtp establishes the session
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' && session) {
        setHasSession(true)
        setSessionLoading(false)
      }
    })

    // Check if a recovery session already exists (e.g. page refresh after clicking email link)
    const checkExistingSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setHasSession(true)
        setSessionLoading(false)
      } else {
        // No session yet — wait for PASSWORD_RECOVERY event (when user clicks email link)
        // Give it 2 seconds to receive the PASSWORD_RECOVERY event
        setTimeout(() => {
          setSessionLoading(false)
        }, 2000)
      }
    }

    checkExistingSession()

    return () => {
      subscription.unsubscribe()
    }
  }, [searchParams])

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    if (!hasSession) {
      setError('Session expired. Please request a new password reset link.')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // Sign out the recovery session then redirect to login with success message
    const supabaseSignOut = createClient()
    await supabaseSignOut.auth.signOut()
    router.push('/auth/login?message=Password+updated!+Please+sign+in+with+your+new+password.')
  }

  // Show expired error
  if (isExpired) {
    return (
      <main
        className="min-h-screen flex items-center justify-center px-4"
        style={{ background: "#fbcfe8" }}
      >
        <div className="w-full max-w-md">
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

          <div className="bg-white/80 rounded-3xl px-8 py-10 shadow-sm">
            <h1 className="text-2xl font-bold text-center mb-1" style={{ color: "#ec4899", fontFamily: "var(--font-dancing), cursive" }}>
              Link expired
            </h1>

            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center my-6">
              <p className="text-sm font-medium text-red-700 mb-2">
                This reset link expired or was already used.
              </p>
              <p className="text-xs text-red-600">
                Please request a new password reset link.
              </p>
            </div>

            <Link
              href="/auth/forgot-password"
              className="w-full py-3 rounded-2xl text-sm font-semibold text-white transition-opacity hover:opacity-90 block text-center"
              style={{ background: "linear-gradient(135deg, #ec4899, #f472b6)" }}
            >
              Request new reset link
            </Link>

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

  // Show loading state
  if (sessionLoading) {
    return (
      <main
        className="min-h-screen flex items-center justify-center px-4"
        style={{ background: "#fbcfe8" }}
      >
        <div className="w-full max-w-md">
          <div className="bg-white/80 rounded-3xl px-8 py-10 shadow-sm">
            <div className="flex flex-col gap-4">
              <div className="w-24 h-6 bg-white/50 rounded-lg animate-pulse mx-auto" />
              <div className="w-40 h-4 bg-white/50 rounded-lg animate-pulse mx-auto" />
              <div className="w-full h-10 bg-white/50 rounded-2xl animate-pulse" />
              <div className="w-full h-10 bg-white/50 rounded-2xl animate-pulse" />
            </div>
          </div>
        </div>
      </main>
    )
  }

  // Show no session message — user accessed directly without a valid reset link
  // Show friendly page saying "Request a password reset link" with a button to /auth/forgot-password
  if (!hasSession) {
    return (
      <main
        className="min-h-screen flex items-center justify-center px-4"
        style={{ background: "#fbcfe8" }}
      >
        <div className="w-full max-w-md">
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

          <div className="bg-white/80 rounded-3xl px-8 py-10 shadow-sm">
            <h1 className="text-2xl font-bold text-center mb-1" style={{ color: "#ec4899", fontFamily: "var(--font-dancing), cursive" }}>
              Request a password reset link
            </h1>

            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-center my-6">
              <p className="text-sm font-medium text-blue-700 mb-2">
                No reset link found
              </p>
              <p className="text-xs text-blue-600">
                To reset your password, we&apos;ll send a secure link to your email address.
              </p>
            </div>

            <Link
              href="/auth/forgot-password"
              className="w-full py-3 rounded-2xl text-sm font-semibold text-white transition-opacity hover:opacity-90 block text-center"
              style={{ background: "linear-gradient(135deg, #ec4899, #f472b6)" }}
            >
              Send password reset link
            </Link>

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

  // Show reset password form
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
            Create new password
          </h1>
          <p className="text-sm text-center text-foreground/60 mb-8">
            Enter your new password below.
          </p>

          <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-medium" style={{ color: "#ec4899" }}>
                New password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full rounded-2xl px-4 py-3 text-sm bg-white border-[1.5px] border-[#fbcfe8] focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="confirmPassword" className="text-sm font-medium" style={{ color: "#ec4899" }}>
                Confirm password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
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
              {loading ? 'Resetting...' : 'Reset password'}
            </button>
          </form>

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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordContent />
    </Suspense>
  )
}
