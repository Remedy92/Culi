import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const locale = requestUrl.pathname.split('/')[1] // Extract locale from URL

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Get the authenticated user
      const { data: { user } } = await supabase.auth.getUser()

      // Check if user has a restaurant
      const { data: restaurant } = await supabase
        .from('restaurants')
        .select('id')
        .eq('owner_id', user?.id)
        .single()

      // Redirect based on whether user has a restaurant
      const redirectTo = restaurant 
        ? `/${locale}/dashboard` 
        : `/${locale}/onboarding`
      
      return NextResponse.redirect(new URL(redirectTo, request.url))
    }
  }

  // Error or no code - redirect to auth page
  return NextResponse.redirect(new URL(`/${locale}/auth`, request.url))
}