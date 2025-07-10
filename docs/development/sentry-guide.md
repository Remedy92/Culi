# Sentry Error Tracking Guide

## Overview

This project uses Sentry for error tracking, performance monitoring, and debugging. Sentry is configured for both server-side and edge runtime environments.

## Configuration

### Environment Variables

Add these to your `.env.local`:

```bash
# Required
SENTRY_DSN=your_sentry_dsn_here
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn_here

# For source map uploads (production builds)
SENTRY_AUTH_TOKEN=your_auth_token
SENTRY_ORG=your_org_slug
SENTRY_PROJECT=your_project_slug

# Optional: Enable in development
SENTRY_SEND_IN_DEV=true
```

### Sample Rates

The project uses different sample rates based on environment:
- **Development**: 100% of transactions (for testing)
- **Production**: 10% of transactions (for cost control)

You can adjust these in:
- `sentry.server.config.ts`
- `sentry.edge.config.ts`

## Usage

### Basic Error Tracking

```typescript
import { captureError, captureMessage } from '@/lib/sentry';

// Capture an error
try {
  await riskyOperation();
} catch (error) {
  captureError(error, {
    userId: user.id,
    operation: 'risky_operation'
  });
}

// Capture a message
captureMessage('Payment processed successfully', 'info', {
  amount: 100,
  currency: 'EUR'
});
```

### Menu Extraction Errors

Use the specialized helper for menu extraction:

```typescript
import { trackExtractionError } from '@/lib/sentry';

trackExtractionError(
  error,
  menuId,
  restaurantId,
  'ocr' // stage: 'upload' | 'ocr' | 'ai' | 'merge' | 'save'
);
```

### API Errors

```typescript
import { captureAPIError } from '@/lib/sentry';

captureAPIError(
  '/api/menu/upload',
  'POST',
  error,
  500,
  { fileSize: 1024 } // request data (sensitive fields auto-removed)
);
```

### Performance Monitoring

```typescript
import * as Sentry from '@sentry/nextjs';

const transaction = Sentry.startTransaction({
  op: 'menu.extract',
  name: 'Menu Extraction Pipeline'
});

const span = transaction.startChild({
  op: 'ocr',
  description: 'OCR Processing'
});

// ... do work ...

span.finish();
transaction.finish();
```

### React Error Boundaries

Wrap your components with the error boundary:

```tsx
import ErrorBoundary from '@/app/components/sentry/ErrorBoundary';

export default function MyPage() {
  return (
    <ErrorBoundary 
      showDialog={true} // Show Sentry feedback dialog
      onError={(error, errorInfo) => {
        // Custom error handling
      }}
    >
      <YourComponent />
    </ErrorBoundary>
  );
}
```

### User Context

Set user context for better error tracking:

```typescript
import { setUser, clearUser } from '@/lib/sentry';

// On login
setUser({
  id: user.id,
  email: user.email,
  username: user.username
});

// On logout
clearUser();
```

### Breadcrumbs

Add breadcrumbs for better debugging:

```typescript
import { addBreadcrumb } from '@/lib/sentry';

addBreadcrumb(
  'Menu upload started',
  'menu',
  { fileSize: 1024, fileType: 'image/jpeg' }
);
```

## Best Practices

1. **Don't log sensitive data**: The utilities automatically filter out passwords, API keys, etc.
2. **Use appropriate levels**: Use `error` for actual errors, `warning` for potential issues, `info` for general tracking
3. **Add context**: Always include relevant context (IDs, user info, operation details)
4. **Use transactions**: For multi-step operations like menu extraction
5. **Test locally**: Set `SENTRY_SEND_IN_DEV=true` to test Sentry integration

## Testing

1. Visit `/sentry-example-page` to test client-side errors
2. Visit `/api/sentry-example-api` to test server-side errors
3. Check Sentry dashboard to verify errors are being captured

## Cost Management

To control Sentry costs:
- Keep `tracesSampleRate` at 0.1 (10%) or lower in production
- Use `beforeSend` to filter out non-critical errors
- Regularly review and resolve errors to reduce noise
- Use error budgets and alerts instead of capturing everything

## Troubleshooting

### Errors not appearing in Sentry?
1. Check environment variables are set
2. Verify DSN is correct
3. Check `NODE_ENV` - errors are filtered in development by default
4. Look for console errors about Sentry initialization

### Source maps not working?
1. Ensure `SENTRY_AUTH_TOKEN` is set
2. Verify `SENTRY_ORG` and `SENTRY_PROJECT` match your Sentry account
3. Check build logs for source map upload errors

### Too many events?
1. Lower `tracesSampleRate` in config files
2. Add more filtering in `beforeSend`
3. Use `captureMessage` sparingly
4. Review and fix recurring errors