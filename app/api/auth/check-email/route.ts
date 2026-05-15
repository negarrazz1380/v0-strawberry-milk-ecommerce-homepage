import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400 }
      )
    }

    // Create Supabase client with service role key (for server-side only)
    // This bypasses RLS to check if the email exists in profiles
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    // Check if profile with this email exists
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('email', email)
      .single()

    // If no profile found, return error
    if (error || !profile) {
      return new Response(
        JSON.stringify({ 
          exists: false,
          message: "Email not found. Please sign up first." 
        }),
        { status: 200 }
      )
    }

    // Email exists
    return new Response(
      JSON.stringify({ 
        exists: true,
        message: "Email found. Ready to send reset link."
      }),
      { status: 200 }
    )
  } catch (err) {
    console.error('[v0] Error checking email:', err)
    return new Response(
      JSON.stringify({ error: 'An error occurred while checking the email' }),
      { status: 500 }
    )
  }
}
