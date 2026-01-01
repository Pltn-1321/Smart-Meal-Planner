import React, { useState } from 'react';
import { WeeklyPlanData, Recipe, LoadingState, UserPreferences, DayPlan } from './types';
import { generateWeeklyPlan, regenerateDayPlan } from './services/geminiService';
import { generateMarkdown, printDayPlan } from './services/exportService';
import { InputSection } from './components/InputSection';
import { MealCard } from './components/MealCard';
import { ShoppingListView } from './components/ShoppingListView';
import { BatchCookingView } from './components/BatchCookingView';
import { RecipeModal } from './components/RecipeModal';
import { UtensilsCrossed, RefreshCw, Copy, Check } from 'lucide-react';

const App: React.FC = () => {
  const [planData, setPlanData] = useState<WeeklyPlanData | null>(null);
  const [loading, setLoading] = useState<LoadingState>({ isLoading: false, message: '' });
  const [regeneratingDay, setRegeneratingDay] = useState<string | null>(null);
  
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentPrefs, setCurrentPrefs] = useState<UserPreferences | null>(null);
  
  const [copied, setCopied] = useState(false);

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

  return (
    <div className="min-h-screen pb-12 bg-stone-50/50">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-2.5 rounded-xl shadow-md">
                <UtensilsCrossed className="w-6 h-6 text-white" />
             </div>
             <div>
                <h1 className="text-xl font-bold text-stone-900 leading-tight">Smart Meal Planner</h1>
                <p className="text-xs text-stone-500 font-medium">
                  {currentPrefs ? `${currentPrefs.location} • ${currentPrefs.cuisine || 'Mixed Cuisine'}` : "Personalized for you"}
                </p>
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {!planData && !loading.isLoading && (
            <div className="text-center mb-10 mt-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <h2 className="text-4xl font-extrabold text-stone-800 mb-4 tracking-tight">Eat better, spend smarter.</h2>
                <p className="text-lg text-stone-600 max-w-2xl mx-auto leading-relaxed">
                    Generate a chef-curated weekly meal plan optimized for your specific location, budget, and culinary tastes.
                </p>
            </div>
        )}

        {/* Input Section */}
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
                        onClick={handleRegenerateWeek}
                        className="bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-all backdrop-blur-sm border border-white/10 flex items-center"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Regenerate
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
               <ShoppingListView lists={planData.shoppingList} budget={planData.budgetEstimate} />
            </div>

          </div>
        )}
      </main>

      {/* Recipe Modal */}
      <RecipeModal 
        recipe={selectedRecipe} 
        onClose={() => setSelectedRecipe(null)} 
      />
    </div>
  );
};

export default App;