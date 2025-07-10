import { z } from 'zod';
import { 
  OCRResult, 
  QuickAnalysisResult, 
  ExtractedMenu, 
  AllergenType, 
  DietaryTag,
  MenuItem,
  MenuSection,
  ConfidenceSchema 
} from './extraction-schemas';
import { EXTRACTION_CONFIG } from '@/lib/config/extraction';

interface TextMatch {
  text: string;
  confidence: number;
  lineIndex?: number;
}

interface PriceMatch {
  value: number;
  confidence: number;
  lineIndex?: number;
}

export function mergeOCRWithAI(
  ocr: OCRResult,
  ai: QuickAnalysisResult
): ExtractedMenu {
  const startTime = Date.now();
  const ocrLines = ocr.lines.map(l => l.text);
  
  const sections: MenuSection[] = [];
  const allItems: MenuItem[] = [];
  
  // Process each AI-detected section
  ai.sections.forEach((aiSection, sectionIndex) => {
    const sectionMatch = findBestTextMatch(aiSection.name, ocrLines);
    
    const section: MenuSection = {
      id: generateUUID(),
      name: sectionMatch?.text || aiSection.name,
      confidence: sectionMatch ? Math.min(95, sectionMatch.confidence + 10) : aiSection.confidence,
      displayOrder: sectionIndex,
      items: []
    };
    
    // Process items in section
    aiSection.items.forEach(aiItem => {
      const itemMatch = findBestTextMatch(aiItem.name, ocrLines);
      const priceMatch = aiItem.price ? findPriceInOCR(aiItem.name, ocrLines) : undefined;
      const descMatch = findDescriptionInOCR(aiItem.name, ocrLines, itemMatch?.lineIndex);
      
      const mergedDescription = descMatch?.text || aiItem.description || '';
      
      const item: MenuItem = {
        id: generateUUID(),
        name: itemMatch?.text || aiItem.name,
        price: (priceMatch?.value || aiItem.price || 0) as z.infer<typeof ConfidenceSchema>,
        description: mergedDescription || undefined,
        allergens: inferAllergensFromText(mergedDescription),
        dietaryTags: inferDietaryTags(mergedDescription + ' ' + (itemMatch?.text || aiItem.name)),
        confidence: calculateItemConfidence(aiItem, itemMatch, priceMatch, descMatch) as z.infer<typeof ConfidenceSchema>,
        isAvailable: true,
        category: section.name
      };
      
      section.items.push(item);
      allItems.push(item);
    });
    
    sections.push(section);
  });
  
  // Calculate overall confidence
  const allConfidences = [
    ...sections.map(s => s.confidence),
    ...allItems.map(i => i.confidence)
  ];
  const overallConfidence = allConfidences.length > 0
    ? Math.round(allConfidences.reduce((a, b) => a + b, 0) / allConfidences.length)
    : 0;
  
  return {
    sections,
    items: allItems,
    overallConfidence: overallConfidence as z.infer<typeof ConfidenceSchema>,
    metadata: {
      extractionMethod: 'ocr-ai-hybrid',
      processingTime: Date.now() - startTime,
      modelUsed: 'gpt-4o',
      ocrConfidence: ocr.confidence,
      language: ai.detectedLanguage || 'en',
      currency: ai.detectedCurrency || 'EUR',
      warnings: identifyWarnings(sections, ocr)
    },
    rawOcrText: ocr.text
  };
}

function findBestTextMatch(target: string, ocrLines: string[]): TextMatch | null {
  const normalizedTarget = normalizeText(target);
  let bestMatch: TextMatch | null = null;
  let bestScore = 0;
  
  ocrLines.forEach((line, index) => {
    const normalizedLine = normalizeText(line);
    const score = calculateSimilarity(normalizedTarget, normalizedLine);
    
    // Also check if target is contained within line
    if (normalizedLine.includes(normalizedTarget) || normalizedTarget.includes(normalizedLine)) {
      const containScore = Math.max(score, 0.8);
      if (containScore > bestScore) {
        bestScore = containScore;
        bestMatch = {
          text: line,
          confidence: Math.round(containScore * 100),
          lineIndex: index
        };
      }
    } else if (score > bestScore && score > 0.6) {
      bestScore = score;
      bestMatch = {
        text: line,
        confidence: Math.round(score * 100),
        lineIndex: index
      };
    }
  });
  
  return bestMatch;
}

