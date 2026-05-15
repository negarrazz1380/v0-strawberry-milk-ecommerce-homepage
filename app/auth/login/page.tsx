'use client'

import { Suspense } from 'react'
import { LoginForm } from './LoginForm'

export default function LoginPage() {
  return (
    <main
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "#fbcfe8" }}
    >
      <div className="w-full max-w-md">
        <Suspense fallback={<LoginLoadingPlaceholder />}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  )
}

function LoginLoadingPlaceholder() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col items-center mb-8 gap-3">
        <div className="w-48 h-12 bg-white/50 rounded-lg animate-pulse" />
        <div className="w-32 h-4 bg-white/50 rounded-lg animate-pulse" />
      </div>
      <div className="bg-white/80 rounded-3xl px-8 py-10 shadow-sm flex flex-col gap-4">
        <div className="w-24 h-6 bg-white/50 rounded-lg animate-pulse mx-auto" />
        <div className="w-40 h-4 bg-white/50 rounded-lg animate-pulse mx-auto" />
        <div className="flex flex-col gap-3">
          <div className="w-full h-10 bg-white/50 rounded-2xl animate-pulse" />
          <div className="w-full h-10 bg-white/50 rounded-2xl animate-pulse" />
        </div>
      </div>
    </div>
  )
}

