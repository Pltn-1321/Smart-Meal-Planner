import React from 'react';
import { Recipe } from '../types';
import { X, Clock, Flame, Printer } from 'lucide-react';
import { printRecipe } from '../services/exportService';

interface RecipeModalProps {
  recipe: Recipe | null;
  onClose: () => void;
}

export const RecipeModal: React.FC<RecipeModalProps> = ({ recipe, onClose }) => {
  if (!recipe) return null;

  const handlePrint = () => {
    printRecipe(recipe);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="sticky top-0 bg-white border-b border-stone-100 p-4 flex justify-between items-center z-10">
          <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-stone-900 line-clamp-1">{recipe.name}</h2>
              <button 
                onClick={handlePrint}
                className="p-1.5 text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                title="Print Recipe PDF"
              >
                  <Printer className="w-5 h-5" />
              </button>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-stone-500" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6 text-sm text-stone-600">
             <span className="flex items-center bg-stone-100 px-3 py-1 rounded-full">
               <Clock className="w-4 h-4 mr-2" /> {recipe.prepTime}
             </span>
             <span className="flex items-center bg-orange-50 text-orange-700 px-3 py-1 rounded-full border border-orange-100">
               <Flame className="w-4 h-4 mr-2" /> No oven
             </span>
          </div>

          <div className="mb-6">
            <h3 className="font-bold text-stone-800 mb-3 uppercase text-sm tracking-wide">Ingredients</h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {recipe.ingredients.map((ing, idx) => (
                <li key={idx} className="flex items-center text-stone-700">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2"></span>
                  {ing}
                </li>
              ))}
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="font-bold text-stone-800 mb-3 uppercase text-sm tracking-wide">Instructions</h3>
            <ol className="space-y-3">
              {recipe.instructions.map((step, idx) => (
                <li key={idx} className="flex gap-3 text-stone-700">
                  <span className="font-bold text-emerald-600 min-w-[20px]">{idx + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {recipe.tips && (
             <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-blue-800">
               <strong>Chef's Tip:</strong> {recipe.tips}
             </div>
          )}
        </div>
      </div>
    </div>
  );
};