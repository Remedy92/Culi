-- Fix infinite recursion in RLS policies for restaurants table
-- The issue: users_view_restaurants policy queries restaurant_members, 
-- which has policies that query back to restaurants, creating a loop

-- Step 1: Drop the problematic policy to break the cycle
DROP POLICY IF EXISTS users_view_restaurants ON restaurants;

-- Step 2: Create a simpler policy for direct owners (no circular refs)
CREATE POLICY owners_view_restaurants ON restaurants
  FOR SELECT USING (owner_id = auth.uid());

-- Step 3: Create a policy for members (queries restaurant_members without back-referencing restaurants)
CREATE POLICY members_view_restaurants ON restaurants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM restaurant_members rm
      WHERE rm.restaurant_id = restaurants.id
      AND rm.user_id = auth.uid()
      -- No check back to restaurants.owner_id here to avoid recursion
    )
  );

-- Step 4: Ensure RLS is enabled on both tables (if not already)
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_members ENABLE ROW LEVEL SECURITY;

-- Step 5: The get_user_restaurant function already exists and works correctly
-- No need to recreate it, just ensure permissions are set

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_restaurant TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION get_user_restaurant IS 'Returns the restaurant for the current user, either as owner or member. Uses SECURITY DEFINER to bypass RLS and avoid recursion.';