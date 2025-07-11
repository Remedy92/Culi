# Menu Upload & Analysis Improvements - Phase 2 & 3

## Phase 2: Real-Time Progress (2-4 hours)

### Overview
Replace simulated progress with actual real-time updates from the extraction process using Server-Sent Events (SSE) or polling.

### 2.1 Server-Sent Events Implementation

#### Backend Changes (`/app/api/menu/extract/route.ts`)
```typescript
// Convert to streaming response
export async function POST(request: Request) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Send initial event
        controller.enqueue(encoder.encode(
          `data: ${JSON.stringify({ 
            stage: 'start', 
            progress: 0, 
            message: 'Starting menu analysis...' 
          })}\n\n`
        ));

        // OCR Processing
        controller.enqueue(encoder.encode(
          `data: ${JSON.stringify({ 
            stage: 'ocr_start', 
            progress: 5, 
            message: 'Reading menu text...' 
          })}\n\n`
        ));
        
        const ocrResult = await performOCR(input.thumbnailUrl);
        
        controller.enqueue(encoder.encode(
          `data: ${JSON.stringify({ 
            stage: 'ocr_complete', 
            progress: 20, 
            message: `Found ${ocrResult.lines.length} lines of text`,
            details: {
              confidence: ocrResult.confidence,
              textLength: ocrResult.text.length
            }
          })}\n\n`
        ));

        // AI Analysis
        controller.enqueue(encoder.encode(
          `data: ${JSON.stringify({ 
            stage: 'ai_start', 
            progress: 25, 
            message: 'AI analyzing menu items...' 
          })}\n\n`
        ));
        
        const aiResult = await analyzeWithAI(input.thumbnailUrl, ocrResult.text);
        
        controller.enqueue(encoder.encode(
          `data: ${JSON.stringify({ 
            stage: 'ai_complete', 
            progress: 70, 
            message: `Identified ${aiResult.sections.length} sections`,
            details: {
              itemCount: aiResult.sections.flatMap(s => s.items).length,
              confidence: aiResult.overallConfidence
            }
          })}\n\n`
        ));

        // Enhancement (if needed)
        if (aiResult.overallConfidence < 80 && input.enhancedUrl) {
          controller.enqueue(encoder.encode(
            `data: ${JSON.stringify({ 
              stage: 'enhance_start', 
              progress: 75, 
              message: 'Enhancing with high-resolution image...' 
            })}\n\n`
          ));
          
          // Enhancement logic...
        }

        // Organizing & Saving
        controller.enqueue(encoder.encode(
          `data: ${JSON.stringify({ 
            stage: 'organize_start', 
            progress: 85, 
            message: 'Organizing menu structure...' 
          })}\n\n`
        ));

        // Save to database...

        // Complete
        controller.enqueue(encoder.encode(
          `data: ${JSON.stringify({ 
            stage: 'complete', 
            progress: 100, 
            message: 'Analysis complete!',
            menuId: updatedMenu.id,
            metrics: {
              itemsExtracted: items.length,
              confidence: validatedResult.overallConfidence,
              processingTime: Date.now() - startTime
            }
          })}\n\n`
        ));

        controller.close();
      } catch (error) {
        controller.enqueue(encoder.encode(
          `data: ${JSON.stringify({ 
            stage: 'error', 
            error: error.message 
          })}\n\n`
        ));
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
```

### 2.2 Client SSE Handling

#### Update MenuUploadClient.tsx
```typescript
const startExtraction = async () => {
  try {
    // Use fetch with streaming for better error handling than EventSource
    const response = await fetch('/api/menu/extract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        menuId: data.menu.id,
        restaurantId: restaurantId,
        thumbnailUrl: data.menu.thumbnailUrl,
        enhancedUrl: data.menu.enhancedUrl
      })
    });

    if (!response.ok) {
      throw new Error('Extraction failed');
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('No response body');
    }

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = JSON.parse(line.slice(6));
          
          // Update modal with real progress
          setExtractionProgress(data);
          
          if (data.stage === 'complete') {
            handleExtractionComplete(data);
          } else if (data.stage === 'error') {
            handleExtractionError(data.error);
          }
        }
      }
    }
  } catch (error) {
    console.error('SSE error:', error);
    // Fallback to polling or show error
  }
};
```

### 2.3 Update AnalysisProgressModal

#### Props Interface
```typescript
interface AnalysisProgressModalProps {
  open: boolean
  onOpenChange?: (open: boolean) => void
  fileName?: string
  fileSize?: number
  filePreview?: string
  error?: string
  onRetry?: () => void
  // New props for real progress
  realProgress?: {
    stage: string
    progress: number
    message: string
    details?: {
      confidence?: number
      itemCount?: number
      textLength?: number
    }
  }
}
```

