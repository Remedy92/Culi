'use client';

import * as Sentry from '@sentry/nextjs';
import React, { useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { usePathname } from 'next/navigation';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
  showDialog?: boolean;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to Sentry
    Sentry.withScope((scope) => {
      scope.setContext('errorBoundary', {
        componentStack: errorInfo.componentStack,
      });
      Sentry.captureException(error);
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // Show Sentry dialog if enabled
    if (this.props.showDialog && process.env.NODE_ENV === 'production') {
      Sentry.showReportDialog();
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
      }

      return <DefaultErrorFallback error={this.state.error} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}

// Default error UI
function DefaultErrorFallback({ 
  error, 
  resetError 
}: { 
  error: Error; 
  resetError: () => void;
}) {
  const pathname = usePathname();
  
  useEffect(() => {
    // Log error details in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Boundary caught:', error);
    }
  }, [error]);
  
  // Extract locale from pathname
  const locale = pathname?.split('/')[1] || 'en';

  return (
    <div className="min-h-[400px] flex items-center justify-center p-4">
      <div className="max-w-max-w-container-narrow mx-auto w-full bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center space-x-3 text-red-600 mb-4">
          <AlertCircle className="h-6 w-6" />
          <h2 className="text-lg font-semibold">Something went wrong</h2>
        </div>
        
        <p className="text-gray-600 mb-4">
          We&apos;re sorry for the inconvenience. The error has been reported and we&apos;ll look into it.
        </p>

        {process.env.NODE_ENV === 'development' && (
          <details className="mb-4">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
              Error details (development only)
            </summary>
            <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
              {error.stack || error.message}
            </pre>
          </details>
        )}

        <div className="flex space-x-3">
          <button
            onClick={resetError}
            className="flex-1 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={() => window.location.href = `/${locale}`}
            className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}

export default ErrorBoundary;

// Hook for using error boundary
export function useErrorHandler() {
  return (error: Error) => {
    Sentry.captureException(error);
    throw error; // This will be caught by the nearest error boundary
  };
}