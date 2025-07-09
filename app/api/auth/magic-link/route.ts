import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    
    // Get the origin from the request headers
    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'
    
    // Extract locale from referer header with fallback
    const referer = req.headers.get('referer') || ''
    let locale = 'en' // default locale
    
    // Try to extract locale from referer URL
    if (referer) {
      const refererUrl = new URL(referer)
      const pathSegments = refererUrl.pathname.split('/')
      const possibleLocale = pathSegments[1]
      // Validate if it's a valid locale (2-letter code)
      if (possibleLocale && /^[a-z]{2}$/.test(possibleLocale)) {
        locale = possibleLocale
      }
    }
    
    // Construct the redirect URL
    const redirectUrl = `${origin}/${locale}/auth/callback`
    
    console.log('Magic link redirect URL:', redirectUrl)
    console.log('Origin:', origin)
    console.log('Locale:', locale)
    
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectUrl,
      }
    })

    if (error) {
      console.error('Supabase auth error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ 
      success: true,
      redirectUrl // Return for debugging
    })
  } catch (error) {
    console.error('Magic link error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}