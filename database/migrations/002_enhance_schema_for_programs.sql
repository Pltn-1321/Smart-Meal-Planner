-- Migration: Enhance schema for program management
-- Description: Add metadata, relationships, and improved data structure for plans, lists, and recipes
-- Created: 2026-01-24

-- ============================================================
-- 1. Enhance saved_plans table with metadata
-- ============================================================

ALTER TABLE saved_plans
  ADD COLUMN IF NOT EXISTS shopping_list_id UUID REFERENCES saved_lists(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS cuisine TEXT,
  ADD COLUMN IF NOT EXISTS difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  ADD COLUMN IF NOT EXISTS total_budget NUMERIC,
  ADD COLUMN IF NOT EXISTS week_start_date DATE;

-- Add comment to clarify relationship
COMMENT ON COLUMN saved_plans.shopping_list_id IS 'Link to the associated shopping list in saved_lists';
COMMENT ON COLUMN saved_plans.tags IS 'Tags for filtering (e.g., vegetarian, budget-friendly, quick)';
COMMENT ON COLUMN saved_plans.difficulty IS 'Overall difficulty level of the meal plan';
COMMENT ON COLUMN saved_plans.total_budget IS 'Numeric budget value for easier filtering/sorting';
COMMENT ON COLUMN saved_plans.week_start_date IS 'Start date of the meal plan week';

-- ============================================================
-- 2. Enhance saved_lists table
-- ============================================================

ALTER TABLE saved_lists
  ADD COLUMN IF NOT EXISTS plan_id UUID REFERENCES saved_plans(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS is_editable BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS total_estimated_price NUMERIC;

-- Add comment
COMMENT ON COLUMN saved_lists.plan_id IS 'Link back to the meal plan (if created from a plan)';
COMMENT ON COLUMN saved_lists.is_editable IS 'Whether this list can be edited after creation';
COMMENT ON COLUMN saved_lists.total_estimated_price IS 'Sum of all estimated item prices';

-- ============================================================
-- 3. Enhance saved_recipes table
-- ============================================================

ALTER TABLE saved_recipes
  ADD COLUMN IF NOT EXISTS difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  ADD COLUMN IF NOT EXISTS cook_time TEXT,
  ADD COLUMN IF NOT EXISTS servings INTEGER,
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS nutrition JSONB;

-- Add comment
COMMENT ON COLUMN saved_recipes.difficulty IS 'Recipe difficulty level';
COMMENT ON COLUMN saved_recipes.cook_time IS 'Cooking time (e.g., "30 min")';
COMMENT ON COLUMN saved_recipes.servings IS 'Number of servings/people';
COMMENT ON COLUMN saved_recipes.tags IS 'Tags for filtering (e.g., healthy, kid-friendly, spicy)';
COMMENT ON COLUMN saved_recipes.nutrition IS 'Nutritional information (calories, protein, carbs, fat)';

-- ============================================================
-- 4. Create indexes for better performance
-- ============================================================

-- Index for tag searches (GIN index for array columns)
CREATE INDEX IF NOT EXISTS idx_plans_tags ON saved_plans USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_recipes_tags ON saved_recipes USING GIN(tags);

-- Index for filtering by cuisine
CREATE INDEX IF NOT EXISTS idx_plans_cuisine ON saved_plans(cuisine) WHERE cuisine IS NOT NULL;

-- Index for filtering by difficulty
CREATE INDEX IF NOT EXISTS idx_plans_difficulty ON saved_plans(difficulty) WHERE difficulty IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_recipes_difficulty ON saved_recipes(difficulty) WHERE difficulty IS NOT NULL;

-- Index for date-based queries
CREATE INDEX IF NOT EXISTS idx_plans_week_start ON saved_plans(week_start_date) WHERE week_start_date IS NOT NULL;

-- Index for plan-list relationship
CREATE INDEX IF NOT EXISTS idx_lists_plan_id ON saved_lists(plan_id) WHERE plan_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_plans_shopping_list ON saved_plans(shopping_list_id) WHERE shopping_list_id IS NOT NULL;

-- Index for budget filtering
CREATE INDEX IF NOT EXISTS idx_plans_budget ON saved_plans(total_budget) WHERE total_budget IS NOT NULL;

-- ============================================================
-- 5. Update RLS policies to account for new columns
-- ============================================================

-- No changes needed to RLS policies as they already filter by user_id
-- The new columns are accessible through existing policies

-- ============================================================
-- 6. Migration helper function: Extract budget from old data
-- ============================================================

-- This function attempts to extract numeric budget from the old 'budget_estimate' text field
-- Run this after migration to populate total_budget for existing records
CREATE OR REPLACE FUNCTION migrate_budget_to_numeric()
RETURNS void AS $$
BEGIN
  UPDATE saved_plans
  SET total_budget =
    CASE
      -- Extract number from patterns like "50 EUR", "EUR 50", "50€", "$50"
      WHEN budget_estimate ~ '^\d+' THEN
        (regexp_match(budget_estimate, '^\d+'))[1]::NUMERIC
      WHEN budget_estimate ~ '\d+' THEN
        (regexp_match(budget_estimate, '\d+'))[1]::NUMERIC
      ELSE NULL
    END
  WHERE total_budget IS NULL AND budget_estimate IS NOT NULL;

  RAISE NOTICE 'Budget migration completed';
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 7. Migration helper: Extract cuisine from preferences
-- ============================================================

CREATE OR REPLACE FUNCTION migrate_cuisine_from_preferences()
RETURNS void AS $$
BEGIN
  UPDATE saved_plans
  SET cuisine = preferences->>'cuisine'
  WHERE cuisine IS NULL
    AND preferences IS NOT NULL
    AND preferences ? 'cuisine';

  RAISE NOTICE 'Cuisine migration completed';
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 8. Execute migrations (optional - run manually if needed)
-- ============================================================

-- Uncomment to run migrations on existing data:
-- SELECT migrate_budget_to_numeric();
-- SELECT migrate_cuisine_from_preferences();

-- ============================================================
-- 9. Validation query
-- ============================================================

-- Run this to check the migration worked
-- SELECT
--   COUNT(*) as total_plans,
--   COUNT(cuisine) as plans_with_cuisine,
--   COUNT(total_budget) as plans_with_budget,
--   COUNT(tags) as plans_with_tags,
--   COUNT(shopping_list_id) as plans_with_linked_list
-- FROM saved_plans;
