import { z } from 'zod';

// Auth validators
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const changePasswordSchema = z.object({
  token: z.string(),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

// User preferences validators
export const userPreferencesSchema = z.object({
  dietaryRestrictions: z.array(z.string()).optional(),
  cuisinePreferences: z.array(z.string()).optional(),
  budgetPerDay: z.number().positive().optional(),
  peopleCount: z.number().int().positive().default(4),
  location: z.string().optional(),
  currency: z.string().default('USD'),
});

// Plan validators
export const savePlanSchema = z.object({
  name: z.string().min(1, 'Plan name is required'),
  preferences: z.any(), // UserPreferences object
  weekPlan: z.any(),
  recipes: z.array(z.any()),
  batchCooking: z.array(z.any()),
  budgetEstimate: z.string(),
  shoppingList: z.array(z.any()),
});

// Recipe validators
export const saveRecipeSchema = z.object({
  recipe: z.any(), // Recipe object
  planId: z.string().uuid().optional(),
});

// List validators
export const saveListSchema = z.object({
  name: z.string().min(1, 'List name is required'),
  list: z.array(z.any()),
});
