import React, { useState } from 'react';
import { MetricsSummary, UserProfile } from '../types/diet';
import {
  Droplets,
  Plus,
  Minus,
  CheckCircle,
  Footprints,
  Moon,
  Sparkles,
  Award,
} from 'lucide-react';

interface InteractiveHabitTrackerProps {
  metrics: MetricsSummary;
  user: UserProfile;
}

export const InteractiveHabitTracker: React.FC<InteractiveHabitTrackerProps> = ({
  metrics,
  user,
}) => {
  const targetWaterGlasses = Math.round(metrics.macros.waterLiters / 0.25);
  const [loggedGlasses, setLoggedGlasses] = useState<number>(4);
  const [loggedSteps, setLoggedSteps] = useState<number>(6500);
  const [targetSteps] = useState<number>(user.routine === 'desk_sedentary' ? 8500 : 10000);
  const [checkedMeals, setCheckedMeals] = useState<string[]>(['breakfast', 'lunch']);
  const [dailyHabits, setDailyHabits] = useState<string[]>(['morning_sunlight', 'digestive_walk']);

  const addGlass = () => setLoggedGlasses((prev) => Math.min(targetWaterGlasses + 4, prev + 1));
  const removeGlass = () => setLoggedGlasses((prev) => Math.max(0, prev - 1));

  const toggleMeal = (mealKey: string) => {
    if (checkedMeals.includes(mealKey)) {
      setCheckedMeals(checkedMeals.filter((m) => m !== mealKey));
    } else {
      setCheckedMeals([...checkedMeals, mealKey]);
    }
  };

  const toggleHabit = (habitKey: string) => {
    if (dailyHabits.includes(habitKey)) {
      setDailyHabits(dailyHabits.filter((h) => h !== habitKey));
    } else {
      setDailyHabits([...dailyHabits, habitKey]);
    }
  };

  const waterPct = Math.min(100, Math.round((loggedGlasses / targetWaterGlasses) * 100));
  const stepsPct = Math.min(100, Math.round((loggedSteps / targetSteps) * 100));
  const totalMealsCount = 5;
  const mealsPct = Math.round((checkedMeals.length / totalMealsCount) * 100);

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-2 text-emerald-600 text-xs font-semibold uppercase tracking-wider mb-1">
          <Award className="w-4 h-4" />
          <span>Active Daily Adherence System</span>
        </div>
        <h2 className="text-2xl font-bold font-display text-stone-900">
          Interactive Daily Wellness Tracker
        </h2>
        <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-2xl leading-relaxed">
          Consistent micro-habits compound into transformative longevity. Log your hydration, mindful meals, and non-exercise daily steps in real time.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Hydration Tracker */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-cyan-50 text-cyan-600">
                <Droplets className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-stone-900">Hydration Log (250ml Glasses)</h3>
                <p className="text-xs text-stone-500">
                  Target: {metrics.macros.waterLiters}L ({targetWaterGlasses} glasses)
                </p>
              </div>
            </div>

            <span className="text-lg font-mono font-bold text-cyan-600 tabular-nums">
              {(loggedGlasses * 0.25).toFixed(2)}L
            </span>
          </div>

          {/* Water progress bar */}
          <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-cyan-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${waterPct}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-stone-500">
            <span>Progress: {waterPct}%</span>
            <span>
              {loggedGlasses >= targetWaterGlasses ? 'Daily Goal Achieved! 🎉' : `${targetWaterGlasses - loggedGlasses} glasses to go`}
            </span>
          </div>

          {/* Interactive glass buttons */}
          <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 pt-2">
            {Array.from({ length: targetWaterGlasses }).map((_, idx) => {
              const isFilled = idx < loggedGlasses;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setLoggedGlasses(idx + 1)}
                  className={`py-3 rounded-lg border flex flex-col items-center justify-center transition-all cursor-pointer ${
                    isFilled
                      ? 'bg-cyan-50 border-cyan-400 text-cyan-700 shadow-2xs'
                      : 'border-stone-200 hover:border-stone-300 text-stone-300'
                  }`}
                  title={`Glass ${idx + 1} (250ml)`}
                >
                  <Droplets className={`w-4 h-4 ${isFilled ? 'fill-cyan-500 text-cyan-600' : 'text-stone-300'}`} />
                  <span className="text-[10px] font-mono mt-1 font-semibold">{idx + 1}</span>
                </button>
              );
            })}
          </div>

          {/* Plus / Minus Quick Steppers */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={removeGlass}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
            >
              <Minus className="w-3.5 h-3.5" />
              <span>-250ml</span>
            </button>
            <button
              type="button"
              onClick={addGlass}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-700 rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+250ml</span>
            </button>
          </div>
        </div>

        {/* Daily Steps & NEAT Tracker */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                <Footprints className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-stone-900">Daily Steps & NEAT Movement</h3>
                <p className="text-xs text-stone-500">
                  Target: {targetSteps.toLocaleString()} steps
                </p>
              </div>
            </div>

            <span className="text-lg font-mono font-bold text-emerald-600 tabular-nums">
              {loggedSteps.toLocaleString()}
            </span>
          </div>

          {/* Steps Progress */}
          <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${stepsPct}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-stone-500">
            <span>{stepsPct}% of goal</span>
            <span>
              {loggedSteps >= targetSteps ? 'Movement Target Reached! 🚀' : `${(targetSteps - loggedSteps).toLocaleString()} steps remaining`}
            </span>
          </div>

          {/* Interactive Step Slider */}
          <div className="pt-2">
            <label className="block text-xs font-medium text-stone-600 mb-1.5">
              Quick Adjust Today's Step Count:
            </label>
            <input
              type="range"
              min={0}
              max={16000}
              step={500}
              value={loggedSteps}
              onChange={(e) => setLoggedSteps(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {[3000, 6000, 8500, 10000, 12000].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setLoggedSteps(preset)}
                className={`px-2.5 py-1 text-xs font-mono font-medium rounded-md border transition-all ${
                  loggedSteps === preset
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                    : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                {preset.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        {/* Meal Adherence Checklist */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-stone-900">Today's Meals Eaten Mindfully</h3>
            <span className="text-xs font-mono font-semibold text-stone-500">
              {checkedMeals.length} / {totalMealsCount} logged ({mealsPct}%)
            </span>
          </div>

          <div className="space-y-2.5">
            {[
              { id: 'breakfast', label: 'Breakfast (Calibrated Satiety)' },
              { id: 'morning_snack', label: 'Morning Brain Snack' },
              { id: 'lunch', label: 'Midday Power Lunch' },
              { id: 'afternoon_snack', label: 'Afternoon Glycemic Recharge' },
              { id: 'dinner', label: 'Evening Restorative Dinner' },
            ].map((meal) => {
              const isDone = checkedMeals.includes(meal.id);
              return (
                <div
                  key={meal.id}
                  onClick={() => toggleMeal(meal.id)}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    isDone ? 'bg-emerald-50/40 border-emerald-300' : 'border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  <span className={`text-xs font-medium ${isDone ? 'text-emerald-950 font-semibold' : 'text-stone-700'}`}>
                    {meal.label}
                  </span>
                  <CheckCircle className={`w-4 h-4 ${isDone ? 'fill-emerald-500 text-white' : 'text-stone-300'}`} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Daily Longevity Micro-Habits */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-stone-900">Daily Longevity Rituals</h3>
            <span className="text-xs font-mono font-semibold text-stone-500">
              {dailyHabits.length} completed
            </span>
          </div>

          <div className="space-y-2.5">
            {[
              { id: 'morning_sunlight', label: '10 min Morning Sunlight on Eyes' },
              { id: 'desk_stretch', label: '3x Posture Scapular Resets at Desk' },
              { id: 'digestive_walk', label: '15-min Post-Lunch Digestive Walk' },
              { id: 'workout_done', label: 'Daily Strength or Cardio Circuit' },
              { id: 'digital_sunset', label: 'Digital Sunset (No screens 45m before bed)' },
            ].map((habit) => {
              const isDone = dailyHabits.includes(habit.id);
              return (
                <div
                  key={habit.id}
                  onClick={() => toggleHabit(habit.id)}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    isDone ? 'bg-indigo-50/40 border-indigo-300' : 'border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  <span className={`text-xs font-medium ${isDone ? 'text-indigo-950 font-semibold' : 'text-stone-700'}`}>
                    {habit.label}
                  </span>
                  <CheckCircle className={`w-4 h-4 ${isDone ? 'fill-indigo-600 text-white' : 'text-stone-300'}`} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
