export interface Ingredient {
  item: string;
  quantity: string;
  notes?: string;
}

export interface Recipe {
  id: string; // e.g., "mon-dinner"
  name: string;
  prepTime: string;
  ingredients: string[];
  instructions: string[];
  tips?: string;
}

export interface DayPlan {
  day: string; // "Lundi", "Mardi", etc.
  breakfast: string;
  lunch: string;
  dinner: string;
  dinnerRecipeId: string;
}

export interface ShoppingListCategory {
  location: "Dezerter Bazaar" | "Carrefour/Supermarket" | "Pantry/Epices";
  items: Ingredient[];
}

export interface BatchCookingStep {
  step: number;
  instruction: string;
  timeEstimate: string;
}

export interface WeeklyPlanData {
  weekPlan: DayPlan[];
  shoppingList: ShoppingListCategory[];
  batchCooking: BatchCookingStep[];
  recipes: Recipe[];
  budgetEstimate: string;
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