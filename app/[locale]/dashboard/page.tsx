import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
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
      <header className="bg-white shadow-warm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <TLLogo />
              <div className="hidden md:block">
                <h1 className="text-xl font-semibold text-eerie-black">{restaurant.name}</h1>
              </div>
            </div>
            
            <nav className="flex items-center space-x-4">
              <Link href={`/${locale}/dashboard/settings`}>
                <Button variant="ghost" size="icon">
                  <Settings className="w-5 h-5" />
                </Button>
              </Link>
              <form action={async () => {
                'use server'
                const supabase = await createClient()
                await supabase.auth.signOut()
                redirect(`/${locale}/`)
              }}>
                <Button variant="ghost" size="icon" type="submit">
                  <LogOut className="w-5 h-5" />
                </Button>
              </form>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 shadow-warm hover:shadow-warm-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-cinereous">Monthly Conversations</p>
                <p className="text-2xl font-bold text-eerie-black">{conversationCount}</p>
                <p className="text-xs text-cinereous mt-1">
                  {restaurant.tier === 'free' ? '100' : restaurant.tier === 'professional' ? '1,000' : 'Unlimited'} limit
                </p>
              </div>
              <MessageSquare className="w-8 h-8 text-spanish-orange" />
            </div>
          </Card>

          <Card className="p-6 shadow-warm hover:shadow-warm-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-cinereous">Active Menu</p>
                <p className="text-2xl font-bold text-eerie-black">Not Set</p>
                <p className="text-xs text-cinereous mt-1">Upload your first menu</p>
              </div>
              <Menu className="w-8 h-8 text-spanish-orange" />
            </div>
          </Card>

          <Card className="p-6 shadow-warm hover:shadow-warm-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-cinereous">Subscription</p>
                <p className="text-2xl font-bold text-eerie-black capitalize">{restaurant.tier}</p>
                <p className="text-xs text-cinereous mt-1">
                  {restaurant.tier === 'free' ? 'Upgrade for more features' : 'Active'}
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-spanish-orange" />
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <h2 className="text-xl font-semibold text-eerie-black mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href={`/${locale}/dashboard/menu`}>
            <Card className="p-6 shadow-warm hover:shadow-warm-lg transition-all hover:scale-105 cursor-pointer">
              <Upload className="w-8 h-8 text-spanish-orange mb-3" />
              <h3 className="font-medium text-eerie-black mb-1">Upload Menu</h3>
              <p className="text-sm text-cinereous">Add or update your restaurant menu</p>
            </Card>
          </Link>

          <Link href={`/${locale}/dashboard/qr`}>
            <Card className="p-6 shadow-warm hover:shadow-warm-lg transition-all hover:scale-105 cursor-pointer">
              <QrCode className="w-8 h-8 text-spanish-orange mb-3" />
              <h3 className="font-medium text-eerie-black mb-1">Get QR Code</h3>
              <p className="text-sm text-cinereous">Generate QR codes for tables</p>
            </Card>
          </Link>

          <Link href={`/${locale}/dashboard/conversations`}>
            <Card className="p-6 shadow-warm hover:shadow-warm-lg transition-all hover:scale-105 cursor-pointer">
              <MessageSquare className="w-8 h-8 text-spanish-orange mb-3" />
              <h3 className="font-medium text-eerie-black mb-1">View Conversations</h3>
              <p className="text-sm text-cinereous">See what guests are asking</p>
            </Card>
          </Link>

          <Link href={`/${locale}/dashboard/team`}>
            <Card className="p-6 shadow-warm hover:shadow-warm-lg transition-all hover:scale-105 cursor-pointer">
              <Users className="w-8 h-8 text-spanish-orange mb-3" />
              <h3 className="font-medium text-eerie-black mb-1">Manage Team</h3>
              <p className="text-sm text-cinereous">Invite team members</p>
            </Card>
          </Link>
        </div>

        {/* Getting Started Guide */}
        {!monthlyStats && (
          <Card className="mt-8 p-8 bg-timberwolf/50 shadow-warm">
            <h2 className="text-xl font-semibold text-eerie-black mb-4">Getting Started</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-spanish-orange text-white flex items-center justify-center flex-shrink-0 text-sm font-medium">
                  1
                </div>
                <div>
                  <h3 className="font-medium text-eerie-black">Upload Your Menu</h3>
                  <p className="text-sm text-cinereous">Upload a PDF, image, or enter your menu manually</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-spanish-orange text-white flex items-center justify-center flex-shrink-0 text-sm font-medium">
                  2
                </div>
                <div>
                  <h3 className="font-medium text-eerie-black">Generate QR Codes</h3>
                  <p className="text-sm text-cinereous">Create QR codes for your tables or menus</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-spanish-orange text-white flex items-center justify-center flex-shrink-0 text-sm font-medium">
                  3
                </div>
                <div>
                  <h3 className="font-medium text-eerie-black">Start Answering Questions</h3>
                  <p className="text-sm text-cinereous">Guests can now ask about your menu in any language!</p>
                </div>
              </div>
            </div>
          </Card>
        )}
      </main>
    </div>
  )
}