import React, { useState } from 'react';
import { UserPreferences } from '../types';
import { MapPin, Wallet, Ban, ChefHat, Flame, Microwave, Zap, Settings2, Check, Globe, Users } from 'lucide-react';

interface InputSectionProps {
  onGenerate: (prefs: UserPreferences) => void;
  isLoading: boolean;
}

const DIET_SUGGESTIONS = [
  "Vegetarian", "Vegan", "Pescetarian", "Keto", "Gluten Free", 
  "No Pork", "No Red Meat", "No Dairy", "No Nuts", 
  "No Cilantro", "No Spicy Food", "No Seafood"
];

const CUISINE_SUGGESTIONS = [
  "Local / Traditional", "Italian", "French", "Mediterranean", 
  "Asian Fusion", "Mexican", "Indian", "Healthy / Light", "Comfort Food"
];

export const InputSection: React.FC<InputSectionProps> = ({ onGenerate, isLoading }) => {
  const [location, setLocation] = useState('Tbilisi, Georgia');
  const [peopleCount, setPeopleCount] = useState(2);
  const [budget, setBudget] = useState('225');
  const [currency, setCurrency] = useState('GEL');
  
  // Split restrictions into selected tags and custom text
  const [selectedRestrictions, setSelectedRestrictions] = useState<string[]>([]);
  const [customRestriction, setCustomRestriction] = useState('');
  
  // Cuisine
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [customCuisine, setCustomCuisine] = useState('');

  const [context, setContext] = useState('');
  
  const [equipment, setEquipment] = useState({
    stovetop: true,
    microwave: true,
    blender: true,
    oven: false
  });

  const toggleEquipment = (key: keyof typeof equipment) => {
    setEquipment(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleRestriction = (tag: string) => {
    setSelectedRestrictions(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const toggleCuisine = (tag: string) => {
    setSelectedCuisines(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = () => {
    const activeEquipment = Object.entries(equipment)
      .filter(([_, isActive]) => isActive)
      .map(([key]) => key.charAt(0).toUpperCase() + key.slice(1));

    if (activeEquipment.length === 0) activeEquipment.push("No cooking equipment");

    const finalRestrictions = [
      ...selectedRestrictions, 
      customRestriction.trim()
    ].filter(Boolean).join(', ');

    const finalCuisine = [
      ...selectedCuisines,
      customCuisine.trim()
    ].filter(Boolean).join(', ');

    onGenerate({
      location,
      budget,
      currency,
      peopleCount,
      restrictions: finalRestrictions,
      cuisine: finalCuisine,
      context,
      equipment: activeEquipment
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-stone-100 overflow-hidden mb-8 transition-all duration-300">
      <div className="bg-emerald-900 p-4 border-b border-emerald-800">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Settings2 className="w-5 h-5" />
          Plan Preferences
        </h2>
      </div>

      <div className="p-6 grid gap-8">
        
        {/* Top Row: Location, People, Budget */}
        <div className="grid md:grid-cols-12 gap-6">
          {/* Location */}
          <div className="md:col-span-5 space-y-2">
            <label className="text-sm font-semibold text-stone-700 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" /> Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
              placeholder="City, Country"
            />
          </div>

           {/* People Count */}
           <div className="md:col-span-3 space-y-2">
            <label className="text-sm font-semibold text-stone-700 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600" /> People
            </label>
            <input
              type="number"
              min="1"
              max="20"
              value={peopleCount}
              onChange={(e) => setPeopleCount(parseInt(e.target.value) || 1)}
              className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
              placeholder="2"
            />
          </div>

          {/* Budget */}
          <div className="md:col-span-4 space-y-2">
            <label className="text-sm font-semibold text-stone-700 flex items-center gap-2">
              <Wallet className="w-4 h-4 text-emerald-600" /> Weekly Budget
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-2/3 p-3 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
                placeholder="Amount"
              />
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-1/3 p-3 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
              >
                <option value="GEL">GEL</option>
                <option value="USD">$</option>
                <option value="EUR">€</option>
                <option value="GBP">£</option>
              </select>
            </div>
          </div>
        </div>

        {/* Equipment */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-stone-700">Kitchen Equipment Available</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <EquipmentToggle 
              label="Stovetop" 
              icon={<Flame className="w-4 h-4" />} 
              active={equipment.stovetop} 
              onClick={() => toggleEquipment('stovetop')} 
            />
            <EquipmentToggle 
              label="Microwave" 
              icon={<Microwave className="w-4 h-4" />} 
              active={equipment.microwave} 
              onClick={() => toggleEquipment('microwave')} 
            />
            <EquipmentToggle 
              label="Oven" 
              icon={<ChefHat className="w-4 h-4" />} 
              active={equipment.oven} 
              onClick={() => toggleEquipment('oven')} 
            />
            <EquipmentToggle 
              label="Blender" 
              icon={<Zap className="w-4 h-4" />} 
              active={equipment.blender} 
              onClick={() => toggleEquipment('blender')} 
            />
          </div>
        </div>

        {/* Cuisine Preferences (NEW) */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-stone-700 flex items-center gap-2">
            <Globe className="w-4 h-4 text-indigo-500" /> Cuisine Style
          </label>
          
          <div className="flex flex-wrap gap-2 mb-3">
            {CUISINE_SUGGESTIONS.map((tag) => {
              const isActive = selectedCuisines.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => toggleCuisine(tag)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all duration-200 flex items-center gap-1.5 ${
                    isActive 
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-medium shadow-sm' 
                      : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50 hover:border-stone-300'
                  }`}
                >
                  {tag}
                  {isActive ? <Check className="w-3 h-3" /> : null}
                </button>
              );
            })}
          </div>

          <input
            type="text"
            value={customCuisine}
            onChange={(e) => setCustomCuisine(e.target.value)}
            className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 focus:outline-none transition-all placeholder:text-stone-400"
            placeholder="Specific cravings? (e.g. Thai, Georgian Fusion...)"
          />
        </div>

        {/* Restrictions */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-stone-700 flex items-center gap-2">
            <Ban className="w-4 h-4 text-rose-500" /> Dietary Restrictions & Dislikes
          </label>
          
          <div className="flex flex-wrap gap-2 mb-3">
            {DIET_SUGGESTIONS.map((tag) => {
              const isActive = selectedRestrictions.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => toggleRestriction(tag)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all duration-200 flex items-center gap-1.5 ${
                    isActive 
                      ? 'bg-rose-50 border-rose-300 text-rose-700 font-medium shadow-sm' 
                      : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50 hover:border-stone-300'
                  }`}
                >
                  {tag}
                  {isActive ? <Check className="w-3 h-3" /> : null}
                </button>
              );
            })}
          </div>

          <input
            type="text"
            value={customRestriction}
            onChange={(e) => setCustomRestriction(e.target.value)}
            className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-rose-200 focus:border-rose-400 focus:outline-none transition-all placeholder:text-stone-400"
            placeholder="Allergies or dislikes? (e.g. No buckwheat...)"
          />
        </div>

        {/* Context */}
        <div className="space-y-2">
           <label className="text-sm font-semibold text-stone-700">
             Leftovers / Context
           </label>
           <textarea
            className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none min-h-[80px]"
            placeholder="e.g. We have rice left. Last week we ate too much chicken."
            value={context}
            onChange={(e) => setContext(e.target.value)}
          />
        </div>

        {/* Action Button */}
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg transform transition-all active:scale-[0.99] ${
            isLoading
              ? 'bg-stone-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 hover:shadow-xl'
          }`}
        >
          {isLoading ? 'Designing your menu...' : 'Generate Meal Plan'}
        </button>
      </div>
    </div>
  );
};

const EquipmentToggle = ({ label, icon, active, onClick }: { label: string, icon: React.ReactNode, active: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-all duration-200 ${
      active 
        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-sm ring-1 ring-emerald-500/20' 
        : 'bg-white border-stone-200 text-stone-400 hover:bg-stone-50'
    }`}
  >
    {icon}
    <span className="text-sm font-medium">{label}</span>
  </button>
);