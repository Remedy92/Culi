/**
 * Configuration for menu extraction system
 * Centralized location for all extraction-related settings
 */

export const EXTRACTION_CONFIG = {
  // OCR Settings
  OCR: {
    CONFIDENCE_THRESHOLD: 70, // Minimum confidence % to avoid enhancement
    LANGUAGES: ['nld', 'eng'], // Dutch primary for Flemish menus, English fallback
    PAGE_SEG_MODE: '4', // Single column of text of variable sizes - better for menus
    PRESERVE_SPACES: '1',
    CHAR_WHITELIST: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz.,€$£¥-()/ '
  },

  // AI Model Settings
  AI: {
    QUICK_ANALYSIS_MODEL: 'gpt-4o-mini', // Cheaper model for initial analysis
    ENHANCEMENT_MODEL: 'gpt-4o', // Better model for low-confidence enhancement
    TEMPERATURE: 0.1,
    MAX_TOKENS: {
      QUICK: 2000,
      ENHANCEMENT: 3000
    }
  },

  // Cost Control
  COST: {
    DAILY_THRESHOLD: 50, // $50/day
    PER_RESTAURANT_THRESHOLD: 5, // $5/restaurant/day
    PER_EXTRACTION_TARGET: 0.10, // $0.10/extraction target
    COST_SAVING_MODE_DURATION: 3600 // 1 hour in seconds
  },

  // Caching
  CACHE: {
    TTL: 86400, // 24 hours in seconds
    KEY_PREFIX: 'extraction:'
  },

  // File Upload
  UPLOAD: {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
    ALLOWED_EXTENSIONS: ['jpg', 'jpeg', 'png', 'webp', 'pdf']
  },

  // Image Processing
  IMAGE: {
    THUMBNAIL: {
      SIZE: 1024,
      QUALITY: 90
    },
    ENHANCED: {
      SIZE: 2048,
      QUALITY: 95,
      SHARPEN_SIGMA: 2
    }
  },

  // Processing Timeouts
  TIMEOUTS: {
    OCR: 30000, // 30 seconds
    AI_QUICK: 20000, // 20 seconds
    AI_ENHANCEMENT: 40000, // 40 seconds
    TOTAL_EXTRACTION: 60000 // 60 seconds
  }
} as const;

// Type exports for type safety
export type ExtractionConfig = typeof EXTRACTION_CONFIG;