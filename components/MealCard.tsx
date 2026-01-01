import React from 'react';
import { DayPlan } from '../types';
import { ChefHat, Sun, Moon, Coffee, RefreshCw, Printer } from 'lucide-react';

interface MealCardProps {
  day: DayPlan;
  onViewRecipe: (id: string) => void;
  onRegenerate: (day: string) => void;
  onPrint: (day: DayPlan) => void;
  isLoading?: boolean;
}

export const MealCard: React.FC<MealCardProps> = ({ day, onViewRecipe, onRegenerate, onPrint, isLoading }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden hover:shadow-md transition-shadow relative group">
      
      {/* Header */}
      <div className="bg-emerald-50 p-3 border-b border-emerald-100 flex justify-between items-center">
        <h3 className="font-bold text-emerald-900">{day.day}</h3>
        
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
                onClick={() => onPrint(day)}
                disabled={isLoading}
                className="p-1.5 rounded-full hover:bg-emerald-200 text-emerald-700 transition-all"
                title="Print Day Plan"
            >
                <Printer className="w-4 h-4" />
            </button>
            <button 
                onClick={() => onRegenerate(day.day)}
                disabled={isLoading}
                className={`p-1.5 rounded-full hover:bg-emerald-200 text-emerald-700 transition-all ${isLoading ? 'animate-spin opacity-100' : ''}`}
                title="Regenerate this day"
            >
                <RefreshCw className="w-4 h-4" />
            </button>
        </div>
      </div>

      <div className={`p-4 space-y-4 ${isLoading ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
        {/* Breakfast */}
        <div className="flex items-start space-x-3">
          <Coffee className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Breakfast</span>
            <p className="text-sm text-stone-800 line-clamp-2">{day.breakfast}</p>
          </div>
        </div>

        {/* Lunch */}
        <div className="flex items-start space-x-3">
          <Sun className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
          <div>
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Lunch (Snack)</span>
            <p className="text-sm text-stone-800 line-clamp-2">{day.lunch}</p>
          </div>
        </div>

        {/* Dinner */}
        <div className="flex items-start space-x-3 bg-stone-50 -mx-4 px-4 py-2 border-t border-stone-100">
          <Moon className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Dinner</span>
            <p className="text-sm font-medium text-stone-900 mb-2 line-clamp-2">{day.dinner}</p>
            <button
              onClick={() => onViewRecipe(day.dinnerRecipeId)}
              className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded hover:bg-emerald-200 transition-colors flex items-center w-fit"
            >
              <ChefHat className="w-3 h-3 mr-1" />
              View Recipe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};