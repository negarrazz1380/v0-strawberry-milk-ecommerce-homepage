import { createClient } from '@/lib/supabase/server'

const RATE_LIMIT = 10
const WINDOW_MS = 60_000

// Best-effort per-instance in-memory rate limiter. Not distributed (resets on
// cold start / differs per serverless instance) but enough to blunt scripted
// enumeration abuse against this public endpoint.
const ipHits = new Map<string, number[]>()

function getClientIp(request: Request): string {
  const xff = request.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0].trim()
  return request.headers.get('x-real-ip') ?? 'unknown'
}

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const hits = (ipHits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS)
  hits.push(now)
  ipHits.set(ip, hits)
  return hits.length > RATE_LIMIT
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request)
    if (isRateLimited(ip)) {
      return new Response(
        JSON.stringify({ error: 'Too many requests. Please try again later.' }),
        { status: 429 }
      )
    }

    const { email } = await request.json()

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400 }
      )
    }

    // Anon-key client — RLS applies. The service role key must never be used
    // in a public, unauthenticated route.
    const supabase = await createClient()

    // Perform the lookup but never leak whether the account exists: returning
    // an identical response in all cases removes the account-enumeration oracle.
    await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single()

    return new Response(
      JSON.stringify({
        message:
          "If an account exists for that email, you'll receive further instructions.",
      }),
      { status: 200 }
    )
  } catch (err) {
    console.error('[check-email] Error checking email:', err)
    return new Response(
      JSON.stringify({ error: 'An error occurred while checking the email' }),
      { status: 500 }
    )
  }
}
