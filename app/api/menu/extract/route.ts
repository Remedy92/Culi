import { NextRequest, NextResponse } from 'next/server';
import { streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { kv } from '@vercel/kv';
import * as Sentry from '@sentry/nextjs';
import { captureError, trackExtractionError, addBreadcrumb } from '@/lib/sentry';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

import { mergeOCRWithAI } from '@/lib/ai/menu/extraction-merger';
import { QUICK_ANALYSIS_PROMPT } from '@/lib/ai/menu/extraction-prompts';
import { 
  ExtractedMenuSchema, 
  OCRResultSchema, 
  QuickAnalysisResultSchema,
  ExtractedMenu 
} from '@/lib/ai/menu/extraction-schemas';
import { EXTRACTION_CONFIG } from '@/lib/config/extraction';

export const runtime = 'nodejs';
export const maxDuration = 60;

// Initialize clients
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Configure AI Gateway for v5
const gatewayOpenAI = process.env.AI_GATEWAY_API_KEY
  ? createOpenAI({
      baseURL: 'https://ai-gateway.vercel.sh/v1', // Vercel AI Gateway URL
      apiKey: process.env.AI_GATEWAY_API_KEY,
    })
  : createOpenAI(); // Direct OpenAI fallback (uses OPENAI_API_KEY)

console.log('AI Gateway configured:', !!process.env.AI_GATEWAY_API_KEY);

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
    
    const [ocrResult, aiQuickAnalysis] = await Promise.all([
      performOCR(input.thumbnailUrl).catch(err => {
        console.error('OCR failed:', err);
        throw err;
      }),
      performQuickAIAnalysis(input.thumbnailUrl).catch(err => {
        console.error('AI analysis failed:', err);
        throw err;
      })
    ]);
    
    console.log('Parallel processing completed');

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

    // Check if enhancement needed
    if (validatedResult.overallConfidence < EXTRACTION_CONFIG.OCR.CONFIDENCE_THRESHOLD && input.enhancedUrl) {
      const enhanceSpan = Sentry.startInactiveSpan({
        op: 'enhance',
        description: 'Enhance with full resolution'
      });

      const enhancedResult = await enhanceWithFullResolution(
        input.enhancedUrl,
        ocrResult.text,
        validatedResult
      );

      enhanceSpan.end();

      if (enhancedResult) {
        Object.assign(validatedResult, enhancedResult);
      }
    }

    // Save to database
    const saveSpan = Sentry.startInactiveSpan({
      op: 'database.save',
      description: 'Save extraction results'
    });

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
      console.error('Failed to update menu:', updateError);
      throw new Error('Failed to save extraction results');
    }

    // Save individual items for search
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

    // Track metrics
    span.setAttribute('extraction.items_extracted', items.length);
    span.setAttribute('extraction.confidence_score', validatedResult.overallConfidence);
    span.setAttribute('extraction.ocr_confidence', ocrResult.confidence);

    span.end();

    // Return success response
    return NextResponse.json({
      success: true,
      extraction: validatedResult,
      metrics: {
        itemsExtracted: items.length,
        confidence: validatedResult.overallConfidence,
        processingTime: validatedResult.metadata.processingTime
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
      preserve_interword_spaces: EXTRACTION_CONFIG.OCR.PRESERVE_SPACES
      // Removed tessedit_char_whitelist as it can interfere with non-English languages
    });

    console.log('Starting OCR recognition...');
    
    // Add timeout to prevent hanging
    const recognizePromise = worker.recognize(imageUrl);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('OCR timeout after 30 seconds')), 30000)
    );
    
    const { data } = await Promise.race([recognizePromise, timeoutPromise]) as Awaited<ReturnType<typeof worker.recognize>>;
    
    // Add defensive coding for missing lines
    if (!data.lines) {
      console.warn('OCR warning: No text lines detected in image');
      data.lines = [];
    }
    
    const result = OCRResultSchema.parse({
      text: data.text || '',
      confidence: data.confidence || 0,
      lines: data.lines.map(line => ({
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
  imageUrl: string
): Promise<z.infer<typeof QuickAnalysisResultSchema>> {
  const span = Sentry.startInactiveSpan({
    op: 'ai.quick',
    description: 'Quick AI analysis'
  });

  console.log('Starting AI analysis...');
  const startTime = Date.now();

  try {
    // Use cheaper model for quick analysis
    console.log('Initializing AI model:', EXTRACTION_CONFIG.AI.QUICK_ANALYSIS_MODEL);
    console.log('Using AI Gateway:', !!process.env.AI_GATEWAY_API_KEY);
    const model = gatewayOpenAI(EXTRACTION_CONFIG.AI.QUICK_ANALYSIS_MODEL);
    
    console.log('Calling AI API...');
    
    // Add timeout to prevent hanging
    const streamPromise = streamText({
      model,
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: QUICK_ANALYSIS_PROMPT },
          { type: 'image', image: imageUrl }
        ]
      }],
      temperature: EXTRACTION_CONFIG.AI.TEMPERATURE,
      maxOutputTokens: EXTRACTION_CONFIG.AI.MAX_TOKENS.QUICK  // v5 uses maxOutputTokens
    });
    
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('AI analysis timeout after 30 seconds')), 30000)
    );
    
    const result = await Promise.race([streamPromise, timeoutPromise]) as Awaited<typeof streamPromise>;

    console.log('Awaiting AI response text...');
    const text = await result.text;
    const parsed = JSON.parse(text);
    
    const duration = Date.now() - startTime;
    console.log(`AI analysis completed in ${duration}ms`);
    
    span.setAttribute('ai.duration', duration);
    span.end();
    
    return QuickAnalysisResultSchema.parse(parsed);
  } catch (error) {
    console.error('AI analysis error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      apiKeySet: !!process.env.OPENAI_API_KEY,
      apiKeyLength: process.env.OPENAI_API_KEY?.length || 0,
      usingGateway: !!process.env.AI_GATEWAY_API_KEY,
      gatewayKeyLength: process.env.AI_GATEWAY_API_KEY?.length || 0
    });
    
    span.setStatus({ code: 2, message: 'internal_error' });
    span.end();
    
    addBreadcrumb('AI quick analysis failed', 'ai', { imageUrl });
    captureError(error, { 
      operation: 'quick_ai_analysis',
      imageUrl 
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

  try {
    // Use better model for enhancement
    console.log('Using enhancement model with gateway:', !!process.env.AI_GATEWAY_API_KEY);
    const model = gatewayOpenAI(EXTRACTION_CONFIG.AI.ENHANCEMENT_MODEL);
    
    const enhancementPrompt = `
You have:
1. Current extraction with low confidence items (shown below)
2. OCR text: ${ocrText}
3. High resolution image

Focus on items with confidence < 70% and enhance them.
Current extraction: ${JSON.stringify(currentExtraction)}

Return only the enhanced sections/items that need updating.`;

    const result = await streamText({
      model,
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: enhancementPrompt },
          { type: 'image', image: enhancedUrl }
        ]
      }],
      temperature: EXTRACTION_CONFIG.AI.TEMPERATURE,
      maxOutputTokens: EXTRACTION_CONFIG.AI.MAX_TOKENS.ENHANCEMENT  // v5 uses maxOutputTokens
    });

    const enhancement = await result.text;
    span.end();
    
    return JSON.parse(enhancement);
  } catch (error) {
    span.setStatus({ code: 2, message: 'internal_error' });
    span.end();
    
    captureError(error, {
      operation: 'enhancement',
      enhancedUrl
    });
    
    return null;
  }
}