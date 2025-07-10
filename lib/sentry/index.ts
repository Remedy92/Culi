import * as Sentry from '@sentry/nextjs';

/**
 * Sentry utility functions for consistent error tracking
 */

// Custom error types
export class BusinessError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'BusinessError';
  }
}

export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Sentry helper functions
export const captureError = (error: Error | unknown, context?: Record<string, unknown>) => {
  console.error('Error captured:', error);
  
  if (process.env.NODE_ENV === 'development' && !process.env.SENTRY_SEND_IN_DEV) {
    return;
  }

  Sentry.captureException(error, {
    contexts: {
      custom: context || {},
    },
  });
};

export const captureMessage = (
  message: string,
  level: 'debug' | 'info' | 'warning' | 'error' = 'info',
  context?: Record<string, unknown>
) => {
  if (process.env.NODE_ENV === 'development' && !process.env.SENTRY_SEND_IN_DEV) {
    console.log(`[${level.toUpperCase()}]`, message, context);
    return;
  }

  Sentry.captureMessage(message, {
    level: level as Sentry.SeverityLevel,
    contexts: {
      custom: context || {},
    },
  });
};

// Add user context
export const setUser = (user: { id: string; email?: string; username?: string }) => {
  Sentry.setUser(user);
};

export const clearUser = () => {
  Sentry.setUser(null);
};

// Add custom context
export const setContext = (key: string, context: Record<string, unknown>) => {
  Sentry.setContext(key, context);
};

// Performance monitoring
export const startTransaction = (name: string, op: string) => {
  return Sentry.startTransaction({ name, op });
};

// Breadcrumbs for better debugging
export const addBreadcrumb = (
  message: string,
  category: string,
  data?: Record<string, unknown>
) => {
  Sentry.addBreadcrumb({
    message,
    category,
    level: 'info',
    data,
    timestamp: Date.now() / 1000,
  });
};

// Error boundary helper
export const withSentry = <T extends (...args: unknown[]) => unknown>(
  fn: T,
  context?: Record<string, unknown>
): T => {
  return ((...args: Parameters<T>) => {
    try {
      const result = fn(...args);
      if (result instanceof Promise) {
        return result.catch((error) => {
          captureError(error, context);
          throw error;
        });
      }
      return result;
    } catch (error) {
      captureError(error, context);
      throw error;
    }
  }) as T;
};

// Menu extraction specific error tracking
export const trackExtractionError = (
  error: Error,
  menuId: string,
  restaurantId: string,
  stage: 'upload' | 'ocr' | 'ai' | 'merge' | 'save'
) => {
  captureError(error, {
    menuId,
    restaurantId,
    stage,
    feature: 'menu_extraction',
  });
};

// API error helper
export const captureAPIError = (
  endpoint: string,
  method: string,
  error: Error,
  statusCode?: number,
  requestData?: Record<string, unknown>
) => {
  // Sanitize sensitive data
  const sanitizedData = requestData ? {
    ...requestData,
    password: undefined,
    apiKey: undefined,
    token: undefined,
  } : undefined;

  captureError(error, {
    api: {
      endpoint,
      method,
      statusCode,
      requestData: sanitizedData,
    },
  });
};