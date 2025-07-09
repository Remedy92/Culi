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
    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_URL || ''
    
    // Extract locale from referer header
    const referer = req.headers.get('referer') || ''
    const localeMatch = referer.match(/\/([a-z]{2})\//)?.[1] || 'en'
    
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${origin}/${localeMatch}/auth/callback`,
      }
    })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Magic link error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}