import React, { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';

export interface FilterCriteria {
  search: string;
  cuisines: string[];
  difficulties: string[];
  budgetMin?: number;
  budgetMax?: number;
  tags: string[];
  sortBy: 'date' | 'name' | 'budget' | 'difficulty';
  sortOrder: 'asc' | 'desc';
}

interface AdvancedSearchFilterProps {
  onFilterChange: (criteria: FilterCriteria) => void;
  availableCuisines?: string[];
  availableTags?: string[];
  showFilters?: boolean;
}

export function AdvancedSearchFilter({
  onFilterChange,
  availableCuisines = ['Italian', 'French', 'Asian', 'Mediterranean', 'Mexican', 'Mixed'],
  availableTags = ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'budget-friendly', 'quick', 'healthy', 'kid-friendly'],
  showFilters: initialShowFilters = false,
}: AdvancedSearchFilterProps) {
  const [showFilters, setShowFilters] = useState(initialShowFilters);
  const [criteria, setCriteria] = useState<FilterCriteria>({
    search: '',
    cuisines: [],
    difficulties: [],
    budgetMin: undefined,
    budgetMax: undefined,
    tags: [],
    sortBy: 'date',
    sortOrder: 'desc',
  });

  // Debounced filter change
  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange(criteria);
    }, 300);

    return () => clearTimeout(timer);
  }, [criteria, onFilterChange]);

  const updateCriteria = (updates: Partial<FilterCriteria>) => {
    setCriteria((prev) => ({ ...prev, ...updates }));
  };

  // Toggle multi-select value
  const toggleArrayValue = (key: keyof FilterCriteria, value: string) => {
    const currentArray = criteria[key] as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter((v) => v !== value)
      : [...currentArray, value];

    updateCriteria({ [key]: newArray });
  };

  // Clear all filters
  const clearFilters = () => {
    setCriteria({
      search: '',
      cuisines: [],
      difficulties: [],
      budgetMin: undefined,
      budgetMax: undefined,
      tags: [],
      sortBy: 'date',
      sortOrder: 'desc',
    });
  };

  // Count active filters
  const activeFilterCount =
    criteria.cuisines.length +
    criteria.difficulties.length +
    criteria.tags.length +
    (criteria.budgetMin !== undefined ? 1 : 0) +
    (criteria.budgetMax !== undefined ? 1 : 0);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
      {/* Search and Toggle Row */}
      <div className="flex items-center gap-3">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={criteria.search}
            onChange={(e) => updateCriteria({ search: e.target.value })}
            placeholder="Rechercher un programme..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Sort Select */}
        <select
          value={`${criteria.sortBy}-${criteria.sortOrder}`}
          onChange={(e) => {
            const [sortBy, sortOrder] = e.target.value.split('-') as [FilterCriteria['sortBy'], FilterCriteria['sortOrder']];
            updateCriteria({ sortBy, sortOrder });
          }}
          className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
        >
          <option value="date-desc">Plus récent</option>
          <option value="date-asc">Plus ancien</option>
          <option value="name-asc">Nom (A-Z)</option>
          <option value="name-desc">Nom (Z-A)</option>
          <option value="budget-asc">Budget croissant</option>
          <option value="budget-desc">Budget décroissant</option>
          <option value="difficulty-asc">Difficulté croissante</option>
          <option value="difficulty-desc">Difficulté décroissante</option>
        </select>

        {/* Toggle Filters Button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 rounded-md border transition-colors ${
            showFilters
              ? 'bg-blue-50 border-blue-300 text-blue-700'
              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <SlidersHorizontal className="w-5 h-5" />
          <span className="font-medium">Filtres</span>
          {activeFilterCount > 0 && (
            <span className="ml-1 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="pt-4 border-t border-gray-200 space-y-4">
          {/* Cuisine Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type de cuisine</label>
            <div className="flex flex-wrap gap-2">
              {availableCuisines.map((cuisine) => (
                <button
                  key={cuisine}
                  onClick={() => toggleArrayValue('cuisines', cuisine)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    criteria.cuisines.includes(cuisine)
                      ? 'bg-purple-100 text-purple-800 border border-purple-300'
                      : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                  }`}
                >
                  {cuisine}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Difficulté</label>
            <div className="flex flex-wrap gap-2">
              {['easy', 'medium', 'hard'].map((difficulty) => (
                <button
                  key={difficulty}
                  onClick={() => toggleArrayValue('difficulties', difficulty)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${
                    criteria.difficulties.includes(difficulty)
                      ? difficulty === 'easy'
                        ? 'bg-green-100 text-green-800 border border-green-300'
                        : difficulty === 'medium'
                        ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                        : 'bg-red-100 text-red-800 border border-red-300'
                      : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                  }`}
                >
                  {difficulty}
                </button>
              ))}
            </div>
          </div>

          {/* Budget Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Budget (€)</label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={criteria.budgetMin || ''}
                onChange={(e) =>
                  updateCriteria({ budgetMin: e.target.value ? parseFloat(e.target.value) : undefined })
                }
                placeholder="Min"
                className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="text-gray-500">—</span>
              <input
                type="number"
                value={criteria.budgetMax || ''}
                onChange={(e) =>
                  updateCriteria({ budgetMax: e.target.value ? parseFloat(e.target.value) : undefined })
                }
                placeholder="Max"
                className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Tags Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleArrayValue('tags', tag)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    criteria.tags.includes(tag)
                      ? 'bg-blue-100 text-blue-800 border border-blue-300'
                      : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Clear Filters Button */}
          {activeFilterCount > 0 && (
            <div className="pt-2">
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
              >
                <X className="w-4 h-4" />
                Réinitialiser les filtres
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
