'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [redirectTo, setRedirectTo] = useState<string | null>(null)

  useEffect(() => {
    // Get redirect parameter or default to /account
    const redirect = searchParams.get('redirect') || '/account'
    setRedirectTo(redirect)
  }, [searchParams])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // Wait a brief moment to ensure Supabase session cookies are flushed to browser
    // This prevents a race condition where middleware checks for session before cookies are set
    await new Promise(resolve => setTimeout(resolve, 100))

    // Redirect to the specified page or default to /account
    router.push(redirectTo || '/account')
  }

  return (
    <>
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
          Welcome back
        </h1>
        <p className="text-sm text-center text-foreground/60 mb-8">Sign in to your CaseKisses account</p>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
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

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-sm font-medium" style={{ color: "#ec4899" }}>
                Password
              </label>
              <Link href="/auth/forgot-password" className="text-xs hover:underline" style={{ color: "#ec4899" }}>
                Forgot password?
              </Link>
            </div>
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
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-sm mt-6 text-foreground/60">
          Don&apos;t have an account?{' '}
          <Link href="/auth/sign-up" className="font-semibold hover:underline" style={{ color: "#ec4899" }}>
            Sign up
          </Link>
        </p>
      </div>
    </>
  )
}
