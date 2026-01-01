import React, { useState, useEffect } from 'react';
import { PlanStorageService, SavedPlan } from '../services/planStorageService';
import { WeeklyPlanData, UserPreferences } from '../types';
import { X, FolderOpen, Trash2, Save, Calendar, MapPin, DollarSign, Users, Clock } from 'lucide-react';

interface SavedPlansModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadPlan: (planData: WeeklyPlanData, preferences: UserPreferences) => void;
  onSavePlan: (planName: string) => void;
  currentPlanData?: WeeklyPlanData | null;
  currentPreferences?: UserPreferences | null;
}

interface SavePlanFormProps {
  onSave: (name: string) => void;
  onCancel: () => void;
  isSaving: boolean;
}

const SavePlanForm: React.FC<SavePlanFormProps> = ({ onSave, onCancel, isSaving }) => {
  const [planName, setPlanName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (planName.trim()) {
      onSave(planName.trim());
      setPlanName('');
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-stone-200 max-w-md w-full mx-4">
      <div className="flex items-center gap-2 mb-4">
        <Save className="w-5 h-5 text-emerald-600" />
        <h3 className="text-lg font-semibold text-stone-900">Save Current Plan</h3>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="planName" className="block text-sm font-medium text-stone-700 mb-2">
            Plan Name
          </label>
          <input
            type="text"
            id="planName"
            value={planName}
            onChange={(e) => setPlanName(e.target.value)}
            className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            placeholder="e.g., Family Week 1 - Tbilisi"
            required
          />
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-stone-600 hover:text-stone-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving || !planName.trim()}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Plan
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export const SavedPlansModal: React.FC<SavedPlansModalProps> = ({
  isOpen,
  onClose,
  onLoadPlan,
  onSavePlan,
  currentPlanData,
  currentPreferences,
}) => {
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);
  const [deletingPlanId, setDeletingPlanId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadSavedPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await PlanStorageService.loadSavedPlans();
      if (result.success && result.plans) {
        setSavedPlans(result.plans);
      } else {
        setError(result.error || 'Failed to load saved plans');
      }
    } catch (err) {
      setError('Failed to load saved plans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadSavedPlans();
    }
  }, [isOpen]);

  const handleSavePlan = async (planName: string) => {
    if (!currentPlanData || !currentPreferences) return;

    setSaving(true);
    try {
      const result = await PlanStorageService.savePlan(planName, currentPreferences, currentPlanData);
      if (result.success) {
        await loadSavedPlans(); // Reload the list
        setShowSaveForm(false);
        onSavePlan(planName);
      } else {
        setError(result.error || 'Failed to save plan');
      }
    } catch (err) {
      setError('Failed to save plan');
    } finally {
      setSaving(false);
    }
  };

  const handleLoadPlan = async (plan: SavedPlan) => {
    setLoadingPlanId(plan.id);
    try {
      const planData = PlanStorageService.savedPlanToWeeklyPlan(plan);
      onLoadPlan(planData, plan.preferences);
      onClose();
    } catch (err) {
      setError('Failed to load plan');
    } finally {
      setLoadingPlanId(null);
    }
  };

  const handleDeletePlan = async (planId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingPlanId(planId);
    try {
      const result = await PlanStorageService.deletePlan(planId);
      if (result.success) {
        await loadSavedPlans(); // Reload the list
      } else {
        setError(result.error || 'Failed to delete plan');
      }
    } catch (err) {
      setError('Failed to delete plan');
    } finally {
      setDeletingPlanId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[80vh] overflow-hidden mx-4">
        {/* Header */}
        <div className="p-6 border-b border-stone-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderOpen className="w-6 h-6 text-emerald-600" />
              <h2 className="text-xl font-bold text-stone-900">Saved Plans</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSaveForm(true)}
                disabled={!currentPlanData}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-300 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Current Plan
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-stone-100 text-stone-400 hover:text-stone-600 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {error && (
            <div className="mb-4 bg-red-50 text-red-700 p-3 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-stone-600">Loading saved plans...</p>
            </div>
          ) : savedPlans.length === 0 ? (
            <div className="text-center py-8">
              <FolderOpen className="w-12 h-12 text-stone-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-stone-700 mb-2">No saved plans yet</h3>
              <p className="text-stone-500">Save your first meal plan to get started!</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {savedPlans.map((plan) => (
                <div
                  key={plan.id}
                  onClick={() => handleLoadPlan(plan)}
                  className="border border-stone-200 rounded-lg p-4 hover:border-emerald-300 hover:bg-stone-50 cursor-pointer transition-colors group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-stone-900 mb-2">{plan.name}</h4>
                      <div className="flex items-center gap-4 text-sm text-stone-600 mb-3">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{plan.preferences.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          <span>{plan.preferences.currency} {plan.budget_estimate}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{plan.preferences.peopleCount} people</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-sm text-stone-500">
                          <Calendar className="w-4 h-4" />
                          <span>Updated {formatDate(plan.updated_at)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-sm text-stone-500">{plan.week_plan.length} days</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={(e) => handleDeletePlan(plan.id, e)}
                        disabled={deletingPlanId === plan.id}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                      >
                        {deletingPlanId === plan.id ? (
                          <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        disabled={loadingPlanId === plan.id}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white text-sm rounded-lg transition-colors flex items-center gap-2"
                      >
                        {loadingPlanId === plan.id ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Loading...
                          </>
                        ) : (
                          <>
                            <FolderOpen className="w-4 h-4" />
                            Load Plan
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Save Plan Overlay */}
      {showSaveForm && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <SavePlanForm
            onSave={handleSavePlan}
            onCancel={() => setShowSaveForm(false)}
            isSaving={saving}
          />
        </div>
      )}
    </div>
  );
};
