import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr'

// Supported locales
export const locales = ['en', 'nl', 'fr', 'de', 'es', 'it'] as const;
export const defaultLocale = 'en' as const;

// Create the i18n middleware
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localeDetection: true,
});

// Protected routes that require authentication
const protectedRoutes = ['/dashboard', '/onboarding'];

// Public routes that don't require authentication
const publicRoutes = ['/auth', '/auth/callback', '/', '/app'];

export default async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const searchParams = request.nextUrl.searchParams;
  
  // Skip middleware for API routes, static files, and Next.js internals
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.') // static files
  ) {
    return NextResponse.next();
  }

  // Handle Supabase auth callback at root URL
  const code = searchParams.get('code');
  if (code && pathname === '/') {
    // Redirect to the proper auth callback with default locale
    const redirectUrl = new URL(`/${defaultLocale}/auth/callback`, request.url);
    redirectUrl.searchParams.set('code', code);
    return NextResponse.redirect(redirectUrl);
  }

  // Create response and apply i18n middleware first
  let response = intlMiddleware(request);
  
  // Extract the locale from the pathname
  const pathnameHasLocale = locales.some(
    locale => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );
  
  if (!pathnameHasLocale) {
    // Handle auth callback for paths without locale
    if (code) {
      const redirectUrl = new URL(`/${defaultLocale}/auth/callback`, request.url);
      redirectUrl.searchParams.set('code', code);
      return NextResponse.redirect(redirectUrl);
    }
    return response;
  }

  // Get the locale and the path without locale
  const locale = pathname.split('/')[1];
  const pathWithoutLocale = pathname.replace(`/${locale}`, '') || '/';

  // Check if the route requires authentication
  const isProtectedRoute = protectedRoutes.some(route => 
    pathWithoutLocale.startsWith(route)
  );

  if (isProtectedRoute) {
    // Create a Supabase client
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      // Redirect to auth page with locale
      const redirectUrl = new URL(`/${locale}/auth`, request.url);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return response;
}

export const config = {
  // Match all pathnames except for API routes and static files
  matcher: ['/((?!api|_next|.*\\..*).*)']
};