#### Update Progress Display
```typescript
// Use real progress if available, otherwise fall back to simulation
const displayProgress = realProgress?.progress ?? progress;
const displayMessage = realProgress?.message ?? getCurrentStepMessage(currentStep);

// Show real metrics in the UI
{realProgress?.details && (
  <div className="text-xs text-muted-foreground space-y-1 mt-2">
    {realProgress.details.confidence && (
      <p>Confidence: {realProgress.details.confidence}%</p>
    )}
    {realProgress.details.itemCount && (
      <p>Items found: {realProgress.details.itemCount}</p>
    )}
  </div>
)}
```

### 2.4 Alternative: Polling Implementation

If SSE is too complex or has deployment issues, use polling:

#### Backend Status Endpoint
```typescript
// /app/api/menu/extract/status/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const extractionId = searchParams.get('id');
  
  // Get status from KV store
  const status = await kv.get(`extraction:${extractionId}:status`);
  
  return NextResponse.json(status || { 
    stage: 'unknown', 
    progress: 0 
  });
}
```

#### Client Polling
```typescript
const pollExtractionStatus = async (extractionId: string) => {
  const interval = setInterval(async () => {
    try {
      const response = await fetch(`/api/menu/extract/status?id=${extractionId}`);
      const status = await response.json();
      
      setExtractionProgress(status);
      
      if (status.stage === 'complete' || status.stage === 'error') {
        clearInterval(interval);
      }
    } catch (error) {
      console.error('Polling error:', error);
    }
  }, 2000); // Poll every 2 seconds
};
```

## Phase 3: Polish & Monitoring (2 hours)

### 3.1 AI Prompt Optimization

#### Update extraction prompts in `/lib/ai/menu/prompts.ts`
```typescript
export const EXTRACTION_PROMPT_IMPROVEMENTS = `
CRITICAL: For all optional fields, particularly bundleId:
- If an item is NOT part of a bundle, DO NOT include the bundleId field at all
- Do not use empty strings (""), null, or undefined as field values
- Only include fields that have actual meaningful values

When confidence is low:
- Clearly mark items with confidence < 70 as "needs_review"
- Suggest possible corrections in a "suggestions" field
- Flag ambiguous text for human review

For better extraction:
- Group items by visual proximity on the page
- Detect multi-column layouts automatically
- Identify price patterns (e.g., "sm/md/lg" or "lunch/dinner")
- Recognize common menu structures (appetizers → mains → desserts)
`;
```

### 3.2 Analytics & Monitoring

#### Sentry Performance Monitoring
```typescript
// Add detailed spans for each phase
const transaction = Sentry.startTransaction({
  name: 'menu.extraction',
  op: 'extraction',
  data: {
    menuId: input.menuId,
    restaurantId: input.restaurantId,
    fileType: getFileType(input.thumbnailUrl)
  }
});

// Track each phase with detailed metrics
const ocrSpan = transaction.startChild({
  op: 'ocr',
  description: 'Text extraction',
  data: {
    imageUrl: input.thumbnailUrl,
    imageSize: await getImageSize(input.thumbnailUrl)
  }
});

// Add custom measurements
transaction.setMeasurement('ocr.confidence', ocrResult.confidence, 'percent');
transaction.setMeasurement('ai.items_extracted', items.length, 'none');
transaction.setMeasurement('extraction.total_time', processingTime, 'millisecond');
```

#### Create Monitoring Dashboard
```typescript
// /app/api/menu/extract/metrics/route.ts
export async function GET() {
  const metrics = await getExtractionMetrics();
  
  return NextResponse.json({
    averageProcessingTime: metrics.avgTime,
    successRate: metrics.successRate,
    averageConfidence: metrics.avgConfidence,
    commonErrors: metrics.topErrors,
    performanceByFileType: metrics.byFileType,
    // Alert thresholds
    alerts: {
      slowExtractions: metrics.p95Time > 60000, // > 60s
      lowConfidence: metrics.avgConfidence < 70,
      highErrorRate: metrics.errorRate > 0.1
    }
  });
}
```

### 3.3 User Experience Polish

