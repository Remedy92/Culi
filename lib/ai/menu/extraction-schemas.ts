import { z } from 'zod';

// Branded types for type safety
export type Price = z.infer<typeof PriceSchema>;
export type Confidence = z.infer<typeof ConfidenceSchema>;

export const PriceSchema = z.number().positive().brand('Price');
export const ConfidenceSchema = z.number().min(0).max(100).brand('Confidence');

// Enums for consistency
export const AllergenEnum = z.enum([
  'nuts',
  'dairy',
  'gluten',
  'shellfish',
  'eggs',
  'soy',
  'fish',
  'sesame',
  'celery',
  'mustard',
  'peanuts',
  'sulphites',
  'lupin',
  'molluscs'
]);

export const DietaryTagEnum = z.enum([
  'vegan',
  'vegetarian',
  'gluten-free',
  'dairy-free',
  'nut-free',
  'halal',
  'kosher',
  'organic',
  'spicy',
  'raw',
  'low-carb',
  'keto',
  'paleo'
]);

export const BoundingBoxSchema = z.object({
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number()
});

export const MenuItemSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  price: PriceSchema,
  description: z.string().max(500).optional(),
  allergens: z.array(AllergenEnum).default([]),
  dietaryTags: z.array(DietaryTagEnum).default([]),
  confidence: ConfidenceSchema,
  ocrBoundingBox: BoundingBoxSchema.optional(),
  category: z.string().optional(),
  isAvailable: z.boolean().default(true),
  modifiers: z.array(z.object({
    name: z.string(),
    price: z.number().optional()
  })).optional()
});

export const MenuSectionSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(50),
  description: z.string().max(200).optional(),
  confidence: ConfidenceSchema,
  items: z.array(MenuItemSchema),
  displayOrder: z.number().int().min(0).default(0)
});

export const ExtractedMenuSchema = z.object({
  sections: z.array(MenuSectionSchema),
  overallConfidence: ConfidenceSchema,
  metadata: z.object({
    extractionMethod: z.enum(['ocr-ai-hybrid', 'ai-only', 'ocr-only', 'manual']),
    processingTime: z.number().positive(),
    modelUsed: z.string(),
    ocrConfidence: z.number().min(0).max(100).optional(),
    language: z.string().default('en'),
    currency: z.string().default('EUR'),
    warnings: z.array(z.string()).optional()
  }),
  rawOcrText: z.string().optional(),
  items: z.array(MenuItemSchema) // Flattened view for easy access
});

// OCR specific types
export const OCRLineSchema = z.object({
  text: z.string(),
  bbox: BoundingBoxSchema,
  confidence: z.number().min(0).max(100),
  isHeader: z.boolean().optional(),
  fontSize: z.number().optional()
});

export const OCRResultSchema = z.object({
  text: z.string(),
  confidence: z.number().min(0).max(100),
  lines: z.array(OCRLineSchema),
  language: z.string().optional(),
  orientation: z.number().optional()
});

// Quick AI analysis result
export const QuickAnalysisResultSchema = z.object({
  sections: z.array(z.object({
    name: z.string(),
    confidence: z.number(),
    items: z.array(z.object({
      name: z.string(),
      price: z.number().optional(),
      description: z.string().optional(),
      confidence: z.number()
    }))
  })),
  detectedLanguage: z.string().optional(),
  detectedCurrency: z.string().optional(),
  menuType: z.enum(['restaurant', 'cafe', 'bar', 'bakery', 'other']).optional()
});

// Types
export type AllergenType = z.infer<typeof AllergenEnum>;
export type DietaryTag = z.infer<typeof DietaryTagEnum>;
export type MenuItem = z.infer<typeof MenuItemSchema>;
export type MenuSection = z.infer<typeof MenuSectionSchema>;
export type ExtractedMenu = z.infer<typeof ExtractedMenuSchema>;
export type OCRResult = z.infer<typeof OCRResultSchema>;
export type OCRLine = z.infer<typeof OCRLineSchema>;
export type QuickAnalysisResult = z.infer<typeof QuickAnalysisResultSchema>;