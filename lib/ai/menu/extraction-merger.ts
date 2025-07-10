import { z } from 'zod';
import { 
  OCRResult, 
  QuickAnalysisResult, 
  ExtractedMenu, 
  AllergenType, 
  DietaryTag,
  MenuItem,
  MenuSection,
  ConfidenceSchema,
  PriceSchema,
  ChoiceGroup
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

interface BundleMatch {
  type: 'prix-fixe' | 'multi-course' | 'combo' | 'lunch-special' | 'dinner-with-drinks';
  courses: number;
  price: number;
  lineIndex: number;
  priceType?: 'per-person' | 'per-table' | 'fixed';
  includedDrinks?: {
    options: string[];
    quantity?: string;
  };
}

// Helper to detect if a section name indicates it's part of a bundle
function isBundleComponentSection(sectionName: string): boolean {
  const normalized = sectionName.toLowerCase();
  // Common section names that are typically part of bundles
  return /^(voorgerechten|starters|entrées|hoofdgerechten|mains|plats|desserts|nagerechten)$/i.test(normalized);
}

// Helper to find parent bundle section
function findParentBundle(sections: MenuSection[], currentIndex: number): MenuSection | null {
  // Look backwards for a bundle section
  for (let i = currentIndex - 1; i >= 0; i--) {
    if (sections[i].bundleInfo) {
      return sections[i];
    }
    // Stop if we hit a non-component section
    if (!isBundleComponentSection(sections[i].name)) {
      break;
    }
  }
  return null;
}

// Helper to categorize a menu item based on keywords and context
function categorizeChoiceGroup(
  itemName: string, 
  sectionName: string,
  itemIndex: number,
  totalItems: number,
  description?: string
): ChoiceGroup | undefined {
  const lowerName = itemName.toLowerCase();
  const lowerSection = sectionName.toLowerCase();
  const lowerDesc = description?.toLowerCase() || '';
  
  // Keyword-based categorization (multilingual)
  const starterKeywords = /\b(starter|voorgerecht|entrée|antipasto|appetizer|first\s*course|entradas|vorspeise)\b/i;
  const mainKeywords = /\b(main|hoofdgerecht|plat\s*principal|secondo|main\s*course|entree|principales|hauptgang)\b/i;
  const dessertKeywords = /\b(dessert|nagerecht|dolce|postre|sweet|sobremesa|nachspeise)\b/i;
  const sideKeywords = /\b(side|bijgerecht|contorno|acompañamiento|beilage|side\s*dish)\b/i;
  const drinkKeywords = /\b(drink|drank|boisson|bebida|beverage|getränk|wine|beer|wijn|bier)\b/i;
  
  // Check description first (highest priority) - AI-generated hints
  if (description) {
    if (/\b(dessert|nagerecht|postre|dolce|sweet)\s*(choice|option|keuze)?/i.test(lowerDesc)) return 'dessert';
    if (/\b(starter|voorgerecht|entrée|antipasto|appetizer)\s*(choice|option|keuze)?/i.test(lowerDesc)) return 'starter';
    if (/\b(main|hoofdgerecht|plat\s*principal|secondo)\s*(course|choice|option|keuze)?/i.test(lowerDesc)) return 'main';
    if (/\b(side|bijgerecht|contorno)\s*(dish|choice|option|keuze)?/i.test(lowerDesc)) return 'side';
    if (/\b(drink|drank|boisson|bebida|beverage)\s*(choice|option|keuze)?/i.test(lowerDesc)) return 'drink';
  }
  
  // Check item name for keywords
  if (starterKeywords.test(lowerName)) return 'starter';
  if (mainKeywords.test(lowerName)) return 'main';
  if (dessertKeywords.test(lowerName)) return 'dessert';
  if (sideKeywords.test(lowerName)) return 'side';
  if (drinkKeywords.test(lowerName)) return 'drink';
  
  // Common food names for better categorization
  const dessertNames = /\b(tiramisu|panna\s*cotta|crème\s*brûlée|ice\s*cream|gelato|sorbet|mousse|tart|cake|taart|pêche\s*melba|profiterole|cheesecake|brownie|pudding|flan|churros|cannoli|macaron|éclair|baklava)\b/i;
  const starterNames = /\b(caesar\s*salad|soup|soep|carpaccio|bruschetta|antipasti|oysters|oesters|escargot|foie\s*gras|gazpacho|ceviche|tartare|hummus|tzatziki|calamari|spring\s*roll|samosa|edamame|nachos)\b/i;
  const mainNames = /\b(steak|beef|chicken|kip|poulet|fish|vis|pescado|salmon|tuna|pasta|pizza|burger|schnitzel|curry|risotto|paella|lasagna|moussaka|tagine|ramen|pad\s*thai|biryani)\b/i;
  
  // Check for common food names
  if (dessertNames.test(lowerName)) return 'dessert';
  if (starterNames.test(lowerName)) return 'starter';
  if (mainNames.test(lowerName)) return 'main';
  
  // Check section name
  if (starterKeywords.test(lowerSection)) return 'starter';
  if (mainKeywords.test(lowerSection)) return 'main';
  if (dessertKeywords.test(lowerSection)) return 'dessert';
  if (sideKeywords.test(lowerSection)) return 'side';
  if (drinkKeywords.test(lowerSection)) return 'drink';
  
  // Special handling for 3-item bundles
  if (totalItems === 3 && itemIndex === 2) return 'dessert';
  
  // Position-based inference if no keywords match
  const relativePosition = itemIndex / totalItems;
  if (relativePosition < 0.33) return 'starter';
  if (relativePosition < 0.67) return 'main';
  return 'dessert';
}

// Helper to group bundle items into structured choices
function groupBundleChoices(items: MenuItem[]): MenuSection['bundleInfo']['choices'] {
  const choices: NonNullable<MenuSection['bundleInfo']>['choices'] = {
    starters: [],
    mains: [],
    desserts: []
  };
  
  const sides: MenuItem[] = [];
  const drinks: MenuItem[] = [];
  
  items.forEach(item => {
    if (!item.isPartOfBundle || !item.choiceGroup) return;
    
    switch (item.choiceGroup) {
      case 'starter':
      case 'appetizer':
        choices.starters.push(item);
        break;
      case 'main':
        choices.mains.push(item);
        break;
      case 'dessert':
        choices.desserts.push(item);
        break;
      case 'side':
        sides.push(item);
        break;
      case 'drink':
        drinks.push(item);
        break;
    }
  });
  
  // Add optional arrays if they have items
  if (sides.length > 0) choices.sides = sides;
  if (drinks.length > 0) choices.drinks = drinks;
  
  return choices;
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
    const sectionName = sectionMatch?.text || aiSection.name;
    
    // Check if this is a bundle section
    const bundleMatch = findBundleInOCR(sectionName, ocrLines);
    const bundleId = bundleMatch ? generateUUID() : undefined;
    
    const section: MenuSection = {
      id: generateUUID(),
      name: sectionName,
      confidence: (sectionMatch ? Math.min(95, sectionMatch.confidence + 10) : aiSection.confidence) as z.infer<typeof ConfidenceSchema>,
      displayOrder: sectionIndex,
      items: [],
      // Add bundle info if detected
      ...(bundleMatch && {
        bundleInfo: {
          type: bundleMatch.type,
          courses: bundleMatch.courses,
          sharedPrice: bundleMatch.price as z.infer<typeof PriceSchema>,
          priceType: bundleMatch.priceType || 'fixed',
          description: `${bundleMatch.courses}-course ${bundleMatch.type}`,
          ...(bundleMatch.includedDrinks && {
            includedDrinks: {
              ...bundleMatch.includedDrinks,
              conditions: bundleMatch.includedDrinks.options.join(' or ')
            }
          })
        }
      })
    };
    
    // Process items in section
    aiSection.items.forEach((aiItem, itemIndex) => {
      const itemMatch = findBestTextMatch(aiItem.name, ocrLines);
      const priceMatch = aiItem.price ? findPriceInOCR(aiItem.name, ocrLines) : null;
      const descMatch = findDescriptionInOCR(aiItem.name, ocrLines, itemMatch?.lineIndex);
      
      const mergedDescription = descMatch?.text || (aiItem.description === null ? '' : aiItem.description) || '';
      
      // Handle price: use null for bundle items, otherwise use found price
      let finalPrice: number | null;
      if (bundleMatch) {
        // For bundle items, individual prices are typically null
        finalPrice = null;
      } else {
        finalPrice = priceMatch?.value || 
                    (aiItem.price !== null && aiItem.price !== undefined ? aiItem.price : null);
      }
      
      // Categorize if part of bundle
      const choiceGroup = bundleMatch ? 
        categorizeChoiceGroup(aiItem.name, section.name, itemIndex, aiSection.items.length, mergedDescription) : 
        undefined;
      
      const item: MenuItem = {
        id: generateUUID(),
        name: itemMatch?.text || aiItem.name,
        price: (finalPrice !== null ? finalPrice : undefined) as z.infer<typeof PriceSchema>,
        description: mergedDescription || undefined,
        allergens: inferAllergensFromText(mergedDescription),
        dietaryTags: inferDietaryTags(mergedDescription + ' ' + (itemMatch?.text || aiItem.name)),
        confidence: calculateItemConfidence(aiItem, itemMatch, priceMatch, descMatch) as z.infer<typeof ConfidenceSchema>,
        isAvailable: true,
        category: section.name,
        // Mark as part of bundle if applicable
        isPartOfBundle: !!bundleMatch,
        bundleId: bundleId,
        choiceGroup: choiceGroup
      };
      
      section.items.push(item);
      allItems.push(item);
    });
    
    // If section has bundle info, group choices
    if (section.bundleInfo && section.items.some(item => item.isPartOfBundle)) {
      const bundleItems = section.items.filter(item => item.isPartOfBundle);
      section.bundleInfo.choices = groupBundleChoices(bundleItems);
    }
    
    sections.push(section);
  });
  
  // Post-processing: Detect implied bundles and link orphaned sections
  sections.forEach((section, index) => {
    // Look for pattern where items are followed by "X-gangen" pricing
    const gangenItems = section.items.filter(item => 
      /\d+-gangen/i.test(item.name) && item.price !== undefined && item.price > 0
    );
    
    if (gangenItems.length > 0 && !section.bundleInfo) {
      // This is likely an implied bundle
      const bundlePrices = gangenItems.map(item => ({
        courses: parseInt(item.name.match(/(\d+)-gangen/i)?.[1] || '2'),
        price: item.price!
      }));
      
      // Find items that are likely bundle choices (low confidence prices or null)
      const choiceItems = section.items.filter(item => 
        !gangenItems.includes(item) && 
        (item.confidence < 60 || item.price === undefined || item.price === null)
      );
      
      // If we have choices and bundle prices, mark as bundle (confidence threshold)
      if (choiceItems.length > 0 && bundlePrices.length > 0 && section.confidence > 60) {
        const bundleId = generateUUID();
        
        // Update section with bundle info
        section.bundleInfo = {
          type: 'lunch-special',
          courses: Math.max(...bundlePrices.map(bp => bp.courses)),
          sharedPrice: Math.max(...bundlePrices.map(bp => bp.price)) as z.infer<typeof PriceSchema>,
          priceType: 'fixed',
          description: `Choose ${bundlePrices.map(bp => bp.courses).join(' or ')} courses`
        };
        
        // Mark choice items as part of bundle and categorize
        choiceItems.forEach((item, idx) => {
          item.isPartOfBundle = true;
          item.bundleId = bundleId;
          item.price = undefined; // Clear any guessed prices
          // Categorize based on position and context
          item.choiceGroup = categorizeChoiceGroup(
            item.name, 
            section.name, 
            idx, 
            choiceItems.length,
            item.description
          );
        });
        
        // Update gangen items to be bundle pricing options
        gangenItems.forEach(item => {
          item.description = `Choose ${item.name.match(/\d+/)?.[0]} courses`;
        });
        
        // Group the choices into structured arrays
        section.bundleInfo.choices = groupBundleChoices(choiceItems);
      }
    }
    
    // If this section looks like a bundle component but has no bundle info
    if (!section.bundleInfo && isBundleComponentSection(section.name) && section.items.length > 0) {
      const parentBundle = findParentBundle(sections, index);
      if (parentBundle && parentBundle.bundleInfo) {
        // Link items to the parent bundle
        section.items.forEach(item => {
          item.isPartOfBundle = true;
          item.bundleId = parentBundle.id;
          // Clear individual prices if they're part of a bundle
          if (parentBundle.bundleInfo!.sharedPrice && item.price) {
            item.price = null;
          }
        });
      }
    }
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
  aiItem: { confidence?: number; price?: number | null; description?: string | null },
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

// Bundle detection functions
function detectBundleKeywords(text: string): { isBundle: boolean; type?: BundleMatch['type']; courses?: number; priceType?: 'per-person' | 'per-table' | 'fixed' } {
  const normalized = text.toLowerCase();
  
  // Check for per-person pricing (use original text to preserve case)
  const priceType = /p\.p\.|per\s*persoon|per\s*person|por\s*persona|par\s*personne/i.test(text) 
    ? 'per-person' as const 
    : 'fixed' as const;
  
  // Check if drinks are mentioned
  const hasDrinks = /incl.*(?:wine|beer|drink|wijn|bier|drank|boisson|bebida)|including.*(?:wine|beer|drink)|met.*drank/i.test(text);
  
  // Multi-language bundle patterns
  const bundlePatterns = [
    { pattern: /(\d+)\s*(?:gangen|course|gang).*diner/i, type: hasDrinks ? 'dinner-with-drinks' as const : 'multi-course' as const },
    { pattern: /(\d+)\s*(?:gangen|course|gang)/i, type: 'multi-course' as const },
    { pattern: /(\d+)-gangen/i, type: 'multi-course' as const }, // Specific pattern for "2-gangen"
    { pattern: /diner.*menu/i, type: hasDrinks ? 'dinner-with-drinks' as const : 'multi-course' as const },
    { pattern: /prix\s*fixe/i, type: 'prix-fixe' as const },
    { pattern: /lunch\s*(?:menu|special|deal)/i, type: 'lunch-special' as const },
    { pattern: /(?:combo|set)\s*(?:menu|deal)?/i, type: 'combo' as const },
    { pattern: /menu\s*(?:du\s*jour|del\s*dia)/i, type: 'prix-fixe' as const },
    { pattern: /(?:formule|dagmenu|tagesmenü)/i, type: 'prix-fixe' as const }
  ];
  
  for (const { pattern, type } of bundlePatterns) {
    const match = normalized.match(pattern);
    if (match) {
      // Extract number of courses if present
      const coursesMatch = match[1];
      const courses = coursesMatch ? parseInt(coursesMatch) : undefined;
      return { isBundle: true, type, courses, priceType };
    }
  }
  
  return { isBundle: false };
}

function findBundleInOCR(sectionName: string, ocrLines: string[]): BundleMatch | null {
  const bundleInfo = detectBundleKeywords(sectionName);
  if (!bundleInfo.isBundle) return null;
  
  // Find the section in OCR
  const sectionIndex = ocrLines.findIndex(line => 
    normalizeText(line).includes(normalizeText(sectionName))
  );
  
  if (sectionIndex < 0) return null;
  
  // Extract drink information if present
  let includedDrinks: BundleMatch['includedDrinks'] | undefined;
  
  // Look for drinks in the section line and next few lines
  for (let i = 0; i <= 3; i++) {
    if (sectionIndex + i < ocrLines.length) {
      const line = ocrLines[sectionIndex + i];
      const drinkMatch = line.match(/(?:incl\.?|including|met|avec).*?(?:[\d/]+\s*(?:liter|litre|l)\s*(?:wine|wijn|vin|beer|bier|bière)|(?:wine|wijn|vin|beer|bier|bière|draught|tap|house)\s*(?:wine|beer|bier|wijn))/i);
      
      if (drinkMatch || /(?:of|or|ou)\s*(?:wine|beer|wijn|bier|tapbier|draught)/i.test(line)) {
        // Extract drink options
        const options: string[] = [];
        let quantity: string | undefined;
        
        // Look for pattern like "1/2 liter wijn of tapbier"
        const fullDrinkPattern = /([\d/]+\s*(?:liter|litre|l)s?)\s*(?:wine|wijn|vin)\s*(?:of|or|ou)\s*(?:draught\s*beer|tapbier|beer|bier)/i;
        const fullMatch = line.match(fullDrinkPattern);
        
        if (fullMatch) {
          quantity = fullMatch[1];
          options.push(`${quantity} wine`);
          options.push('draught beer');
        } else {
          // Extract wine options
          const wineMatch = line.match(/([\d/]+\s*(?:liter|litre|l)s?)\s*(?:wine|wijn|vin)/i);
          if (wineMatch) {
            quantity = wineMatch[1];
            options.push(wineMatch[0]);
          }
          
          // Extract beer options
          const beerMatch = line.match(/(?:draught\s*beer|tapbier|tap\s*beer|house\s*beer)/i);
          if (beerMatch) options.push(beerMatch[0]);
        }
        
        if (options.length > 0) {
          includedDrinks = {
            options,
            quantity
          };
          break;
        }
      }
    }
  }
  
  // Look for price in section header or nearby lines
  const pricePattern = /(?:[$€£¥]\s?)?\d+[.,]\d{2}(?:\s?[$€£¥])?/g;
  
  // Check section line first
  const sectionMatches = ocrLines[sectionIndex].match(pricePattern);
  if (sectionMatches) {
    const price = parsePrice(sectionMatches[sectionMatches.length - 1]); // Last price is likely bundle price
    if (price > 0) {
      return {
        type: bundleInfo.type!,
        courses: bundleInfo.courses || 2,
        price,
        priceType: bundleInfo.priceType,
        lineIndex: sectionIndex,
        includedDrinks
      };
    }
  }
  
  // Check next few lines for price
  for (let i = 1; i <= 3; i++) {
    if (sectionIndex + i < ocrLines.length) {
      const matches = ocrLines[sectionIndex + i].match(pricePattern);
      if (matches) {
        const price = parsePrice(matches[0]);
        if (price > 10) { // Bundle prices are typically higher
          return {
            type: bundleInfo.type!,
            courses: bundleInfo.courses || 2,
            price,
            priceType: bundleInfo.priceType,
            lineIndex: sectionIndex + i,
            includedDrinks
          };
        }
      }
    }
  }
  
  return null;
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