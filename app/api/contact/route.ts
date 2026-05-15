import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, subject, message } = body

    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ error: 'Name, email, and message are required' }),
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Save contact message to Supabase (subject not stored in DB)
    const { error: dbError } = await supabase
      .from('contact_messages')
      .insert({
        name,
        email,
        message,
        status: 'new',
      })

    if (dbError) {
      console.error('Database error:', dbError)
      return new Response(
        JSON.stringify({ error: `Failed to save message: ${dbError.message || 'Database error'}` }),
        { status: 500 }
      )
    }

    // Send email to support
    try {
      await sendEmail({
        name,
        email,
        subject: subject || 'No subject',
        message,
      })
    } catch (emailError) {
      console.error('Contact email error:', emailError)
      return new Response(
        JSON.stringify({ error: 'Message saved but failed to send email notification' }),
        { status: 500 }
      )
    }

    return new Response(
      JSON.stringify({ message: 'Message sent successfully' }),
      { status: 200 }
    )
  } catch (error) {
    console.error('Contact form error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to send message' }),
      { status: 500 }
    )
  }
}
