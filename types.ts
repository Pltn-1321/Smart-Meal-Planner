export interface Ingredient {
  id?: string; // UUID for editing
  item?: string; // Deprecated, use 'name'
  name?: string; // New preferred field
  quantity: string;
  unit?: string; // "g", "ml", "pcs", "cup", etc.
  notes?: string;
  optional?: boolean;
}

export interface NutritionInfo {
  calories?: number;
  protein?: number; // in grams
  carbs?: number; // in grams
  fat?: number; // in grams
}

export interface Recipe {
  id: string; // e.g., "mon-dinner"
  name: string;
  prepTime: string;
  cookTime?: string; // New field
  servings?: number; // Number of people
  difficulty?: 'easy' | 'medium' | 'hard'; // New field
  ingredients: string[] | Ingredient[]; // Support both old and new format
  instructions: string[];
  tips?: string;
  tags?: string[]; // ["healthy", "kid-friendly", "spicy"]
  nutrition?: NutritionInfo; // New field
  imageUrl?: string; // New field (optional)
}

export interface DayPlan {
  day: string; // "Lundi", "Mardi", etc.
  breakfast: string;
  lunch: string;
  dinner: string;
  dinnerRecipeId: string;
}

export interface ShoppingListItem {
  id?: string; // UUID for editing
  item: string;
  quantity: string;
  estimatedPrice?: number; // New field
  category?: string; // "vegetables", "meat", "spices", etc.
  checked?: boolean; // For checking off during shopping
}

export interface ShoppingListCategory {
  location: string; // More flexible than enum - "Dezerter Bazaar", "Carrefour/Supermarket", etc.
  items: (Ingredient | ShoppingListItem)[]; // Support both formats
  totalEstimated?: number; // Sum of estimated prices
}

export interface BatchCookingStep {
  step: number;
  instruction: string;
  timeEstimate: string;
}

export interface ProgramMetadata {
  id?: string; // UUID of the program (after saving)
  name?: string; // Ex: "Italian Week - Budget 50€"
  suggestedName?: string; // AI-suggested name
  cuisine?: string; // "Italian", "French", "Mixed"
  difficulty?: 'easy' | 'medium' | 'hard';
  totalBudget?: number; // Numeric amount
  currency?: string;
  peopleCount?: number;
  weekStartDate?: string; // ISO date
  tags?: string[]; // ["vegetarian", "budget-friendly", "quick"]
  createdAt?: string;
  updatedAt?: string;
}

export interface WeeklyPlanData {
  metadata?: ProgramMetadata; // New field for enhanced metadata
  weekPlan: DayPlan[];
  shoppingList: ShoppingListCategory[];
  shoppingListId?: string; // New field - link to saved_lists
  batchCooking: BatchCookingStep[];
  recipes: Recipe[];
  budgetEstimate: string; // Deprecated, use metadata.totalBudget
}

export interface UserPreferences {
  location: string;
  budget: string;
  currency: string;
  peopleCount: number;
  equipment: string[];
  restrictions: string;
  cuisine: string;
  context: string; // Previous week leftovers
}

export interface LoadingState {
  isLoading: boolean;
  message: string;
}