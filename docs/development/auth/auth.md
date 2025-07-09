# TableLink Authentication: The Simplified Plan

## Overview
Leverage Vercel's built-in security + Supabase Auth to create a simple, secure authentication system that can be implemented in 2-3 days.

## Core Principles
- **Let Vercel handle security** (bot detection, DDoS, rate limiting)
- **Use Supabase defaults** (they're battle-tested)
- **Ship fast, iterate later**
- **No premature optimization**

## 1. Authentication Flow

```mermaid
graph TD
    A[User enters email] --> B[Send magic link via Supabase]
    B --> C[User clicks link]
    C --> D[Verify & create session]
    D --> E[Redirect to dashboard]
    
    F[Vercel Security Layer] --> A
    F --> B
    F --> C
    F --> D
```

## 2. File Structure (Minimal)

```
app/
├── auth/
│   ├── page.tsx              # Login page
│   └── callback/route.ts     # Magic link handler
├── api/
│   └── auth/
│       └── magic-link/route.ts
├── dashboard/
│   └── page.tsx              # Protected page
├── (public)/
│   └── app/[restaurant]/     # Guest menu view
└── middleware.ts             # Auth checks
```

## 3. Implementation

### 3.1 Magic Link Endpoint (15 lines)

```typescript
// app/api/auth/magic-link/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { email } = await req.json();
  const supabase = createRouteHandlerClient({ cookies });
  
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_URL}/auth/callback`,
    }
  });
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  
  return NextResponse.json({ success: true });
}
```

### 3.2 Callback Handler (20 lines)

```typescript
// app/auth/callback/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const requestUrl = new URL(req.url);
  const code = requestUrl.searchParams.get('code');
  
  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    await supabase.auth.exchangeCodeForSession(code);
    
    // Check if user needs onboarding
    const { data: { user } } = await supabase.auth.getUser();
    const { data: restaurant } = await supabase
      .from('restaurants')
      .select('id')
      .eq('owner_id', user?.id)
      .single();
    
    const redirectTo = restaurant ? '/dashboard' : '/onboarding';
    return NextResponse.redirect(new URL(redirectTo, req.url));
  }
  
  return NextResponse.redirect(new URL('/auth', req.url));
}
```

### 3.3 Simple Middleware (30 lines)

```typescript
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  
  // Public routes - no auth needed
  const isPublicRoute = req.nextUrl.pathname.startsWith('/app/') || 
                       req.nextUrl.pathname === '/' ||
                       req.nextUrl.pathname.startsWith('/auth');
  
  if (isPublicRoute) {
    return res;
  }
  
  // Check auth for protected routes
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session && req.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/auth', req.url));
  }
  
  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
};
```

### 3.4 Login Page (50 lines)

```tsx
// app/auth/page.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch('/api/auth/magic-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    setLoading(false);

    if (res.ok) {
      setSent(true);
      toast.success('Check your email for the login link!');
    } else {
      const { error } = await res.json();
      toast.error(error || 'Something went wrong');
    }
  };

  if (sent) {
    return (
      <div className="max-w-md mx-auto mt-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Check your email</h1>
        <p className="text-muted-foreground">
          We sent a login link to {email}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-20">
      <h1 className="text-2xl font-bold mb-6">Sign in to TableLink</h1>
      <Input
        type="email"
        placeholder="your@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="mb-4"
      />
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Sending...' : 'Send login link'}
      </Button>
    </form>
  );
}
```

## 4. Database Schema (Essential Only)

```sql
-- Users handled by Supabase Auth

-- Restaurants (multi-tenant)
CREATE TABLE restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  owner_id UUID REFERENCES auth.users(id),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Restaurant access
CREATE TABLE restaurant_members (
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'member',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (restaurant_id, user_id)
);

-- Menus
CREATE TABLE menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  name VARCHAR(255),
  data JSONB NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Usage tracking (for billing)
CREATE TABLE usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES restaurants(id),
  type VARCHAR(50), -- 'menu_query', 'menu_extraction'
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- GDPR consent (legal requirement)
CREATE TABLE gdpr_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  email VARCHAR(255),
  privacy_accepted BOOLEAN DEFAULT false,
  marketing_emails BOOLEAN DEFAULT false,
  accepted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE menus ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies
CREATE POLICY "Users can view their restaurants" ON restaurants
  FOR SELECT USING (owner_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM restaurant_members 
      WHERE restaurant_id = restaurants.id 
      AND user_id = auth.uid()
    )
  );
