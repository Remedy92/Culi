import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import MenuUploadClient from './MenuUploadClient'

export default async function MenuUploadPage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const supabase = await createClient()
  
  // Get the current user
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect(`/${locale}/auth`)
  }

  // Get the user's restaurant using SECURITY DEFINER function to avoid RLS recursion
  const { data: restaurant, error } = await supabase
    .rpc('get_user_restaurant')
    .single()

  if (error || !restaurant) {
    console.log('No restaurant found for user, redirecting to onboarding')
    redirect(`/${locale}/onboarding`)
  }

  // Render the client component with the necessary data
  return <MenuUploadClient restaurantId={restaurant.id} locale={locale} />
}