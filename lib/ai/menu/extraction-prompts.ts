import { ExtractedMenuSchema } from './extraction-schemas';

export const EXTRACTION_PROMPT_WITH_OCR = `
You are a precise menu structurer. Use OCR text as ground truth; enhance with image for layout.

STEP-BY-STEP PROCESS:
1. Scan OCR for section headers (e.g., STARTERS, MAINS, LUNCH MENU)
2. Group items with prices and descriptions under sections
3. DETECT BUNDLES: Look for multi-course sets with shared pricing:
   - Keywords: menu, gangen, course, prix fixe, set, combo, lunch special, diner
   - Pattern: Multiple items/choices with one price (e.g., "2-gangen €24.90")
   - Per-person pricing: p.p., per persoon, per person, por persona
   - Drink inclusions: "including", "incl.", "with", "met", "avec"
   - Link starter/main/dessert choices to the bundle
   - Detect conditional choices (e.g., "wine OR beer")
4. CATEGORIZE CHOICES: For bundles, classify sub-items:
   - Starters: voorgerecht, entrée, antipasto, starter, first course, appetizer
   - Mains: hoofdgerecht, plat principal, secondo, main course, entree (US)
   - Desserts: nagerecht, dessert, dolce, postre, sweet
   - Sides: bijgerecht, side dish, contorno, acompañamiento
   - Drinks: dranken, boissons, bebidas, beverages
   - Position-based: first 1/3 = starters, middle = mains, last 1/3 = desserts
5. Match allergens and dietary tags using patterns below
6. Generate UUIDs for IDs; set confidence 0-100 based on OCR clarity
7. For unknowns: empty string "" for descriptions, null for prices (not 0 unless explicitly free)

ALLERGEN PATTERNS (compact):
nuts: almond|cashew|pecan|walnut|pistachio|hazelnut|nut
dairy: milk|cream|cheese|butter|yogurt|mozzarella|parmesan
gluten: wheat|bread|pasta|flour|breadcrumb|couscous
shellfish: shrimp|lobster|crab|prawn|oyster|mussel
eggs: egg|mayo|aioli|hollandaise
soy: soy|tofu|tempeh|edamame|miso
fish: salmon|tuna|bass|cod|anchovy

DIETARY PATTERNS:
vegan: (v)|vegan|plant-based; vegetarian: (vg)|veggie
gluten-free: (gf)|gluten-free; spicy: chili|jalapeño|hot
organic: organic|bio; halal/kosher: halal|kosher certified

BUNDLE EXAMPLES:
1) Simple: "LUNCH MENU 2-gangen €24.90\nVOORGERECHTEN\nSoep\nSalade\nHOOFDGERECHTEN\nSteak\nVis"
   - Set choiceGroup: 'starter' for Soep/Salade, 'main' for Steak/Vis
   - Bundle choices: {starters: [Soep, Salade], mains: [Steak, Vis]}

2) IMPLIED BUNDLE (critical): "LUNCH MENU\nCaesar salade of tomatensoep\nKalfsfricassée met frietjes\nPêche melba\n2-gangen €24.90\n3-gangen €28.90"
   - Items BEFORE pricing are bundle choices (set price: null)
   - Categorize: Caesar/tomatensoep = 'starter', Kalfsfricassée = 'main', Pêche = 'dessert'
   - Bundle choices: {starters: [Caesar, tomatensoep], mains: [Kalfsfricassée], desserts: [Pêche]}

3) Multiple bundles: "LUNCH (€25)\nStarters: Soup or Salad\nMain: Fish\n\nDINNER (€45)\nStarters: Carpaccio\nMains: Steak or Lobster\nDessert: Tiramisu"
   - Create 2 sections with separate bundleIds
   - Each with categorized choices arrays

4) With drinks: "5 GANG DINER €34,50 p.p.\nincl. 1/2 liter wijn of tapbier\n[sections with starters/mains/desserts]"
   - Mark as dinner-with-drinks type
   - Set priceType: "per-person"
   - includedDrinks: {options: ["1/2 liter wine", "draught beer"]}

Output includes bundle structure with categorized choices.

ERROR PREVENTION: If unsure, set confidence low and use null—never invent data.

OCR TEXT TO ANALYZE:
{{OCR_TEXT}}

Return exact JSON schema:
${JSON.stringify(ExtractedMenuSchema.shape, null, 2)}`;

