-- =====================================================
-- MINIMAL CORE WITH AI FUTURE-PROOFING
-- =====================================================

-- Enable vector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Single restaurant table (add multi-tenant later)
CREATE TABLE restaurants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  
  -- Subscription
  tier TEXT DEFAULT 'free',
  tier_expires_at TIMESTAMPTZ,
  
  -- AI Learning Preferences
  ai_settings JSONB DEFAULT '{
    "learn_from_conversations": true,
    "personalization_level": "medium",
    "auto_update_menu": false
  }',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- FLEXIBLE MENU STORAGE (AI-Optimized)
-- =====================================================

-- Menus with unstructured + structured data
CREATE TABLE menus (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  
  -- Original source (what humans uploaded)
  source_type TEXT NOT NULL, -- 'pdf', 'image', 'text', 'api'
  source_url TEXT,
  source_text TEXT, -- Raw text for AI to process
  
  -- AI-extracted structured data
  extracted_data JSONB NOT NULL DEFAULT '{}', -- Flexible schema
  extraction_confidence FLOAT,
  extraction_model TEXT, -- Track which AI model/version
  
  -- Embeddings for semantic search
  menu_embedding vector(1536), -- OpenAI ada-002 size
  
  -- Versioning
  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_menu_embedding ON menus 
  USING ivfflat (menu_embedding vector_cosine_ops)
  WITH (lists = 100);

-- =====================================================
-- CONVERSATIONS (Core AI Learning Data)
-- =====================================================

CREATE TABLE conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  menu_id UUID REFERENCES menus(id) ON DELETE SET NULL,
  
  -- Session tracking (anonymous)
  session_id TEXT NOT NULL,
  
  -- The actual conversation
  question TEXT NOT NULL,
  question_embedding vector(1536), -- For similarity search
  answer TEXT NOT NULL,
  
  -- Language detection
  question_language TEXT,
  answer_language TEXT,
  
  -- AI Metadata
  model_used TEXT NOT NULL,
  prompt_tokens INTEGER,
  completion_tokens INTEGER,
  total_tokens INTEGER,
  response_time_ms INTEGER,
  
  -- Learning signals
  was_helpful BOOLEAN, -- Future: thumbs up/down
  follow_up_question BOOLEAN DEFAULT false,
  confidence_score FLOAT,
  
  -- Extracted intents/entities for learning
  intents JSONB DEFAULT '[]', -- ["check_allergen", "price_inquiry"]
  entities JSONB DEFAULT '{}', -- {"dish": "pasta", "allergen": "gluten"}
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for AI queries
CREATE INDEX idx_conversations_session ON conversations(session_id, created_at);
CREATE INDEX idx_conversations_embedding ON conversations 
  USING ivfflat (question_embedding vector_cosine_ops)
  WITH (lists = 100);
CREATE INDEX idx_conversations_intents ON conversations USING GIN(intents);
CREATE INDEX idx_conversations_entities ON conversations USING GIN(entities);

-- =====================================================
-- AI KNOWLEDGE BASE (Learning Storage)
-- =====================================================

-- Store learned patterns and insights
CREATE TABLE ai_insights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  
  insight_type TEXT NOT NULL, -- 'popular_question', 'menu_correction', 'pairing'
  
  -- The insight data
  pattern TEXT, -- "Users often ask about X when ordering Y"
  data JSONB NOT NULL, -- Flexible storage for any insight
  confidence FLOAT,
  
  -- Usage tracking
  times_used INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  
  -- Validation
  is_verified BOOLEAN DEFAULT false,
  verified_by TEXT, -- human email or 'auto'
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ -- Some insights become stale
);

-- =====================================================
-- SIMPLIFIED MENU ITEMS (AI-Extracted)
-- =====================================================

-- Denormalized for performance, AI maintains this
CREATE TABLE menu_items_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  menu_id UUID REFERENCES menus(id) ON DELETE CASCADE,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  
  -- Basic data (all extracted by AI)
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  price DECIMAL(10,2),
  currency TEXT DEFAULT 'EUR',
  
  -- AI-extracted attributes
  allergens TEXT[], -- Simple array
  dietary_tags TEXT[], -- ['vegan', 'gluten-free']
  ingredients TEXT[], -- AI best guess
  
  -- Embeddings for semantic search
  item_embedding vector(1536),
  
  -- Metadata
  extraction_confidence FLOAT,
  manually_verified BOOLEAN DEFAULT false,
  
  -- Analytics helper
  times_queried INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_items_restaurant ON menu_items_cache(restaurant_id);
CREATE INDEX idx_items_embedding ON menu_items_cache 
  USING ivfflat (item_embedding vector_cosine_ops)
  WITH (lists = 100);
CREATE INDEX idx_items_allergens ON menu_items_cache USING GIN(allergens);
CREATE INDEX idx_items_dietary ON menu_items_cache USING GIN(dietary_tags);

-- =====================================================
-- AI TRAINING FEEDBACK
-- =====================================================

-- Store corrections and feedback for model improvement
CREATE TABLE ai_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  
  feedback_type TEXT NOT NULL, -- 'correction', 'missing_info', 'wrong_answer'
  
  -- Context
  conversation_id UUID REFERENCES conversations(id),
  menu_item_id UUID REFERENCES menu_items_cache(id),
  
  -- The feedback
  original_value TEXT,
  corrected_value TEXT,
  feedback_text TEXT,
  
  -- Who gave feedback
  submitted_by TEXT, -- email or 'customer'
  
  -- Processing status
  is_processed BOOLEAN DEFAULT false,
  applied_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ANALYTICS (Pre-aggregated for Performance)
-- =====================================================

CREATE TABLE analytics_hourly (
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  hour TIMESTAMPTZ NOT NULL,
  
  -- Core metrics
  conversation_count INTEGER DEFAULT 0,
  unique_sessions INTEGER DEFAULT 0,
  total_tokens_used INTEGER DEFAULT 0,
  
  -- AI Performance
  avg_response_time_ms INTEGER,
  avg_confidence_score FLOAT,
  
  -- Usage patterns
  languages JSONB DEFAULT '{}', -- {"en": 45, "fr": 30}
  top_intents JSONB DEFAULT '{}', -- {"allergen": 20, "price": 15}
  top_queried_items UUID[], -- Array of item IDs
  
  -- Learning metrics
  corrections_received INTEGER DEFAULT 0,
  insights_generated INTEGER DEFAULT 0,
  
  PRIMARY KEY (restaurant_id, hour)
);

-- =====================================================
-- FUTURE AI FEATURES (Table placeholders)
-- =====================================================

-- For A/B testing different AI behaviors
CREATE TABLE ai_experiments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID REFERENCES restaurants(id),
  name TEXT NOT NULL,
  config JSONB NOT NULL, -- Model settings, prompts, etc.
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- For storing different AI model configurations
CREATE TABLE ai_models (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  provider TEXT NOT NULL, -- 'openai', 'anthropic', 'local'
  model_id TEXT NOT NULL, -- 'gpt-4', 'claude-2'
  config JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Auto-update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_restaurants_updated_at BEFORE UPDATE ON restaurants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_menus_updated_at BEFORE UPDATE ON menus
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON menu_items_cache
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- INITIAL INDEXES
-- =====================================================

-- Performance-critical queries
CREATE INDEX idx_conversations_restaurant_created 
  ON conversations(restaurant_id, created_at DESC);

CREATE INDEX idx_analytics_hourly_lookup 
  ON analytics_hourly(restaurant_id, hour DESC);

CREATE INDEX idx_feedback_unprocessed 
  ON ai_feedback(restaurant_id, is_processed) 
  WHERE is_processed = false;