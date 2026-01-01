import React, { useState } from 'react';
import { ShoppingCart, X } from 'lucide-react';
import { ShoppingListCategory } from '../types';

interface SaveListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, description?: string) => Promise<void>;
  shoppingList: ShoppingListCategory[];
}

export const SaveListModal: React.FC<SaveListModalProps> = ({
  isOpen,
  onClose,
  onSave,
  shoppingList,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const totalItems = shoppingList.reduce((acc, category) => acc + category.items.length, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Please enter a list name');
      return;
    }

    try {
      setSaving(true);
      setError('');
      await onSave(name.trim(), description.trim() || undefined);
      // Reset form
      setName('');
      setDescription('');
      onClose();
    } catch (err) {
      setError('Failed to save list. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (!saving) {
      setName('');
      setDescription('');
      setError('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full shadow-xl">
        {/* Header */}
        <div className="p-6 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-100 p-2 rounded-lg">
              <ShoppingCart className="w-5 h-5 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-stone-900">Save Shopping List</h2>
          </div>
          <button
            onClick={handleClose}
            disabled={saving}
            className="text-stone-400 hover:text-stone-600 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            {/* List Info */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-sm">
              <p className="text-emerald-800 font-medium">
                {totalItems} items across {shoppingList.length} {shoppingList.length === 1 ? 'location' : 'locations'}
              </p>
            </div>

            {/* Name Input */}
            <div>
              <label htmlFor="list-name" className="block text-sm font-medium text-stone-700 mb-2">
                List Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="list-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Weekly Groceries - Jan 2025"
                disabled={saving}
                className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-stone-100 disabled:cursor-not-allowed"
                autoFocus
              />
            </div>

            {/* Description Input */}
            <div>
              <label htmlFor="list-description" className="block text-sm font-medium text-stone-700 mb-2">
                Description (optional)
              </label>
              <textarea
                id="list-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add notes about this shopping list..."
                disabled={saving}
                rows={2}
                className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none disabled:bg-stone-100 disabled:cursor-not-allowed"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-stone-200 flex gap-3 justify-end">
            <button
              type="button"
              onClick={handleClose}
              disabled={saving}
              className="bg-stone-100 hover:bg-stone-200 text-stone-700 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !name.trim()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {saving ? 'Saving...' : 'Save List'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
