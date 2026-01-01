import { supabase } from '../lib/supabase';
import { WeeklyPlanData, UserPreferences } from '../types';

export interface SavedPlan {
  id: string;
  user_id: string;
  name: string;
  preferences: UserPreferences;
  week_plan: any;
  recipes: any[];
  batch_cooking: any[];
  budget_estimate: string;
  shopping_list: any[];
  created_at: string;
  updated_at: string;
}

export class PlanStorageService {

  /**
   * Save a meal plan for the current user
   */
  static async savePlan(
    planName: string,
    preferences: UserPreferences,
    planData: WeeklyPlanData
  ): Promise<{ success: boolean; planId?: string; error?: string }> {
    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      const { data, error } = await supabase
        .from('saved_plans')
        .insert({
          user_id: user.id,
          name: planName,
          preferences: preferences,
          week_plan: planData.weekPlan,
          recipes: planData.recipes,
          batch_cooking: planData.batchCooking,
          budget_estimate: planData.budgetEstimate,
          shopping_list: planData.shoppingList,
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error saving plan:', error);
        return { success: false, error: error.message };
      }

      const planId = data.id;

      // Save each recipe individually, linked to the plan
      if (planData.recipes && planData.recipes.length > 0) {
        const recipeInserts = planData.recipes.map(recipe => ({
          user_id: user.id,
          plan_id: planId,
          recipe: recipe,
        }));

        const { error: recipeError } = await supabase
          .from('saved_recipes')
          .insert(recipeInserts);

        if (recipeError) {
          console.warn('Warning: Failed to save individual recipes for plan:', recipeError);
          // Don't fail the whole operation, just log the warning
        }
      }

      return { success: true, planId: planId };
    } catch (error) {
      console.error('Error saving plan:', error);
      return { success: false, error: 'Failed to save plan' };
    }
  }

  /**
   * Load all saved plans for the current user
   */
  static async loadSavedPlans(): Promise<{ success: boolean; plans?: SavedPlan[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('saved_plans')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error loading saved plans:', error);
        return { success: false, error: error.message };
      }

      return { success: true, plans: data || [] };
    } catch (error) {
      console.error('Error loading saved plans:', error);
      return { success: false, error: 'Failed to load saved plans' };
    }
  }

  /**
   * Load a specific plan by ID
   */
  static async loadPlan(planId: string): Promise<{ success: boolean; plan?: SavedPlan; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('saved_plans')
        .select('*')
        .eq('id', planId)
        .single();

      if (error) {
        console.error('Error loading plan:', error);
        return { success: false, error: error.message };
      }

      return { success: true, plan: data };
    } catch (error) {
      console.error('Error loading plan:', error);
      return { success: false, error: 'Failed to load plan' };
    }
  }

  /**
   * Delete a saved plan
   */
  static async deletePlan(planId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('saved_plans')
        .delete()
        .eq('id', planId);

      if (error) {
        console.error('Error deleting plan:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error deleting plan:', error);
      return { success: false, error: 'Failed to delete plan' };
    }
  }

  /**
   * Convert a SavedPlan to WeeklyPlanData format
   */
  static savedPlanToWeeklyPlan(savedPlan: SavedPlan): WeeklyPlanData {
    return {
      weekPlan: savedPlan.week_plan,
      recipes: savedPlan.recipes,
      batchCooking: savedPlan.batch_cooking,
      budgetEstimate: savedPlan.budget_estimate,
      shoppingList: savedPlan.shopping_list,
    };
  }
}
