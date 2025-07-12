# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Culi (formerly TableLink) is an AI-powered menu assistant for restaurants that enables guests to scan a QR code and ask questions about menu items in any language. It's a SaaS platform that complements (not replaces) traditional paper menus.

## Common Commands

```bash
# Development
npm run dev          # Start Next.js dev server (http://localhost:3000)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Testing
# No test framework configured yet - check package.json before adding tests
```

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 15.3.5 with App Router
- **Database**: Supabase (PostgreSQL with vector search)
- **AI**: Multi-provider support via Vercel AI SDK
  - Primary: OpenAI GPT-4
  - Secondary: xAI Grok-3
  - Gateway pattern for provider flexibility
- **UI**: React 19, Tailwind CSS v4, Lucide icons
- **Hosting**: Vercel (planned)

### Key Directories
- `app/` - Next.js App Router pages and API routes
- `lib/` - Shared utilities (Supabase client, privacy helpers)
- `supabase/migrations/` - Database schema definitions
- `docs/` - Product and development documentation

### Multi-Tenant Architecture

The system is designed for multi-tenancy from day one:
- All tables use `restaurant_id` for tenant isolation
- Row Level Security (RLS) enabled on all tables
- Restaurant context passed via custom Supabase client headers
- Usage tracking per restaurant with tier-based limits

### AI Integration Pattern

```typescript
// AI requests go through /api/ai/route.ts
// Supports both streaming and non-streaming responses
// Example:
const response = await fetch('/api/ai', {
  method: 'POST',
  body: JSON.stringify({
    prompt: 'User question',
    model: 'openai/gpt-4', // or 'xai/grok-3'
    stream: true
  })
});
```

### Database Architecture

**Privacy-First Design**:
- Session hashing with daily salt rotation
- IP addresses never stored (only country/region)
- Automatic data expiration (90-day default)
- GDPR-compliant with consent tracking

**Vector Search**:
- Dual embedding support (1536 and 3072 dimensions)
- IVFFlat indexes for semantic search
- Embeddings on menus, conversations, and menu items

**Key Tables**:
- `restaurants` - Tenant management with subscription tiers
- `menus` - Flexible storage (PDF/image/text) with AI extraction
- `conversations` - Chat history with privacy controls
- `menu_items_cache` - AI-extracted items for fast queries
- `ai_insights` - Learned patterns and improvements

### Environment Variables

Required for development:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
AI_GATEWAY_API_KEY= (optional, for Vercel AI Gateway)
```

### Security Considerations

- Never commit `.env` files
- All user sessions are anonymous by default
- Service role key only for server-side operations
- RLS policies enforce tenant isolation
- Session data hashed before storage

### Development Patterns

**TypeScript**: Strict mode enabled, use type safety
**Imports**: Use `@/*` path alias for absolute imports
**State Management**: Supabase real-time subscriptions for live data
**Error Handling**: AI operations should gracefully fallback
**Cost Control**: Track tokens per conversation, implement caching

### Current Implementation Status

✅ Completed:
- Database schema with multi-tenancy
- AI endpoint with multi-provider support
- Privacy helpers for GDPR compliance
- Basic project structure

🚧 TODO (MVP):
- Restaurant dashboard UI
- Guest chat interface
- QR code generation
- Menu upload/processing
- Authentication (Supabase Auth)
- Subscription management (Stripe)

### Performance Optimization Strategies

- Pre-aggregate analytics hourly to reduce queries
- Cache common AI responses
- Use edge functions for low latency
- Implement connection pooling for database
- Stream AI responses for better UX

### Width Utilities

**CRITICAL**: Never use standard Tailwind max-width classes (max-w-xl, max-w-5xl, etc.) as they cause narrow column issues.

Always use our custom container utilities:
- `max-w-container-narrow` (48rem/768px) - forms, modals, focused content
- `max-w-container-standard` (64rem/1024px) - standard content pages
- `max-w-container-wide` (80rem/1280px) - dashboards, wide layouts, menu validation
- `max-w-container-full` (96rem/1536px) - hero sections, full-width content

This prevents the recurring narrow column issue caused by standard Tailwind widths in our v4 setup.

### Memory

- use supabase mcp
- never overcapitulize text
- always check lint errors
- Sentry v9 no longer needs `autoDiscoverNodePerformanceMonitoringIntegrations()` - integrations are automatic
- Webpack cache warnings about large strings are normal with Sentry/OpenTelemetry - use lazy loading for large libraries
- for UI/UX always remember: The goal: Make it accessible, clear, and reliable without adding visual noise. True minimalism means every element serves a purpose.
- 