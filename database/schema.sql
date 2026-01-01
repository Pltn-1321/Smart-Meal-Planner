-- Create saved_recipes table
CREATE TABLE IF NOT EXISTS saved_recipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  recipe JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add plan_id column if it doesn't exist
ALTER TABLE saved_recipes ADD COLUMN IF NOT EXISTS plan_id UUID REFERENCES saved_plans(id) ON DELETE CASCADE;

-- Create saved_lists table
CREATE TABLE IF NOT EXISTS saved_lists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  list JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for saved_recipes
ALTER TABLE saved_recipes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own saved recipes" ON saved_recipes;
DROP POLICY IF EXISTS "Users can insert their own saved recipes" ON saved_recipes;
DROP POLICY IF EXISTS "Users can update their own saved recipes" ON saved_recipes;
DROP POLICY IF EXISTS "Users can delete their own saved recipes" ON saved_recipes;

CREATE POLICY "Users can view their own saved recipes"
  ON saved_recipes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved recipes"
  ON saved_recipes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved recipes"
  ON saved_recipes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved recipes"
  ON saved_recipes FOR DELETE
  USING (auth.uid() = user_id);

-- Add RLS policies for saved_lists
ALTER TABLE saved_lists ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own saved lists" ON saved_lists;
DROP POLICY IF EXISTS "Users can insert their own saved lists" ON saved_lists;
DROP POLICY IF EXISTS "Users can update their own saved lists" ON saved_lists;
DROP POLICY IF EXISTS "Users can delete their own saved lists" ON saved_lists;

CREATE POLICY "Users can view their own saved lists"
  ON saved_lists FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved lists"
  ON saved_lists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved lists"
  ON saved_lists FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved lists"
  ON saved_lists FOR DELETE
  USING (auth.uid() = user_id);

-- Create user_preferences table for global user settings
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  dietary_restrictions TEXT[],
  cuisine_preferences TEXT[],
  budget_per_day DECIMAL(10,2),
  people_count INTEGER DEFAULT 4,
  location TEXT,
  currency TEXT DEFAULT 'USD',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create saved_plans table
CREATE TABLE IF NOT EXISTS saved_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  preferences JSONB NOT NULL, -- Plan-specific preferences (may override global ones)
  week_plan JSONB NOT NULL,
  recipes JSONB NOT NULL,
  batch_cooking JSONB NOT NULL,
  budget_estimate TEXT NOT NULL,
  shopping_list JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for user_preferences
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can insert their own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can update their own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can delete their own preferences" ON user_preferences;

CREATE POLICY "Users can view their own preferences"
  ON user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
  ON user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
  ON user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own preferences"
  ON user_preferences FOR DELETE
  USING (auth.uid() = user_id);

-- Add RLS policies for saved_plans
ALTER TABLE saved_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own saved plans" ON saved_plans;
DROP POLICY IF EXISTS "Users can insert their own saved plans" ON saved_plans;
DROP POLICY IF EXISTS "Users can update their own saved plans" ON saved_plans;
DROP POLICY IF EXISTS "Users can delete their own saved plans" ON saved_plans;

CREATE POLICY "Users can view their own saved plans"
  ON saved_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved plans"
  ON saved_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved plans"
  ON saved_plans FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved plans"
  ON saved_plans FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_saved_recipes_user_id ON saved_recipes(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_recipes_plan_id ON saved_recipes(plan_id);
CREATE INDEX IF NOT EXISTS idx_saved_recipes_created_at ON saved_recipes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_saved_lists_user_id ON saved_lists(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_lists_created_at ON saved_lists(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_saved_plans_user_id ON saved_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_plans_updated_at ON saved_plans(updated_at DESC);
