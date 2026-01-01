import React from 'react';
import { ShoppingListCategory } from '../types';
import { ShoppingBag, MapPin, Printer } from 'lucide-react';
import { printShoppingList } from '../services/exportService';

interface ShoppingListViewProps {
  lists: ShoppingListCategory[];
  budget: string;
}

export const ShoppingListView: React.FC<ShoppingListViewProps> = ({ lists, budget }) => {
  
  const handlePrint = () => {
    printShoppingList(lists, budget);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-stone-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-stone-800 flex items-center">
          <ShoppingBag className="w-6 h-6 mr-2 text-emerald-600" />
          Shopping List
        </h2>
        <div className="flex items-center gap-3">
            <span className="bg-emerald-100 text-emerald-800 text-sm font-bold px-3 py-1 rounded-full">
            Est. {budget}
            </span>
            <button 
                onClick={handlePrint}
                className="p-2 text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-all"
                title="Print Shopping List"
            >
                <Printer className="w-5 h-5" />
            </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {lists.map((category, idx) => (
          <div key={idx} className="bg-stone-50 p-4 rounded-lg">
            <h3 className="font-bold text-stone-700 mb-3 flex items-center border-b border-stone-200 pb-2">
              <MapPin className="w-4 h-4 mr-2 text-stone-500" />
              {category.location}
            </h3>
            <ul className="space-y-2">
              {category.items.map((item, i) => (
                <li key={i} className="flex justify-between text-sm items-center group">
                  <div className="flex items-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-stone-300 mr-2 group-hover:bg-emerald-400 transition-colors"></div>
                    <span className="text-stone-700">{item.item}</span>
                  </div>
                  <span className="font-semibold text-stone-500 text-xs bg-white px-2 py-0.5 rounded border border-stone-200">
                    {item.quantity}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};