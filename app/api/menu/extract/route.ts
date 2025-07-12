import { NextRequest, NextResponse } from 'next/server';
import { generateObject } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { gateway } from '@ai-sdk/gateway';
import { kv } from '@vercel/kv';
import * as Sentry from '@sentry/nextjs';
import { captureError, trackExtractionError, addBreadcrumb } from '@/lib/sentry';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

import { mergeOCRWithAI, rebuildSectionsFromItems } from '@/lib/ai/menu/extraction-merger';
import { QUICK_ANALYSIS_PROMPT } from '@/lib/ai/menu/extraction-prompts';
import { 
  ExtractedMenuSchema, 
  OCRResultSchema, 
  QuickAnalysisResultSchema,
  ExtractedMenu,
  MenuSectionSchema
} from '@/lib/ai/menu/extraction-schemas';
import { EXTRACTION_CONFIG } from '@/lib/config/extraction';

export const runtime = 'nodejs';
export const maxDuration = 60;

// Initialize clients
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Configure AI providers
const useGateway = !!process.env.AI_GATEWAY_API_KEY;
const openai = createOpenAI(); // Direct OpenAI instance for fallback

console.log('AI Gateway mode:', useGateway);
console.log('Gateway key length:', process.env.AI_GATEWAY_API_KEY?.length || 0);
console.log('OpenAI key length:', process.env.OPENAI_API_KEY?.length || 0);

// Input validation
const ExtractRequestSchema = z.object({
  menuId: z.string().uuid(),
  restaurantId: z.string().uuid(),
  thumbnailUrl: z.string().url(),
  enhancedUrl: z.string().url().optional(),
  forceReprocess: z.boolean().optional()
});

