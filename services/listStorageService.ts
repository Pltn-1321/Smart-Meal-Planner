import { supabase } from '../lib/supabase';
import { ShoppingListCategory } from '../types';

export interface SavedList {
  id: string;
  user_id: string;
  name: string;
  list: ShoppingListCategory[];
  created_at: string;
  updated_at: string;
}

export class ListStorageService {

  /**
   * Save a shopping list for the current user
   */
  static async saveList(name: string, list: ShoppingListCategory[]): Promise<{ success: boolean; listId?: string; error?: string }> {
    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      const { data, error } = await supabase
        .from('saved_lists')
        .insert({
          user_id: user.id,
          name: name,
          list: list,
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error saving list:', error);
        return { success: false, error: error.message };
      }

      return { success: true, listId: data.id };
    } catch (error) {
      console.error('Error saving list:', error);
      return { success: false, error: 'Failed to save list' };
    }
  }

  /**
   * Load all saved lists for the current user
   */
  static async loadSavedLists(): Promise<{ success: boolean; lists?: SavedList[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('saved_lists')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading saved lists:', error);
        return { success: false, error: error.message };
      }

      return { success: true, lists: data || [] };
    } catch (error) {
      console.error('Error loading saved lists:', error);
      return { success: false, error: 'Failed to load saved lists' };
    }
  }

  /**
   * Load a specific list by ID
   */
  static async loadList(listId: string): Promise<{ success: boolean; list?: SavedList; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('saved_lists')
        .select('*')
        .eq('id', listId)
        .single();

      if (error) {
        console.error('Error loading list:', error);
        return { success: false, error: error.message };
      }

      return { success: true, list: data };
    } catch (error) {
      console.error('Error loading list:', error);
      return { success: false, error: 'Failed to load list' };
    }
  }

  /**
   * Delete a saved list
   */
  static async deleteList(listId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('saved_lists')
        .delete()
        .eq('id', listId);

      if (error) {
        console.error('Error deleting list:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error deleting list:', error);
      return { success: false, error: 'Failed to delete list' };
    }
  }
}
