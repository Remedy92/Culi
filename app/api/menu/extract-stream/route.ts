import { NextRequest } from 'next/server';
import { generateObject } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { gateway } from '@ai-sdk/gateway';
import { kv } from '@vercel/kv';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

import { mergeOCRWithAI } from '@/lib/ai/menu/extraction-merger';
import { QUICK_ANALYSIS_PROMPT } from '@/lib/ai/menu/extraction-prompts';
import { 
  ExtractedMenuSchema, 
  OCRResultSchema, 
  QuickAnalysisResultSchema,
  ExtractedMenu,
  PriceSchema,
  ConfidenceSchema,
  AllergenEnum,
  DietaryTagEnum
} from '@/lib/ai/menu/extraction-schemas';
import { EXTRACTION_CONFIG } from '@/lib/config/extraction';
import { 
  ProgressTracker, 
  EXTRACTION_PROGRESS_MESSAGES,
  EXTRACTION_TIMEOUTS 
} from '@/lib/utils/progress-tracker';

export const runtime = 'nodejs';
export const maxDuration = 60;

// Initialize clients
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Configure AI providers
const useGateway = !!process.env.AI_GATEWAY_API_KEY;
const openai = createOpenAI();

// Input validation
const ExtractRequestSchema = z.object({
  menuId: z.string().uuid(),
  restaurantId: z.string().uuid(),
  thumbnailUrl: z.string().url(),
  enhancedUrl: z.string().url().optional(),
  forceReprocess: z.boolean().optional()
});

// Track active extractions to prevent duplicates
const activeExtractions = new Map<string, boolean>();

