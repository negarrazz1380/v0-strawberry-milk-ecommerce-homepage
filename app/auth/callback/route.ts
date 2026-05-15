import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get('code')
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? '/account'

  // Handle error params first (e.g. otp_expired from Supabase)
  const errorParam = searchParams.get('error')
  const errorCode = searchParams.get('error_code')
  if (errorParam || errorCode) {
    return NextResponse.redirect(
      `${origin}/auth/reset-password?error=${errorParam ?? ''}&error_code=${errorCode ?? ''}`
    )
  }

  const supabase = await createClient()

  // Token hash flow — used by password recovery emails
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: type as any })
    if (!error) {
      // Always send recovery type back to reset-password form, not /account
      if (type === 'recovery') {
        return NextResponse.redirect(`${origin}/auth/reset-password`)
      }
      return NextResponse.redirect(`${origin}${next}`)
    }
    // OTP verify failed — link expired or already used
    return NextResponse.redirect(
      `${origin}/auth/reset-password?error=access_denied&error_code=otp_expired`
    )
  }

  // PKCE code flow — used by email confirmation and OAuth
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/error`)
}

