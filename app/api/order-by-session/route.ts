import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get('session_id')

  if (!sessionId) {
    return Response.json({ error: 'Missing session_id' }, { status: 400 })
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('orders')
    .select('order_number, customer_name, total')
    .eq('stripe_session_id', sessionId)
    .single()

  if (error || !data) {
    return Response.json({ error: 'Order not found' }, { status: 404 })
  }

  return Response.json(data)
}
