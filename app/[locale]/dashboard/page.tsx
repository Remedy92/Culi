import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TLLogo } from '@/app/components/TLLogo'
import { 
  Upload, 
  MessageSquare, 
  Settings, 
  BarChart3, 
  QrCode, 
  LogOut,
  Menu,
  Users
} from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage({
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

  // Get the user's restaurant
  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('*')
    .eq('owner_id', user.id)
    .single()

  if (!restaurant) {
    redirect(`/${locale}/onboarding`)
  }

  // Get basic stats
  const today = new Date()
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  
  const { data: monthlyStats } = await supabase
    .from('analytics_hourly')
    .select('conversation_count')
    .eq('restaurant_id', restaurant.id)
    .gte('hour', startOfMonth.toISOString())
    .single()

  const conversationCount = monthlyStats?.conversation_count || 0

  return (
    <div className="min-h-screen bg-seasalt">
      {/* Header */}
      <header className="bg-white shadow-warm sticky top-0 z-40">
        <div className="max-w-max-w-container-full mx-auto mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3 md:py-6">
            <div className="flex items-center gap-3 md:gap-4 min-w-0">
              <Link href={`/${locale}/dashboard`} className="flex-shrink-0">
                <TLLogo size="sm" className="md:hidden" />
                <TLLogo size="md" className="hidden md:block" />
              </Link>
              <div className="min-w-0">
                <h1 className="text-base md:text-xl font-semibold text-eerie-black truncate">{restaurant.name}</h1>
                <p className="text-xs text-cinereous md:hidden">{restaurant.tier} plan</p>
              </div>
            </div>
            
            <nav className="flex items-center gap-2">
              <Link href={`/${locale}/dashboard/settings`}>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="touch-target-min hover:bg-seasalt active:bg-cinereous/20 transition-colors"
                  aria-label="Settings"
                >
                  <Settings className="w-5 h-5" />
                </Button>
              </Link>
              <form action={async () => {
                'use server'
                const supabase = await createClient()
                await supabase.auth.signOut()
                redirect(`/${locale}/`)
              }}>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  type="submit"
                  className="touch-target-min hover:bg-seasalt active:bg-cinereous/20 transition-colors"
                  aria-label="Sign out"
                >
                  <LogOut className="w-5 h-5" />
                </Button>
              </form>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-max-w-container-full mx-auto mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          <Card className="p-4 md:p-6 shadow-warm hover:shadow-warm-lg transition-shadow active:scale-[0.98] md:active:scale-100 touch-manipulation">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs md:text-sm text-cinereous">Monthly Conversations</p>
                <p className="text-xl md:text-2xl font-bold text-eerie-black">{conversationCount}</p>
                <p className="text-xs text-cinereous mt-1">
                  {restaurant.tier === 'free' ? '100' : restaurant.tier === 'professional' ? '1,000' : 'Unlimited'} limit
                </p>
              </div>
              <MessageSquare className="w-6 h-6 md:w-8 md:h-8 text-spanish-orange flex-shrink-0 ml-3" />
            </div>
          </Card>

          <Card className="p-4 md:p-6 shadow-warm hover:shadow-warm-lg transition-shadow active:scale-[0.98] md:active:scale-100 touch-manipulation">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs md:text-sm text-cinereous">Active Menu</p>
                <p className="text-xl md:text-2xl font-bold text-eerie-black">Not Set</p>
                <p className="text-xs text-cinereous mt-1">Upload your first menu</p>
              </div>
              <Menu className="w-6 h-6 md:w-8 md:h-8 text-spanish-orange flex-shrink-0 ml-3" />
            </div>
          </Card>

          <Card className="p-4 md:p-6 shadow-warm hover:shadow-warm-lg transition-shadow active:scale-[0.98] md:active:scale-100 touch-manipulation sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs md:text-sm text-cinereous">Subscription</p>
                <p className="text-xl md:text-2xl font-bold text-eerie-black capitalize">{restaurant.tier}</p>
                <p className="text-xs text-cinereous mt-1">
                  {restaurant.tier === 'free' ? 'Upgrade for more features' : 'Active'}
                </p>
              </div>
              <BarChart3 className="w-6 h-6 md:w-8 md:h-8 text-spanish-orange flex-shrink-0 ml-3" />
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <h2 className="text-lg md:text-xl font-semibold text-eerie-black mb-3 md:mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <Link href={`/${locale}/dashboard/menu`} className="block">
            <Card className="p-4 md:p-6 shadow-warm hover:shadow-warm-lg transition-all md:hover:scale-105 active:scale-[0.98] cursor-pointer h-full touch-manipulation">
              <Upload className="w-6 h-6 md:w-8 md:h-8 text-spanish-orange mb-2 md:mb-3" />
              <h3 className="font-medium text-sm md:text-base text-eerie-black mb-1">Upload Menu</h3>
              <p className="text-xs md:text-sm text-cinereous line-clamp-2">Add or update your restaurant menu</p>
            </Card>
          </Link>

          <Link href={`/${locale}/dashboard/qr`} className="block">
            <Card className="p-4 md:p-6 shadow-warm hover:shadow-warm-lg transition-all md:hover:scale-105 active:scale-[0.98] cursor-pointer h-full touch-manipulation">
              <QrCode className="w-6 h-6 md:w-8 md:h-8 text-spanish-orange mb-2 md:mb-3" />
              <h3 className="font-medium text-sm md:text-base text-eerie-black mb-1">Get QR Code</h3>
              <p className="text-xs md:text-sm text-cinereous line-clamp-2">Generate QR codes for tables</p>
            </Card>
          </Link>

          <Link href={`/${locale}/dashboard/conversations`} className="block">
            <Card className="p-4 md:p-6 shadow-warm hover:shadow-warm-lg transition-all md:hover:scale-105 active:scale-[0.98] cursor-pointer h-full touch-manipulation">
              <MessageSquare className="w-6 h-6 md:w-8 md:h-8 text-spanish-orange mb-2 md:mb-3" />
              <h3 className="font-medium text-sm md:text-base text-eerie-black mb-1">View Conversations</h3>
              <p className="text-xs md:text-sm text-cinereous line-clamp-2">See what guests are asking</p>
            </Card>
          </Link>

          <Link href={`/${locale}/dashboard/team`} className="block">
            <Card className="p-4 md:p-6 shadow-warm hover:shadow-warm-lg transition-all md:hover:scale-105 active:scale-[0.98] cursor-pointer h-full touch-manipulation">
              <Users className="w-6 h-6 md:w-8 md:h-8 text-spanish-orange mb-2 md:mb-3" />
              <h3 className="font-medium text-sm md:text-base text-eerie-black mb-1">Manage Team</h3>
              <p className="text-xs md:text-sm text-cinereous line-clamp-2">Invite team members</p>
            </Card>
          </Link>
        </div>

        {/* Getting Started Guide */}
        {!monthlyStats && (
          <Card className="mt-6 md:mt-8 p-4 md:p-8 bg-timberwolf/50 shadow-warm">
            <h2 className="text-lg md:text-xl font-semibold text-eerie-black mb-3 md:mb-4">Getting Started</h2>
            <div className="space-y-3 md:space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-spanish-orange text-white flex items-center justify-center flex-shrink-0 text-sm md:text-base font-medium touch-target-min">
                  1
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm md:text-base text-eerie-black">Upload Your Menu</h3>
                  <p className="text-xs md:text-sm text-cinereous">Upload a PDF, image, or enter your menu manually</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-spanish-orange text-white flex items-center justify-center flex-shrink-0 text-sm md:text-base font-medium touch-target-min">
                  2
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm md:text-base text-eerie-black">Generate QR Codes</h3>
                  <p className="text-xs md:text-sm text-cinereous">Create QR codes for your tables or menus</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-spanish-orange text-white flex items-center justify-center flex-shrink-0 text-sm md:text-base font-medium touch-target-min">
                  3
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm md:text-base text-eerie-black">Start Answering Questions</h3>
                  <p className="text-xs md:text-sm text-cinereous">Guests can now ask about your menu in any language!</p>
                </div>
              </div>
            </div>
          </Card>
        )}
      </main>
    </div>
  )
}