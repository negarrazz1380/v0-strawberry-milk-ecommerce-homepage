import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  // Check if user is logged in
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Get user profile to check if admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  // If user is not admin, show unauthorized page
  if (!profile || profile.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md">
          <h1 className="text-4xl font-bold mb-4" style={{ color: '#d4456f' }}>
            Unauthorized
          </h1>
          <p className="text-gray-600 mb-8">
            You do not have access to the admin panel. Contact support if you believe this is an error.
          </p>
          <a
            href="/"
            className="inline-block px-6 py-3 rounded-full font-semibold transition-colors"
            style={{ backgroundColor: '#d4456f', color: 'white' }}
          >
            Back to Home
          </a>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
