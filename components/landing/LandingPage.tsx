import React, { useEffect, useState } from 'react';
import {
  UtensilsCrossed,
  ChefHat,
  Calendar,
  ShoppingCart,
  Clock,
  DollarSign,
  Star,
  Check,
  Sparkles,
  ArrowRight,
  Globe,
  User
} from 'lucide-react';
import { MockupPreview } from './MockupPreview';

interface LandingPageProps {
  onOpenAuth: () => void;
}

export function LandingPage({ onOpenAuth }: LandingPageProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-emerald-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700">
        <div className="absolute inset-0 bg-black bg-opacity-10"></div>
        <div className="absolute inset-0" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")', opacity: 0.2}}></div>

        <div className="relative max-w-7xl mx-auto px-4 py-20 sm:py-24 lg:py-32">
          <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="text-center">
              <div className="flex justify-center mb-8">
                <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl border border-white/20">
                  <UtensilsCrossed className="w-16 h-16 text-white drop-shadow-lg" />
                </div>
              </div>

              <h1 className="text-4xl sm:text-6xl font-bold text-white mb-6 leading-tight">
                Meal Planning <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">AI-Powered</span>
                <br />for Your Lifestyle
              </h1>

              <p className="text-xl text-emerald-100 max-w-3xl mx-auto leading-relaxed mb-8">
                Create personalized weekly meal plans adapted to your location, budget, and culinary preferences.
                Smart Meal Planner uses AI to design recipes and optimize shopping lists based on local markets and prices.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button
                  onClick={onOpenAuth}
                  className="group bg-white text-emerald-700 hover:bg-emerald-50 px-8 py-4 rounded-xl font-semibold text-lg shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 flex items-center gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  Start Planning Now
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>

                <div className="text-white/80 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span className="text-sm">Free account required</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating elements */}
        <div className="absolute top-1/4 left-1/4 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-white/5 rounded-full blur-2xl animate-pulse delay-1000"></div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-stone-800 mb-4">How It Works</h2>
            <p className="text-stone-600 max-w-2xl mx-auto">
              Three simple steps to transform your meal planning experience
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className={`text-center transform transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '200ms' }}>
              <div className="bg-emerald-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Globe className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-stone-800 mb-3">Set Your Preferences</h3>
              <p className="text-stone-600 leading-relaxed">
                Tell us about your location, budget, dietary preferences, and cuisine style.
                We adapt to local markets and cultural tastes.
              </p>
            </div>

            {/* Step 2 */}
            <div className={`text-center transform transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '400ms' }}>
              <div className="bg-emerald-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <ChefHat className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-stone-800 mb-3">AI Generates Your Plan</h3>
              <p className="text-stone-600 leading-relaxed">
                Our AI analyzes local ingredients and prices to create personalized recipes
                and shopping lists optimized for your area.
              </p>
            </div>

            {/* Step 3 */}
            <div className={`text-center transform transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '600ms' }}>
              <div className="bg-emerald-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <ShoppingCart className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-stone-800 mb-3">Cook & Save Money</h3>
              <p className="text-stone-600 leading-relaxed">
                Follow batch cooking guides, shop efficiently at local markets,
                and enjoy delicious meals while staying within budget.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-stone-800 mb-4">Smart Features for Smart Planning</h2>
            <p className="text-stone-600 max-w-2xl mx-auto">
              Everything you need for efficient, delicious, and budget-conscious meal planning
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Calendar,
                title: "Weekly Planning",
                description: "7-day meal schedules with variety and balance"
              },
              {
                icon: ChefHat,
                title: "AI Recipes",
                description: "Personalized recipes using advanced AI technology"
              },
              {
                icon: DollarSign,
                title: "Budget Optimized",
                description: "Plans that respect your financial constraints"
              },
              {
                icon: Globe,
                title: "Local Markets",
                description: "Shopping lists adapted to your area and stores"
              },
              {
                icon: Clock,
                title: "Batch Cooking",
                description: "Efficient cooking guides to save time"
              },
              {
                icon: Star,
                title: "Premium Experience",
                description: "Beautiful interface, easy export, mobile friendly"
              }
            ].map((feature, index) => (
              <div
                key={index}
                className={`bg-white p-6 rounded-2xl shadow-sm border border-stone-200 hover:shadow-lg hover:border-emerald-200 transition-all duration-300 transform hover:-translate-y-1 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: `${800 + index * 100}ms` }}
              >
                <div className="bg-emerald-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="text-lg font-semibold text-stone-800 mb-2">{feature.title}</h3>
                <p className="text-stone-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mockup Preview Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-stone-800 mb-4">See It In Action</h2>
            <p className="text-stone-600 max-w-2xl mx-auto mb-4">
              Here's a sample meal plan for someone in Tbilisi with a 200-300₾ weekly budget
            </p>
            <span className="inline-block bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium">
              Interactive Demo Example
            </span>
          </div>

          <MockupPreview />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to Plan Smarter?
          </h2>
          <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
            Join thousands of people who save time and money with AI-powered meal planning
          </p>

          <div className="grid sm:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <Check className="w-8 h-8 text-green-300 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Free to Start</h3>
              <p className="text-emerald-100 text-sm">No hidden costs, transparent pricing</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <Check className="w-8 h-8 text-green-300 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Quick Setup</h3>
              <p className="text-emerald-100 text-sm">Be ready to cook in under 5 minutes</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <Check className="w-8 h-8 text-green-300 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Smart AI</h3>
              <p className="text-emerald-100 text-sm">Advanced AI that learns and adapts</p>
            </div>
          </div>

          <button
            onClick={onOpenAuth}
            className="group bg-white text-emerald-700 hover:bg-emerald-50 px-8 py-4 rounded-xl font-semibold text-lg shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 flex items-center gap-2 mx-auto"
          >
            <User className="w-5 h-5" />
            Create Your Account
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="bg-emerald-600 p-2 rounded-lg">
                <UtensilsCrossed className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold">Smart Meal Planner</span>
            </div>
            <p className="text-stone-400 max-w-2xl mx-auto">
              AI-powered meal planning adapted to your location, budget, and tastes.
              Save time and money while enjoying delicious, personalized cooking experiences.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