export async function POST(req: NextRequest) {
  const encoder = new TextEncoder();
  let extractionKey: string | null = null;
  
  const stream = new ReadableStream({
    async start(controller) {
      // Helper to send SSE-formatted events
      const sendEvent = (data: Record<string, unknown>) => {
        try {
          const event = `data: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(event));
        } catch {
          // Controller might be closed if client disconnected
          console.log('Failed to send event, client may have disconnected');
        }
      };
      
      // Create progress tracker
      const tracker = new ProgressTracker((update) => {
        sendEvent(update as unknown as Record<string, unknown>);
      });
      
      // Track start time for processing duration
      const extractionStartTime = Date.now();
      
      try {
        // Parse and validate request
        let body;
        try {
          body = await req.json();
        } catch {
          sendEvent({
            stage: 'error',
            error: 'Invalid JSON in request body'
          });
          controller.close();
          return;
        }
        
        let input;
        try {
          input = ExtractRequestSchema.parse(body);
        } catch (validationError) {
          sendEvent({
            stage: 'error',
            error: 'Invalid request parameters',
            details: validationError instanceof z.ZodError ? validationError.errors : undefined
          });
          controller.close();
          return;
        }
        
        // Check if extraction is already in progress
        extractionKey = `${input.restaurantId}:${input.menuId}`;
        if (activeExtractions.has(extractionKey)) {
          sendEvent({
            stage: 'error',
            error: 'Extraction already in progress for this menu'
          });
          controller.close();
          return;
        }
        
        // Mark extraction as active
        activeExtractions.set(extractionKey, true);
        
        tracker.sendUpdate('validation', 5, 'Request validated');
        
        // Check cache first
        if (!input.forceReprocess) {
          const cacheKey = `${EXTRACTION_CONFIG.CACHE.KEY_PREFIX}${input.menuId}`;
          const cached = await kv.get<ExtractedMenu>(cacheKey);
          
          if (cached) {
            sendEvent({
              stage: 'complete',
              progress: 100,
              message: 'Retrieved from cache',
              extraction: cached,
              fromCache: true
            });
            controller.close();
            return;
          }
        }
        
        // Verify menu exists
        const { data: menu, error: menuError } = await supabase
          .from('menus')
          .select('*')
          .eq('id', input.menuId)
          .eq('restaurant_id', input.restaurantId)
          .single();
        
        if (menuError || !menu) {
          sendEvent({
            stage: 'error',
            error: 'Menu not found or access denied'
          });
          controller.close();
          return;
        }
        
        tracker.sendUpdate('menu_verified', 8, 'Menu access verified');
        
        // Start parallel processing with progress
        const ocrPromise = performOCRWithProgress(input.thumbnailUrl, tracker);
        const aiPromise = performAIAnalysisWithProgress(input.thumbnailUrl, tracker);
        
        // Start timeout monitoring
        const timeoutMonitor = monitorTimeouts(tracker, EXTRACTION_TIMEOUTS);
        
        // Wait for results
        const results = await Promise.allSettled([ocrPromise, aiPromise]);
        clearInterval(timeoutMonitor);
        
        // Handle results
        if (results[0].status === 'rejected') {
          sendEvent({
            stage: 'error',
            error: 'OCR processing failed',
            details: results[0].reason?.message
          });
          controller.close();
          return;
        }
        
        const ocrResult = results[0].value;
        let aiQuickAnalysis;
        
        // OCR complete update
        sendEvent({
          stage: 'ocr_complete',
          progress: 30,
          message: 'Text extraction complete',
          stats: {
            confidence: ocrResult.confidence,
            lines: ocrResult.lines.length,
            textLength: ocrResult.text.length
          }
        });
        
        if (results[1].status === 'rejected') {
          console.error('AI analysis failed, using fallback:', results[1].reason);
          // Create a basic fallback with OCR data
          aiQuickAnalysis = {
            sections: [{
              name: 'Menu Items',
              confidence: 50,
              items: []
            }],
            detectedLanguage: 'en',
            detectedCurrency: 'EUR'
          };
          sendEvent({
            stage: 'ai_fallback',
            progress: 75,
            message: 'Using OCR-only results due to AI timeout'
          });
        } else {
          aiQuickAnalysis = results[1].value;
          sendEvent({
            stage: 'ai_complete',
            progress: 75,
            message: 'AI analysis complete'
          });
        }
        
        // Merge results
        tracker.sendUpdate('merge_start', 80, 'Combining results...');
        const mergedResult = mergeOCRWithAI(ocrResult, aiQuickAnalysis);
        
        // Ensure processingTime is set before validation
        if (!mergedResult.metadata.processingTime || mergedResult.metadata.processingTime <= 0) {
          mergedResult.metadata.processingTime = Date.now() - extractionStartTime;
        }
        
        // Validate extraction with fallback
        tracker.sendUpdate('validation', 85, 'Validating extraction...');
        const validation = ExtractedMenuSchema.safeParse(mergedResult);
        
        let validatedResult: ExtractedMenu;
        if (!validation.success) {
          console.warn('Validation failed, applying fixes:', validation.error.errors);
          
          // Auto-fix common issues
          const fixed = { ...mergedResult };
          
          // Fix invalid prices (convert 0 or negative to null)
          fixed.sections.forEach(section => {
            section.items.forEach(item => {
              if (item.price !== null && item.price !== undefined && item.price <= 0) {
                console.log(`Fixing invalid price ${item.price} for item ${item.name}`);
                item.price = null;
              }
            });
          });
          
          // Fix items array
          fixed.items = fixed.sections.flatMap(s => s.items);
          
          // Retry validation
          validatedResult = ExtractedMenuSchema.parse(fixed);
        } else {
          validatedResult = validation.data;
        }
        
        // Enhancement if needed
        if (validatedResult.overallConfidence < EXTRACTION_CONFIG.OCR.CONFIDENCE_THRESHOLD && input.enhancedUrl) {
          tracker.sendUpdate('enhancement', 87, 'Enhancing low-confidence items...');
          const enhancedResult = await enhanceWithFullResolution(
            input.enhancedUrl,
            ocrResult.text,
            validatedResult
          );
          
          if (enhancedResult && enhancedResult.sections) {
            // Merge enhanced items back into the validated result
            enhancedResult.sections.forEach(enhancedSection => {
              const existingSection = validatedResult.sections.find(
                s => s.name === enhancedSection.name
              );
              
              if (existingSection) {
                enhancedSection.items.forEach(enhancedItem => {
                  const existingItem = existingSection.items.find(
                    i => i.name === enhancedItem.name
                  );
                  
                  if (existingItem) {
                    // Update existing item with enhanced data
                    if (enhancedItem.price !== null && enhancedItem.price !== undefined) {
                      existingItem.price = enhancedItem.price as z.infer<typeof PriceSchema>;
                    }
                    if (enhancedItem.description) {
                      existingItem.description = enhancedItem.description;
                    }
                    if (enhancedItem.confidence > existingItem.confidence) {
                      existingItem.confidence = enhancedItem.confidence as z.infer<typeof ConfidenceSchema>;
                    }
                    if (enhancedItem.allergens) {
                      existingItem.allergens = enhancedItem.allergens as z.infer<typeof AllergenEnum>[];
                    }
                    if (enhancedItem.dietaryTags) {
                      existingItem.dietaryTags = enhancedItem.dietaryTags as z.infer<typeof DietaryTagEnum>[];
                    }
                  }
                });
              }
            });
            
            tracker.sendUpdate('enhancement_complete', 90, 'Enhancement complete');
          }
        }
        
        // Save to database
        tracker.sendUpdate('save_start', 92, 'Saving to database...');
        
        const { error: updateError } = await supabase
          .from('menus')
          .update({
            extracted_data: validatedResult,
            extraction_confidence: validatedResult.overallConfidence / 100,
            extraction_model: validatedResult.metadata.modelUsed,
            extraction_timestamp: new Date().toISOString(),
            is_active: true
          })
          .eq('id', input.menuId);
        
        if (updateError) {
          throw new Error('Failed to save extraction results');
        }
        
        // Save individual items
        const items = validatedResult.sections.flatMap(section => 
          section.items.map(item => ({
            menu_id: input.menuId,
            restaurant_id: input.restaurantId,
            section_name: section.name,
            name: item.name,
            price: item.price,
            description: item.description,
            allergens: item.allergens,
            dietary_tags: item.dietaryTags,
            confidence: item.confidence / 100
          }))
        );
        
        if (items.length > 0) {
          await supabase
            .from('menu_items_cache')
            .insert(items);
          
          tracker.sendUpdate('items_saved', 95, `Saved ${items.length} menu items`);
        }
        
        // Cache the result
        await kv.set(
          `${EXTRACTION_CONFIG.CACHE.KEY_PREFIX}${input.menuId}`,
          validatedResult,
          { ex: EXTRACTION_CONFIG.CACHE.TTL }
        );
        
        tracker.sendUpdate('cache_saved', 98, 'Results cached');
        
        // Calculate actual processing time
        const processingTime = Date.now() - extractionStartTime;
        
        // Update metadata with processing time
        validatedResult.metadata.processingTime = processingTime;
        
        // Send final result
        sendEvent({
          stage: 'complete',
          progress: 100,
          message: 'Extraction complete!',
          extraction: validatedResult,
          metrics: {
            itemsExtracted: items.length,
            confidence: validatedResult.overallConfidence,
            processingTime: processingTime
          }
        });
        
      } catch (error) {
        console.error('Extraction error:', error);
        sendEvent({
          stage: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
          fallbackToManual: true
        });
      } finally {
        // Clean up active extraction tracking
        if (extractionKey) {
          activeExtractions.delete(extractionKey);
        }
        controller.close();
      }
    },
    cancel() {
      // Handle client disconnect
      console.log('Client disconnected during extraction');
      if (extractionKey) {
        activeExtractions.delete(extractionKey);
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

// Helper functions with progress tracking
async function performOCRWithProgress(
  imageUrl: string,
  tracker: ProgressTracker
): Promise<z.infer<typeof OCRResultSchema>> {
  // Start OCR progress messages
  const messages = [...EXTRACTION_PROGRESS_MESSAGES.ocr];
  tracker.startTimedMessages(messages);
  
  try {
    // Import and create worker
    const { createWorker } = await import('tesseract.js');
    const worker = await createWorker(EXTRACTION_CONFIG.OCR.LANGUAGES.join('+'));
    
    await worker.setParameters({
      tessedit_pageseg_mode: EXTRACTION_CONFIG.OCR.PAGE_SEG_MODE,
      preserve_interword_spaces: EXTRACTION_CONFIG.OCR.PRESERVE_SPACES
    } as Parameters<typeof worker.setParameters>[0]);
    
    const { data } = await worker.recognize(imageUrl);
    await worker.terminate();
    
    tracker.stopTimedMessages();
    
    const result = OCRResultSchema.parse({
      text: data.text || '',
      confidence: data.confidence || 0,
      lines: ((data as Record<string, unknown>).lines as Array<Record<string, unknown>> || []).map((line) => ({
        text: line.text,
        bbox: {
          x: (line.bbox as Record<string, number>).x0,
          y: (line.bbox as Record<string, number>).y0,
          width: (line.bbox as Record<string, number>).x1 - (line.bbox as Record<string, number>).x0,
          height: (line.bbox as Record<string, number>).y1 - (line.bbox as Record<string, number>).y0
        },
        confidence: line.confidence as number
      })),
      language: (data as Record<string, unknown>).language as string || 'unknown'
    });
    
    return result;
  } catch (error) {
    tracker.stopTimedMessages();
    throw error;
  }
}

async function performAIAnalysisWithProgress(
  imageUrl: string,
  tracker: ProgressTracker,
  retryCount: number = 0
): Promise<z.infer<typeof QuickAnalysisResultSchema>> {
  // Start AI progress messages
  const messages = [...EXTRACTION_PROGRESS_MESSAGES.ai];
  tracker.startTimedMessages(messages);
  
  try {
    const modelName = EXTRACTION_CONFIG.AI.QUICK_ANALYSIS_MODEL;
    const model = useGateway 
      ? gateway(`openai/${modelName}`)
      : openai(modelName);
    
    // Use generateObject for structured output with proper timeout
    const { object } = await generateObject({
      model,
      schema: QuickAnalysisResultSchema,
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: QUICK_ANALYSIS_PROMPT },
          { type: 'image', image: imageUrl }
        ]
      }],
      temperature: EXTRACTION_CONFIG.AI.TEMPERATURE,
      maxRetries: 2,
      abortSignal: AbortSignal.timeout(EXTRACTION_CONFIG.TIMEOUTS.AI_QUICK)
    });
    
    tracker.stopTimedMessages();
    
    // Post-process to convert nulls to appropriate defaults
    if (object.sections) {
      object.sections.forEach(section => {
        if (section.items) {
          section.items.forEach(item => {
            // Convert null descriptions to empty strings
            if (item.description === null || item.description === undefined) {
              item.description = '';
            }
            // Price can remain null as schema allows it
          });
        }
      });
    }
    
    return object;
    
  } catch (error) {
    tracker.stopTimedMessages();
    
    // Retry logic
    const isRetryable = error instanceof Error && 
      (error.name === 'AbortError' || error.message.includes('gateway'));
    
    if (isRetryable && retryCount < 2 && useGateway) {
      tracker.sendUpdate('ai_retry', 30 + (retryCount * 10), `Retrying AI analysis (attempt ${retryCount + 2}/3)...`);
      await new Promise(resolve => setTimeout(resolve, (retryCount + 1) * 1000));
      return performAIAnalysisWithProgress(imageUrl, tracker, retryCount + 1);
    }
    
    throw error;
  }
}

// Define enhancement schema for partial updates
const EnhancementResultSchema = z.object({
  sections: z.array(z.object({
    name: z.string(),
    confidence: z.number(),
    items: z.array(z.object({
      name: z.string(),
      price: z.number().nullable().optional(),
      description: z.string().nullable().optional(),
      confidence: z.number(),
      allergens: z.array(z.string()).optional(),
      dietaryTags: z.array(z.string()).optional()
    }))
  })).optional(),
  metadata: z.object({
    enhancedAt: z.string().optional(),
    enhancedItems: z.number().optional()
  }).optional()
});

async function enhanceWithFullResolution(
  enhancedUrl: string,
  ocrText: string,
  currentExtraction: ExtractedMenu
): Promise<Partial<ExtractedMenu> | null> {
  try {
    const modelName = EXTRACTION_CONFIG.AI.ENHANCEMENT_MODEL;
    const model = useGateway 
      ? gateway(`openai/${modelName}`)
      : openai(modelName);
    
    const enhancementPrompt = `
You have:
1. Current extraction with low confidence items (shown below)
2. OCR text: ${ocrText}
3. High resolution image

Focus on items with confidence < 70% and enhance them.
Current extraction: ${JSON.stringify(currentExtraction)}

Return ONLY the enhanced sections/items that need updating in this schema:
{
  "sections": [{
    "name": "Section Name",
    "confidence": 90,
    "items": [{
      "name": "Item Name", 
      "price": 12.50,
      "description": "Enhanced description",
      "confidence": 85,
      "allergens": ["dairy", "gluten"],
      "dietaryTags": ["vegetarian"]
    }]
  }]
}

CRITICAL NULL HANDLING RULES:
- For missing descriptions: Use empty string "" (NOT null)
- For unclear prices: Use null (NEVER use 0 unless the item is explicitly free)
- Only include items that you are enhancing/correcting
- Do NOT include id fields
- Confidence should be higher than original if enhanced
- Valid examples:
  * With description: {"name": "Pasta", "price": 15.50, "description": "Fresh homemade pasta", "confidence": 95}
  * Without description: {"name": "Soup", "price": 8.00, "description": "", "confidence": 90}
  * Unknown price: {"name": "Market Fish", "price": null, "description": "Fresh catch of the day", "confidence": 85}
  * Free item: {"name": "Bread", "price": 0, "description": "Complimentary", "confidence": 95}`;
    
    // Use generateObject for structured output with proper timeout
    const { object } = await generateObject({
      model,
      schema: EnhancementResultSchema,
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: enhancementPrompt },
          { type: 'image', image: enhancedUrl }
        ]
      }],
      temperature: EXTRACTION_CONFIG.AI.TEMPERATURE,
      maxRetries: 2,
      abortSignal: AbortSignal.timeout(EXTRACTION_CONFIG.TIMEOUTS.AI_ENHANCEMENT)
    });
    
    // Post-process to convert nulls to appropriate defaults
    if (object.sections) {
      object.sections.forEach(section => {
        if (section.items) {
          section.items.forEach(item => {
            // Convert null descriptions to empty strings
            if (item.description === null) {
              item.description = '';
            }
          });
        }
      });
    }
    
    return object;
    
  } catch (error) {
    console.error('Enhancement error:', error);
    return null;
  }
}

function monitorTimeouts(tracker: ProgressTracker, timeouts: typeof EXTRACTION_TIMEOUTS): NodeJS.Timeout {
  const startTime = Date.now();
  
  return setInterval(() => {
    const elapsed = Date.now() - startTime;
    
    for (const timeout of timeouts) {
      if (elapsed >= timeout.after && elapsed < timeout.after + 1000) {
        tracker.sendUpdate(timeout.stage, -1, timeout.message);
      }
    }
  }, 500);
}