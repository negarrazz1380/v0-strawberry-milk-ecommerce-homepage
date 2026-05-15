import Link from 'next/link'

export default function SignUpSuccessPage() {
  return (
    <main
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: '#F5A8C2' }}
    >
      <div className="w-full max-w-md">
        <div className="bg-white/80 rounded-3xl px-8 py-12 shadow-sm flex flex-col items-center text-center gap-4">
          <span className="text-5xl">💌</span>
          <h1
            className="text-3xl font-bold"
            style={{ color: '#dc2626', fontFamily: 'var(--font-dancing), cursive' }}
          >
            Check your inbox
          </h1>
          <p className="text-sm text-foreground/60 leading-relaxed">
            We sent a confirmation link to your email. Click it to activate your account and start shopping.
          </p>
          <Link
            href="/auth/login"
            className="mt-4 px-8 py-3 rounded-2xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #dc2626, #ef4444)' }}
          >
            Back to sign in
          </Link>
        </div>
      </div>
    </main>
  )
}
