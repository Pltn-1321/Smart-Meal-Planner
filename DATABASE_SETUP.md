# Database Setup Instructions

This document contains the SQL schema needed to set up the database tables for the Smart Meal Planner application.

## Prerequisites

- Supabase project set up
- Database access (via Supabase dashboard or direct connection)

## Tables Created

The application requires the following tables:

1. **saved_plans** - Stores saved meal plans (with plan-specific preferences)
2. **saved_recipes** - Stores saved individual recipes
3. **saved_lists** - Stores saved shopping lists
4. **user_preferences** - Stores global user settings and defaults

## Schema Setup

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `database/schema.sql`
4. Execute the SQL script

Alternatively, if you have direct database access, you can run the SQL file directly.

## Database Tables Structure

### saved_recipes

- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key to auth.users)
- `recipe` (JSONB) - Complete recipe object
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

### saved_lists

- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key to auth.users)
- `name` (Text) - User-provided name for the list
- `list` (JSONB) - Complete shopping list categories
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

### saved_plans

- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key to auth.users)
- `name` (Text) - User-provided name for the plan
- `preferences` (JSONB) - User preferences for meal planning
- `week_plan` (JSONB) - Complete weekly meal plan structure
- `recipes` (JSONB) - Array of all recipes in the plan
- `batch_cooking` (JSONB) - Batch cooking instructions
- `budget_estimate` (Text) - Budget estimate for the plan
- `shopping_list` (JSONB) - Shopping list data
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

### user_preferences

- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key to auth.users, Unique) - One record per user
- `dietary_restrictions` (TEXT[]) - Array of dietary restrictions
- `cuisine_preferences` (TEXT[]) - Array of preferred cuisines
- `budget_per_day` (DECIMAL(10,2)) - Daily budget limit
- `people_count` (INTEGER) - Default number of people
- `location` (TEXT) - Default location for meal planning
- `currency` (TEXT) - Default currency (USD, EUR, etc.)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

## Security

All tables have Row Level Security (RLS) enabled with policies that ensure:

- Users can only access their own data
- Full CRUD operations are allowed for authenticated users on their own records

## Features Implemented

With this setup, users can:

1. **Save Meal Plans** - Save entire weekly meal plans
2. **Save Individual Recipes** - Save specific recipes from meal plans
3. **Save Shopping Lists** - Save shopping lists with organized categories
4. **Delete Saved Items** - Remove any saved plans, recipes, or lists
5. **View Organized Data** - All saved items are ordered by creation date (newest first)

The dashboard provides a tabbed interface with:

- **New Plan** - Create and manage meal plans
- **My Recipes** - View and manage saved recipes
- **My Lists** - View and manage saved shopping lists
- **Settings** - Placeholder for future settings

## Testing the Setup

After running the schema:

1. Start the application
2. Create a new meal plan
3. Save individual recipes using the "Save" button in recipe modals
4. Save shopping lists using the "Save List" button
5. Switch between dashboard tabs to view saved items
6. Test deleting items to ensure proper cleanup
