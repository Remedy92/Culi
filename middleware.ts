import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';

// Supported locales
export const locales = ['en', 'nl', 'fr', 'de', 'es', 'it'] as const;
export const defaultLocale = 'en' as const;

// Create the middleware
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localeDetection: true,
});

export default function middleware(request: NextRequest) {
  // Special handling for API routes and static files
  const pathname = request.nextUrl.pathname;
  
  // Skip middleware for API routes, static files, and Next.js internals
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.') // static files
  ) {
    return NextResponse.next();
  }

  // Apply internationalization middleware
  return intlMiddleware(request);
}

export const config = {
  // Match all pathnames except for API routes and static files
  matcher: ['/((?!api|_next|.*\\..*).*)']
};