-- =====================================================
-- AUTHENTICATION & MULTI-TENANCY UPDATES
-- Adds missing auth-related tables and updates RLS policies
-- =====================================================

-- =====================================================
-- RESTAURANT MEMBERS (Team Access)
-- =====================================================

CREATE TABLE IF NOT EXISTS restaurant_members (
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (restaurant_id, user_id)
);

-- Enable RLS
ALTER TABLE restaurant_members ENABLE ROW LEVEL SECURITY;

-- Indexes for performance
CREATE INDEX idx_restaurant_members_user ON restaurant_members(user_id);
CREATE INDEX idx_restaurant_members_restaurant ON restaurant_members(restaurant_id);

-- =====================================================
-- GDPR CONSENTS (Legal Requirement)
-- =====================================================

CREATE TABLE IF NOT EXISTS gdpr_consents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  consent_type TEXT NOT NULL CHECK (consent_type IN ('privacy_policy', 'terms_of_service', 'marketing_emails')),
  consent_given BOOLEAN DEFAULT false,
  ip_country TEXT,
  user_agent_hash TEXT,
  given_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE gdpr_consents ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX idx_gdpr_consents_user ON gdpr_consents(user_id);
CREATE INDEX idx_gdpr_consents_email ON gdpr_consents(email);

-- =====================================================
-- USAGE LOGS (Detailed Tracking)
-- =====================================================

CREATE TABLE IF NOT EXISTS usage_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  type TEXT NOT NULL CHECK (type IN (
    'menu_query', 'menu_extraction', 'menu_upload', 
    'login', 'team_invite', 'settings_change'
  )),
  metadata JSONB DEFAULT '{}',
  ip_country TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;

-- Indexes for analytics
CREATE INDEX idx_usage_logs_restaurant_date ON usage_logs(restaurant_id, created_at DESC);
CREATE INDEX idx_usage_logs_type ON usage_logs(type, created_at DESC);

-- =====================================================
-- UPDATE RESTAURANTS TABLE
-- =====================================================

-- Add owner_id column to restaurants if it doesn't exist
ALTER TABLE restaurants 
ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id);

-- =====================================================
-- HELPER FUNCTIONS FOR AUTH
-- =====================================================

-- Get current user's restaurants
CREATE OR REPLACE FUNCTION get_user_restaurants()
RETURNS SETOF UUID AS $$
  SELECT DISTINCT 
    COALESCE(r.id, rm.restaurant_id) as restaurant_id
  FROM restaurants r
  LEFT JOIN restaurant_members rm ON rm.restaurant_id = r.id
  WHERE r.owner_id = auth.uid() 
     OR rm.user_id = auth.uid()
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Check if user has access to restaurant
CREATE OR REPLACE FUNCTION has_restaurant_access(restaurant_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM restaurants r
    LEFT JOIN restaurant_members rm ON rm.restaurant_id = r.id
    WHERE r.id = restaurant_uuid
      AND (r.owner_id = auth.uid() OR rm.user_id = auth.uid())
  )
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- =====================================================
-- UPDATE RLS POLICIES
-- =====================================================

-- Drop old policies that use auth.restaurant_id()
DROP POLICY IF EXISTS "Users can view own restaurant" ON restaurants;
DROP POLICY IF EXISTS "Users can update own restaurant" ON restaurants;
DROP POLICY IF EXISTS "Users can view own menus" ON menus;
DROP POLICY IF EXISTS "Users can view own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can manage own menu items" ON menu_items_cache;
DROP POLICY IF EXISTS "Users can view own insights" ON ai_insights;
DROP POLICY IF EXISTS "Users can view own analytics" ON analytics_hourly;

-- Restaurants: Users can see restaurants they own or are members of
CREATE POLICY "Users can view accessible restaurants"
  ON restaurants FOR SELECT
  USING (
    owner_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM restaurant_members 
      WHERE restaurant_id = restaurants.id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Owners can update their restaurants"
  ON restaurants FOR UPDATE
  USING (owner_id = auth.uid());

CREATE POLICY "Authenticated users can create restaurants"
  ON restaurants FOR INSERT
  WITH CHECK (owner_id = auth.uid());

-- Restaurant Members
CREATE POLICY "Users can view members of their restaurants"
  ON restaurant_members FOR SELECT
  USING (has_restaurant_access(restaurant_id));

CREATE POLICY "Restaurant owners can manage members"
  ON restaurant_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM restaurants 
      WHERE id = restaurant_members.restaurant_id 
      AND owner_id = auth.uid()
    )
  );

-- Menus: Access based on restaurant membership
CREATE POLICY "Users can view menus of their restaurants"
  ON menus FOR SELECT
  USING (has_restaurant_access(restaurant_id));

CREATE POLICY "Users can manage menus of their restaurants"
  ON menus FOR ALL
  USING (has_restaurant_access(restaurant_id));

-- Conversations: Restaurant members can view, public can insert
CREATE POLICY "Restaurant members can view conversations"
  ON conversations FOR SELECT
  USING (has_restaurant_access(restaurant_id));

CREATE POLICY "Public can create conversations"
  ON conversations FOR INSERT
  WITH CHECK (true);

-- Menu Items Cache
CREATE POLICY "Users can view menu items of their restaurants"
  ON menu_items_cache FOR SELECT
  USING (has_restaurant_access(restaurant_id));

CREATE POLICY "Users can manage menu items of their restaurants"
  ON menu_items_cache FOR ALL
  USING (has_restaurant_access(restaurant_id));

-- AI Insights
CREATE POLICY "Users can view insights of their restaurants"
  ON ai_insights FOR SELECT
  USING (has_restaurant_access(restaurant_id));

CREATE POLICY "Users can manage insights of their restaurants"
  ON ai_insights FOR ALL
  USING (has_restaurant_access(restaurant_id));

-- Analytics
CREATE POLICY "Users can view analytics of their restaurants"
  ON analytics_hourly FOR SELECT
  USING (has_restaurant_access(restaurant_id));

-- GDPR Consents
CREATE POLICY "Users can view their own consents"
  ON gdpr_consents FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own consents"
  ON gdpr_consents FOR ALL
  USING (user_id = auth.uid());

-- Usage Logs
CREATE POLICY "Users can view usage logs of their restaurants"
  ON usage_logs FOR SELECT
  USING (has_restaurant_access(restaurant_id));

-- =====================================================
-- MIGRATION HELPERS
-- =====================================================

-- Function to track user activity
CREATE OR REPLACE FUNCTION track_user_activity(
  p_restaurant_id UUID,
  p_type TEXT,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS void AS $$
BEGIN
  INSERT INTO usage_logs (restaurant_id, user_id, type, metadata)
  VALUES (p_restaurant_id, auth.uid(), p_type, p_metadata);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to record GDPR consent
CREATE OR REPLACE FUNCTION record_gdpr_consent(
  p_email TEXT,
  p_consent_types TEXT[],
  p_ip_country TEXT DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO gdpr_consents (user_id, email, consent_type, consent_given, given_at, ip_country)
  SELECT auth.uid(), p_email, consent_type, true, NOW(), p_ip_country
  FROM unnest(p_consent_types) AS consent_type
  ON CONFLICT (user_id, consent_type) 
  DO UPDATE SET 
    consent_given = true,
    given_at = NOW(),
    revoked_at = NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- DATA MIGRATION
-- =====================================================

-- Ensure all restaurants have an owner_id
-- (This would need to be run manually with proper user mapping)
-- UPDATE restaurants SET owner_id = 'your-user-id' WHERE owner_id IS NULL;