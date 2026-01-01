import React, { useState } from 'react';
import { WeeklyPlanData, Recipe, LoadingState, UserPreferences, DayPlan } from './types';
import { generateWeeklyPlan, regenerateDayPlan } from './services/openRouterService';
import { generateMarkdown, printDayPlan } from './services/exportService';
import { InputSection } from './components/InputSection';
import { MealCard } from './components/MealCard';
import { ShoppingListView } from './components/ShoppingListView';
import { BatchCookingView } from './components/BatchCookingView';
import { RecipeModal } from './components/RecipeModal';
import { AuthModal } from './components/AuthModal';
import { SavedPlansModal } from './components/SavedPlansModal';
import { LandingPage } from './components/landing/LandingPage';
import { UserDashboard } from './components/UserDashboard';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { UtensilsCrossed, RefreshCw, Copy, Check, User, LogOut, FolderOpen } from 'lucide-react';

export function AppWithAuth() {
  const { user, signOut, loading: authLoading } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const handleOpenAuth = () => setAuthModalOpen(true);

  // Show landing page if not authenticated
  if (!authLoading && !user) {
    return (
      <>
        <LandingPage onOpenAuth={handleOpenAuth} />
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
        />
      </>
    );
  }

  // Show loading while auth loads
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-4"></div>
          <p className="text-stone-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show user dashboard for authenticated users
  return <UserDashboard onSignOut={signOut} />;
};

const App: React.FC = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppWithAuth />
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;
