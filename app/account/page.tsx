'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LogOut } from 'lucide-react'

interface Profile {
  first_name: string
  last_name: string
  email: string
}

interface Order {
  id: string
  order_number: string
  created_at: string
  total: number
  order_status: string
  shipping_method?: string
}

export default function AccountPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !user) {
          router.push('/auth/login')
          return
        }

        // Load profile
        let { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, email, first_name, last_name, role')
          .eq('id', user.id)
          .single()

        // If profile doesn't exist, create it
        if (profileError?.code === 'PGRST116' || (profileError && profileError.message?.includes('No rows'))) {
          const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email || '',
              first_name: '',
              last_name: '',
              role: 'customer',
            })
            .select()
            .single()

          if (insertError) {
            console.error('Profile creation error:', insertError.message)
            setError(`Failed to create profile: ${insertError.message}`)
            return
          }
          profileData = newProfile
        } else if (profileError) {
          console.error('Profile fetch error:', profileError.message)
          setError(`Failed to load profile: ${profileError.message}`)
          return
        }

        setProfile(profileData as Profile)

        // Load orders by customer email — orders store the email directly
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select('id, order_number, created_at, total, order_status, shipping_method')
          .eq('customer_email', profileData?.email || user.email)
          .order('created_at', { ascending: false })

        if (orderError) {
          console.error('Order fetch error:', orderError.message)
        }
        setOrders(orderData || [])
      } catch (err) {
        setError('An error occurred')
        console.error('Account page unexpected error:', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [router])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
        <div className="text-center">
          <p className="text-foreground/60">Loading your profile...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen px-4 py-12 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="text-foreground/60 hover:text-foreground transition-colors">
            Back to home
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-semibold transition-colors hover:bg-gray-100"
            style={{ color: '#ec4899' }}
          >
            <LogOut size={18} />
            Sign out
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1 bg-white rounded-3xl p-8 shadow-sm">
            <h1 className="text-2xl font-bold mb-6" style={{ color: '#ec4899' }}>
              Your Account
            </h1>

            {error ? (
              <div className="text-center py-8">
                <p className="text-red-600">{error}</p>
              </div>
            ) : profile ? (
              <div className="space-y-6">
                {/* Profile Info */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider" style={{ color: '#ec4899' }}>
                    Name
                  </label>
                  <p className="text-lg font-semibold mt-1">{profile.first_name || ''} {profile.last_name || ''}</p>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider" style={{ color: '#ec4899' }}>
                    Email
                  </label>
                  <p className="text-sm font-semibold mt-1 break-all">{profile.email}</p>
                </div>
              </div>
            ) : null}
          </div>

          {/* Orders Card */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#ec4899' }}>
              Order History
            </h2>

            {orders.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-foreground/60 mb-4">No orders yet</p>
                <Link
                  href="/shop/all"
                  className="inline-block px-6 py-2 rounded-2xl text-sm font-semibold text-white"
                  style={{ backgroundColor: '#ec4899' }}
                >
                  Start Shopping
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/account/orders/${order.order_number}`}
                    className="block border-2 border-gray-200 rounded-2xl p-4 hover:border-pink-300 transition-colors"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex-1">
                        <p className="text-sm font-mono text-foreground/60">{order.order_number}</p>
                        <p className="font-semibold mt-1">
                          ${order.total.toFixed(2)}
                        </p>
                        <p className="text-xs text-foreground/60 mt-1">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs px-3 py-1 rounded-full inline-block capitalize" style={{ backgroundColor: '#fbcfe8', color: '#ec4899' }}>
                          {order.order_status}
                        </p>
                        <p className="text-xs text-foreground/60 mt-2">
                          {order.shipping_method === 'express' ? 'Express' : 'Standard'} Shipping
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