```

## 5. Onboarding Flow (Simple)

```tsx
// app/onboarding/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function OnboardingPage() {
  const [restaurantName, setRestaurantName] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    const slug = restaurantName.toLowerCase().replace(/\s+/g, '-');

    const { error } = await supabase
      .from('restaurants')
      .insert({
        name: restaurantName,
        slug,
        owner_id: user?.id
      });

    if (!error) {
      // Record GDPR consent
      await supabase
        .from('gdpr_consents')
        .insert({
          user_id: user?.id,
          email: user?.email,
          privacy_accepted: true,
          marketing_emails: false
        });

      router.push('/dashboard');
    }
    
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-20">
      <h1 className="text-2xl font-bold mb-6">Welcome to TableLink!</h1>
      <input
        type="text"
        placeholder="Restaurant name"
        value={restaurantName}
        onChange={(e) => setRestaurantName(e.target.value)}
        required
        className="w-full p-2 border rounded mb-4"
      />
      <button 
        type="submit" 
        disabled={loading}
        className="w-full bg-primary text-white p-2 rounded"
      >
        {loading ? 'Creating...' : 'Create restaurant'}
      </button>
    </form>
  );
}
```

## 6. Security Configuration

### 6.1 Enable Vercel Protection (30 seconds)
```bash
# In Vercel Dashboard:
# 1. Go to Project Settings → Firewall
# 2. Enable "Bot Protection" ✅
# 3. Enable "DDoS Protection" ✅
# Done!
```

### 6.2 Environment Variables
```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_URL=http://localhost:3000

# Production
NEXT_PUBLIC_URL=https://app.tablelink.be
```

### 6.3 Supabase Email Template
```html
<!-- Customize in Supabase Dashboard → Authentication → Email Templates -->
<h2>Sign in to TableLink</h2>
<p>Click below to sign in:</p>
<a href="{{ .ConfirmationURL }}">Sign in to TableLink</a>
<p>This link expires in 5 minutes.</p>
```

## 7. Multi-Tenant Data Access

```typescript
// lib/supabase/queries.ts
export async function getRestaurantData(restaurantId: string) {
  const supabase = createServerClient();
  
  // RLS automatically filters based on auth.uid()
  const { data, error } = await supabase
    .from('restaurants')
    .select(`
      *,
      menus (*)
    `)
    .eq('id', restaurantId)
    .single();
    
  return { data, error };
}

// Helper to get current restaurant
export async function getCurrentRestaurant() {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data } = await supabase
    .from('restaurants')
    .select('*')
    .eq('owner_id', user?.id)
    .single();
    
  return data;
}
```

## 8. Usage Tracking (For Billing)

```typescript
// lib/usage.ts
export async function trackUsage(
  restaurantId: string, 
  type: 'menu_query' | 'menu_extraction'
) {
  const supabase = createServerClient();
  
  await supabase
    .from('usage_logs')
    .insert({
      restaurant_id: restaurantId,
      type,
      metadata: {
        timestamp: new Date().toISOString(),
        // Add any relevant metadata
      }
    });
}

// Check limits
export async function checkUsageLimits(restaurantId: string) {
  const supabase = createServerClient();
  
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  
  const { count } = await supabase
    .from('usage_logs')
    .select('*', { count: 'exact', head: true })
    .eq('restaurant_id', restaurantId)
    .gte('created_at', startOfMonth.toISOString());
    
  return {
    queries: count || 0,
    limit: 1000 // Based on plan
  };
}
```

## 9. Timeline

### Day 1: Core Auth (4 hours)
- [ ] Set up Supabase project
- [ ] Implement magic link endpoint
- [ ] Create callback handler
- [ ] Add middleware
- [ ] Test auth flow

### Day 2: Multi-tenancy (4 hours)
- [ ] Create database schema
- [ ] Set up RLS policies
- [ ] Build onboarding flow
- [ ] Add restaurant context
- [ ] Test tenant isolation

### Day 3: Polish & Deploy (4 hours)
- [ ] Enable Vercel security
- [ ] Add error handling
- [ ] Create loading states
- [ ] Deploy to production
- [ ] Test in production

## 10. What We're NOT Building

❌ Custom bot detection (Vercel handles it)  
❌ Rate limiting code (Vercel handles it)  
❌ IP tracking (Vercel logs it)  
❌ Device fingerprinting  
❌ Complex session management  
❌ Password auth (magic links only)  
❌ 2FA (can add later)  
❌ OAuth providers (can add later)  

## 11. Monitoring & Analytics

```typescript
// Use Vercel Analytics (built-in)
import { track } from '@vercel/analytics';

// Track key events
track('user_signup', { method: 'magic_link' });
track('restaurant_created');
track('menu_uploaded');
```

## 12. Future Enhancements (After Launch)

1. **Month 2**: Add team invites
2. **Month 3**: Add OAuth (Google/Microsoft)
3. **Month 6**: Add 2FA for enterprise
4. **Month 12**: Add SSO support

## The Bottom Line

This simplified plan:
- **3 days to implement** (vs 2 weeks)
- **~200 lines of code** (vs 2000+)
- **Leverages platform security** (Vercel + Supabase)
- **Focuses on core value** (menu AI, not auth complexity)
- **Can scale to thousands of users** without changes

Ship this, get customers, iterate based on real needs! 🚀