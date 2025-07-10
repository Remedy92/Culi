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
    TEMPERATURE: 0, // Deterministic outputs for consistency
    MAX_TOKENS: {
      QUICK: 1500, // Reduced to cap costs
      ENHANCEMENT: 2000 // Reduced to cap costs
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
      SIZE: 768, // Reduced from 1024 to improve processing time
      QUALITY: 80 // Reduced from 90 to reduce token usage
    },
    ENHANCED: {
      SIZE: 1536, // Reduced from 2048 for faster processing
      QUALITY: 85, // Reduced from 95 to optimize tokens
      SHARPEN_SIGMA: 2
    }
  },

  // Processing Timeouts
  TIMEOUTS: {
    OCR: 30000, // 30 seconds
    AI_QUICK: 45000, // 45 seconds (increased for vision tasks)
    AI_ENHANCEMENT: 60000, // 60 seconds (increased for complex menus)
    TOTAL_EXTRACTION: 90000 // 90 seconds (increased to accommodate retries)
  },

  // Feature Flags
  FEATURES: {
    ENABLE_AI_FALLBACK: true, // Fallback to GPT-4o on timeout
    ENABLE_GATEWAY_BYPASS: true, // Allow direct API calls on gateway timeout
    EXPONENTIAL_BACKOFF: true // Use exponential backoff for retries
  }
} as const;

// Type exports for type safety
export type ExtractionConfig = typeof EXTRACTION_CONFIG;