import React from 'react';
import {
  Calendar,
  ChefHat,
  ShoppingCart,
  Clock,
  Utensils,
  RefreshCw,
  MapPin,
  DollarSign
} from 'lucide-react';

export function MockupPreview() {
  return (
    <div className="bg-stone-50 rounded-3xl p-8 border border-stone-200 shadow-xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white p-6 rounded-2xl mb-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold">Your Weekly Plan</h3>
            <div className="flex items-center gap-4 mt-2 text-emerald-200 text-sm">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>Tbilisi, Georgia</span>
              </div>
              <div className="flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                <span>200-300₾ budget</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-all backdrop-blur-sm border border-white/10 flex items-center">
              <RefreshCw className="w-4 h-4 mr-2" />
              Regenerate
            </button>
            <button className="bg-emerald-500 hover:bg-emerald-400 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-lg">
              New Plan
            </button>
          </div>
        </div>
      </div>

      {/* Weekly Meal Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
        {[
          { day: 'Monday', meal: 'Khachapuri with Salad', recipe: 'Traditional Georgian Cheese Bread' },
          { day: 'Tuesday', meal: 'Chicken Soup with Lavash', recipe: 'Hearty Georgian Chicken Soup' },
          { day: 'Wednesday', meal: 'Lobio (Bean Stew)', recipe: 'Georgian Red Bean Stew' },
          { day: 'Thursday', meal: 'Mtsvadi (Grilled Meat)', recipe: 'Georgian Grilled Pork Skewers' },
          { day: 'Friday', meal: 'Pkhali Assortment', recipe: 'Georgian Vegetable Pâté' },
          { day: 'Saturday', meal: 'Chvishtari with Eggs', recipe: 'Georgian Cornbread with Cheese' },
          { day: 'Sunday', meal: 'Satsivi Chicken', recipe: 'Walnut Sauce Chicken Georgian Style' }
        ].map((dayPlan) => (
          <div key={dayPlan.day} className="bg-white rounded-xl p-4 shadow-sm border border-stone-200 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <h4 className="font-semibold text-stone-800">{dayPlan.day}</h4>
            </div>
            <div className="space-y-2">
              <p className="text-stone-700 font-medium">{dayPlan.meal}</p>
              <p className="text-stone-600 text-sm leading-relaxed">{dayPlan.recipe}</p>
              <button className="text-emerald-600 hover:text-emerald-700 text-sm font-medium flex items-center gap-1 mt-2">
                <ChefHat className="w-4 h-4" />
                View Recipe
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Shopping List and Batch Cooking */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Shopping List */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200">
          <div className="flex items-center gap-2 mb-6">
            <ShoppingCart className="w-5 h-5 text-emerald-600" />
            <h3 className="text-xl font-bold text-stone-800">Shopping List</h3>
          </div>

          <div className="space-y-4">
            <div className="border-l-4 border-emerald-500 pl-4">
              <h4 className="font-semibold text-stone-800 mb-2">Dezerter Market (₾15.2)</h4>
              <ul className="text-stone-600 space-y-1 text-sm">
                <li>2 kg Sulguni cheese (₾8)</li>
                <li>1 kg Pork shoulder (₾12)</li>
                <li>500g Red kidney beans (₾2)</li>
                <li>Fresh herbs & vegetables (₾3.2)</li>
              </ul>
            </div>

            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-semibold text-stone-800 mb-2">Supermarket/Carrefour (₾20)</h4>
              <ul className="text-stone-600 space-y-1 text-sm">
                <li>Flour & cornmeal (₾3)</li>
                <li>Chicken & walnuts (₾12)</li>
                <li>Cooking oil & spices (₾5)</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-stone-800">Total Estimated Budget</span>
              <span className="text-xl font-bold text-emerald-700">₾35.2</span>
            </div>
            <p className="text-stone-600 text-sm mt-1">Under your 200-300₾ target range!</p>
          </div>
        </div>

        {/* Batch Cooking */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200">
          <div className="flex items-center gap-2 mb-6">
            <Utensils className="w-5 h-5 text-emerald-600" />
            <h3 className="text-xl font-bold text-stone-800">Batch Cooking Steps</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="bg-emerald-100 text-emerald-700 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                1
              </div>
              <div>
                <p className="font-medium text-stone-800">Prepare Khachapuri Dough</p>
                <p className="text-stone-600 text-sm mt-1">Mix dough, let rise - use same dough for Chvishtari</p>
                <div className="flex items-center gap-1 mt-1 text-stone-500 text-xs">
                  <Clock className="w-3 h-3" />
                  <span>30 min prep, serves 2 meals</span>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-emerald-100 text-emerald-700 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                2
              </div>
              <div>
                <p className="font-medium text-stone-800">Cook Bean Base</p>
                <p className="text-stone-600 text-sm mt-1">Prepare beans for Lobio - can be used for 3-4 meals</p>
                <div className="flex items-center gap-1 mt-1 text-stone-500 text-xs">
                  <Clock className="w-3 h-3" />
                  <span>45 min cooking, multiple servings</span>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-emerald-100 text-emerald-700 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                3
              </div>
              <div>
                <p className="font-medium text-stone-800">Grill Meat Skewers</p>
                <p className="text-stone-600 text-sm mt-1">Prepare Mtsvadi for Thursday dinner</p>
                <div className="flex items-center gap-1 mt-1 text-stone-500 text-xs">
                  <Clock className="w-3 h-3" />
                  <span>20 min grilling, serves 2</span>
                </div>
              </div>
            </div>

            <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200 mt-6">
              <p className="text-emerald-800 font-medium">
                💡 Tip: Spend 2-3 hours on Sunday cooking bases and proteins for 4-5 easy weeknight meals
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="mt-8 text-center">
        <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg hover:scale-105">
          Start Generating Real Plans Like This
        </button>
        <p className="text-stone-500 text-sm mt-3">
          ✨ Plans generated with real AI analysis of Tbilisi markets and Georgian cuisine
        </p>
      </div>
    </div>
  );
}
