import { createClient } from '@/lib/supabase/server'
import { createClient as createBrowserClient } from '@/lib/supabase/browser'

// Server-side queries (for server components and API routes)
export async function getRestaurantData(restaurantId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('restaurants')
    .select(`
      *,
      menus (*)
    `)
    .eq('id', restaurantId)
    .single()
    
  return { data, error }
}

export async function getCurrentRestaurant() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { data: null, error: new Error('No authenticated user') }
  
  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .eq('owner_id', user.id)
    .single()
    
  return { data, error }
}

export async function getUserRestaurants() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { data: [], error: new Error('No authenticated user') }
  
  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .or(`owner_id.eq.${user.id},id.in.(
      select restaurant_id from restaurant_members where user_id = ${user.id}
    )`)
    
  return { data: data || [], error }
}

// Client-side queries (for client components)
export function getRestaurantDataClient(restaurantId: string) {
  const supabase = createBrowserClient()
  
  return supabase
    .from('restaurants')
    .select(`
      *,
      menus (*)
    `)
    .eq('id', restaurantId)
    .single()
}

// Usage tracking
export async function trackUsage(
  restaurantId: string, 
  type: 'menu_query' | 'menu_extraction' | 'menu_upload' | 'login' | 'team_invite' | 'settings_change',
  metadata?: Record<string, unknown>
) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('usage_logs')
    .insert({
      restaurant_id: restaurantId,
      type,
      metadata: metadata || {}
    })
    
  return { error }
}

// Usage limits checking
export async function checkUsageLimits(restaurantId: string) {
  const supabase = await createClient()
  
  // Get restaurant tier
  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('tier, monthly_conversations, usage_reset_at')
    .eq('id', restaurantId)
    .single()
    
  if (!restaurant) {
    return { canUse: false, limit: 0, used: 0, tier: 'free' }
  }
  
  // Get tier limits
  const { data: tierLimit } = await supabase
    .from('tier_limits')
    .select('*')
    .eq('tier', restaurant.tier)
    .single()
    
  const limit = tierLimit?.monthly_conversations || 100
  const used = restaurant.monthly_conversations || 0
  
  // Check if usage needs to be reset
  if (restaurant.usage_reset_at && new Date(restaurant.usage_reset_at) < new Date()) {
    // Reset usage counters
    await supabase
      .from('restaurants')
      .update({
        monthly_conversations: 0,
        monthly_tokens_used: 0,
        usage_reset_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      })
      .eq('id', restaurantId)
      
    return { canUse: true, limit, used: 0, tier: restaurant.tier }
  }
  
  return {
    canUse: limit === -1 || used < limit,
    limit,
    used,
    tier: restaurant.tier
  }
}

// Menu management
export async function getActiveMenu(restaurantId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('menus')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
    
  return { data, error }
}

export async function createMenu(
  restaurantId: string,
  sourceType: 'pdf' | 'image' | 'text' | 'manual',
  sourceUrl?: string,
  sourceText?: string
) {
  const supabase = await createClient()
  
  // Deactivate existing menus
  await supabase
    .from('menus')
    .update({ is_active: false })
    .eq('restaurant_id', restaurantId)
  
  // Create new menu
  const { data, error } = await supabase
    .from('menus')
    .insert({
      restaurant_id: restaurantId,
      source_type: sourceType,
      source_url: sourceUrl,
      source_text: sourceText,
      is_active: true
    })
    .select()
    .single()
    
  return { data, error }
}

// Analytics
export async function getRestaurantAnalytics(restaurantId: string, days = 30) {
  const supabase = await createClient()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  
  const { data, error } = await supabase
    .from('analytics_hourly')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .gte('hour', startDate.toISOString())
    .order('hour', { ascending: true })
    
  return { data: data || [], error }
}

// Conversations
export async function getRecentConversations(restaurantId: string, limit = 50) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .order('created_at', { ascending: false })
    .limit(limit)
    
  return { data: data || [], error }
}

// Team management
export async function inviteTeamMember(restaurantId: string, email: string, role: 'admin' | 'member' = 'member') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { error: new Error('No authenticated user') }
  
  // Check if user exists
  const { data: existingUser } = await supabase
    .from('auth.users')
    .select('id')
    .eq('email', email)
    .single()
    
  if (!existingUser) {
    // User doesn't exist yet - they'll be added when they sign up
    // For now, we could send an invitation email
    return { error: new Error('User not found. They need to sign up first.') }
  }
  
  // Add user to restaurant
  const { data, error } = await supabase
    .from('restaurant_members')
    .insert({
      restaurant_id: restaurantId,
      user_id: existingUser.id,
      role,
      invited_by: user.id,
      accepted_at: new Date().toISOString()
    })
    
  return { data, error }
}

export async function getTeamMembers(restaurantId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('restaurant_members')
    .select(`
      *,
      user:auth.users!user_id (
        id,
        email
      ),
      inviter:auth.users!invited_by (
        id,
        email
      )
    `)
    .eq('restaurant_id', restaurantId)
    
  return { data: data || [], error }
}