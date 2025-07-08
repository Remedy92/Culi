-- =====================================================
-- CULI (TABLELINK) - PRODUCTION-READY SCHEMA
-- With multi-tenancy, GDPR compliance, and AI future-proofing
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_crypto;

-- =====================================================
-- RESTAURANTS (Multi-tenant ready from day 1)
-- =====================================================

CREATE TABLE restaurants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  
  -- Subscription management
  tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'professional', 'premium')),
  tier_expires_at TIMESTAMPTZ,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  
  -- AI Learning Preferences
  ai_settings JSONB DEFAULT '{
    "learn_from_conversations": true,
    "personalization_level": "medium",
    "auto_update_menu": false,
    "allowed_models": ["openai/gpt-4", "xai/grok-3"]
  }',
  
  -- Usage tracking
  monthly_conversations INTEGER DEFAULT 0,
  monthly_tokens_used INTEGER DEFAULT 0,
  usage_reset_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '1 month',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS immediately
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- FLEXIBLE MENU STORAGE (AI-Optimized)
-- =====================================================

CREATE TABLE menus (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  
  -- Original source (what humans uploaded)
  source_type TEXT NOT NULL CHECK (source_type IN ('pdf', 'image', 'text', 'api', 'manual')),
  source_url TEXT,
  source_text TEXT, -- Raw text for AI to process
  
  -- AI-extracted structured data
  extracted_data JSONB NOT NULL DEFAULT '{}',
  extraction_confidence FLOAT CHECK (extraction_confidence >= 0 AND extraction_confidence <= 1),
  extraction_model TEXT,
  extraction_timestamp TIMESTAMPTZ,
  
  -- Multiple embedding support for future models
  menu_embedding vector(1536), -- Current OpenAI models
  menu_embedding_large vector(3072), -- Future larger models
  embedding_model TEXT,
  embedding_timestamp TIMESTAMPTZ,
  
  -- Versioning
  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  previous_version_id UUID REFERENCES menus(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE menus ENABLE ROW LEVEL SECURITY;

-- Indexes for vector search
CREATE INDEX idx_menu_embedding ON menus 
  USING ivfflat (menu_embedding vector_cosine_ops)
  WITH (lists = 100);

CREATE INDEX idx_menu_embedding_large ON menus 
  USING ivfflat (menu_embedding_large vector_cosine_ops)
  WITH (lists = 100)
  WHERE menu_embedding_large IS NOT NULL;

-- =====================================================
-- GDPR-COMPLIANT CONVERSATIONS
-- =====================================================

CREATE TABLE conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  menu_id UUID REFERENCES menus(id) ON DELETE SET NULL,
  
  -- Privacy-first session tracking
  session_hash TEXT NOT NULL, -- SHA-256 hash of session ID + daily salt
  ip_country TEXT, -- Only store country for analytics
  ip_region TEXT, -- Optional region/state
  user_agent_hash TEXT, -- Hashed for privacy
  
  -- The actual conversation
  question TEXT NOT NULL,
  question_embedding vector(1536),
  question_embedding_large vector(3072),
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
  was_helpful BOOLEAN,
  follow_up_question BOOLEAN DEFAULT false,
  confidence_score FLOAT,
  
  -- Extracted intents/entities for learning
  intents JSONB DEFAULT '[]',
  entities JSONB DEFAULT '{}',
  
  -- GDPR compliance
  consent_given BOOLEAN DEFAULT false,
  retention_days INTEGER DEFAULT 90, -- Auto-delete after X days
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Indexes for performance
CREATE INDEX idx_conversations_session ON conversations(session_hash, created_at DESC);
CREATE INDEX idx_conversations_restaurant_date ON conversations(restaurant_id, created_at DESC);
CREATE INDEX idx_conversations_retention ON conversations(created_at, retention_days) 
  WHERE retention_days IS NOT NULL;

-- Vector indexes
CREATE INDEX idx_conversations_embedding ON conversations 
  USING ivfflat (question_embedding vector_cosine_ops)
  WITH (lists = 100);

CREATE INDEX idx_conversations_embedding_large ON conversations 
  USING ivfflat (question_embedding_large vector_cosine_ops)
  WITH (lists = 100)
  WHERE question_embedding_large IS NOT NULL;

-- =====================================================
-- AI KNOWLEDGE BASE (Learning Storage)
-- =====================================================

CREATE TABLE ai_insights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  
  insight_type TEXT NOT NULL CHECK (insight_type IN (
    'popular_question', 'menu_correction', 'pairing', 
    'allergen_pattern', 'dietary_preference', 'language_pattern'
  )),
  
  -- The insight data
  pattern TEXT,
  data JSONB NOT NULL,
  confidence FLOAT CHECK (confidence >= 0 AND confidence <= 1),
  
  -- Usage tracking
  times_used INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  
  -- Validation
  is_verified BOOLEAN DEFAULT false,
  verified_by TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- MENU ITEMS CACHE (AI-Extracted)
-- =====================================================

CREATE TABLE menu_items_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  menu_id UUID REFERENCES menus(id) ON DELETE CASCADE,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  
  -- Basic data
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  price DECIMAL(10,2),
  currency TEXT DEFAULT 'EUR',
  
  -- AI-extracted attributes
  allergens TEXT[],
  dietary_tags TEXT[],
  ingredients TEXT[],
  calories INTEGER,
  
  -- Multiple embeddings
  item_embedding vector(1536),
  item_embedding_large vector(3072),
  embedding_model TEXT,
  
  -- Metadata
  extraction_confidence FLOAT,
  manually_verified BOOLEAN DEFAULT false,
  
  -- Analytics
  times_queried INTEGER DEFAULT 0,
  last_queried_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE menu_items_cache ENABLE ROW LEVEL SECURITY;

-- Performance indexes
CREATE INDEX idx_items_restaurant ON menu_items_cache(restaurant_id);
CREATE INDEX idx_items_menu ON menu_items_cache(menu_id);
CREATE INDEX idx_items_allergens ON menu_items_cache USING GIN(allergens);
CREATE INDEX idx_items_dietary ON menu_items_cache USING GIN(dietary_tags);

-- Vector indexes
CREATE INDEX idx_items_embedding ON menu_items_cache 
  USING ivfflat (item_embedding vector_cosine_ops)
  WITH (lists = 100);

CREATE INDEX idx_items_embedding_large ON menu_items_cache 
  USING ivfflat (item_embedding_large vector_cosine_ops)
  WITH (lists = 100)
  WHERE item_embedding_large IS NOT NULL;

-- =====================================================
-- SESSION MANAGEMENT (GDPR Compliant)
-- =====================================================

CREATE TABLE session_salts (
  date DATE PRIMARY KEY DEFAULT CURRENT_DATE,
  salt TEXT NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-generate daily salts
CREATE OR REPLACE FUNCTION get_or_create_daily_salt()
RETURNS TEXT AS $$
DECLARE
  daily_salt TEXT;
BEGIN
  INSERT INTO session_salts (date)
  VALUES (CURRENT_DATE)
  ON CONFLICT (date) DO NOTHING;
  
  SELECT salt INTO daily_salt
  FROM session_salts
  WHERE date = CURRENT_DATE;
  
  RETURN daily_salt;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- ANALYTICS (Pre-aggregated)
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
  languages JSONB DEFAULT '{}',
  top_intents JSONB DEFAULT '{}',
  top_queried_items UUID[],
  
  -- Business metrics
  helpful_rate FLOAT,
  
  PRIMARY KEY (restaurant_id, hour)
);

-- Enable RLS
ALTER TABLE analytics_hourly ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Function to get current restaurant context
CREATE OR REPLACE FUNCTION auth.restaurant_id()
RETURNS UUID AS $$
  SELECT 
    COALESCE(
      current_setting('request.jwt.claims', true)::json->>'restaurant_id',
      current_setting('request.headers', true)::json->>'x-restaurant-id'
    )::UUID
$$ LANGUAGE SQL STABLE;

-- Restaurants: Users can only see their own restaurant
CREATE POLICY "Users can view own restaurant"
  ON restaurants FOR SELECT
  USING (id = auth.restaurant_id());

CREATE POLICY "Users can update own restaurant"
  ON restaurants FOR UPDATE
  USING (id = auth.restaurant_id());

-- Menus: Tenant isolation
CREATE POLICY "Users can view own menus"
  ON menus FOR ALL
  USING (restaurant_id = auth.restaurant_id());

-- Conversations: Tenant isolation
CREATE POLICY "Users can view own conversations"
  ON conversations FOR SELECT
  USING (restaurant_id = auth.restaurant_id());

CREATE POLICY "Public can insert conversations"
  ON conversations FOR INSERT
  WITH CHECK (true); -- Allow guests to create conversations

-- Menu items: Tenant isolation
CREATE POLICY "Users can manage own menu items"
  ON menu_items_cache FOR ALL
  USING (restaurant_id = auth.restaurant_id());

-- AI insights: Tenant isolation
CREATE POLICY "Users can view own insights"
  ON ai_insights FOR SELECT
  USING (restaurant_id = auth.restaurant_id());

-- Analytics: Tenant isolation
CREATE POLICY "Users can view own analytics"
  ON analytics_hourly FOR SELECT
  USING (restaurant_id = auth.restaurant_id());

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

-- Create triggers for all tables with updated_at
CREATE TRIGGER update_restaurants_updated_at BEFORE UPDATE ON restaurants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_menus_updated_at BEFORE UPDATE ON menus
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON menu_items_cache
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- GDPR: Auto-delete old conversations
CREATE OR REPLACE FUNCTION delete_expired_conversations()
RETURNS void AS $$
BEGIN
  DELETE FROM conversations
  WHERE created_at < NOW() - (retention_days || ' days')::INTERVAL
  AND retention_days IS NOT NULL;
END;
$$ LANGUAGE plpgsql;

-- Hash session ID with daily salt
CREATE OR REPLACE FUNCTION hash_session_id(session_id TEXT)
RETURNS TEXT AS $$
DECLARE
  daily_salt TEXT;
BEGIN
  daily_salt := get_or_create_daily_salt();
  RETURN encode(digest(session_id || daily_salt, 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- INITIAL DATA
-- =====================================================

-- Create tier limits
CREATE TABLE tier_limits (
  tier TEXT PRIMARY KEY,
  monthly_conversations INTEGER NOT NULL,
  monthly_tokens INTEGER NOT NULL,
  languages_allowed INTEGER NOT NULL,
  custom_branding BOOLEAN DEFAULT false,
  api_access BOOLEAN DEFAULT false,
  analytics_retention_days INTEGER DEFAULT 30
);

INSERT INTO tier_limits (tier, monthly_conversations, monthly_tokens, languages_allowed, custom_branding, api_access, analytics_retention_days)
VALUES 
  ('free', 100, 50000, 2, false, false, 30),
  ('professional', 1000, 500000, -1, true, false, 90),
  ('premium', -1, -1, -1, true, true, 365);

-- =====================================================
-- SCHEDULED JOBS (Run via Supabase CRON or external)
-- =====================================================

-- 1. Daily: Delete expired conversations (GDPR)
-- 2. Daily: Generate new session salt
-- 3. Hourly: Aggregate analytics
-- 4. Monthly: Reset usage counters