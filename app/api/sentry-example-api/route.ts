import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { captureMessage, captureAPIError, addBreadcrumb } from '@/lib/sentry';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const errorType = searchParams.get('type') || 'default';

  addBreadcrumb('Sentry example API called', 'http', {
    url: request.url,
    method: 'GET',
    errorType
  });

  try {
    switch (errorType) {
      case 'unhandled':
        throw new Error('Unhandled server error - this should appear in Sentry');
      
      case 'async':
        await simulateAsyncError();
        break;
      
      case 'database':
        await simulateDatabaseError();
        break;
      
      case 'timeout':
        await simulateTimeout();
        break;
      
      case 'validation':
        throw new ValidationError('Invalid input data');
      
      case 'transaction':
        return await performTransactionExample();
      
      case 'message':
        captureMessage('Test message from API route', 'info', {
          endpoint: '/api/sentry-example-api',
          timestamp: new Date().toISOString()
        });
        return NextResponse.json({ 
          success: true, 
          message: 'Info message sent to Sentry' 
        });
      
      case 'warning':
        captureMessage('API rate limit approaching', 'warning', {
          endpoint: '/api/sentry-example-api',
          currentRate: 450,
          maxRate: 500
        });
        return NextResponse.json({ 
          success: true, 
          message: 'Warning message sent to Sentry' 
        });
      
      default:
        return NextResponse.json({ 
          success: true, 
          message: 'API is working. Add ?type=<errorType> to trigger errors',
          availableTypes: [
            'unhandled',
            'async',
            'database',
            'timeout',
            'validation',
            'transaction',
            'message',
            'warning'
          ]
        });
    }

    return NextResponse.json({ success: true, message: 'Operation completed' });
  } catch (error) {
    captureAPIError(
      '/api/sentry-example-api',
      'GET',
      error,
      500,
      { errorType, timestamp: new Date().toISOString() }
    );

    return NextResponse.json(
      { 
        error: 'Internal Server Error', 
        message: error instanceof Error ? error.message : 'Unknown error',
        details: 'Check Sentry dashboard for full error details'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    addBreadcrumb('Processing POST request', 'http', {
      url: request.url,
      method: 'POST',
      hasBody: !!body
    });

    if (!body.data) {
      throw new ValidationError('Missing required field: data');
    }

    if (body.triggerError) {
      throw new Error('POST error triggered on purpose');
    }

    captureMessage('Successful POST to example API', 'info', {
      dataLength: JSON.stringify(body.data).length
    });

    return NextResponse.json({
      success: true,
      message: 'Data processed successfully',
      received: body.data
    });
  } catch (error) {
    const status = error instanceof ValidationError ? 400 : 500;
    
    captureAPIError(
      '/api/sentry-example-api',
      'POST',
      error,
      status,
      { timestamp: new Date().toISOString() }
    );

    return NextResponse.json(
      { 
        error: status === 400 ? 'Bad Request' : 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status }
    );
  }
}

async function simulateAsyncError() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(new Error('Async operation failed after delay'));
    }, 100);
  });
}

async function simulateDatabaseError() {
  const transaction = Sentry.startTransaction({
    op: 'db.query',
    name: 'Database Query Example'
  });

  const span = transaction.startChild({
    op: 'db.query',
    description: 'SELECT * FROM non_existent_table'
  });

  try {
    throw new Error('Database connection failed: ECONNREFUSED');
  } finally {
    span.finish();
    transaction.finish();
  }
}

async function simulateTimeout() {
  const transaction = Sentry.startTransaction({
    op: 'http.server',
    name: 'Timeout Simulation'
  });

  await new Promise((resolve) => setTimeout(resolve, 5000));
  
  transaction.finish();
  throw new Error('Operation timed out after 5 seconds');
}

async function performTransactionExample() {
  const transaction = Sentry.startTransaction({
    op: 'api.request',
    name: 'Example API Transaction'
  });

  Sentry.getCurrentHub().configureScope(scope => scope.setSpan(transaction));

  const dbSpan = transaction.startChild({
    op: 'db',
    description: 'Fetch user data'
  });
  await new Promise(resolve => setTimeout(resolve, 50));
  dbSpan.finish();

  const cacheSpan = transaction.startChild({
    op: 'cache',
    description: 'Check cache'
  });
  await new Promise(resolve => setTimeout(resolve, 20));
  cacheSpan.finish();

  const computeSpan = transaction.startChild({
    op: 'compute',
    description: 'Process data'
  });
  await new Promise(resolve => setTimeout(resolve, 100));
  computeSpan.finish();

  transaction.finish();

  return NextResponse.json({
    success: true,
    message: 'Transaction completed - check Sentry Performance tab',
    transaction: {
      name: transaction.name,
      duration: 'Check Sentry for timing details'
    }
  });
}

class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}