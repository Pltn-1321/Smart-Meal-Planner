import React, { useState, useEffect, useMemo } from 'react';
import { WeeklyPlanData, UserPreferences, Recipe, ShoppingListCategory, DayPlan } from '../types';
import { generateWeeklyPlan, regenerateDayPlan } from '../services/openRouterService';
import { generateMarkdown, printDayPlan } from '../services/exportService';
import { RecipeStorageService, SavedRecipe } from '../services/recipeStorageService';
import { ListStorageService, SavedList } from '../services/listStorageService';
import { PlanStorageService } from '../services/planStorageService';
import { InputSection } from './InputSection';
import { MealCard } from './MealCard';
import { ShoppingListView } from './ShoppingListView';
import { BatchCookingView } from './BatchCookingView';
import { RecipeModal } from './RecipeModal';
import { SavedPlansModal } from './SavedPlansModal';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { SaveListModal } from './SaveListModal';
import { SearchFilterBar } from './SearchFilterBar';
import { useToast } from '../contexts/ToastContext';
import { FolderOpen, Copy, Check, RefreshCw, Save, UtensilsCrossed, ShoppingCart, Settings, Plus, Trash2, Calendar, Clock, Users } from 'lucide-react';

type TabType = 'new-plan' | 'my-recipes' | 'my-lists' | 'settings';

interface UserDashboardProps {
  onSignOut: () => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({ onSignOut }) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>('new-plan');

