'use client';

import { useState } from 'react';
import * as Sentry from '@sentry/nextjs';
import { captureError, captureMessage, addBreadcrumb, setUser, clearUser } from '@/lib/sentry';
import ErrorBoundary from '@/app/components/sentry/ErrorBoundary';

function ErrorTriggerComponent() {
  const [shouldThrow, setShouldThrow] = useState(false);

  if (shouldThrow) {
    throw new Error('React component error thrown on purpose');
  }

  return (
    <button
      onClick={() => setShouldThrow(true)}
      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
    >
      Trigger Component Error (Error Boundary)
    </button>
  );
}

export default function SentryExamplePage() {
  const [lastAction, setLastAction] = useState<string>('');

  const triggerUnhandledError = () => {
    addBreadcrumb('User clicked unhandled error button', 'user', {
      timestamp: new Date().toISOString()
    });
    setLastAction('Triggered unhandled error');
    throw new Error('Unhandled client error - this should appear in Sentry');
  };

  const triggerHandledError = () => {
    try {
      addBreadcrumb('User clicked handled error button', 'user', {
        timestamp: new Date().toISOString()
      });
      throw new Error('Handled error example');
    } catch (error) {
      setLastAction('Captured handled error');
      captureError(error, {
        context: 'sentry-example-page',
        action: 'handled-error-test'
      });
    }
  };

  const triggerAsyncError = async () => {
    addBreadcrumb('User clicked async error button', 'user', {
      timestamp: new Date().toISOString()
    });
    setLastAction('Triggered async error');
    
    try {
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          reject(new Error('Async operation failed'));
        }, 100);
      });
    } catch (error) {
      captureError(error, {
        context: 'sentry-example-page',
        action: 'async-error-test'
      });
    }
  };

  const triggerTypeError = () => {
    addBreadcrumb('User clicked type error button', 'user', {
      timestamp: new Date().toISOString()
    });
    setLastAction('Triggered type error');
    
    try {
      const obj = null as unknown;
      obj.nonExistentMethod();
    } catch (error) {
      captureError(error, {
        context: 'sentry-example-page',
        action: 'type-error-test'
      });
    }
  };

  const sendInfoMessage = () => {
    addBreadcrumb('User sent info message', 'user', {
      timestamp: new Date().toISOString()
    });
    setLastAction('Sent info message');
    captureMessage('Test info message from Sentry example page', 'info', {
      page: 'sentry-example-page',
      userAction: 'test-message'
    });
  };

  const sendWarningMessage = () => {
    addBreadcrumb('User sent warning message', 'user', {
      timestamp: new Date().toISOString()
    });
    setLastAction('Sent warning message');
    captureMessage('Test warning message - something might be wrong', 'warning', {
      page: 'sentry-example-page',
      threshold: 80,
      current: 85
    });
  };

  const setTestUser = () => {
    const testUser = {
      id: 'test-user-123',
      email: 'test@example.com',
      username: 'testuser'
    };
    setUser(testUser);
    setLastAction(`Set user: ${testUser.email}`);
  };

  const clearTestUser = () => {
    clearUser();
    setLastAction('Cleared user context');
  };

  const createTransaction = () => {
    const transaction = Sentry.startTransaction({
      op: 'test',
      name: 'Example Transaction'
    });

    const span1 = transaction.startChild({
      op: 'task',
      description: 'First task'
    });
    setTimeout(() => span1.finish(), 100);

    const span2 = transaction.startChild({
      op: 'task',
      description: 'Second task'
    });
    setTimeout(() => {
      span2.finish();
      transaction.finish();
    }, 200);

    setLastAction('Created performance transaction');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Sentry Example Page</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Sentry Integration</h2>
          <p className="text-gray-600 mb-6">
            Click the buttons below to trigger different types of errors and events that will be sent to Sentry.
          </p>
          
          {lastAction && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm text-blue-800">Last action: {lastAction}</p>
            </div>
          )}

          <div className="space-y-6">
            <section>
              <h3 className="text-lg font-medium mb-3">Error Examples</h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={triggerUnhandledError}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Trigger Unhandled Error
                </button>
                
                <button
                  onClick={triggerHandledError}
                  className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
                >
                  Trigger Handled Error
                </button>
                
                <button
                  onClick={triggerAsyncError}
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                  Trigger Async Error
                </button>
                
                <button
                  onClick={triggerTypeError}
                  className="px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700"
                >
                  Trigger Type Error
                </button>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-medium mb-3">Error Boundary Test</h3>
              <ErrorBoundary showDialog={true}>
                <ErrorTriggerComponent />
              </ErrorBoundary>
            </section>

            <section>
              <h3 className="text-lg font-medium mb-3">Messages & Breadcrumbs</h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={sendInfoMessage}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Send Info Message
                </button>
                
                <button
                  onClick={sendWarningMessage}
                  className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                >
                  Send Warning Message
                </button>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-medium mb-3">User Context</h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={setTestUser}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Set Test User
                </button>
                
                <button
                  onClick={clearTestUser}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Clear User
                </button>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-medium mb-3">Performance Monitoring</h3>
              <button
                onClick={createTransaction}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                Create Test Transaction
              </button>
            </section>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-medium text-yellow-800 mb-2">Instructions:</h3>
          <ol className="list-decimal list-inside text-sm text-yellow-700 space-y-1">
            <li>Click any button to trigger an event</li>
            <li>Check your Sentry dashboard to see the captured events</li>
            <li>Note that unhandled errors will cause the page to crash (this is expected)</li>
            <li>Use the browser&apos;s back button if the page crashes</li>
          </ol>
        </div>
      </div>
    </div>
  );
}