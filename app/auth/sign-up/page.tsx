'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SignUpPage() {
  const router = useRouter()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      },
    })

    if (error) {
      // Provide user-friendly error message for rate limiting
      if (error.message.includes('rate limit')) {
        setError('Too many attempts. Please wait a few minutes and try again.')
      } else {
        setError(error.message)
      }
      setLoading(false)
      return
    }

    // Small delay to allow Supabase auth cookies to be set before navigating
    await new Promise((resolve) => setTimeout(resolve, 100))
    router.push('/account')
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
            Create an account
          </h1>
          <p className="text-sm text-center text-foreground/60 mb-8">Join CaseKisses and shop cute cases</p>

          <form onSubmit={handleSignUp} className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex flex-col gap-1.5 flex-1">
                <label htmlFor="firstName" className="text-sm font-medium" style={{ color: "#ec4899" }}>
                  First name
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="John"
                  required
                  className="w-full rounded-2xl px-4 py-3 text-sm bg-white border-[1.5px] border-[#fbcfe8] focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div className="flex flex-col gap-1.5 flex-1">
                <label htmlFor="lastName" className="text-sm font-medium" style={{ color: "#ec4899" }}>
                  Last name
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                  required
                  className="w-full rounded-2xl px-4 py-3 text-sm bg-white border-[1.5px] border-[#fbcfe8] focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
            </div>

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
              <label htmlFor="password" className="text-sm font-medium" style={{ color: "#ec4899" }}>
                Password
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
              <label htmlFor="confirm-password" className="text-sm font-medium" style={{ color: "#ec4899" }}>
                Confirm password
              </label>
              <input
                id="confirm-password"
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
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="text-center text-sm mt-6 text-foreground/60">
            Already have an account?{' '}
            <Link href="/auth/login" className="font-semibold hover:underline" style={{ color: "#ec4899" }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
