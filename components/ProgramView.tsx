import React, { useState } from 'react';
import { WeeklyPlanData, ProgramMetadata } from '../types';
import { MealCard } from './MealCard';
import { RecipeModal } from './RecipeModal';
import { EditableShoppingList } from './EditableShoppingList';
import { BatchCookingView } from './BatchCookingView';
import { Calendar, ChefHat, ShoppingCart, Clock, DollarSign, Users, Tag } from 'lucide-react';

interface ProgramViewProps {
  programId: string;
  programData: WeeklyPlanData;
  onUpdate?: (updatedData: WeeklyPlanData) => void;
  onClose?: () => void;
}

type TabType = 'overview' | 'recipes' | 'shopping' | 'batch';

export function ProgramView({ programId, programData, onUpdate, onClose }: ProgramViewProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);

  const metadata = programData.metadata || {};
  const selectedRecipe = selectedRecipeId
    ? programData.recipes.find(r => r.id === selectedRecipeId)
    : null;

  // Render tags
  const renderTags = () => {
    if (!metadata.tags || metadata.tags.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-2 mt-3">
        {metadata.tags.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
          >
            {tag}
          </span>
        ))}
      </div>
    );
  };

  // Render overview tab
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
            <DollarSign className="w-4 h-4" />
            <span>Budget</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {metadata.totalBudget || programData.budgetEstimate}
          </div>
          <div className="text-xs text-gray-500">{metadata.currency || ''}</div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
            <Users className="w-4 h-4" />
            <span>Personnes</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {metadata.peopleCount || 0}
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
            <ChefHat className="w-4 h-4" />
            <span>Difficulté</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 capitalize">
            {metadata.difficulty || 'N/A'}
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
            <Calendar className="w-4 h-4" />
            <span>Recettes</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {programData.recipes.length}
          </div>
        </div>
      </div>

      {/* Week Plan Grid */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Planning de la semaine
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {programData.weekPlan.map((dayPlan) => (
            <MealCard
              key={dayPlan.day}
              dayPlan={dayPlan}
              onViewRecipe={() => setSelectedRecipeId(dayPlan.dinnerRecipeId)}
              onRegenerate={undefined}
            />
          ))}
        </div>
      </div>

      {/* Batch Cooking */}
      {programData.batchCooking && programData.batchCooking.length > 0 && (
        <BatchCookingView steps={programData.batchCooking} />
      )}
    </div>
  );

  // Render recipes tab
  const renderRecipes = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
        <ChefHat className="w-5 h-5" />
        Toutes les recettes ({programData.recipes.length})
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {programData.recipes.map((recipe) => {
          // Find which day this recipe is for
          const dayPlan = programData.weekPlan.find(d => d.dinnerRecipeId === recipe.id);
          const day = dayPlan?.day || '';

          return (
            <div
              key={recipe.id}
              className="bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer"
              onClick={() => setSelectedRecipeId(recipe.id)}
            >
              {/* Day badge */}
              {day && (
                <div className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded mb-2">
                  {day}
                </div>
              )}

              <h4 className="font-semibold text-gray-900 mb-2">{recipe.name}</h4>

              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Prep: {recipe.prepTime}</span>
                  {recipe.cookTime && <span>• Cook: {recipe.cookTime}</span>}
                </div>

                {recipe.difficulty && (
                  <div className="flex items-center gap-2">
                    <ChefHat className="w-4 h-4" />
                    <span className="capitalize">{recipe.difficulty}</span>
                  </div>
                )}

                {recipe.servings && (
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>{recipe.servings} personnes</span>
                  </div>
                )}
              </div>

              {/* Recipe tags */}
              {recipe.tags && recipe.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {recipe.tags.slice(0, 3).map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Nutrition preview */}
              {recipe.nutrition && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{recipe.nutrition.calories || 0} cal</span>
                    <span>{recipe.nutrition.protein || 0}g protéines</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  // Render shopping list tab
  const renderShopping = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <ShoppingCart className="w-5 h-5" />
          Liste de courses
        </h3>
      </div>

      <EditableShoppingList
        listId={programData.shoppingListId || programId}
        categories={programData.shoppingList}
        onUpdate={(updatedList) => {
          if (onUpdate) {
            onUpdate({
              ...programData,
              shoppingList: updatedList,
            });
          }
        }}
      />
    </div>
  );

  // Render batch cooking tab
  const renderBatchCooking = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
        <Clock className="w-5 h-5" />
        Préparation en avance (Batch Cooking)
      </h3>

      <BatchCookingView steps={programData.batchCooking} />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">
                {metadata.name || metadata.suggestedName || 'Programme de repas'}
              </h1>

              <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600">
                {metadata.cuisine && (
                  <span className="flex items-center gap-1">
                    <Tag className="w-4 h-4" />
                    {metadata.cuisine}
                  </span>
                )}
                {metadata.difficulty && (
                  <span className="flex items-center gap-1 capitalize">
                    <ChefHat className="w-4 h-4" />
                    {metadata.difficulty}
                  </span>
                )}
                {metadata.peopleCount && (
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {metadata.peopleCount} personnes
                  </span>
                )}
                {metadata.weekStartDate && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(metadata.weekStartDate).toLocaleDateString('fr-FR')}
                  </span>
                )}
              </div>

              {renderTags()}
            </div>

            {onClose && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 p-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mt-6 border-b border-gray-200">
            {[
              { id: 'overview', label: 'Vue d\'ensemble', icon: Calendar },
              { id: 'recipes', label: 'Recettes', icon: ChefHat },
              { id: 'shopping', label: 'Liste de courses', icon: ShoppingCart },
              { id: 'batch', label: 'Batch Cooking', icon: Clock },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as TabType)}
                className={`flex items-center gap-2 px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'recipes' && renderRecipes()}
        {activeTab === 'shopping' && renderShopping()}
        {activeTab === 'batch' && renderBatchCooking()}
      </div>

      {/* Recipe Modal */}
      {selectedRecipe && (
        <RecipeModal
          recipe={selectedRecipe}
          onClose={() => setSelectedRecipeId(null)}
          showSaveButton={false}
        />
      )}
    </div>
  );
}
