import { describe, it, expect } from '@jest/globals';
import { 
  mergeOCRWithAI, 
  rebuildSectionsFromItems,
  inferAllergensFromText,
  inferDietaryTags
} from '../extraction-merger';
import type { 
  OCRResult, 
  QuickAnalysisResult, 
  MenuItem
} from '../extraction-schemas';

describe('extraction-merger', () => {
  describe('rebuildSectionsFromItems', () => {
    it('should group items by category and create sections', () => {
      const items: MenuItem[] = [
        {
          id: '1',
          name: 'Caesar Salad',
          category: 'STARTERS',
          confidence: 80,
          allergens: [],
          dietaryTags: [],
          isAvailable: true,
          isPartOfBundle: false
        },
        {
          id: '2',
          name: 'Tomato Soup',
          category: 'STARTERS',
          confidence: 85,
          allergens: [],
          dietaryTags: [],
          isAvailable: true,
          isPartOfBundle: false
        },
        {
          id: '3',
          name: 'Steak',
          category: 'MAINS',
          price: 25.99,
          confidence: 90,
          allergens: [],
          dietaryTags: [],
          isAvailable: true,
          isPartOfBundle: false
        }
      ];

      const sections = rebuildSectionsFromItems(items);

      expect(sections).toHaveLength(2);
      expect(sections[0].name).toBe('STARTERS');
      expect(sections[0].items).toHaveLength(2);
      expect(sections[1].name).toBe('MAINS');
      expect(sections[1].items).toHaveLength(1);
    });

    it('should handle items without category', () => {
      const items: MenuItem[] = [
        {
          id: '1',
          name: 'Mystery Item',
          confidence: 50,
          allergens: [],
          dietaryTags: [],
          isAvailable: true,
          isPartOfBundle: false
        }
      ];

      const sections = rebuildSectionsFromItems(items);

      expect(sections).toHaveLength(1);
      expect(sections[0].name).toBe('Uncategorized');
      expect(sections[0].items).toHaveLength(1);
    });

    it('should preserve bundle information when rebuilding', () => {
      const bundleId = 'bundle-123';
      const items: MenuItem[] = [
        {
          id: '1',
          name: 'Caesar salade',
          category: 'LUNCH MENU',
          confidence: 66,
          allergens: [],
          dietaryTags: [],
          isAvailable: true,
          isPartOfBundle: true,
          bundleId: bundleId,
          choiceGroup: 'starter'
        },
        {
          id: '2',
          name: 'Kalfsfricassée',
          category: 'LUNCH MENU',
          confidence: 64,
          allergens: [],
          dietaryTags: [],
          isAvailable: true,
          isPartOfBundle: true,
          bundleId: bundleId,
          choiceGroup: 'main'
        },
        {
          id: '3',
          name: '2-gangen',
          category: 'LUNCH MENU',
          price: 24.90,
          confidence: 80,
          allergens: [],
          dietaryTags: [],
          isAvailable: true,
          isPartOfBundle: false
        }
      ];

      const sections = rebuildSectionsFromItems(items);

      expect(sections).toHaveLength(1);
      expect(sections[0].name).toBe('LUNCH MENU');
      expect(sections[0].bundleInfo).toBeDefined();
      expect(sections[0].bundleInfo?.type).toBe('lunch-special');
      expect(sections[0].bundleInfo?.sharedPrice).toBe(24.90);
    });

    it('should order sections correctly', () => {
      const items: MenuItem[] = [
        {
          id: '1',
          name: 'Dessert',
          category: 'DESSERT',
          confidence: 80,
          allergens: [],
          dietaryTags: [],
          isAvailable: true,
          isPartOfBundle: false
        },
        {
          id: '2',
          name: 'Starter',
          category: 'STARTERS',
          confidence: 80,
          allergens: [],
          dietaryTags: [],
          isAvailable: true,
          isPartOfBundle: false
        },
        {
          id: '3',
          name: 'Main',
          category: 'HOOFDGERECHTEN',
          confidence: 80,
          allergens: [],
          dietaryTags: [],
          isAvailable: true,
          isPartOfBundle: false
        }
      ];

      const sections = rebuildSectionsFromItems(items);

      expect(sections[0].name).toBe('STARTERS');
      expect(sections[1].name).toBe('HOOFDGERECHTEN');
      expect(sections[2].name).toBe('DESSERT');
    });
  });

  describe('inferAllergensFromText', () => {
    it('should detect common allergens', () => {
      expect(inferAllergensFromText('Contains milk and eggs')).toContain('dairy');
      expect(inferAllergensFromText('Contains milk and eggs')).toContain('eggs');
      expect(inferAllergensFromText('Made with peanut butter')).toContain('peanuts');
      expect(inferAllergensFromText('Fresh salmon fillet')).toContain('fish');
      expect(inferAllergensFromText('Shrimp cocktail')).toContain('shellfish');
    });

    it('should handle empty or null text', () => {
      expect(inferAllergensFromText('')).toEqual([]);
      // Test with type assertion to simulate runtime behavior
      expect(inferAllergensFromText(null as unknown as string)).toEqual([]);
      expect(inferAllergensFromText(undefined as unknown as string)).toEqual([]);
    });

    it('should not duplicate allergens', () => {
      const allergens = inferAllergensFromText('Milk, cream, and butter sauce');
      const dairyCount = allergens.filter(a => a === 'dairy').length;
      expect(dairyCount).toBe(1);
    });
  });

  describe('inferDietaryTags', () => {
    it('should detect dietary markers', () => {
      expect(inferDietaryTags('(v) Vegetable curry')).toContain('vegan');
      expect(inferDietaryTags('(vg) Cheese pizza')).toContain('vegetarian');
      expect(inferDietaryTags('Gluten-free pasta')).toContain('gluten-free');
      expect(inferDietaryTags('Spicy jalapeño poppers')).toContain('spicy');
    });

    it('should prefer vegan over vegetarian when both could apply', () => {
      const tags = inferDietaryTags('(v) Plant-based burger');
      expect(tags).toContain('vegan');
      expect(tags).not.toContain('vegetarian');
    });
  });

  describe('mergeOCRWithAI integration', () => {
    it('should handle enhancement that reduces sections', () => {
      // This tests the actual bug we fixed
      const ocrResult: OCRResult = {
        text: 'Menu text',
        confidence: 84,
        lines: [],
        language: 'nl'
      };

      const aiResult: QuickAnalysisResult = {
        sections: [
          {
            name: 'STARTERS',
            confidence: 80,
            items: [
              { name: 'Soup', confidence: 80 },
              { name: 'Salad', confidence: 80 }
            ]
          },
          {
            name: 'MAINS',
            confidence: 80,
            items: [
              { name: 'Steak', price: 25, confidence: 80 },
              { name: 'Fish', price: 22, confidence: 80 }
            ]
          },
          {
            name: 'DESSERTS',
            confidence: 80,
            items: [
              { name: 'Ice cream', price: 8, confidence: 80 }
            ]
          }
        ],
        detectedLanguage: 'nl',
        detectedCurrency: 'EUR'
      };

      const result = mergeOCRWithAI(ocrResult, aiResult);

      // Should have all sections
      expect(result.sections).toHaveLength(3);
      expect(result.items).toHaveLength(5);
      
      // Check sections are properly structured
      const sectionNames = result.sections.map(s => s.name);
      expect(sectionNames).toContain('STARTERS');
      expect(sectionNames).toContain('MAINS');
      expect(sectionNames).toContain('DESSERTS');
    });
  });
});