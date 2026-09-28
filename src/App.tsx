import React, { useState, useEffect } from 'react';
import {
  UserProfile,
  FullHealthPlan,
  MealItem,
} from './types/diet';
import { buildCompleteHealthPlan, getFallbackMealSwap } from './utils/nutritionCalculator';
import { Navbar } from './components/Navbar';
import { AssessmentForm } from './components/AssessmentForm';
import { MetricsDashboard } from './components/MetricsDashboard';
import { WeeklyDietPlanView } from './components/WeeklyDietPlanView';
import { DailyRoutineTimeline } from './components/DailyRoutineTimeline';
import { InteractiveHabitTracker } from './components/InteractiveHabitTracker';
import { GroceryListView } from './components/GroceryListView';
import { DietitianCoachChat } from './components/DietitianCoachChat';
import { RecipeModal } from './components/RecipeModal';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  CheckCircle,
  Footprints,
  Heart,
  Droplets,
} from 'lucide-react';

export default function App() {
  const [profile, setProfile] = useState<UserProfile>({
    age: 29,
    sex: 'male',
    heightCm: 178,
    weightKg: 74,
    routine: 'desk_sedentary',
    wakeTime: '06:45',
    bedTime: '22:45',
    goal: 'fat_loss',
    dietPreference: 'mediterranean',
    allergies: [],
    cookingSkill: 'quick_easy',
  });

  const [healthPlan, setHealthPlan] = useState<FullHealthPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('diet');
  const [selectedRecipe, setSelectedRecipe] = useState<MealItem | null>(null);
  const [isSwappingId, setIsSwappingId] = useState<string | null>(null);
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);

  // Initialize with scientifically grounded default plan on initial load
  useEffect(() => {
    const initialPlan = buildCompleteHealthPlan(profile);
    setHealthPlan(initialPlan);
  }, []);

  const handleGeneratePlan = async (newProfile: UserProfile) => {
    setIsLoading(true);
    setProfile(newProfile);

    try {
      const response = await fetch('/api/health/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProfile),
      });

      if (!response.ok) {
        throw new Error('Failed to generate customized plan from server');
      }

      const planData: FullHealthPlan = await response.json();
      setHealthPlan(planData);
      setShowAssessmentModal(false);
      setActiveTab('diet');
    } catch (err) {
      console.warn('Server generation error, generating local evidence-based plan:', err);
      const fallback = buildCompleteHealthPlan(newProfile);
      setHealthPlan(fallback);
      setShowAssessmentModal(false);
      setActiveTab('diet');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwapMeal = async (
    dayIndex: number,
    mealId: string,
    category: string,
    currentMealName: string,
    calories: number
  ) => {
    if (!healthPlan) return;
    setIsSwappingId(mealId);

    try {
      const response = await fetch('/api/health/swap-meal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          currentMealName,
          calories,
          dietPreference: profile.dietPreference,
          allergies: profile.allergies,
        }),
      });

      if (!response.ok) throw new Error('API swap failed');
      const data = await response.json();
      if (data.meal) {
        const updatedWeekly = [...healthPlan.weeklyPlan];
        const dayMeals = updatedWeekly[dayIndex].meals.map((m) =>
          m.id === mealId ? { ...data.meal, id: 'meal-' + Date.now() } : m
        );
        updatedWeekly[dayIndex].meals = dayMeals;

        setHealthPlan({
          ...healthPlan,
          weeklyPlan: updatedWeekly,
        });
      }
    } catch (err) {
      console.warn('Network meal swap unavailable, using local swap fallback:', err);
      const fallbackMeal = getFallbackMealSwap(category, calories, profile.dietPreference);
      const updatedWeekly = [...healthPlan.weeklyPlan];
      const dayMeals = updatedWeekly[dayIndex].meals.map((m) =>
        m.id === mealId ? fallbackMeal : m
      );
      updatedWeekly[dayIndex].meals = dayMeals;

      setHealthPlan({
        ...healthPlan,
        weeklyPlan: updatedWeekly,
      });
    } finally {
      setIsSwappingId(null);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleReset = () => {
    setShowAssessmentModal(true);
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col font-sans">
      {/* Top Bar */}
      <Navbar
        onPrint={handlePrint}
        onReset={handleReset}
        hasPlan={!!healthPlan}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* If Assessment Modal or First-time Intake */}
        {showAssessmentModal ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold font-display text-stone-900">
                  Update Your Physical Metrics & Schedule
                </h1>
                <p className="text-xs sm:text-sm text-stone-500 mt-1">
                  Adjust height, weight, activity levels, or dietary restrictions to recalibrate your entire plan.
                </p>
              </div>

              {healthPlan && (
                <button
                  type="button"
                  onClick={() => setShowAssessmentModal(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-stone-600 bg-white border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>

            <AssessmentForm onSubmit={handleGeneratePlan} isLoading={isLoading} />
          </div>
        ) : healthPlan ? (
          <>
            {/* Quick Profile Strip & Recalculate CTA */}
            <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-stone-600">
                <span className="font-semibold text-stone-900">Current Profile:</span>
                <span>{profile.sex === 'male' ? 'Male' : 'Female'}, {profile.age} yrs</span>
                <span aria-hidden="true" className="text-stone-300">·</span>
                <span>{profile.heightCm} cm</span>
                <span aria-hidden="true" className="text-stone-300">·</span>
                <span>{profile.weightKg} kg</span>
                <span aria-hidden="true" className="text-stone-300">·</span>
                <span className="capitalize">{profile.routine.replace('_', ' ')}</span>
                <span aria-hidden="true" className="text-stone-300">·</span>
                <span className="capitalize">{profile.goal.replace('_', ' ')}</span>
                <span aria-hidden="true" className="text-stone-300">·</span>
                <span className="capitalize">{profile.dietPreference}</span>
              </div>

              <button
                type="button"
                onClick={() => setShowAssessmentModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Edit Metrics & Schedule</span>
              </button>
            </div>

            {/* Sub-Views Controlled by Top Navbar */}
            {activeTab === 'diet' && (
              <WeeklyDietPlanView
                weeklyPlan={healthPlan.weeklyPlan}
                user={profile}
                onOpenRecipe={(meal) => setSelectedRecipe(meal)}
                onSwapMeal={handleSwapMeal}
                isSwappingId={isSwappingId}
              />
            )}

            {activeTab === 'routine' && (
              <DailyRoutineTimeline
                schedule={healthPlan.dailySchedule}
                user={profile}
              />
            )}

            {activeTab === 'metrics' && (
              <MetricsDashboard
                metrics={healthPlan.metrics}
                user={profile}
                aiInsights={(healthPlan as any).aiInsights}
              />
            )}

            {activeTab === 'groceries' && (
              <GroceryListView
                categories={healthPlan.groceryCategories}
                dietPreference={profile.dietPreference}
              />
            )}

            {activeTab === 'tracker' && (
              <InteractiveHabitTracker
                metrics={healthPlan.metrics}
                user={profile}
              />
            )}

            {activeTab === 'coach' && (
              <DietitianCoachChat
                user={profile}
                metrics={healthPlan.metrics}
              />
            )}
          </>
        ) : (
          <AssessmentForm onSubmit={handleGeneratePlan} isLoading={isLoading} />
        )}
      </main>

      {/* Recipe Modal */}
      <RecipeModal
        meal={selectedRecipe}
        onClose={() => setSelectedRecipe(null)}
      />

      {/* Clean Editorial Footer */}
      <footer className="border-t border-stone-200 bg-white py-8 mt-12 text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-stone-900 font-display">NutriLife</span>
            <span aria-hidden="true">·</span>
            <span>Clinical Diet & Longevity Architecture</span>
          </div>

          <div className="flex items-center gap-4 text-stone-400">
            <span>Mifflin-St Jeor Energy Equations</span>
            <span aria-hidden="true">·</span>
            <span>Circadian Neurobiology Protocols</span>
            <span aria-hidden="true">·</span>
            <span>Whole-Food Nutrition</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
