import React from 'react';
import { ProgramMetadata } from '../types';
import { Calendar, Users, DollarSign, ChefHat, ShoppingCart, CheckCircle, Eye, Copy, Trash2 } from 'lucide-react';

interface ProgramCardProps {
  programId: string;
  metadata: ProgramMetadata;
  recipeCount: number;
  hasShoppingList: boolean;
  onView: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
}

export function ProgramCard({
  programId,
  metadata,
  recipeCount,
  hasShoppingList,
  onView,
  onDuplicate,
  onDelete,
}: ProgramCardProps) {
  const {
    name,
    suggestedName,
    cuisine,
    difficulty,
    totalBudget,
    currency,
    peopleCount,
    weekStartDate,
    tags,
  } = metadata;

  const displayName = name || suggestedName || 'Programme de repas';

  // Format date
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Difficulty badge color
  const getDifficultyColor = (diff?: string) => {
    switch (diff) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all duration-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate" title={displayName}>
              {displayName}
            </h3>

            {/* Metadata row */}
            <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-gray-600">
              {weekStartDate && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(weekStartDate)}
                </span>
              )}
              {peopleCount && (
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {peopleCount} pers.
                </span>
              )}
              {cuisine && (
                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full capitalize">
                  {cuisine}
                </span>
              )}
              {difficulty && (
                <span
                  className={`px-2 py-0.5 rounded-full capitalize ${getDifficultyColor(difficulty)}`}
                >
                  {difficulty}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        {/* Budget */}
        {totalBudget !== undefined && (
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <span className="text-sm font-medium text-blue-900">Budget</span>
            <span className="text-lg font-bold text-blue-900 flex items-center gap-1">
              {totalBudget}
              <span className="text-sm font-normal">{currency || '€'}</span>
            </span>
          </div>
        )}

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 4).map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-700"
              >
                {tag}
              </span>
            ))}
            {tags.length > 4 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-500">
                +{tags.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-gray-600 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-1">
            <CheckCircle className={`w-4 h-4 ${hasShoppingList ? 'text-green-500' : 'text-gray-300'}`} />
            <span className={hasShoppingList ? 'text-green-700 font-medium' : ''}>
              Liste de courses
            </span>
          </div>
          <div className="flex items-center gap-1">
            <ChefHat className="w-4 h-4" />
            <span>{recipeCount} recettes</span>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center gap-2">
        <button
          onClick={onView}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium text-sm"
        >
          <Eye className="w-4 h-4" />
          Voir
        </button>

        {onDuplicate && (
          <button
            onClick={onDuplicate}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors text-sm"
            title="Dupliquer"
          >
            <Copy className="w-4 h-4" />
          </button>
        )}

        {onDelete && (
          <button
            onClick={onDelete}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors text-sm"
            title="Supprimer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
