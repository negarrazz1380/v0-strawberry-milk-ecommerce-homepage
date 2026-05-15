import { createClient } from '@/lib/supabase/server'
import { AdminOrdersTable } from '@/components/admin-orders-table'

export default async function AdminOrdersPage() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('orders')
    .select('id, order_number, customer_name, customer_email, phone, total, order_status, created_at')
    .order('created_at', { ascending: false })

  const orders = data ?? []

  return (
    <main className="min-h-screen px-4 py-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-light mb-1" style={{ fontFamily: 'var(--font-playfair)', color: '#d4456f' }}>
            Orders
          </h1>
          <p className="text-sm text-gray-600">{orders.length} total order{orders.length !== 1 ? 's' : ''}</p>
        </div>

        <AdminOrdersTable orders={orders} />
      </div>
    </main>
  )
}
