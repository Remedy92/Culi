import { ExtractedMenuSchema } from './extraction-schemas';

export const EXTRACTION_PROMPT_WITH_OCR = `
You are an expert menu analyzer with access to both an image and OCR-extracted text.
Your task is to structure menu data with high accuracy.

CRITICAL RULES:
1. The OCR text is ground truth for actual text content - trust it over visual interpretation
2. Your role is to structure the flat OCR text into semantic sections and items
3. Identify menu sections, items, prices, and descriptions from the OCR text
4. Infer allergens and dietary information from item descriptions using pattern matching
5. Flag low confidence (<70%) when OCR and visual analysis don't align
6. Never invent items or prices not present in the OCR text

ALLERGEN DETECTION PATTERNS:
- Nuts: almond, cashew, pecan, walnut, pistachio, hazelnut, nut
- Dairy: milk, cream, cheese, butter, yogurt, dairy, mozzarella, parmesan
- Gluten: wheat, bread, pasta, flour, gluten, breadcrumb, couscous
- Shellfish: shrimp, lobster, crab, shellfish, prawn, oyster, mussel
- Eggs: egg, mayo, mayonnaise, aioli, hollandaise
- Soy: soy, tofu, tempeh, edamame, miso
- Fish: salmon, tuna, bass, cod, fish, anchovy

DIETARY TAG PATTERNS:
- Vegan: marked with (v), vegan, plant-based
- Vegetarian: marked with (vg), vegetarian, veggie
- Gluten-free: marked with (gf), gluten-free, no gluten
- Spicy: chili, jalapeño, spicy, hot, cayenne
- Organic: organic, bio
- Halal: halal certified
- Kosher: kosher certified

FEW-SHOT EXAMPLES:

Input OCR: "STARTERS\nBruschetta (v) 8.50\nFresh tomatoes, basil, garlic on toasted bread\nCalamari 12.00\nCrispy fried squid rings with aioli"

Output:
{
  "sections": [{
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "name": "STARTERS",
    "confidence": 95,
    "items": [{
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "name": "Bruschetta",
      "price": 8.50,
      "description": "Fresh tomatoes, basil, garlic on toasted bread",
      "allergens": ["gluten"],
      "dietaryTags": ["vegetarian"],
      "confidence": 92
    }, {
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "name": "Calamari",
      "price": 12.00,
      "description": "Crispy fried squid rings with aioli",
      "allergens": ["eggs", "molluscs"],
      "dietaryTags": [],
      "confidence": 90
    }]
  }],
  "overallConfidence": 91,
  "metadata": {
    "extractionMethod": "ocr-ai-hybrid",
    "processingTime": 2500,
    "modelUsed": "gpt-4o",
    "ocrConfidence": 88,
    "language": "en",
    "currency": "EUR"
  }
}

OCR TEXT TO ANALYZE:
{{OCR_TEXT}}

Return a valid JSON object matching this exact schema:
${JSON.stringify(ExtractedMenuSchema.shape, null, 2)}

IMPORTANT: 
- Generate unique UUIDs for all id fields
- Ensure all prices are positive numbers
- Confidence scores must be between 0 and 100
- Include the flattened 'items' array with all menu items
- Set reasonable displayOrder values for sections`;

export const QUICK_ANALYSIS_PROMPT = `
Analyze this menu image thumbnail and extract basic structure.
This is a quick pass - focus on identifying sections and items only.
Don't worry about perfect accuracy - this will be refined with OCR data.

Return JSON matching this EXACT schema structure:
{
  "sections": [
    {
      "name": "Section Name",
      "confidence": 80,
      "items": [
        {
          "name": "Item Name",
          "price": 12.50,
          "description": "",
          "confidence": 75
        }
      ]
    }
  ],
  "detectedLanguage": "en",
  "detectedCurrency": "EUR",
  "menuType": "restaurant"
}

CRITICAL RULES FOR NULL HANDLING:
- For missing descriptions: Use empty string "" (NOT null)
- For unclear prices: Use null (NEVER use 0 unless the item is explicitly free)
- NEVER use null for name or confidence fields
- Valid examples:
  * Item with description: {"name": "Pizza", "price": 12.50, "description": "Tomato and cheese", "confidence": 90}
  * Item without description: {"name": "Coffee", "price": 3.50, "description": "", "confidence": 85}
  * Item with unknown price: {"name": "Daily Special", "price": null, "description": "", "confidence": 70}
  * Free item: {"name": "Water", "price": 0, "description": "Complimentary", "confidence": 95}
  * Market price item: {"name": "Fresh Fish", "price": null, "description": "Market price", "confidence": 85}

OTHER RULES:
- Confidence scores must be 0-100
- Only include items you can clearly see
- menuType options: restaurant, cafe, bar, bakery, other`;

export const ENHANCEMENT_PROMPT = `
You have access to:
1. Initial extraction results with low confidence areas
2. High-resolution menu image
3. OCR text from the original

Your task is to enhance the extraction by:
1. Clarifying ambiguous prices
2. Completing truncated descriptions
3. Identifying missed allergens
4. Correcting any obvious errors

Focus only on items with confidence < 70%.
Return the enhanced menu data in the same format.`;

export const MULTILINGUAL_PROMPT_PREFIX = `
The menu appears to be in {{LANGUAGE}}.
Please maintain original language for names and descriptions.
Translate only structural elements (sections) if needed.
Currency detected: {{CURRENCY}}

`;

export function getExtractionPrompt(ocrText: string, language?: string, currency?: string): string {
  let prompt = '';
  
  if (language && language !== 'en') {
    prompt += MULTILINGUAL_PROMPT_PREFIX
      .replace('{{LANGUAGE}}', language)
      .replace('{{CURRENCY}}', currency || 'EUR');
  }
  
  prompt += EXTRACTION_PROMPT_WITH_OCR.replace('{{OCR_TEXT}}', ocrText);
  
  return prompt;
}