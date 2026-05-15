import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email || !email.includes('@')) {
      return new Response(
        JSON.stringify({ error: 'Valid email is required' }),
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Subscribe to newsletter
    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert({
        email,
        source: 'footer',
      })

    if (error) {
      if (error.code === '23505') {
        // Duplicate email
        return new Response(
          JSON.stringify({ message: 'Already subscribed' }),
          { status: 200 }
        )
      }
      throw error
    }

    return new Response(
      JSON.stringify({ message: 'Successfully subscribed' }),
      { status: 200 }
    )
  } catch (error) {
    console.error('Newsletter subscribe error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to subscribe' }),
      { status: 500 }
    )
  }
}