#### Enhanced Success State
```typescript
// Show detailed extraction results
<div className="space-y-3 mt-4">
  <div className="grid grid-cols-2 gap-4 text-sm">
    <div className="text-center p-3 bg-gray-50 rounded-lg">
      <p className="text-2xl font-bold text-spanish-orange">{metrics.itemsExtracted}</p>
      <p className="text-xs text-muted-foreground">Items Found</p>
    </div>
    <div className="text-center p-3 bg-gray-50 rounded-lg">
      <p className="text-2xl font-bold text-spanish-orange">{metrics.confidence}%</p>
      <p className="text-xs text-muted-foreground">Confidence</p>
    </div>
  </div>
  
  {metrics.sections && (
    <div className="text-xs text-muted-foreground">
      <p>Sections: {metrics.sections.map(s => s.name).join(', ')}</p>
    </div>
  )}
  
  <div className="flex gap-2">
    <Button onClick={navigateToValidation} className="flex-1">
      Review & Edit
    </Button>
    <Button variant="outline" onClick={shareResults}>
      Share
    </Button>
  </div>
</div>
```

#### Smooth Transitions
```typescript
// Add view transitions API support
const navigateToValidation = () => {
  if ('startViewTransition' in document) {
    document.startViewTransition(() => {
      router.push(`/${locale}/dashboard/menu/validate?menuId=${menuId}`);
    });
  } else {
    router.push(`/${locale}/dashboard/menu/validate?menuId=${menuId}`);
  }
};
```

#### Keyboard Shortcuts
```typescript
useEffect(() => {
  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && isExtracting) {
      handleCancelExtraction();
    }
    if (e.key === 'Enter' && isComplete) {
      navigateToValidation();
    }
  };
  
  window.addEventListener('keydown', handleKeyPress);
  return () => window.removeEventListener('keydown', handleKeyPress);
}, [isExtracting, isComplete]);
```

### 3.4 Testing Strategy

#### E2E Tests with Playwright
```typescript
// tests/menu-upload.spec.ts
test.describe('Menu Upload Flow', () => {
  test('successfully uploads and extracts menu', async ({ page }) => {
    await page.goto('/dashboard/menu');
    
    // Upload file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('tests/fixtures/sample-menu.pdf');
    
    // Start analysis
    await page.click('button:has-text("Start AI analysis")');
    
    // Verify progress modal appears
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await expect(page.locator('text=Analyzing Your Menu')).toBeVisible();
    
    // Wait for completion
    await expect(page.locator('text=Analysis Complete!')).toBeVisible({
      timeout: 70000 // Allow up to 70s
    });
    
    // Verify navigation
    await expect(page).toHaveURL(/\/dashboard\/menu\/validate/);
  });
  
  test('handles extraction errors gracefully', async ({ page }) => {
    // Test error scenarios
  });
  
  test('shows real-time progress updates', async ({ page }) => {
    // Verify progress updates
  });
});
```

#### Load Testing
```typescript
// tests/load/extraction-load.ts
import { check } from 'k6';
import http from 'k6/http';

export const options = {
  stages: [
    { duration: '2m', target: 10 }, // Ramp up to 10 concurrent extractions
    { duration: '5m', target: 10 }, // Stay at 10
    { duration: '2m', target: 0 },  // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<60000'], // 95% of requests under 60s
    http_req_failed: ['rate<0.1'], // Error rate under 10%
  },
};

export default function() {
  const response = http.post('/api/menu/extract', {
    // Test payload
  });
  
  check(response, {
    'extraction successful': (r) => r.status === 200,
    'confidence above threshold': (r) => JSON.parse(r.body).metrics?.confidence > 70,
  });
}
```

## Implementation Checklist

### Phase 2
- [ ] Implement SSE in extraction endpoint
- [ ] Update client to handle streaming responses
- [ ] Add real progress to modal component
- [ ] Test SSE with various network conditions
- [ ] Implement polling as fallback
- [ ] Add progress persistence for page refreshes

### Phase 3
- [ ] Optimize AI prompts for accuracy
- [ ] Add comprehensive Sentry tracking
- [ ] Create metrics dashboard
- [ ] Enhance success state UI
- [ ] Add keyboard shortcuts
- [ ] Write E2E tests
- [ ] Perform load testing
- [ ] Document API changes

## Success Metrics
- Real-time progress accuracy: ±5% of actual progress
- User perception of speed: 40% improvement
- Error visibility: 100% of errors shown to user
- Success rate: >95% successful extractions
- Average extraction time: <45 seconds
- User satisfaction: Reduced support tickets

## Rollout Strategy
1. Deploy Phase 2 behind feature flag
2. Test with internal team (1 week)
3. Gradual rollout to 10% → 50% → 100% of users
4. Monitor metrics and adjust
5. Deploy Phase 3 improvements
6. A/B test UI enhancements