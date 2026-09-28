import React from 'react';
import { MetricsSummary, UserProfile } from '../types/diet';
import {
  Flame,
  Activity,
  Heart,
  Droplets,
  Wheat,
  Scale,
  Sparkles,
  Info,
} from 'lucide-react';

interface MetricsDashboardProps {
  metrics: MetricsSummary;
  user: UserProfile;
  aiInsights?: {
    personalizedDietitianNote?: string;
    routineEnhancementTips?: string[];
    keyNutrientFocus?: string[];
  };
}

export const MetricsDashboard: React.FC<MetricsDashboardProps> = ({
  metrics,
  user,
  aiInsights,
}) => {
  const { bmi, bmiCategory, idealWeightRange, bmr, tdee, targetCalories, macros } = metrics;

  // BMI bar percentage calculation (range 15 to 35 for visual gauge)
  const bmiPercentage = Math.min(100, Math.max(0, ((bmi - 15) / 20) * 100));

  // Macro calorie contributions
  const proteinKcal = macros.proteinGrams * 4;
  const carbsKcal = macros.carbsGrams * 4;
  const fatsKcal = macros.fatsGrams * 9;
  const totalMacroKcal = proteinKcal + carbsKcal + fatsKcal || targetCalories;

  const proteinPct = Math.round((proteinKcal / totalMacroKcal) * 100);
  const carbsPct = Math.round((carbsKcal / totalMacroKcal) * 100);
  const fatsPct = Math.round((fatsKcal / totalMacroKcal) * 100);

  return (
    <div className="space-y-6">
      {/* Clinician Summary Banner */}
      <div className="bg-stone-900 text-white rounded-2xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold tracking-wider uppercase mb-2">
            <Sparkles className="w-4 h-4" />
            <span>Clinical Metabolic & Body Composition Profile</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-white mb-2">
            Tailored for {user.heightCm} cm · {user.weightKg} kg ·{' '}
            {user.routine.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
          </h2>

          <p className="text-stone-300 text-sm leading-relaxed max-w-4xl">
            {aiInsights?.personalizedDietitianNote ||
              `Based on the validated Mifflin-St Jeor formula, your basal metabolic rate is ${bmr} kcal/day. Factoring in your occupational routine and goal of ${user.goal.replace('_', ' ')}, your daily caloric requirement is targeted at ${targetCalories} kcal with an optimal balance of ${macros.proteinGrams}g protein to preserve functional muscle mass and support sustained daily energy.`}
          </p>

          <div className="mt-4 pt-4 border-t border-stone-800 flex flex-wrap items-center gap-4 text-xs text-stone-400">
            <div>
              <span className="text-stone-300 font-medium">BMR:</span>{' '}
              <span className="font-mono text-emerald-400 tabular-nums">{bmr} kcal</span> (organ baseline)
            </div>
            <span aria-hidden="true" className="text-stone-700">·</span>
            <div>
              <span className="text-stone-300 font-medium">TDEE:</span>{' '}
              <span className="font-mono text-emerald-400 tabular-nums">{tdee} kcal</span> (daily burn)
            </div>
            <span aria-hidden="true" className="text-stone-700">·</span>
            <div>
              <span className="text-stone-300 font-medium">Calorie Target:</span>{' '}
              <span className="font-mono text-emerald-400 tabular-nums font-semibold">{targetCalories} kcal</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Core Quantitative Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: BMI */}
        <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
            <span className="font-medium">Body Mass Index (BMI)</span>
            <Scale className="w-4 h-4 text-stone-400" />
          </div>

          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-bold font-display text-stone-900 tabular-nums">{bmi}</span>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                bmiCategory === 'Normal weight'
                  ? 'bg-emerald-50 text-emerald-700'
                  : bmiCategory === 'Underweight'
                  ? 'bg-blue-50 text-blue-700'
                  : 'bg-amber-50 text-amber-700'
              }`}
            >
              {bmiCategory}
            </span>
          </div>

          {/* Visual BMI Range Bar */}
          <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden mb-2 relative">
            <div
              className={`h-full rounded-full transition-all ${
                bmiCategory === 'Normal weight'
                  ? 'bg-emerald-500'
                  : bmiCategory === 'Underweight'
                  ? 'bg-blue-500'
                  : 'bg-amber-500'
              }`}
              style={{ width: `${bmiPercentage}%` }}
            />
          </div>

          <div className="flex justify-between text-[11px] text-stone-400">
            <span>Ideal Range:</span>
            <span className="font-medium text-stone-600 font-mono">
              {idealWeightRange.min} - {idealWeightRange.max} kg
            </span>
          </div>
        </div>

        {/* Metric 2: Target Calories */}
        <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
            <span className="font-medium">Target Daily Intake</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>

          <div className="flex items-baseline gap-1.5 mb-2">
            <span className="text-3xl font-bold font-display text-stone-900 tabular-nums">{targetCalories}</span>
            <span className="text-xs text-stone-500 font-medium">kcal / day</span>
          </div>

          <p className="text-xs text-stone-500 leading-relaxed">
            {user.goal === 'fat_loss'
              ? 'Calibrated with a mild 400 kcal deficit to ensure fat loss while safeguarding thyroid and leptin levels.'
              : user.goal === 'muscle_gain'
              ? 'Includes a clean 350 kcal surplus to stimulate myofibrillar hypertrophy without excessive adiposity.'
              : 'Iso-caloric maintenance calibrated for cellular repair and sustained energy.'}
          </p>
        </div>

        {/* Metric 3: Protein Target */}
        <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
            <span className="font-medium">Protein Anchor</span>
            <Heart className="w-4 h-4 text-rose-500" />
          </div>

          <div className="flex items-baseline gap-1.5 mb-2">
            <span className="text-3xl font-bold font-display text-stone-900 tabular-nums">{macros.proteinGrams}</span>
            <span className="text-xs text-stone-500 font-medium">grams / day</span>
          </div>

          <p className="text-xs text-stone-500 leading-relaxed">
            Equals <span className="font-mono font-medium text-stone-700">{(macros.proteinGrams / user.weightKg).toFixed(1)}g / kg</span> of bodyweight. Maintains positive nitrogen balance and blunts hunger hormones.
          </p>
        </div>

        {/* Metric 4: Daily Hydration */}
        <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
            <span className="font-medium">Water Requirement</span>
            <Droplets className="w-4 h-4 text-cyan-600" />
          </div>

          <div className="flex items-baseline gap-1.5 mb-2">
            <span className="text-3xl font-bold font-display text-stone-900 tabular-nums">{macros.waterLiters}</span>
            <span className="text-xs text-stone-500 font-medium">Liters ({Math.round(macros.waterLiters / 0.25)} glasses)</span>
          </div>

          <p className="text-xs text-stone-500 leading-relaxed">
            Calculated at 35ml/kg baseline + daily routine hydration allowance for metabolic clearance and joint lubrication.
          </p>
        </div>
      </div>

      {/* Macronutrient Distribution Bar */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <div>
            <h3 className="text-base font-semibold text-stone-900">Macronutrient & Fiber Blueprint</h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Target caloric split designed for your dietary pattern ({user.dietPreference})
            </p>
          </div>
          <span className="text-xs text-stone-500 font-mono">
            Total Budget: {targetCalories} kcal
          </span>
        </div>

        {/* Segmented Macro Bar */}
        <div className="h-3 w-full bg-stone-100 rounded-full overflow-hidden flex mb-4">
          <div
            className="bg-emerald-600 transition-all duration-500"
            style={{ width: `${proteinPct}%` }}
            title={`Protein: ${macros.proteinGrams}g (${proteinPct}%)`}
          />
          <div
            className="bg-amber-500 transition-all duration-500"
            style={{ width: `${carbsPct}%` }}
            title={`Carbs: ${macros.carbsGrams}g (${carbsPct}%)`}
          />
          <div
            className="bg-sky-500 transition-all duration-500"
            style={{ width: `${fatsPct}%` }}
            title={`Healthy Fats: ${macros.fatsGrams}g (${fatsPct}%)`}
          />
        </div>

        {/* 3 Macro Cards + Fiber */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100">
            <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-semibold mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
              <span>Protein ({proteinPct}%)</span>
            </div>
            <div className="text-xl font-bold font-display text-emerald-950 tabular-nums">
              {macros.proteinGrams}g
            </div>
            <div className="text-[11px] text-emerald-700/80 mt-0.5">
              {macros.proteinGrams * 4} kcal · Cellular repair
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-100">
            <div className="flex items-center gap-1.5 text-xs text-amber-800 font-semibold mb-1">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
              <span>Carbs ({carbsPct}%)</span>
            </div>
            <div className="text-xl font-bold font-display text-amber-950 tabular-nums">
              {macros.carbsGrams}g
            </div>
            <div className="text-[11px] text-amber-700/80 mt-0.5">
              {macros.carbsGrams * 4} kcal · Brain & glycogen fuel
            </div>
          </div>

          <div className="p-3 rounded-xl bg-sky-50/60 border border-sky-100">
            <div className="flex items-center gap-1.5 text-xs text-sky-800 font-semibold mb-1">
              <span className="w-2 h-2 rounded-full bg-sky-500 inline-block" />
              <span>Healthy Fats ({fatsPct}%)</span>
            </div>
            <div className="text-xl font-bold font-display text-sky-950 tabular-nums">
              {macros.fatsGrams}g
            </div>
            <div className="text-[11px] text-sky-700/80 mt-0.5">
              {macros.fatsGrams * 9} kcal · Endocrine support
            </div>
          </div>

          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
            <div className="flex items-center gap-1.5 text-xs text-stone-700 font-semibold mb-1">
              <Wheat className="w-3.5 h-3.5 text-stone-600" />
              <span>Daily Fiber Goal</span>
            </div>
            <div className="text-xl font-bold font-display text-stone-900 tabular-nums">
              {macros.fiberGrams}g
            </div>
            <div className="text-[11px] text-stone-500 mt-0.5">
              Gut microbiome & slow digestion
            </div>
          </div>
        </div>
      </div>

      {/* Routine Enhancement Tips & Micronutrient Focus */}
      {aiInsights && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {aiInsights.routineEnhancementTips && (
            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-2xs">
              <h4 className="text-sm font-semibold text-stone-900 mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-600" />
                <span>Routine-Specific Optimization Habits</span>
              </h4>
              <ul className="space-y-2.5">
                {aiInsights.routineEnhancementTips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-stone-600 leading-relaxed">
                    <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {aiInsights.keyNutrientFocus && (
            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-2xs">
              <h4 className="text-sm font-semibold text-stone-900 mb-3 flex items-center gap-2">
                <Info className="w-4 h-4 text-emerald-600" />
                <span>Key Micronutrients for Your Physiology</span>
              </h4>
              <ul className="space-y-2.5">
                {aiInsights.keyNutrientFocus.map((nutrient, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-stone-600 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0 mt-1.5" />
                    <span>{nutrient}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