  // New Plan tab state
  const [planData, setPlanData] = useState<WeeklyPlanData | null>(null);
  const [loading, setLoading] = useState<{ isLoading: boolean; message: string }>({ isLoading: false, message: '' });
  const [regeneratingDay, setRegeneratingDay] = useState<string | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentPrefs, setCurrentPrefs] = useState<UserPreferences | null>(null);
  const [copied, setCopied] = useState(false);
  const [savedPlansModalOpen, setSavedPlansModalOpen] = useState(false);

  // Modal states
  const [showSaveListModal, setShowSaveListModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: 'recipe' | 'list';
    id: string;
    name: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // My Recipes tab state
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([]);
  const [loadingRecipes, setLoadingRecipes] = useState(true);
  const [recipeError, setRecipeError] = useState<string | null>(null);
  const [recipeSearchTerm, setRecipeSearchTerm] = useState('');
  const [recipeSortBy, setRecipeSortBy] = useState<'date' | 'name'>('date');

  // My Lists tab state
  const [savedLists, setSavedLists] = useState<SavedList[]>([]);
  const [loadingLists, setLoadingLists] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [listSearchTerm, setListSearchTerm] = useState('');
  const [listSortBy, setListSortBy] = useState<'date' | 'name'>('date');

  // Load saved recipes
  const loadSavedRecipes = async () => {
    try {
      setLoadingRecipes(true);
      setRecipeError(null);
      const result = await RecipeStorageService.loadSavedRecipes();
      if (result.success && result.recipes) {
        setSavedRecipes(result.recipes);
      } else {
        setRecipeError(result.error || 'Failed to load saved recipes');
      }
    } catch (err) {
      setRecipeError('Failed to load saved recipes');
    } finally {
      setLoadingRecipes(false);
    }
  };

  // Load saved lists
  const loadSavedLists = async () => {
    try {
      setLoadingLists(true);
      setListError(null);
      const result = await ListStorageService.loadSavedLists();
      if (result.success && result.lists) {
        setSavedLists(result.lists);
      } else {
        setListError(result.error || 'Failed to load saved lists');
      }
    } catch (err) {
      setListError('Failed to load saved lists');
    } finally {
      setLoadingLists(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'my-recipes') {
      loadSavedRecipes();
    } else if (activeTab === 'my-lists') {
      loadSavedLists();
    }
  }, [activeTab]);

  // New Plan tab functions
  const handleGenerate = async (prefs: UserPreferences) => {
    setLoading({ isLoading: true, message: `Analyzing cuisine in ${prefs.location}...` });
    setError(null);
    setCurrentPrefs(prefs);

    try {
      const data = await generateWeeklyPlan(prefs);
      setPlanData(data);
    } catch (err) {
      setError("An error occurred while generating the plan. Please check your API key or try again.");
    } finally {
      setLoading({ isLoading: false, message: '' });
    }
  };

  const handleRegenerateDay = async (day: string) => {
    if (!currentPrefs || !planData) return;
    setRegeneratingDay(day);
    setError(null);

    try {
      const { dayPlan, recipe } = await regenerateDayPlan(currentPrefs, day);

      const newWeekPlan = planData.weekPlan.map(d => d.day === day ? dayPlan : d);
      const newRecipes = planData.recipes.filter(r => r.id !== recipe.id);
      newRecipes.push(recipe);

      setPlanData({
        ...planData,
        weekPlan: newWeekPlan,
        recipes: newRecipes
      });
    } catch (err) {
      setError(`Failed to regenerate meal for ${day}.`);
    } finally {
      setRegeneratingDay(null);
    }
  };

  const handleRegenerateWeek = () => {
    if (currentPrefs) {
      handleGenerate(currentPrefs);
    }
  };

  const handleCopyMarkdown = () => {
    if (!planData) return;
    const md = generateMarkdown(planData, currentPrefs);
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrintDay = (day: DayPlan) => {
    if (!planData) return;
    const recipe = planData.recipes.find(r => r.id === day.dinnerRecipeId);
    printDayPlan(day, recipe);
  };

  const openRecipe = (id: string) => {
    if (!planData) return;
    const recipe = planData.recipes.find(r => r.id === id);
    if (recipe) setSelectedRecipe(recipe);
  };

  const openSavedRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
  };

  const handleLoadPlan = (planData: WeeklyPlanData, preferences: UserPreferences) => {
    setPlanData(planData);
    setCurrentPrefs(preferences);
    setError(null);
    setActiveTab('new-plan');
  };

  const handleSaveRecipe = async (recipe: Recipe) => {
    try {
      const result = await RecipeStorageService.saveRecipe(recipe);
      if (result.success) {
        await loadSavedRecipes();
        showToast('success', 'Recipe saved successfully!');
      } else {
        showToast('error', 'Failed to save recipe: ' + result.error);
      }
    } catch (err) {
      showToast('error', 'Failed to save recipe');
    }
  };

  const handleDeleteRecipe = async (recipeId: string, recipeName: string) => {
    setDeleteConfirm({ type: 'recipe', id: recipeId, name: recipeName });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    try {
      setIsDeleting(true);

      if (deleteConfirm.type === 'recipe') {
        const result = await RecipeStorageService.deleteRecipe(deleteConfirm.id);
        if (result.success) {
          await loadSavedRecipes();
          showToast('success', 'Recipe deleted successfully');
        } else {
          showToast('error', 'Failed to delete recipe: ' + result.error);
        }
      } else if (deleteConfirm.type === 'list') {
        const result = await ListStorageService.deleteList(deleteConfirm.id);
        if (result.success) {
          await loadSavedLists();
          showToast('success', 'List deleted successfully');
        } else {
          showToast('error', 'Failed to delete list: ' + result.error);
        }
      }

      setDeleteConfirm(null);
    } catch (err) {
      showToast('error', `Failed to delete ${deleteConfirm.type}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveList = async (name: string) => {
    if (!planData) return;

    try {
      const result = await ListStorageService.saveList(name, planData.shoppingList);
      if (result.success) {
        await loadSavedLists();
        showToast('success', 'Shopping list saved successfully!');
        setShowSaveListModal(false);
      } else {
        showToast('error', 'Failed to save list: ' + result.error);
      }
    } catch (err) {
      showToast('error', 'Failed to save shopping list');
    }
  };

  const handleDeleteList = async (listId: string, listName: string) => {
    setDeleteConfirm({ type: 'list', id: listId, name: listName });
  };

  const handleSignOut = async () => {
    try {
      await onSignOut();
      showToast('success', 'Signed out successfully');
    } catch (error) {
      showToast('error', 'Failed to sign out. Please try again.');
      console.error('Sign out error:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filtered and sorted recipes
  const filteredRecipes = useMemo(() => {
    return savedRecipes
      .filter((r) =>
        r.recipe.name.toLowerCase().includes(recipeSearchTerm.toLowerCase())
      )
      .sort((a, b) => {
        if (recipeSortBy === 'date') {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        return a.recipe.name.localeCompare(b.recipe.name);
      });
  }, [savedRecipes, recipeSearchTerm, recipeSortBy]);

  // Filtered and sorted lists
  const filteredLists = useMemo(() => {
    return savedLists
      .filter((l) =>
        l.name.toLowerCase().includes(listSearchTerm.toLowerCase())
      )
      .sort((a, b) => {
        if (listSortBy === 'date') {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        return a.name.localeCompare(b.name);
      });
  }, [savedLists, listSearchTerm, listSortBy]);

  const tabs = [
    { id: 'new-plan' as TabType, label: 'New Plan', icon: Plus },
    { id: 'my-recipes' as TabType, label: 'My Recipes', icon: UtensilsCrossed },
    { id: 'my-lists' as TabType, label: 'My Lists', icon: ShoppingCart },
    { id: 'settings' as TabType, label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen pb-12 bg-stone-50/50">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-2.5 rounded-xl shadow-md">
                  <UtensilsCrossed className="w-6 h-6 text-white" />
               </div>
               <div>
                  <h1 className="text-xl font-bold text-stone-900 leading-tight">Smart Meal Planner</h1>
                  <p className="text-xs text-stone-500 font-medium">
                    Personalized meal planning made simple
                  </p>
               </div>
            </div>

            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-700 px-3 py-2 rounded-lg transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-4">
          <nav className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-stone-600 hover:text-stone-900 hover:border-stone-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {activeTab === 'new-plan' && (
          <div className="space-y-8">
            {/* Input Section */}
            {!planData && !loading.isLoading && (
              <div className="text-center mb-10 mt-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <h2 className="text-4xl font-extrabold text-stone-800 mb-4 tracking-tight">Create a New Meal Plan</h2>
                <p className="text-lg text-stone-600 max-w-2xl mx-auto leading-relaxed">
                  Generate a chef-curated weekly meal plan optimized for your location, budget, and culinary tastes.
                </p>
              </div>
            )}

            {!planData && <InputSection onGenerate={handleGenerate} isLoading={loading.isLoading} />}

            {/* Loading State */}
            {loading.isLoading && (
              <div className="text-center py-20 animate-pulse">
                 <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4"></div>
                 <p className="text-lg text-emerald-800 font-medium">{loading.message}</p>
                 <p className="text-sm text-stone-500 mt-2">Designing recipes...</p>
              </div>
            )}

            {/* Error State */}
            {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-8 border border-red-200 text-center shadow-sm">
                    {error}
                </div>
            )}

            {/* Results */}
            {planData && !loading.isLoading && (
              <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">

                {/* Header of Plan */}
                <div className="flex flex-col md:flex-row justify-between items-center bg-gradient-to-r from-emerald-900 to-teal-900 text-white p-6 rounded-2xl shadow-xl border border-emerald-800/50 gap-4">
                    <div className="text-center md:text-left">
                        <h2 className="text-2xl font-bold">Your Custom Plan</h2>
                        <p className="text-emerald-200 text-sm mt-1 opacity-90">
                           {currentPrefs?.cuisine ? `${currentPrefs.cuisine} Style` : 'Optimized for local tastes'}
                        </p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-2">
                        <button
                            onClick={handleCopyMarkdown}
                            className="bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-all backdrop-blur-sm border border-white/10 flex items-center min-w-[140px] justify-center"
                        >
                            {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                            {copied ? 'Copied!' : 'Copy to MD'}
                        </button>
                        <button
                            onClick={() => setSavedPlansModalOpen(true)}
                            className="bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-all backdrop-blur-sm border border-white/10 flex items-center"
                        >
                            <FolderOpen className="w-4 h-4 mr-2" />
                            Saved Plans
                        </button>
                        <button
                            onClick={handleRegenerateWeek}
                            className="bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-all backdrop-blur-sm border border-white/10 flex items-center"
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Regenerate
                        </button>
                        <button
                            onClick={() => setSavedPlansModalOpen(true)}
                            className="bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-all backdrop-blur-sm border border-white/10 flex items-center"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            Save Plan
                        </button>
                        <button
                            onClick={() => setPlanData(null)}
                            className="bg-emerald-500 hover:bg-emerald-400 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-lg"
                        >
                            New Plan
                        </button>
                    </div>
                </div>

                {/* Weekly Grid */}
                <div>
                  <h3 className="text-xl font-bold text-stone-800 mb-6 flex items-center">
                    <span className="w-1.5 h-6 bg-emerald-500 rounded-full mr-3"></span>
                    Meal Schedule
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {planData.weekPlan.map((day) => (
                      <MealCard
                        key={day.day}
                        day={day}
                        onViewRecipe={openRecipe}
                        onRegenerate={handleRegenerateDay}
                        onPrint={handlePrintDay}
                        isLoading={regeneratingDay === day.day}
                      />
                    ))}
                  </div>
                </div>

                {/* Batch Cooking & Shopping List Grid */}
                <div className="grid lg:grid-cols-2 gap-8">
                   <BatchCookingView steps={planData.batchCooking} />
                   <div>
                     <ShoppingListView lists={planData.shoppingList} budget={planData.budgetEstimate} />
                     <div className="mt-4 flex justify-center">
                       <button
                         onClick={() => setShowSaveListModal(true)}
                         className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                       >
                         <Save className="w-4 h-4" />
                         Save List
                       </button>
                     </div>
                   </div>
                </div>

              </div>
            )}
          </div>
        )}

        {activeTab === 'my-recipes' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-stone-800">My Saved Recipes</h2>
            </div>

            {recipeError && (
              <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
                {recipeError}
              </div>
            )}

            {loadingRecipes ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-stone-600">Loading your recipes...</p>
              </div>
            ) : savedRecipes.length === 0 ? (
              <div className="text-center py-12">
                <UtensilsCrossed className="w-16 h-16 text-stone-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-stone-700 mb-2">No saved recipes yet</h3>
                <p className="text-stone-500">Recipes you save from meal plans will appear here.</p>
              </div>
            ) : (
              <>
                <SearchFilterBar
                  searchTerm={recipeSearchTerm}
                  onSearchChange={setRecipeSearchTerm}
                  sortBy={recipeSortBy}
                  onSortChange={setRecipeSortBy}
                  onClearFilters={() => {
                    setRecipeSearchTerm('');
                    setRecipeSortBy('date');
                  }}
                  placeholder="Search recipes..."
                  resultCount={filteredRecipes.length}
                />

                {filteredRecipes.length === 0 ? (
                  <div className="text-center py-12">
                    <UtensilsCrossed className="w-16 h-16 text-stone-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-stone-700 mb-2">No recipes found</h3>
                    <p className="text-stone-500">Try adjusting your search or filters.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredRecipes.map((savedRecipe) => (
                  <div key={savedRecipe.id} className="bg-white border border-stone-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-semibold text-stone-900 text-lg">{savedRecipe.recipe.name}</h3>
                      <button
                        onClick={() => handleDeleteRecipe(savedRecipe.id, savedRecipe.recipe.name)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-2 text-sm text-stone-600 mb-4">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{savedRecipe.recipe.prepTime}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-xs text-stone-500">
                        Saved {formatDate(savedRecipe.created_at)}
                      </div>
                      <button
                        onClick={() => openSavedRecipe(savedRecipe.recipe)}
                        className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                      >
                        View Recipe
                      </button>
                    </div>
                  </div>
                ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === 'my-lists' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-stone-800">My Saved Lists</h2>
            </div>

            {listError && (
              <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
                {listError}
              </div>
            )}

            {loadingLists ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-stone-600">Loading your lists...</p>
              </div>
            ) : savedLists.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="w-16 h-16 text-stone-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-stone-700 mb-2">No saved lists yet</h3>
                <p className="text-stone-500">Shopping lists you save will appear here.</p>
              </div>
            ) : (
              <>
                <SearchFilterBar
                  searchTerm={listSearchTerm}
                  onSearchChange={setListSearchTerm}
                  sortBy={listSortBy}
                  onSortChange={setListSortBy}
                  onClearFilters={() => {
                    setListSearchTerm('');
                    setListSortBy('date');
                  }}
                  placeholder="Search lists..."
                  resultCount={filteredLists.length}
                />

                {filteredLists.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="w-16 h-16 text-stone-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-stone-700 mb-2">No lists found</h3>
                    <p className="text-stone-500">Try adjusting your search or filters.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {filteredLists.map((savedList) => (
                  <div key={savedList.id} className="bg-white border border-stone-200 rounded-lg p-6">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="font-semibold text-stone-900 text-lg mb-2">{savedList.name}</h3>
                        <p className="text-sm text-stone-500">Saved {formatDate(savedList.created_at)}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteList(savedList.id, savedList.name)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      {savedList.list.map((category, index) => (
                        <div key={index} className="border border-stone-100 rounded p-4">
                          <h4 className="font-medium text-stone-800 mb-2">{category.location}</h4>
                          <ul className="space-y-1">
                            {category.items.slice(0, 5).map((item, itemIndex) => (
                              <li key={itemIndex} className="text-sm text-stone-600 flex justify-between">
                                <span>{item.item}</span>
                                <span className="text-stone-400">{item.quantity}</span>
                              </li>
                            ))}
                            {category.items.length > 5 && (
                              <li className="text-xs text-stone-400">+{category.items.length - 5} more items</li>
                            )}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-stone-800">Settings</h2>
            <div className="bg-white border border-stone-200 rounded-lg p-6">
              <p className="text-stone-600">Settings functionality coming soon...</p>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <RecipeModal
        recipe={selectedRecipe}
        onClose={() => setSelectedRecipe(null)}
        onSaveRecipe={activeTab === 'new-plan' ? handleSaveRecipe : undefined}
      />

      <SavedPlansModal
        isOpen={savedPlansModalOpen}
        onClose={() => setSavedPlansModalOpen(false)}
        onLoadPlan={handleLoadPlan}
        onSavePlan={(name) => console.log('Plan saved:', name)}
        currentPlanData={planData}
        currentPreferences={currentPrefs}
      />

      {planData && (
        <SaveListModal
          isOpen={showSaveListModal}
          onClose={() => setShowSaveListModal(false)}
          onSave={handleSaveList}
          shoppingList={planData.shoppingList}
        />
      )}

      <ConfirmDeleteModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={confirmDelete}
        title={`Delete ${deleteConfirm?.type === 'recipe' ? 'Recipe' : 'List'}?`}
        message={`Are you sure you want to delete this ${deleteConfirm?.type}? This action cannot be undone.`}
        itemName={deleteConfirm?.name}
        isDeleting={isDeleting}
      />
    </div>
  );
};
