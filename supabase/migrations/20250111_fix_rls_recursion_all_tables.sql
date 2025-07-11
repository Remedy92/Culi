-- Fix infinite recursion in RLS policies across all tables
-- The issue: Circular dependencies between restaurants, menus, and restaurant_members tables

-- Step 1: Drop all problematic policies that could cause recursion
-- On menus table
DROP POLICY IF EXISTS members_view_menus ON menus;
DROP POLICY IF EXISTS owners_manage_menus ON menus;

-- On restaurant_members table (drop any that reference restaurants circularly)
DROP POLICY IF EXISTS owners_select_members ON restaurant_members;
DROP POLICY IF EXISTS members_view_team_members ON restaurant_members;
DROP POLICY IF EXISTS owners_delete_members ON restaurant_members;
DROP POLICY IF EXISTS owners_update_members ON restaurant_members;

-- On restaurants table (drop the one that references restaurant_members)
DROP POLICY IF EXISTS members_view_restaurants ON restaurants;
DROP POLICY IF EXISTS owners_view_restaurants ON restaurants;

-- Step 2: Create SECURITY DEFINER helper functions to break cycles
-- These run as the database owner, avoiding RLS recursion

-- Function: Check if user owns a restaurant (for owner-level access)
CREATE OR REPLACE FUNCTION user_owns_restaurant(p_restaurant_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM restaurants
    WHERE id = p_restaurant_id AND owner_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Check if user can access a restaurant (owner or member)
CREATE OR REPLACE FUNCTION user_can_access_restaurant(p_restaurant_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM restaurants r
    WHERE r.id = p_restaurant_id
    AND (
      r.owner_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM restaurant_members rm
        WHERE rm.restaurant_id = r.id AND rm.user_id = auth.uid()
      )
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION user_owns_restaurant(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION user_can_access_restaurant(uuid) TO authenticated;

-- Step 3: Recreate non-recursive policies using the helper functions

-- For Restaurants table
CREATE POLICY owners_view_restaurants ON restaurants
  FOR ALL USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY members_view_restaurants ON restaurants
  FOR SELECT USING (user_can_access_restaurant(id));

-- For Menus table
CREATE POLICY owners_manage_menus ON menus
  FOR ALL USING (user_owns_restaurant(restaurant_id))
  WITH CHECK (user_owns_restaurant(restaurant_id));

CREATE POLICY members_view_menus ON menus
  FOR SELECT USING (user_can_access_restaurant(restaurant_id));

-- For Restaurant_Members table
CREATE POLICY owners_manage_members ON restaurant_members
  FOR ALL USING (user_owns_restaurant(restaurant_id))
  WITH CHECK (user_owns_restaurant(restaurant_id));

CREATE POLICY members_view_team ON restaurant_members
  FOR SELECT USING (user_can_access_restaurant(restaurant_id));

-- Keep the user's own membership view policy
CREATE POLICY users_view_own_memberships ON restaurant_members
  FOR SELECT USING (user_id = auth.uid());

-- Step 4: Ensure RLS is enabled on all tables
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_members ENABLE ROW LEVEL SECURITY;

-- Add comments for documentation
COMMENT ON FUNCTION user_owns_restaurant IS 'Checks if the current user owns a restaurant. Uses SECURITY DEFINER to bypass RLS and avoid recursion.';
COMMENT ON FUNCTION user_can_access_restaurant IS 'Checks if the current user can access a restaurant (as owner or member). Uses SECURITY DEFINER to bypass RLS and avoid recursion.';