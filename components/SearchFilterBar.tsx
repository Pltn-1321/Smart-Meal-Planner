import React, { useState, useEffect } from 'react';
import { Search, X, ArrowUpDown } from 'lucide-react';

interface SearchFilterBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  sortBy: 'date' | 'name';
  onSortChange: (sort: 'date' | 'name') => void;
  onClearFilters: () => void;
  placeholder?: string;
  resultCount?: number;
}

export const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
  searchTerm,
  onSearchChange,
  sortBy,
  onSortChange,
  onClearFilters,
  placeholder = 'Search...',
  resultCount,
}) => {
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(localSearchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearchTerm, onSearchChange]);

  // Sync with external searchTerm changes
  useEffect(() => {
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);

  const hasActiveFilters = searchTerm || sortBy !== 'date';

  return (
    <div className="bg-white border border-stone-200 rounded-lg p-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={localSearchTerm}
            onChange={(e) => setLocalSearchTerm(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-10 pr-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>

        {/* Sort Dropdown */}
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as 'date' | 'name')}
            className="appearance-none pl-10 pr-8 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white cursor-pointer"
          >
            <option value="date">Newest First</option>
            <option value="name">Name (A-Z)</option>
          </select>
          <ArrowUpDown className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <svg className="w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        )}
      </div>

      {/* Result Count */}
      {resultCount !== undefined && (
        <div className="mt-3 text-sm text-stone-600">
          {resultCount} {resultCount === 1 ? 'result' : 'results'} found
        </div>
      )}
    </div>
  );
};
