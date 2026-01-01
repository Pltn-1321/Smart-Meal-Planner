# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
npm run dev      # Start dev server on http://localhost:3000
npm run build    # Production build
npm run preview  # Preview production build
```

No test or lint commands are configured.

## Environment Setup

Copy `.env.example` to `.env.local` and configure:
- `OPENROUTER_API_KEY` - Required for AI meal generation (https://openrouter.ai/keys)
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key

## Architecture

This is a React 19 + TypeScript + Vite application for AI-powered meal planning with Supabase backend.

### Core Structure

- **App.tsx**: Entry point wrapping everything in `AuthProvider`
- **types.ts**: All TypeScript interfaces (`WeeklyPlanData`, `Recipe`, `UserPreferences`, etc.)
- **lib/supabase.ts**: Supabase client initialization
- **contexts/AuthContext.tsx**: Authentication state management with `useAuth()` hook

### Services Layer (`services/`)

- **openRouterService.ts**: AI integration via OpenRouter API (uses `mistralai/ministral-8b` model). Handles `generateWeeklyPlan()` and `regenerateDayPlan()`.
- **planStorageService.ts**: Save/load full meal plans to Supabase
- **recipeStorageService.ts**: Individual recipe persistence
- **listStorageService.ts**: Shopping list persistence
- **exportService.ts**: Markdown export and print functionality

### UI Flow

1. Unauthenticated users see `LandingPage` with `AuthModal`
2. Authenticated users see `UserDashboard` with tabs: New Plan, My Recipes, My Lists, Settings
3. `InputSection` collects preferences, `generateWeeklyPlan()` calls OpenRouter API
4. Plan displays via `MealCard`, `ShoppingListView`, `BatchCookingView`
5. `RecipeModal` shows detailed recipe view

### Database Schema (`database/schema.sql`)

Four tables with Row Level Security:
- `saved_plans`: Complete meal plans with preferences
- `saved_recipes`: Individual recipes (can link to plan_id)
- `saved_lists`: Shopping lists
- `user_preferences`: Global user settings

### Path Alias

`@` maps to project root in imports.