function findPriceInOCR(itemName: string, ocrLines: string[]): PriceMatch | null {
  // Price patterns: $12.99, 12.99, 12,99, 12€, €12, etc.
  const pricePattern = /(?:[$€£¥₹]\s?)?\d+[.,]\d{2}(?:\s?[$€£¥₹])?|\d+(?:\s?[$€£¥₹])/g;
  
  // First, try to find price on the same line as item
  const itemLine = ocrLines.find(line => 
    normalizeText(line).includes(normalizeText(itemName))
  );
  
  if (itemLine) {
    const matches = itemLine.match(pricePattern);
    if (matches && matches.length > 0) {
      const price = parsePrice(matches[0]);
      if (price > 0) {
        return { value: price, confidence: 95 };
      }
    }
  }
  
  // Look for price in surrounding lines
  const itemIndex = ocrLines.findIndex(line => 
    normalizeText(line).includes(normalizeText(itemName))
  );
  
  if (itemIndex >= 0) {
    // Check next 2 lines
    for (let i = 1; i <= 2; i++) {
      if (itemIndex + i < ocrLines.length) {
        const matches = ocrLines[itemIndex + i].match(pricePattern);
        if (matches && matches.length > 0) {
          const price = parsePrice(matches[0]);
          if (price > 0) {
            return { value: price, confidence: 85 - (i * 5) };
          }
        }
      }
    }
  }
  
  return null;
}

function findDescriptionInOCR(
  itemName: string, 
  ocrLines: string[], 
  itemLineIndex?: number
): TextMatch | null {
  if (itemLineIndex === undefined) {
    itemLineIndex = ocrLines.findIndex(line => 
      normalizeText(line).includes(normalizeText(itemName))
    );
  }
  
  if (itemLineIndex < 0) return null;
  
  // Look at the next 1-3 lines for description
  const descriptionLines: string[] = [];
  
  for (let i = 1; i <= 3; i++) {
    if (itemLineIndex + i < ocrLines.length) {
      const nextLine = ocrLines[itemLineIndex + i];
      
      // Stop if we hit another item (has price) or section (all caps)
      if (/\d+[.,]\d{2}/.test(nextLine) || nextLine === nextLine.toUpperCase()) {
        break;
      }
      
      // Skip very short lines
      if (nextLine.trim().length > 5) {
        descriptionLines.push(nextLine.trim());
      }
    }
  }
  
  if (descriptionLines.length > 0) {
    return {
      text: descriptionLines.join(' '),
      confidence: 85,
      lineIndex: itemLineIndex + 1
    };
  }
  
  return null;
}

export function inferAllergensFromText(text: string): AllergenType[] {
  if (!text) return [];
  
  const normalizedText = text.toLowerCase();
  const allergens: Set<AllergenType> = new Set();
  
  const allergenPatterns: Record<AllergenType, RegExp> = {
    nuts: /\b(nut|nuts|almond|cashew|pecan|walnut|pistachio|hazelnut|macadamia)\b/i,
    dairy: /\b(milk|cream|cheese|butter|yogurt|dairy|mozzarella|parmesan|cheddar|brie|feta|ricotta|mascarpone)\b/i,
    gluten: /\b(wheat|bread|pasta|flour|gluten|breadcrumb|couscous|bulgur|seitan|rye|barley)\b/i,
    shellfish: /\b(shrimp|lobster|crab|shellfish|prawn|oyster|mussel|clam|scallop|crayfish)\b/i,
    eggs: /\b(egg|eggs|mayo|mayonnaise|aioli|hollandaise|meringue|custard)\b/i,
    soy: /\b(soy|soya|tofu|tempeh|edamame|miso|tamari|soybean)\b/i,
    fish: /\b(salmon|tuna|bass|cod|fish|anchovy|sardine|mackerel|halibut|trout|herring)\b/i,
    sesame: /\b(sesame|tahini|hummus)\b/i,
    celery: /\b(celery|celeriac)\b/i,
    mustard: /\b(mustard|dijon)\b/i,
    peanuts: /\b(peanut|peanuts|groundnut)\b/i,
    sulphites: /\b(sulphite|sulfite|wine|dried fruit)\b/i,
    lupin: /\b(lupin|lupine)\b/i,
    molluscs: /\b(squid|octopus|snail|escargot|calamari)\b/i
  };
  
  Object.entries(allergenPatterns).forEach(([allergen, pattern]) => {
    if (pattern.test(normalizedText)) {
      allergens.add(allergen as AllergenType);
    }
  });
  
  return Array.from(allergens);
}