export async function POST(req: NextRequest) {
  return Sentry.startSpanManual({
    op: 'menu.extract',
    name: 'Menu Extraction Pipeline'
  }, async (span) => {
    let input: z.infer<typeof ExtractRequestSchema>;
    
    try {
      // Parse and validate request
      const validationSpan = Sentry.startInactiveSpan({
        op: 'validation',
        description: 'Validate request'
      });
      
      const body = await req.json();
      input = ExtractRequestSchema.parse(body);
      
      validationSpan.end();
      
      // Track extraction start time
      const extractionStartTime = Date.now();

    // Check cache first (unless force reprocess)
    if (!input.forceReprocess) {
      const cacheSpan = Sentry.startInactiveSpan({
        op: 'cache.check',
        description: 'Check extraction cache'
      });

      const cacheKey = `${EXTRACTION_CONFIG.CACHE.KEY_PREFIX}${input.menuId}`;
      const cached = await kv.get<ExtractedMenu>(cacheKey);
      
      cacheSpan.end();

      if (cached) {
        span.end();
        return NextResponse.json({
          success: true,
          extraction: cached,
          fromCache: true
        });
      }
    }

    // Verify menu exists and belongs to restaurant
    const { data: menu, error: menuError } = await supabase
      .from('menus')
      .select('*')
      .eq('id', input.menuId)
      .eq('restaurant_id', input.restaurantId)
      .single();

    if (menuError || !menu) {
      span.end();
      return NextResponse.json(
        { error: 'Menu not found or access denied' },
        { status: 404 }
      );
    }

    // Start parallel processing
    const parallelSpan = Sentry.startInactiveSpan({
      op: 'parallel.processing',
      description: 'OCR + AI Analysis'
    });

    console.log('Starting parallel OCR and AI analysis...');
    
    const results = await Promise.allSettled([
      EXTRACTION_CONFIG.FEATURES.USE_GOOGLE_VISION ? 
        performOCRWithGoogleVision(input.thumbnailUrl) : 
        performOCR(input.thumbnailUrl),
      performQuickAIAnalysis(input.thumbnailUrl)
    ]);
    
    console.log('Parallel processing completed');
    
    // Extract results with proper error handling
    const ocrSettled = results[0];
    const aiSettled = results[1];
    
    if (ocrSettled.status === 'rejected') {
      console.error('OCR failed:', ocrSettled.reason);
      span.end();
      return NextResponse.json(
        { error: 'OCR processing failed', message: ocrSettled.reason?.message || 'Unknown error' },
        { status: 500 }
      );
    }
    
    const ocrResult = ocrSettled.value;
    
    // If AI fails, we can still use OCR results
    let aiQuickAnalysis: z.infer<typeof QuickAnalysisResultSchema>;
    if (aiSettled.status === 'rejected') {
      console.error('AI analysis failed, using fallback:', aiSettled.reason);
      // Use minimal AI results as fallback
      aiQuickAnalysis = {
        sections: [],
        detectedLanguage: 'en',
        detectedCurrency: 'EUR'
      };
    } else {
      aiQuickAnalysis = aiSettled.value;
    }

    parallelSpan.end();

    // Merge results
    const mergeSpan = Sentry.startInactiveSpan({
      op: 'merge',
      description: 'Merge OCR and AI results'
    });

    const mergedResult = mergeOCRWithAI(ocrResult, aiQuickAnalysis);
    
    mergeSpan.end();

    // Validate extraction result
    const validatedResult = ExtractedMenuSchema.parse(mergedResult);
    
    // Track warnings for non-critical issues
    const warnings: string[] = [];
    
    // Enhancement tracking variable
    let enhancedResult: Awaited<ReturnType<typeof enhanceWithFullResolution>> | null = null;

    // Check if enhancement needed
    if (validatedResult.overallConfidence < EXTRACTION_CONFIG.OCR.CONFIDENCE_THRESHOLD && input.enhancedUrl) {
      const enhanceSpan = Sentry.startInactiveSpan({
        op: 'enhance',
        description: 'Enhance with full resolution'
      });

      enhancedResult = await enhanceWithFullResolution(
        input.enhancedUrl,
        ocrResult.text,
        validatedResult
      );

      enhanceSpan.end();

      if (enhancedResult) {
        // Log pre-enhancement state
        console.log(`Pre-enhancement: ${validatedResult.sections.length} sections, ${validatedResult.items.length} items`);
        
        // Properly merge enhanced sections without overwriting all sections
        if (enhancedResult.sections) {
          // Create a map of enhanced sections by ID for efficient lookup
          const enhancedSectionsMap = new Map(
            enhancedResult.sections.map(s => [s.id, s])
          );
          
          // Merge sections preserving all original sections
          validatedResult.sections = validatedResult.sections.map(section => {
            const enhanced = enhancedSectionsMap.get(section.id);
            if (!enhanced) return section; // Keep non-enhanced sections as-is
            
            // Create a map of enhanced items for this section
            const enhancedItemsMap = new Map(
              enhanced.items.map(item => [item.id, item])
            );
            
            // Merge items within the section
            return {
              ...section,
              items: section.items.map(item => {
                const enhancedItem = enhancedItemsMap.get(item.id);
                return enhancedItem ? { ...item, ...enhancedItem } : item;
              }),
              // Update section confidence if enhanced
              confidence: enhanced.confidence || section.confidence
            };
          });
          
          console.log(`Enhancement updated ${enhancedResult.sections.length} sections`);
        }
        
        // Merge other enhanced properties (metadata, etc.) but not sections
        if (enhancedResult.metadata) {
          Object.assign(validatedResult.metadata, enhancedResult.metadata);
        }
      } else {
        warnings.push('Enhancement skipped due to processing error');
      }
    }

    // Validation safeguards after merging
    const sectionItemCount = validatedResult.sections.reduce(
      (sum, section) => sum + section.items.length, 0
    );
    
    if (sectionItemCount !== validatedResult.items.length) {
      console.warn(`Section/items mismatch: ${sectionItemCount} items in sections vs ${validatedResult.items.length} in items array`);
      
      // Capture warning to Sentry for monitoring
      Sentry.captureMessage('Menu extraction section/items mismatch', {
        level: 'warning',
        extra: {
          menuId: input.menuId,
          sectionItemCount,
          itemsArrayCount: validatedResult.items.length,
          sectionCount: validatedResult.sections.length
        }
      });
      
      addBreadcrumb('Extraction validation warning', 'validation', {
        sectionItemCount,
        itemsArrayCount: validatedResult.items.length,
        sectionCount: validatedResult.sections.length
      });
      
      warnings.push(`Item count mismatch detected: ${sectionItemCount} in sections vs ${validatedResult.items.length} total`);
      
      // Rebuild sections if we're missing items
      if (sectionItemCount < validatedResult.items.length) {
        console.warn('Rebuilding sections from items array due to missing items');
        validatedResult.sections = rebuildSectionsFromItems(validatedResult.items);
        warnings.push('Sections were rebuilt from items to recover missing data');
      }
    }
    
    // Re-validate against schema
    const validation = ExtractedMenuSchema.safeParse(validatedResult);
    if (!validation.success) {
      console.error('Extraction validation failed:', validation.error);
      addBreadcrumb('Schema validation failed', 'validation', {
        errors: validation.error.errors
      });
      // Don't throw - we can still save with warnings
      warnings.push('Extraction data may not conform to expected schema');
    }

    // Save to database
    const saveSpan = Sentry.startInactiveSpan({
      op: 'database.save',
      description: 'Save extraction results'
    });

    const { data: updatedMenu, error: updateError } = await supabase
      .from('menus')
      .update({
        extracted_data: validatedResult,
        extraction_confidence: validatedResult.overallConfidence / 100,
        extraction_model: validatedResult.metadata.modelUsed,
        extraction_timestamp: new Date().toISOString(),
        is_active: true
      })
      .eq('id', input.menuId)
      .select()
      .single();

    if (updateError) {
      console.error('Failed to update menu:', updateError);
      throw new Error('Failed to save extraction results');
    }
    
    // Verify the update was successful
    if (!updatedMenu?.extracted_data) {
      console.error('Menu update succeeded but extracted_data is missing');
      throw new Error('Extraction data was not saved properly');
    }

    // Save individual items for search - use the flattened items array
    const items = validatedResult.items.map(item => ({
      menu_id: input.menuId,
      restaurant_id: input.restaurantId,
      category: item.category || 'Uncategorized', // Correct column name
      name: item.name,
      price: item.price ?? null, // Handle undefined prices (e.g., bundle items)
      description: item.description || null,
      allergens: item.allergens || [],
      dietary_tags: item.dietaryTags || [],
      extraction_confidence: (item.confidence || 0) / 100
    }));

    let insertedItemsCount = 0;
    if (items.length > 0) {
      const { data: insertedItems, error: insertError } = await supabase
        .from('menu_items_cache')
        .insert(items)
        .select();
      
      if (insertError) {
        console.error('Failed to insert menu items to cache:', insertError);
        addBreadcrumb('menu_items_cache insert failed', 'database', { 
          error: insertError.message,
          itemCount: items.length 
        });
        warnings.push('Some items may not be searchable due to cache insert failure');
      } else {
        insertedItemsCount = insertedItems?.length || 0;
      }
    }

    saveSpan.end();

    // Cache the result
    const cacheSetSpan = Sentry.startInactiveSpan({
      op: 'cache.set',
      description: 'Cache extraction results'
    });

    await kv.set(
      `${EXTRACTION_CONFIG.CACHE.KEY_PREFIX}${input.menuId}`,
      validatedResult,
      { ex: EXTRACTION_CONFIG.CACHE.TTL }
    );

    cacheSetSpan.end();

    // Calculate processing time
    const processingTime = Date.now() - extractionStartTime;
    validatedResult.metadata.processingTime = processingTime;
    
    // Track metrics
    span.setAttribute('extraction.sections_count', validatedResult.sections.length);
    span.setAttribute('extraction.items_extracted', validatedResult.items.length);
    span.setAttribute('extraction.items_cached', insertedItemsCount);
    span.setAttribute('extraction.confidence_score', validatedResult.overallConfidence);
    span.setAttribute('extraction.ocr_confidence', ocrResult.confidence);
    span.setAttribute('extraction.processing_time', processingTime);
    span.setAttribute('extraction.enhanced', !!enhancedResult);

    span.end();

    // Return success response with comprehensive logging
    console.log(`Extraction completed for menu ${input.menuId}:
- Sections: ${validatedResult.sections.length}
- Total items: ${validatedResult.items.length}
- Cache items inserted: ${insertedItemsCount}
- Confidence: ${validatedResult.overallConfidence}%
- Processing time: ${processingTime}ms
- Enhanced: ${!!enhancedResult}`);
    
    return NextResponse.json({
      success: true,
      extraction: validatedResult,
      menuId: input.menuId,
      hasExtractedData: !!updatedMenu.extracted_data,
      warnings: warnings.length > 0 ? warnings : undefined,
      metrics: {
        sectionsExtracted: validatedResult.sections.length,
        itemsExtracted: validatedResult.items.length,
        itemsCached: insertedItemsCount,
        confidence: validatedResult.overallConfidence,
        processingTime: processingTime,
        enhanced: !!enhancedResult
      }
    });

    } catch (error) {
      span.setStatus({ code: 2, message: 'internal_error' });
      span.end();

      if (input) {
        trackExtractionError(
          error instanceof Error ? error : new Error('Unknown extraction error'),
          input.menuId,
          input.restaurantId,
          'merge'
        );
      }

      console.error('Extraction error:', error);

      return NextResponse.json(
        {
          error: 'Extraction failed',
          message: error instanceof Error ? error.message : 'Unknown error',
          fallbackToManual: true
        },
        { status: 500 }
      );
    }
  });
}

