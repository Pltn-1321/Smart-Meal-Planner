import React, { useState, useEffect } from 'react';
import { ShoppingListCategory, ShoppingListItem, Ingredient } from '../types';
import { Plus, Trash2, Edit2, Check, X, DollarSign } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface EditableShoppingListProps {
  listId: string;
  categories: ShoppingListCategory[];
  onUpdate: (updatedCategories: ShoppingListCategory[]) => void;
  editable?: boolean;
}

export function EditableShoppingList({
  listId,
  categories: initialCategories,
  onUpdate,
  editable = true,
}: EditableShoppingListProps) {
  const [categories, setCategories] = useState<ShoppingListCategory[]>(initialCategories);
  const [editingItem, setEditingItem] = useState<{ categoryIndex: number; itemIndex: number } | null>(null);
  const [addingToCategory, setAddingToCategory] = useState<number | null>(null);
  const [newItem, setNewItem] = useState({ item: '', quantity: '', estimatedPrice: '' });

  // Sync with parent when initialCategories change
  useEffect(() => {
    setCategories(initialCategories);
  }, [initialCategories]);

  // Helper to normalize item (handle both Ingredient and ShoppingListItem)
  const normalizeItem = (item: Ingredient | ShoppingListItem): ShoppingListItem => {
    if ('item' in item) {
      // Already a ShoppingListItem or Ingredient with 'item' field
      return {
        id: item.id || `item-${Math.random().toString(36).substr(2, 9)}`,
        item: item.item || '',
        quantity: item.quantity || '',
        estimatedPrice: (item as ShoppingListItem).estimatedPrice,
        category: (item as ShoppingListItem).category,
        checked: (item as ShoppingListItem).checked || false,
      };
    } else if ('name' in item) {
      // Ingredient with 'name' field
      return {
        id: item.id || `item-${Math.random().toString(36).substr(2, 9)}`,
        item: item.name || '',
        quantity: item.quantity || '',
        estimatedPrice: undefined,
        category: undefined,
        checked: false,
      };
    }
    // Fallback
    return {
      id: `item-${Math.random().toString(36).substr(2, 9)}`,
      item: '',
      quantity: '',
      checked: false,
    };
  };

  // Toggle item checked
  const toggleItemChecked = (categoryIndex: number, itemIndex: number) => {
    const newCategories = [...categories];
    const item = normalizeItem(newCategories[categoryIndex].items[itemIndex]);
    item.checked = !item.checked;
    newCategories[categoryIndex].items[itemIndex] = item;

    setCategories(newCategories);
    onUpdate(newCategories);
  };

  // Delete item
  const deleteItem = (categoryIndex: number, itemIndex: number) => {
    const newCategories = [...categories];
    newCategories[categoryIndex].items.splice(itemIndex, 1);

    // Recalculate total
    if (newCategories[categoryIndex].totalEstimated !== undefined) {
      newCategories[categoryIndex].totalEstimated = newCategories[categoryIndex].items.reduce(
        (sum, item) => {
          const normalized = normalizeItem(item);
          return sum + (normalized.estimatedPrice || 0);
        },
        0
      );
    }

    setCategories(newCategories);
    onUpdate(newCategories);
    toast.success('Item supprimé');
  };

  // Start editing item
  const startEditItem = (categoryIndex: number, itemIndex: number) => {
    setEditingItem({ categoryIndex, itemIndex });
  };

  // Save edited item
  const saveEditedItem = (categoryIndex: number, itemIndex: number, updatedItem: Partial<ShoppingListItem>) => {
    const newCategories = [...categories];
    const currentItem = normalizeItem(newCategories[categoryIndex].items[itemIndex]);

    const mergedItem = {
      ...currentItem,
      ...updatedItem,
    };

    newCategories[categoryIndex].items[itemIndex] = mergedItem;

    // Recalculate total
    if (newCategories[categoryIndex].totalEstimated !== undefined) {
      newCategories[categoryIndex].totalEstimated = newCategories[categoryIndex].items.reduce(
        (sum, item) => {
          const normalized = normalizeItem(item);
          return sum + (normalized.estimatedPrice || 0);
        },
        0
      );
    }

    setCategories(newCategories);
    onUpdate(newCategories);
    setEditingItem(null);
    toast.success('Item mis à jour');
  };

  // Add new item
  const addNewItem = (categoryIndex: number) => {
    if (!newItem.item.trim()) {
      toast.error('Veuillez entrer un nom d\'item');
      return;
    }

    const newCategories = [...categories];
    const itemToAdd: ShoppingListItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      item: newItem.item.trim(),
      quantity: newItem.quantity.trim(),
      estimatedPrice: newItem.estimatedPrice ? parseFloat(newItem.estimatedPrice) : undefined,
      checked: false,
    };

    newCategories[categoryIndex].items.push(itemToAdd);

    // Recalculate total
    if (newCategories[categoryIndex].totalEstimated !== undefined || itemToAdd.estimatedPrice) {
      newCategories[categoryIndex].totalEstimated =
        (newCategories[categoryIndex].totalEstimated || 0) + (itemToAdd.estimatedPrice || 0);
    }

    setCategories(newCategories);
    onUpdate(newCategories);
    setNewItem({ item: '', quantity: '', estimatedPrice: '' });
    setAddingToCategory(null);
    toast.success('Item ajouté');
  };

  // Calculate grand total
  const grandTotal = categories.reduce((sum, category) => {
    return sum + (category.totalEstimated || 0);
  }, 0);

  return (
    <div className="space-y-6">
      {/* Grand Total */}
      {grandTotal > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-900">Total estimé</span>
            <span className="text-2xl font-bold text-blue-900 flex items-center gap-1">
              <DollarSign className="w-5 h-5" />
              {grandTotal.toFixed(2)}
            </span>
          </div>
        </div>
      )}

      {/* Categories */}
      {categories.map((category, categoryIndex) => {
        const categoryTotal = category.totalEstimated;

        return (
          <div key={categoryIndex} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Category Header */}
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">{category.location}</h3>
                {categoryTotal !== undefined && categoryTotal > 0 && (
                  <span className="text-sm font-medium text-gray-600 flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    {categoryTotal.toFixed(2)}
                  </span>
                )}
              </div>
            </div>

            {/* Items */}
            <div className="divide-y divide-gray-100">
              {category.items.map((item, itemIndex) => {
                const normalizedItem = normalizeItem(item);
                const isEditing =
                  editingItem?.categoryIndex === categoryIndex && editingItem?.itemIndex === itemIndex;

                if (isEditing) {
                  // Edit mode
                  return (
                    <div key={normalizedItem.id || itemIndex} className="px-4 py-3 bg-yellow-50">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          defaultValue={normalizedItem.item}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                          placeholder="Item"
                          id={`edit-item-${categoryIndex}-${itemIndex}`}
                        />
                        <input
                          type="text"
                          defaultValue={normalizedItem.quantity}
                          className="w-24 px-3 py-2 border border-gray-300 rounded-md text-sm"
                          placeholder="Quantité"
                          id={`edit-quantity-${categoryIndex}-${itemIndex}`}
                        />
                        <input
                          type="number"
                          step="0.01"
                          defaultValue={normalizedItem.estimatedPrice || ''}
                          className="w-24 px-3 py-2 border border-gray-300 rounded-md text-sm"
                          placeholder="Prix"
                          id={`edit-price-${categoryIndex}-${itemIndex}`}
                        />
                        <button
                          onClick={() => {
                            const itemInput = document.getElementById(
                              `edit-item-${categoryIndex}-${itemIndex}`
                            ) as HTMLInputElement;
                            const quantityInput = document.getElementById(
                              `edit-quantity-${categoryIndex}-${itemIndex}`
                            ) as HTMLInputElement;
                            const priceInput = document.getElementById(
                              `edit-price-${categoryIndex}-${itemIndex}`
                            ) as HTMLInputElement;

                            saveEditedItem(categoryIndex, itemIndex, {
                              item: itemInput.value,
                              quantity: quantityInput.value,
                              estimatedPrice: priceInput.value ? parseFloat(priceInput.value) : undefined,
                            });
                          }}
                          className="p-2 text-green-600 hover:bg-green-50 rounded"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingItem(null)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                }

                // Display mode
                return (
                  <div
                    key={normalizedItem.id || itemIndex}
                    className={`px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors ${
                      normalizedItem.checked ? 'opacity-50' : ''
                    }`}
                  >
                    {editable && (
                      <input
                        type="checkbox"
                        checked={normalizedItem.checked || false}
                        onChange={() => toggleItemChecked(categoryIndex, itemIndex)}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                    )}

                    <div className="flex-1 min-w-0">
                      <div
                        className={`font-medium text-gray-900 ${
                          normalizedItem.checked ? 'line-through' : ''
                        }`}
                      >
                        {normalizedItem.item}
                      </div>
                      <div className="text-sm text-gray-500">{normalizedItem.quantity}</div>
                    </div>

                    {normalizedItem.estimatedPrice !== undefined && (
                      <div className="text-sm font-medium text-gray-700 flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        {normalizedItem.estimatedPrice.toFixed(2)}
                      </div>
                    )}

                    {editable && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => startEditItem(categoryIndex, itemIndex)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Supprimer cet item ?')) {
                              deleteItem(categoryIndex, itemIndex);
                            }
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Add new item form */}
              {editable && addingToCategory === categoryIndex && (
                <div className="px-4 py-3 bg-blue-50 border-t border-blue-100">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newItem.item}
                      onChange={(e) => setNewItem({ ...newItem, item: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                      placeholder="Nom de l'item"
                      onKeyDown={(e) => e.key === 'Enter' && addNewItem(categoryIndex)}
                    />
                    <input
                      type="text"
                      value={newItem.quantity}
                      onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                      className="w-24 px-3 py-2 border border-gray-300 rounded-md text-sm"
                      placeholder="Qté"
                      onKeyDown={(e) => e.key === 'Enter' && addNewItem(categoryIndex)}
                    />
                    <input
                      type="number"
                      step="0.01"
                      value={newItem.estimatedPrice}
                      onChange={(e) => setNewItem({ ...newItem, estimatedPrice: e.target.value })}
                      className="w-24 px-3 py-2 border border-gray-300 rounded-md text-sm"
                      placeholder="Prix"
                      onKeyDown={(e) => e.key === 'Enter' && addNewItem(categoryIndex)}
                    />
                    <button
                      onClick={() => addNewItem(categoryIndex)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setAddingToCategory(null);
                        setNewItem({ item: '', quantity: '', estimatedPrice: '' });
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Add button */}
              {editable && addingToCategory !== categoryIndex && (
                <div className="px-4 py-2">
                  <button
                    onClick={() => setAddingToCategory(categoryIndex)}
                    className="w-full flex items-center justify-center gap-2 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Ajouter un item
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {categories.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Aucun item dans la liste de courses</p>
        </div>
      )}
    </div>
  );
}
