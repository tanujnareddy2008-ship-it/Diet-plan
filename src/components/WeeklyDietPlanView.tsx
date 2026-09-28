import React, { useState } from 'react';
import { DayDietPlan, MealItem, UserProfile } from '../types/diet';
import {
  Clock,
  Flame,
  ChefHat,
  RefreshCw,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface WeeklyDietPlanViewProps {
  weeklyPlan: DayDietPlan[];
  user: UserProfile;
  onOpenRecipe: (meal: MealItem) => void;
  onSwapMeal: (dayIndex: number, mealId: string, category: string, currentMealName: string, calories: number) => Promise<void>;
  isSwappingId: string | null;
}

export const WeeklyDietPlanView: React.FC<WeeklyDietPlanViewProps> = ({
  weeklyPlan,
  user,
  onOpenRecipe,
  onSwapMeal,
  isSwappingId,
}) => {
  const [selectedDayIdx, setSelectedDayIdx] = useState<number>(0);
  const currentDay = weeklyPlan[selectedDayIdx] || weeklyPlan[0];

  const mealCategoryLabels: Record<string, { label: string; iconTime: string }> = {
    breakfast: { label: 'Breakfast', iconTime: '08:00' },
    morning_snack: { label: 'Morning Satiety Snack', iconTime: '11:00' },
    lunch: { label: 'Midday Power Lunch', iconTime: '13:30' },
    afternoon_snack: { label: 'Afternoon Recharge Snack', iconTime: '16:30' },
    dinner: { label: 'Evening Restorative Dinner', iconTime: '19:30' },
  };

  return (
    <div className="space-y-6">
      {/* Visual Editorial Header with Generated Asset */}
      <div className="relative rounded-2xl overflow-hidden border border-stone-200 bg-stone-900 text-white min-h-[180px] sm:min-h-[220px] flex items-end p-6 sm:p-8">
        <img
          src="/src/assets/images/healthy_diet_balanced_bowl_1790582005637.jpg"
          alt="Balanced nutrition diet bowl"
          className="absolute inset-0 w-full h-full object-cover opacity-35"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-900/60 to-transparent" />

        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold tracking-wider uppercase mb-1">
            <span>Clinical Meal Architecture</span>
            <span aria-hidden="true">·</span>
            <span>7-Day Whole-Food Rotation</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-white">
            Daily Nutritive Plan for {user.dietPreference.replace('_', ' ').toUpperCase()}
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-stone-300 leading-relaxed">
            Every meal is calibrated for glycemic stability, gut integrity, and optimal amino acid timing around your daily schedule.
          </p>
        </div>
      </div>

      {/* 7-Day Day Selector Tabs */}
      <div className="bg-white border border-stone-200 rounded-xl p-1.5 shadow-2xs">
        <div className="grid grid-cols-7 gap-1">
          {weeklyPlan.map((day, idx) => {
            const isSelected = selectedDayIdx === idx;
            return (
              <button
                key={day.dayName}
                onClick={() => setSelectedDayIdx(idx)}
                className={`py-2.5 px-2 rounded-lg text-center transition-all ${
                  isSelected
                    ? 'bg-stone-900 text-white shadow-xs font-semibold'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
              >
                <div className="text-[11px] sm:text-xs font-medium uppercase tracking-wider opacity-80">
                  {day.dayName.slice(0, 3)}
                </div>
                <div className="text-xs sm:text-sm font-bold font-display mt-0.5">
                  Day {idx + 1}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Day Overview Banner */}
      <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-emerald-950 font-display">
              {currentDay.dayName} Focus & Daily Tip
            </span>
          </div>
          <p className="text-xs text-emerald-800/90 mt-1 leading-relaxed">
            {currentDay.nutritionTip}
          </p>
        </div>

        {/* Day Nutrition Aggregates */}
        <div className="flex items-center gap-3 text-xs text-emerald-900 font-mono shrink-0 bg-white/80 px-3.5 py-2 rounded-lg border border-emerald-200/60 shadow-2xs">
          <div>
            <span className="text-[11px] text-stone-500 block">Calories</span>
            <span className="font-bold text-stone-900">{currentDay.totalCalories} kcal</span>
          </div>
          <span className="text-stone-300">|</span>
          <div>
            <span className="text-[11px] text-stone-500 block">Protein</span>
            <span className="font-bold text-emerald-700">{currentDay.totalProtein}g</span>
          </div>
          <span className="text-stone-300">|</span>
          <div>
            <span className="text-[11px] text-stone-500 block">Carbs</span>
            <span className="font-bold text-amber-700">{currentDay.totalCarbs}g</span>
          </div>
          <span className="text-stone-300">|</span>
          <div>
            <span className="text-[11px] text-stone-500 block">Fats</span>
            <span className="font-bold text-sky-700">{currentDay.totalFats}g</span>
          </div>
        </div>
      </div>

      {/* List of 5 Meals for Selected Day */}
      <div className="space-y-4">
        {currentDay.meals.map((meal, mealIdx) => {
          const categoryMeta = mealCategoryLabels[meal.category] || {
            label: meal.category,
            iconTime: meal.time,
          };
          const isSwapping = isSwappingId === meal.id;

          return (
            <div
              key={meal.id}
              className="bg-white border border-stone-200 rounded-xl p-5 shadow-2xs hover:border-stone-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              {/* Left Zone: Category, Title, Unboxed Metadata */}
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2 text-xs text-stone-500">
                  <span className="font-semibold text-emerald-800">
                    {categoryMeta.label}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono text-stone-400">Around {categoryMeta.iconTime}</span>
                  <span aria-hidden="true">·</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-stone-400" />
                    <span>{meal.prepTimeMinutes} min prep</span>
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-stone-900 font-display">
                  {meal.name}
                </h3>

                {/* Unboxed Metadata Line with Typographic Separators */}
                <div className="flex flex-wrap items-center gap-2 text-xs text-stone-600 font-medium">
                  <span className="text-stone-900 font-bold font-mono tabular-nums">
                    {meal.calories} kcal
                  </span>
                  <span aria-hidden="true" className="text-stone-300">·</span>
                  <span className="text-emerald-700 font-mono tabular-nums">
                    {meal.protein}g Protein
                  </span>
                  <span aria-hidden="true" className="text-stone-300">·</span>
                  <span className="text-amber-700 font-mono tabular-nums">
                    {meal.carbs}g Carbs
                  </span>
                  <span aria-hidden="true" className="text-stone-300">·</span>
                  <span className="text-sky-700 font-mono tabular-nums">
                    {meal.fats}g Fats
                  </span>
                </div>

                {/* Health Rationale */}
                <p className="text-xs text-stone-500 italic max-w-3xl leading-relaxed">
                  "{meal.healthBenefit}"
                </p>

                {/* Ingredient Preview */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {meal.ingredients.slice(0, 4).map((ing, i) => (
                    <span
                      key={i}
                      className="text-[11px] text-stone-600 bg-stone-50 px-2 py-0.5 rounded-md border border-stone-100"
                    >
                      {ing}
                    </span>
                  ))}
                  {meal.ingredients.length > 4 && (
                    <span className="text-[11px] text-stone-400 self-center">
                      +{meal.ingredients.length - 4} more
                    </span>
                  )}
                </div>
              </div>

              {/* Right Zone: Interactive Action Buttons */}
              <div className="flex items-center md:flex-col gap-2 shrink-0 self-start md:self-center">
                <button
                  type="button"
                  onClick={() => onOpenRecipe(meal)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg shadow-2xs transition-colors whitespace-nowrap cursor-pointer"
                >
                  <ChefHat className="w-3.5 h-3.5" />
                  <span>Recipe & Prep</span>
                </button>

                <button
                  type="button"
                  disabled={isSwapping}
                  onClick={() =>
                    onSwapMeal(
                      selectedDayIdx,
                      meal.id,
                      meal.category,
                      meal.name,
                      meal.calories
                    )
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg border border-stone-200 transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50"
                  title="Generate alternative meal with equivalent calories and macro ratio"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSwapping ? 'animate-spin text-emerald-600' : ''}`} />
                  <span>{isSwapping ? 'Swapping...' : 'Swap Meal'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