async function performOCRWithGoogleVision(
  imageUrl: string
): Promise<z.infer<typeof OCRResultSchema>> {
  const span = Sentry.startInactiveSpan({
    op: 'ocr.google',
    description: 'Google Cloud Vision OCR processing'
  });

  console.log('Starting Google Vision OCR processing...');
  const startTime = Date.now();

  try {
    // Dynamically import Google Cloud Vision to reduce bundle size
    const vision = await import('@google-cloud/vision');
    
    // Creates a client
    const client = new vision.ImageAnnotatorClient({
      // If credentials are not provided, the client library will look for credentials in the environment
      credentials: process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON ? 
        (() => {
          const creds = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
          // Fix escaped newlines in private key
          if (creds.private_key) {
            creds.private_key = creds.private_key.replace(/\\n/g, '\n');
          }
          return creds;
        })() : undefined
    });

    // Prepare the request
    const request = {
      image: {
        source: {
          imageUri: imageUrl
        }
      },
      features: [{
        type: EXTRACTION_CONFIG.GOOGLE_VISION.FEATURE_TYPE,
        maxResults: EXTRACTION_CONFIG.GOOGLE_VISION.MAX_RESULTS
      }],
      imageContext: {
        languageHints: EXTRACTION_CONFIG.GOOGLE_VISION.LANGUAGE_HINTS
      }
    };

    console.log('Calling Google Vision API...');
    
    // Perform text detection
    const [result] = await client.annotateImage(request);
    const fullTextAnnotation = result.fullTextAnnotation;
    
    if (!fullTextAnnotation) {
      throw new Error('No text detected in image');
    }

    // Convert Google Vision response to our OCR schema
    const pages = fullTextAnnotation.pages || [];
    const lines: Array<{
      text: string;
      bbox: { x: number; y: number; width: number; height: number };
      confidence: number;
    }> = [];
    let totalConfidence = 0;
    let lineCount = 0;

    // Extract lines from pages -> blocks -> paragraphs -> words
    for (const page of pages) {
      if (!page.blocks) continue;
      
      for (const block of page.blocks) {
        if (!block.paragraphs) continue;
        
        for (const paragraph of block.paragraphs) {
          if (!paragraph.words) continue;
          
          // Reconstruct line text from words
          let lineText = '';
          let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
          let lineConfidence = 0;
          let wordCount = 0;
          
          for (const word of paragraph.words) {
            if (!word.symbols) continue;
            
            let wordText = '';
            for (const symbol of word.symbols) {
              wordText += symbol.text || '';
              
              // Update confidence
              if (symbol.confidence !== undefined) {
                lineConfidence += symbol.confidence;
                wordCount++;
              }
              
              // Update bounding box
              if (symbol.boundingBox && symbol.boundingBox.vertices) {
                for (const vertex of symbol.boundingBox.vertices) {
                  minX = Math.min(minX, vertex.x || 0);
                  minY = Math.min(minY, vertex.y || 0);
                  maxX = Math.max(maxX, vertex.x || 0);
                  maxY = Math.max(maxY, vertex.y || 0);
                }
              }
              
              // Check for line break
              if (symbol.property?.detectedBreak?.type?.includes('LINE_BREAK')) {
                wordText += '\n';
              } else if (symbol.property?.detectedBreak?.type?.includes('SPACE')) {
                wordText += ' ';
              }
            }
            
            lineText += wordText;
          }
          
          if (lineText.trim()) {
            const avgConfidence = wordCount > 0 ? (lineConfidence / wordCount) * 100 : 0;
            totalConfidence += avgConfidence;
            lineCount++;
            
            lines.push({
              text: lineText.trim(),
              bbox: {
                x: minX,
                y: minY,
                width: maxX - minX,
                height: maxY - minY
              },
              confidence: avgConfidence
            });
          }
        }
      }
    }

    const overallConfidence = lineCount > 0 ? totalConfidence / lineCount : 0;
    
    const result_schema = OCRResultSchema.parse({
      text: fullTextAnnotation.text || '',
      confidence: overallConfidence,
      lines: lines,
      language: pages[0]?.property?.detectedLanguages?.[0]?.languageCode || 'unknown'
    });

    const duration = Date.now() - startTime;
    console.log(`Google Vision OCR completed in ${duration}ms. Confidence: ${result_schema.confidence}%, Lines: ${result_schema.lines.length}, Text length: ${result_schema.text.length}`);
    
    span.setAttribute('ocr.confidence', result_schema.confidence);
    span.setAttribute('ocr.lines', result_schema.lines.length);
    span.setAttribute('ocr.duration', duration);
    span.setAttribute('ocr.provider', 'google_vision');
    span.end();

    return result_schema;
  } catch (error) {
    console.error('Google Vision OCR error:', error);
    span.setAttribute('ocr.error', true);
    span.end();
    throw new Error(`Google Vision OCR failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function performOCR(
  imageUrl: string
): Promise<z.infer<typeof OCRResultSchema>> {
  const span = Sentry.startInactiveSpan({
    op: 'ocr',
    description: 'Tesseract OCR processing'
  });

  console.log('Starting OCR processing...');
  const startTime = Date.now();

  // Dynamically import Tesseract.js to reduce bundle size
  const { createWorker } = await import('tesseract.js');
  console.log('Creating OCR worker with languages:', EXTRACTION_CONFIG.OCR.LANGUAGES);
  const worker = await createWorker(EXTRACTION_CONFIG.OCR.LANGUAGES.join('+'));
  
  try {
    await worker.setParameters({
      tessedit_pageseg_mode: EXTRACTION_CONFIG.OCR.PAGE_SEG_MODE,
      preserve_interword_spaces: EXTRACTION_CONFIG.OCR.PRESERVE_SPACES,
      tessedit_char_whitelist: EXTRACTION_CONFIG.OCR.CHAR_WHITELIST,
      user_defined_dpi: '300' // Force higher DPI to improve line detection
    });

    console.log('Starting OCR recognition...');
    
    // Add timeout to prevent hanging
    const recognizePromise = worker.recognize(imageUrl);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('OCR timeout after 30 seconds')), 30000)
    );
    
    const { data } = await Promise.race([recognizePromise, timeoutPromise]) as Awaited<ReturnType<typeof worker.recognize>>;
    
    // Log full data structure for debugging
    console.log('OCR data structure:', {
      hasLines: !!data.lines,
      linesCount: data.lines?.length || 0,
      textLength: data.text?.length || 0,
      confidence: data.confidence || 0
    });
    
    // Add defensive coding for missing lines
    if (!data.lines) {
      console.warn('OCR warning: No text lines property in response');
      data.lines = [];
    }
    
    // Fallback: Create synthetic lines if none detected but text exists
    let lines = data.lines || [];
    if (lines.length === 0 && data.text && data.text.trim().length > 0) {
      console.warn('OCR fallback: Creating synthetic lines from text');
      addBreadcrumb('OCR synthetic lines fallback', 'ocr', { 
        textLength: data.text.length,
        confidence: data.confidence 
      });
      
      // Split text by newlines and create synthetic line objects
      const textLines = data.text.split('\n').filter(line => line.trim().length > 0);
      lines = textLines.map((text, index) => ({
        text,
        confidence: data.confidence || 0,
        bbox: {
          x0: 0,
          y0: index * 30,
          x1: 1000,
          y1: (index + 1) * 30
        },
        words: []
      }));
    }
    
    const result = OCRResultSchema.parse({
      text: data.text || '',
      confidence: data.confidence || 0,
      lines: lines.map(line => ({
        text: line.text,
        bbox: {
          x: line.bbox.x0,
          y: line.bbox.y0,
          width: line.bbox.x1 - line.bbox.x0,
          height: line.bbox.y1 - line.bbox.y0
        },
        confidence: line.confidence
      })),
      language: data.language || 'unknown'
    });

    const duration = Date.now() - startTime;
    console.log(`OCR completed in ${duration}ms. Confidence: ${result.confidence}%, Lines: ${result.lines.length}, Text length: ${result.text.length}`);
    
    span.setAttribute('ocr.confidence', result.confidence);
    span.setAttribute('ocr.lines', result.lines.length);
    span.setAttribute('ocr.duration', duration);
    span.end();

    return result;
  } catch (error) {
    console.error('OCR error:', error);
    span.setAttribute('ocr.error', true);
    span.end();
    throw new Error(`OCR failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    await worker.terminate();
  }
}

async function performQuickAIAnalysis(
  imageUrl: string,
  retryCount: number = 0
): Promise<z.infer<typeof QuickAnalysisResultSchema>> {
  const span = Sentry.startInactiveSpan({
    op: 'ai.quick',
    description: 'Quick AI analysis'
  });

  console.log('Starting AI analysis...');
  const startTime = Date.now();
  
  // Create AbortController for proper stream cancellation
  const abortController = new AbortController();
  const timeoutId = setTimeout(() => {
    console.log('AI analysis timeout triggered, aborting...');
    abortController.abort();
  }, 30000);

  try {
    // Use cheaper model for quick analysis
    const modelName = EXTRACTION_CONFIG.AI.QUICK_ANALYSIS_MODEL;
    const model = useGateway 
      ? gateway(`openai/${modelName}`)  // Gateway format with provider prefix
      : openai(modelName);              // Direct OpenAI format
    
    console.log(`Using ${useGateway ? 'gateway' : 'direct'} model: ${useGateway ? 'openai/' : ''}${modelName}`);
    console.log('Image URL:', imageUrl);
    console.log('Prompt length:', QUICK_ANALYSIS_PROMPT.length);
    console.log('Calling AI API with generateObject for structured output...');
    
    // Use generateObject for guaranteed structured output
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
      maxTokens: EXTRACTION_CONFIG.AI.MAX_TOKENS.QUICK,
      abortSignal: abortController.signal
    });

    console.log('AI response received');
    
    clearTimeout(timeoutId);
    
    const duration = Date.now() - startTime;
    console.log(`AI analysis completed in ${duration}ms`);
    
    span.setAttribute('ai.duration', duration);
    span.end();
    
    // Object is already validated and typed!
    return object;
  } catch (error) {
    clearTimeout(timeoutId);
    
    // Check if it's an abort error
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('AI analysis timed out after 30 seconds');
    } else {
      console.error('AI analysis error:', error);
    }
    
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      errorName: error instanceof Error ? error.name : 'Unknown',
      apiKeySet: !!process.env.OPENAI_API_KEY,
      apiKeyLength: process.env.OPENAI_API_KEY?.length || 0,
      usingGateway: !!process.env.AI_GATEWAY_API_KEY,
      gatewayKeyLength: process.env.AI_GATEWAY_API_KEY?.length || 0,
      retryCount
    });
    
    // Retry logic for gateway failures (up to 3 attempts)
    const isGatewayError = error instanceof Error && 
      (error.message.includes('401') || 
       error.message.includes('429') || 
       error.message.includes('503') ||
       error.message.includes('AI_GATEWAY') ||
       error.message.includes('gateway') ||
       error.name === 'AbortError');
    
    if (isGatewayError && retryCount < 2 && useGateway) {
      console.log(`Retrying AI analysis (attempt ${retryCount + 2}/3)...`);
      // Exponential backoff: 1s, 2s
      await new Promise(resolve => setTimeout(resolve, (retryCount + 1) * 1000));
      return performQuickAIAnalysis(imageUrl, retryCount + 1);
    }
    
    span.setStatus({ code: 2, message: 'internal_error' });
    span.end();
    
    addBreadcrumb('AI quick analysis failed', 'ai', { imageUrl, retryCount });
    captureError(error, { 
      operation: 'quick_ai_analysis',
      imageUrl,
      retryCount 
    });
    
    // Return minimal structure on error
    return {
      sections: [],
      detectedLanguage: 'en',
      detectedCurrency: 'EUR'
    };
  }
}

