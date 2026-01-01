import { supabase } from '../lib/supabase';
import { Recipe } from '../types';

export interface SavedRecipe {
  id: string;
  user_id: string;
  plan_id?: string;
  recipe: Recipe;
  created_at: string;
  updated_at: string;
}

export class RecipeStorageService {

  /**
   * Save a recipe for the current user
   */
  static async saveRecipe(recipe: Recipe): Promise<{ success: boolean; recipeId?: string; error?: string }> {
    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      const { data, error } = await supabase
        .from('saved_recipes')
        .insert({
          user_id: user.id,
          recipe: recipe,
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error saving recipe:', error);
        return { success: false, error: error.message };
      }

      return { success: true, recipeId: data.id };
    } catch (error) {
      console.error('Error saving recipe:', error);
      return { success: false, error: 'Failed to save recipe' };
    }
  }

  /**
   * Load all saved recipes for the current user
   */
  static async loadSavedRecipes(): Promise<{ success: boolean; recipes?: SavedRecipe[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('saved_recipes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading saved recipes:', error);
        return { success: false, error: error.message };
      }

      return { success: true, recipes: data || [] };
    } catch (error) {
      console.error('Error loading saved recipes:', error);
      return { success: false, error: 'Failed to load saved recipes' };
    }
  }

  /**
   * Load saved recipes for a specific plan
   */
  static async loadRecipesForPlan(planId: string): Promise<{ success: boolean; recipes?: SavedRecipe[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('saved_recipes')
        .select('*')
        .eq('plan_id', planId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading recipes for plan:', error);
        return { success: false, error: error.message };
      }

      return { success: true, recipes: data || [] };
    } catch (error) {
      console.error('Error loading recipes for plan:', error);
      return { success: false, error: 'Failed to load recipes for plan' };
    }
  }

  /**
   * Load a specific recipe by ID
   */
  static async loadRecipe(recipeId: string): Promise<{ success: boolean; recipe?: SavedRecipe; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('saved_recipes')
        .select('*')
        .eq('id', recipeId)
        .single();

      if (error) {
        console.error('Error loading recipe:', error);
        return { success: false, error: error.message };
      }

      return { success: true, recipe: data };
    } catch (error) {
      console.error('Error loading recipe:', error);
      return { success: false, error: 'Failed to load recipe' };
    }
  }

  /**
   * Delete a saved recipe
   */
  static async deleteRecipe(recipeId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('saved_recipes')
        .delete()
        .eq('id', recipeId);

      if (error) {
        console.error('Error deleting recipe:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error deleting recipe:', error);
      return { success: false, error: 'Failed to delete recipe' };
    }
  }
}