export function inferDietaryTags(text: string): DietaryTag[] {
  if (!text) return [];
  
  const normalizedText = text.toLowerCase();
  const tags: Set<DietaryTag> = new Set();
  
  // Check for explicit markers
  if (/\(v\)|vegan|plant[- ]based/.test(normalizedText)) tags.add('vegan');
  else if (/\(vg\)|vegetarian|veggie/.test(normalizedText)) tags.add('vegetarian');
  
  if (/\(gf\)|gluten[- ]free|no gluten|sans gluten/.test(normalizedText)) tags.add('gluten-free');
  if (/dairy[- ]free|no dairy|sans lactose/.test(normalizedText)) tags.add('dairy-free');
  if (/nut[- ]free|no nuts/.test(normalizedText)) tags.add('nut-free');
  
  if (/\bhalal\b/.test(normalizedText)) tags.add('halal');
  if (/\bkosher\b/.test(normalizedText)) tags.add('kosher');
  if (/\borganic\b|\bbio\b/.test(normalizedText)) tags.add('organic');
  if (/\bspicy\b|\bhot\b|\bchili\b|\bjalapeño\b|\bcayenne\b/.test(normalizedText)) tags.add('spicy');
  if (/\braw\b/.test(normalizedText)) tags.add('raw');
  
  // Diet specific
  if (/\bketo\b/.test(normalizedText)) tags.add('keto');
  if (/\bpaleo\b/.test(normalizedText)) tags.add('paleo');
  if (/low[- ]carb/.test(normalizedText)) tags.add('low-carb');
  
  return Array.from(tags);
}

function calculateItemConfidence(
  aiItem: { confidence?: number; price?: number; description?: string },
  textMatch: TextMatch | null,
  priceMatch: PriceMatch | null,
  descMatch: TextMatch | null
): number {
  const weights = {
    name: 0.4,
    price: 0.3,
    description: 0.2,
    base: 0.1
  };
  
  let confidence = 0;
  
  // Name confidence
  if (textMatch) {
    confidence += weights.name * textMatch.confidence;
  } else {
    confidence += weights.name * (aiItem.confidence || 50);
  }
  
  // Price confidence
  if (priceMatch) {
    confidence += weights.price * priceMatch.confidence;
  } else if (aiItem.price) {
    confidence += weights.price * 60; // Lower confidence for AI-only price
  }
  
  // Description confidence
  if (descMatch) {
    confidence += weights.description * descMatch.confidence;
  } else if (aiItem.description) {
    confidence += weights.description * 50;
  }
  
  // Base AI confidence
  confidence += weights.base * (aiItem.confidence || 70);
  
  return Math.round(Math.min(confidence, 100));
}

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .replace(/\s+/g, ' ')     // Normalize whitespace
    .trim();
}

function calculateSimilarity(str1: string, str2: string): number {
  // Simple Levenshtein distance-based similarity
  const maxLen = Math.max(str1.length, str2.length);
  if (maxLen === 0) return 1;
  
  const distance = levenshteinDistance(str1, str2);
  return 1 - (distance / maxLen);
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

function parsePrice(priceStr: string): number {
  // Remove currency symbols and normalize decimal separator
  const normalized = priceStr
    .replace(/[$€£¥₹]/g, '')
    .replace(',', '.')
    .trim();
  
  const price = parseFloat(normalized);
  return isNaN(price) ? 0 : price;
}

function generateUUID(): string {
  // Simple UUID v4 generator
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function identifyWarnings(sections: MenuSection[], ocr: OCRResult): string[] {
  const warnings: string[] = [];
  
  // Check for low OCR confidence
  if (ocr.confidence < EXTRACTION_CONFIG.OCR.CONFIDENCE_THRESHOLD) {
    warnings.push('OCR confidence is low - manual review recommended');
  }
  
  // Check for sections with no items
  const emptySections = sections.filter(s => s.items.length === 0);
  if (emptySections.length > 0) {
    warnings.push(`${emptySections.length} sections have no items detected`);
  }
  
  // Check for items with no prices
  const noPriceItems = sections
    .flatMap(s => s.items)
    .filter(i => !i.price || i.price === 0);
  
  if (noPriceItems.length > 0) {
    warnings.push(`${noPriceItems.length} items have no price detected`);
  }
  
  // Check for very low confidence items
  const lowConfidenceItems = sections
    .flatMap(s => s.items)
    .filter(i => i.confidence < 60);
  
  if (lowConfidenceItems.length > 0) {
    warnings.push(`${lowConfidenceItems.length} items have low confidence scores`);
  }
  
  return warnings;
}