async function enhanceWithFullResolution(
  enhancedUrl: string,
  ocrText: string,
  currentExtraction: ExtractedMenu
): Promise<Partial<ExtractedMenu> | null> {
  const span = Sentry.startInactiveSpan({
    op: 'ai.enhance',
    description: 'Full resolution enhancement'
  });
  
  // Create AbortController for enhancement timeout
  const abortController = new AbortController();
  const timeoutId = setTimeout(() => {
    console.log('Enhancement timeout triggered, aborting...');
    abortController.abort();
  }, 40000); // 40 seconds for enhancement

  try {
    // Use better model for enhancement
    const modelName = EXTRACTION_CONFIG.AI.ENHANCEMENT_MODEL;
    const model = useGateway 
      ? gateway(`openai/${modelName}`)  // Gateway format with provider prefix
      : openai(modelName);              // Direct OpenAI format
    
    console.log(`Using ${useGateway ? 'gateway' : 'direct'} enhancement model: ${useGateway ? 'openai/' : ''}${modelName}`);
    
    const enhancementPrompt = `
You have:
1. Current extraction with low confidence items (shown below)
2. OCR text: ${ocrText}
3. High resolution image

Focus on items with confidence < 70% and enhance them.
Current extraction: ${JSON.stringify(currentExtraction)}

Return only the enhanced sections/items that need updating.`;

    // Define enhancement schema for partial updates
    const EnhancementResultSchema = z.object({
      sections: z.array(MenuSectionSchema).optional(),
      metadata: z.object({
        enhancedAt: z.string().optional(),
        enhancedItems: z.number().optional()
      }).optional()
    });
    
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
      maxTokens: EXTRACTION_CONFIG.AI.MAX_TOKENS.ENHANCEMENT,
      abortSignal: abortController.signal
    });
    clearTimeout(timeoutId);
    span.end();
    
    return object;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('Enhancement timed out after 40 seconds');
    } else {
      console.error('Enhancement error:', error);
    }
    
    span.setStatus({ code: 2, message: 'internal_error' });
    span.end();
    
    captureError(error, {
      operation: 'enhancement',
      enhancedUrl
    });
    
    return null;
  }
}