'use client'

import { useEffect, useRef, useState } from 'react'

const STORAGE_KEY = 'ck_popup_dismissed'

export function EmailPopup() {
  const [visible, setVisible] = useState(false)
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    let dismissed = false
    try {
      dismissed = localStorage.getItem(STORAGE_KEY) !== null
    } catch {
      // localStorage unavailable (private mode etc.) — fall through and show
    }
    if (dismissed) return

    timeoutsRef.current.push(setTimeout(() => setVisible(true), 5000))

    return () => {
      timeoutsRef.current.forEach(clearTimeout)
      timeoutsRef.current = []
    }
  }, [])

  const markDismissed = () => {
    try {
      localStorage.setItem(STORAGE_KEY, '1')
    } catch {
      // ignore — popup just won't be permanently suppressed
    }
  }

  const handleClose = () => {
    setVisible(false)
    markDismissed()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (status === 'loading') return
    setStatus('loading')
    setErrorMsg('')

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (res.ok) {
        setStatus('success')
        markDismissed()
        timeoutsRef.current.push(setTimeout(() => setVisible(false), 3000))
        return
      }

      let msg = 'Something went wrong. Please try again.'
      try {
        const data = await res.json()
        if (data?.error) msg = data.error
      } catch {
        // non-JSON error body — keep the generic message
      }
      setStatus('error')
      setErrorMsg(msg)
    } catch {
      setStatus('error')
      setErrorMsg('Something went wrong. Please try again.')
    }
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Get 10% off your first order"
      className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/60"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-md rounded-3xl bg-white px-8 py-10 text-center shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close"
          className="absolute right-4 top-4 text-gray-400 transition-colors hover:text-[#ec4899]"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>

        {status === 'success' ? (
          <p className="py-6 text-lg font-semibold" style={{ color: '#ec4899' }}>
            you&apos;re in! check your email for your code 🎀
          </p>
        ) : (
          <>
            <h2 className="mb-2 text-2xl font-bold" style={{ color: '#ec4899' }}>
              get 10% off your first order 🎀
            </h2>
            <p className="mb-6 text-sm text-gray-600">
              join the case kisses fam and be the first to know about new drops
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                aria-label="Email address"
                className="w-full rounded-2xl border-2 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                style={{ borderColor: '#fbcfe8' }}
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full rounded-2xl py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                style={{ backgroundColor: '#ec4899' }}
              >
                {status === 'loading' ? 'submitting…' : 'claim my discount'}
              </button>
              {status === 'error' && (
                <p className="text-xs text-red-600">{errorMsg}</p>
              )}
            </form>
          </>
        )}
      </div>
    </div>
  )
}