export const QUICK_ANALYSIS_PROMPT = `
Analyze this menu image and extract structure with bundle awareness.

STEP-BY-STEP:
1. Spot main sections (headers like STARTERS, MAINS, LUNCH MENU)
2. List items with prices under each section
3. FLAG BUNDLES: Detect multi-course sets or combos:
   - Look for: "menu", "gangen", "course", "set", "prix fixe", "lunch/dinner special", "diner", "formule"
   - Pricing patterns: "€XX p.p.", "per person", "per persoon", "X-gangen €YY"
   - Drink patterns: "including drinks", "incl. wine/beer", "met dranken"
   - IMPLIED BUNDLES: When items are listed BEFORE "2-gangen €XX" or "3-gangen €XX", treat those items as bundle choices, NOT standalone items
   - Mark these sections as potential bundles with choices and shared pricing
4. CATEGORIZE bundle items based on keywords or position:
   - Starters: voorgerecht, entrée, starter, first items listed
   - Mains: hoofdgerecht, main, middle items
   - Desserts: nagerecht, dessert, last items
   - Set choiceGroup field for proper categorization

CRITICAL: Do NOT treat bundle choices as standalone items if followed by gangen pricing!
MULTIPLE MENUS: If you see multiple bundles (lunch AND dinner), create separate sections with unique bundleIds.

Return JSON matching this schema:
{
  "sections": [{
    "name": "Section Name",
    "confidence": 80,
    "items": [{
      "name": "Item Name",
      "price": 12.50,
      "description": "",
      "confidence": 75
    }]
  }],
  "detectedLanguage": "en",
  "detectedCurrency": "EUR",
  "menuType": "restaurant"
}

BUNDLE EXAMPLES:
1) Standard format:
{
  "sections": [{
    "name": "LUNCH MENU 2-COURSES",
    "confidence": 85,
    "items": [
      {"name": "Choose Starter", "price": null, "description": "", "confidence": 80},
      {"name": "Choose Main", "price": null, "description": "", "confidence": 80},
      {"name": "Bundle Price", "price": 24.90, "description": "", "confidence": 90}
    ]
  }]
}

2) IMPLIED BUNDLE (items listed before pricing):
Input: "LUNCH MENU\nCaesar salade of tomatensoep\nKalfsfricassée met frietjes\nPêche melba\n2-gangen €24.90\n3-gangen €28.90"
{
  "sections": [{
    "name": "LUNCH MENU",
    "confidence": 90,
    "items": [
      {"name": "Caesar salade of tomatensoep", "price": null, "description": "Starter choice", "confidence": 85},
      {"name": "Kalfsfricassée met frietjes", "price": null, "description": "Main choice", "confidence": 85},
      {"name": "Pêche melba", "price": null, "description": "Dessert choice", "confidence": 85},
      {"name": "2-gangen", "price": 24.90, "description": "Choose 2 courses", "confidence": 95},
      {"name": "3-gangen", "price": 28.90, "description": "Choose 3 courses", "confidence": 95}
    ]
  }]
}

NULL HANDLING:
- Descriptions: Use "" (not null)
- Prices: Use null for unclear/bundle items (0 only if explicitly free)
- Confidence: Always 0-100

menuType: restaurant|cafe|bar|bakery|other`;

export const ENHANCEMENT_PROMPT = `
Enhance low-confidence menu items using high-resolution image.

STEP-BY-STEP:
1. Focus ONLY on items with confidence < 70%
2. Clarify prices from high-res image
3. Complete descriptions if truncated
4. Add allergens/dietary tags if visible
5. Fix bundle structures if missed

CRITICAL:
- Return ONLY enhanced items (not full menu)
- Match exact schema subset format
- If unsure, keep original with low confidence
- Never invent data

Return matching schema subset with enhanced items only.`;

export const MULTILINGUAL_PROMPT_PREFIX = `
Menu in {{LANGUAGE}}—keep original for names/descriptions.
Detect bundles regardless of language:
- Dutch: menu, gangen (courses), dagmenu, diner, p.p., inclusief dranken
- French: menu, formule, prix fixe, par personne, avec boissons
- German: menü, gänge, tagesmenü, pro person, mit getränken
- Spanish: menú, por persona, bebidas incluidas
- All: combo, set, special, including drinks, with beverages
Currency: {{CURRENCY}}

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