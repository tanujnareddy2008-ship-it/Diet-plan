import React, { useState } from 'react';
import {
  UserProfile,
  Sex,
  RoutineType,
  DietPreference,
  Goal,
} from '../types/diet';
import {
  Activity,
  Flame,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Scale,
  Compass,
} from 'lucide-react';

interface AssessmentFormProps {
  onSubmit: (profile: UserProfile) => void;
  isLoading: boolean;
}

export const AssessmentForm: React.FC<AssessmentFormProps> = ({ onSubmit, isLoading }) => {
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');

  // Form State
  const [sex, setSex] = useState<Sex>('male');
  const [age, setAge] = useState<number>(30);
  const [heightCm, setHeightCm] = useState<number>(178);
  const [weightKg, setWeightKg] = useState<number>(75);

  // Imperial temporary helpers
  const [heightFeet, setHeightFeet] = useState<number>(5);
  const [heightInches, setHeightInches] = useState<number>(10);
  const [weightLbs, setWeightLbs] = useState<number>(165);

  const [routine, setRoutine] = useState<RoutineType>('desk_sedentary');
  const [wakeTime, setWakeTime] = useState<string>('06:45');
  const [bedTime, setBedTime] = useState<string>('22:45');
  const [goal, setGoal] = useState<Goal>('fat_loss');
  const [dietPreference, setDietPreference] = useState<DietPreference>('mediterranean');
  const [allergies, setAllergies] = useState<string[]>([]);

  // Toggle unit system
  const handleUnitToggle = (system: 'metric' | 'imperial') => {
    setUnitSystem(system);
    if (system === 'imperial') {
      const totalInches = Math.round(heightCm / 2.54);
      setHeightFeet(Math.floor(totalInches / 12));
      setHeightInches(totalInches % 12);
      setWeightLbs(Math.round(weightKg * 2.20462));
    } else {
      const cm = Math.round((heightFeet * 12 + heightInches) * 2.54);
      const kg = Math.round(weightLbs / 2.20462);
      setHeightCm(cm);
      setWeightKg(kg);
    }
  };

  const handleImperialHeightChange = (feet: number, inches: number) => {
    setHeightFeet(feet);
    setHeightInches(inches);
    const cm = Math.round((feet * 12 + inches) * 2.54);
    setHeightCm(cm);
  };

  const handleImperialWeightChange = (lbs: number) => {
    setWeightLbs(lbs);
    const kg = Math.round(lbs / 2.20462);
    setWeightKg(kg);
  };

  const toggleAllergy = (item: string) => {
    if (allergies.includes(item)) {
      setAllergies(allergies.filter((a) => a !== item));
    } else {
      setAllergies([...allergies, item]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      age,
      sex,
      heightCm,
      weightKg,
      routine,
      wakeTime,
      bedTime,
      goal,
      dietPreference,
      allergies,
      cookingSkill: 'quick_easy',
    });
  };

  // Quick preset loading
  const loadPreset = (presetKey: 'desk_worker' | 'fitness_bulk' | 'plant_vitality') => {
    if (presetKey === 'desk_worker') {
      setSex('male');
      setAge(32);
      setHeightCm(178);
      setWeightKg(82);
      setRoutine('desk_sedentary');
      setWakeTime('07:00');
      setBedTime('23:00');
      setGoal('fat_loss');
      setDietPreference('mediterranean');
      setAllergies([]);
    } else if (presetKey === 'fitness_bulk') {
      setSex('female');
      setAge(26);
      setHeightCm(168);
      setWeightKg(60);
      setRoutine('moderate_active');
      setWakeTime('06:15');
      setBedTime('22:15');
      setGoal('muscle_gain');
      setDietPreference('high_protein');
      setAllergies(['Gluten']);
    } else if (presetKey === 'plant_vitality') {
      setSex('female');
      setAge(38);
      setHeightCm(165);
      setWeightKg(64);
      setRoutine('hybrid_light');
      setWakeTime('06:30');
      setBedTime('22:30');
      setGoal('energy_vitality');
      setDietPreference('vegetarian');
      setAllergies(['Dairy']);
    }
  };

  const commonAllergies = ['Dairy', 'Gluten', 'Nuts', 'Eggs', 'Shellfish', 'Soy'];

  return (
    <div className="bg-white border border-stone-200 rounded-2xl shadow-xs p-6 sm:p-8 md:p-10">
      {/* Header */}
      <div className="border-b border-stone-100 pb-6 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 font-display">
              Personalized Nutrition & Routine Architecture
            </h2>
            <p className="mt-1 text-sm text-stone-500">
              Input your physical metrics and daily routine to generate your clinical Mifflin-St Jeor plan and tailored healthy life activities.
            </p>
          </div>

          {/* Quick presets */}
          <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-lg self-start sm:self-auto">
            <span className="text-xs text-stone-500 font-medium px-2">Sample Profiles:</span>
            <button
              type="button"
              onClick={() => loadPreset('desk_worker')}
              className="px-2.5 py-1 text-xs font-medium bg-white text-stone-700 hover:text-emerald-700 rounded-md shadow-2xs transition-colors"
            >
              Desk Worker
            </button>
            <button
              type="button"
              onClick={() => loadPreset('fitness_bulk')}
              className="px-2.5 py-1 text-xs font-medium bg-white text-stone-700 hover:text-emerald-700 rounded-md shadow-2xs transition-colors"
            >
              Active Lifter
            </button>
            <button
              type="button"
              onClick={() => loadPreset('plant_vitality')}
              className="px-2.5 py-1 text-xs font-medium bg-white text-stone-700 hover:text-emerald-700 rounded-md shadow-2xs transition-colors"
            >
              Plant Vitality
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Physical Metrics */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-semibold text-stone-900">01. Physical Baseline</h3>
            </div>

            {/* Metric / Imperial toggle */}
            <div className="flex items-center p-1 bg-stone-100 rounded-lg">
              <button
                type="button"
                onClick={() => handleUnitToggle('metric')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  unitSystem === 'metric' ? 'bg-white text-stone-900 shadow-2xs font-semibold' : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                Metric (cm / kg)
              </button>
              <button
                type="button"
                onClick={() => handleUnitToggle('imperial')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  unitSystem === 'imperial' ? 'bg-white text-stone-900 shadow-2xs font-semibold' : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                Imperial (ft / lbs)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Sex */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">Biological Sex</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSex('male')}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg border text-center transition-all ${
                    sex === 'male'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                      : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  Male
                </button>
                <button
                  type="button"
                  onClick={() => setSex('female')}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg border text-center transition-all ${
                    sex === 'female'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                      : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  Female
                </button>
              </div>
            </div>

            {/* Age */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">Age (Years)</label>
              <div className="relative">
                <input
                  type="number"
                  min={14}
                  max={95}
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full px-3.5 py-2 text-sm font-medium border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  required
                />
                <span className="absolute right-3.5 top-2.5 text-xs text-stone-400 font-medium pointer-events-none">
                  yrs
                </span>
              </div>
            </div>

            {/* Height */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Height {unitSystem === 'metric' ? '(cm)' : '(ft & in)'}
              </label>
              {unitSystem === 'metric' ? (
                <div className="relative">
                  <input
                    type="number"
                    min={120}
                    max={230}
                    value={heightCm}
                    onChange={(e) => setHeightCm(Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-sm font-medium border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    required
                  />
                  <span className="absolute right-3.5 top-2.5 text-xs text-stone-400 font-medium pointer-events-none">
                    cm
                  </span>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <input
                      type="number"
                      min={4}
                      max={7}
                      value={heightFeet}
                      onChange={(e) => handleImperialHeightChange(Number(e.target.value), heightInches)}
                      className="w-full px-3 py-2 text-sm font-medium border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                    <span className="absolute right-2.5 top-2 text-xs text-stone-400 font-medium pointer-events-none">
                      ft
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      max={11}
                      value={heightInches}
                      onChange={(e) => handleImperialHeightChange(heightFeet, Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm font-medium border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                    <span className="absolute right-2.5 top-2 text-xs text-stone-400 font-medium pointer-events-none">
                      in
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Weight */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Weight {unitSystem === 'metric' ? '(kg)' : '(lbs)'}
              </label>
              {unitSystem === 'metric' ? (
                <div className="relative">
                  <input
                    type="number"
                    min={35}
                    max={250}
                    step={0.5}
                    value={weightKg}
                    onChange={(e) => setWeightKg(Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-sm font-medium border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    required
                  />
                  <span className="absolute right-3.5 top-2.5 text-xs text-stone-400 font-medium pointer-events-none">
                    kg
                  </span>
                </div>
              ) : (
                <div className="relative">
                  <input
                    type="number"
                    min={80}
                    max={550}
                    value={weightLbs}
                    onChange={(e) => handleImperialWeightChange(Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-sm font-medium border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    required
                  />
                  <span className="absolute right-3.5 top-2.5 text-xs text-stone-400 font-medium pointer-events-none">
                    lbs
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Daily Routine & Schedule */}
        <div className="pt-4 border-t border-stone-100">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-semibold text-stone-900">02. Daily Routine & Schedule</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-2">
                Workday Activity & Occupational Archetype
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  {
                    id: 'desk_sedentary',
                    title: 'Sedentary / Desk Job',
                    desc: 'Desk or screen worker, mostly sitting, <5,000 steps/day',
                    multiplier: '1.2x TDEE',
                  },
                  {
                    id: 'hybrid_light',
                    title: 'Lightly Active / Hybrid',
                    desc: 'Mix of standing/walking, errands, 5,000–8,000 steps/day',
                    multiplier: '1.375x TDEE',
                  },
                  {
                    id: 'moderate_active',
                    title: 'Moderately Active',
                    desc: 'On feet consistently, 3-4 weekly workouts, 8k–12k steps',
                    multiplier: '1.55x TDEE',
                  },
                  {
                    id: 'very_active_physical',
                    title: 'Heavy Labor / Athlete',
                    desc: 'Physical trades or intense sports daily, 12,000+ steps',
                    multiplier: '1.75x TDEE',
                  },
                ].map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setRoutine(item.id as RoutineType)}
                    className={`cursor-pointer p-4 rounded-xl border transition-all text-left flex flex-col justify-between ${
                      routine === item.id
                        ? 'border-emerald-500 bg-emerald-50/50 shadow-2xs'
                        : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-xs text-stone-900">{item.title}</span>
                      </div>
                      <p className="text-xs text-stone-500 leading-relaxed mb-3">{item.desc}</p>
                    </div>
                    <span className="text-[11px] font-mono text-emerald-700 font-medium">
                      {item.multiplier}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Wake & Sleep times */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Typical Morning Wake-up Time
                </label>
                <input
                  type="time"
                  value={wakeTime}
                  onChange={(e) => setWakeTime(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm font-medium border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  required
                />
                <span className="text-[11px] text-stone-400 mt-1 block">
                  Calibrates morning hydration, sunlight exposure, and breakfast timing
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Typical Evening Bedtime
                </label>
                <input
                  type="time"
                  value={bedTime}
                  onChange={(e) => setBedTime(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm font-medium border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  required
                />
                <span className="text-[11px] text-stone-400 mt-1 block">
                  Ensures dinner finishes 3 hours prior to avoid sleep disturbance
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Health Goal & Diet Preference */}
        <div className="pt-4 border-t border-stone-100">
          <div className="flex items-center gap-2 mb-4">
            <Compass className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-semibold text-stone-900">03. Goal & Dietary Framework</h3>
          </div>

          <div className="space-y-4">
            {/* Health Goal */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-2">Primary Objective</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                {[
                  { id: 'fat_loss', label: 'Fat Loss & Lean', desc: '-400 kcal deficit' },
                  { id: 'muscle_gain', label: 'Muscle Building', desc: '+350 kcal surplus' },
                  { id: 'maintenance', label: 'Maintenance', desc: 'Iso-caloric balance' },
                  { id: 'energy_vitality', label: 'Energy & Vitality', desc: 'Glycemic stability' },
                  { id: 'heart_health', label: 'Heart Health', desc: 'Omega-3 & Low Sodium' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setGoal(item.id as Goal)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      goal === item.id
                        ? 'border-emerald-500 bg-emerald-50/60 font-semibold text-emerald-900'
                        : 'border-stone-200 hover:border-stone-300 text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    <div className="text-xs font-semibold">{item.label}</div>
                    <div className="text-[11px] text-stone-500 mt-0.5">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Diet Preference */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-2">Dietary Pattern</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                {[
                  { id: 'balanced', label: 'Balanced' },
                  { id: 'mediterranean', label: 'Mediterranean' },
                  { id: 'high_protein', label: 'High Protein' },
                  { id: 'vegetarian', label: 'Vegetarian' },
                  { id: 'vegan', label: 'Plant-Based' },
                  { id: 'pescatarian', label: 'Pescatarian' },
                  { id: 'low_carb', label: 'Low-Carb / Keto' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setDietPreference(item.id as DietPreference)}
                    className={`py-2 px-2 text-center text-xs font-medium rounded-lg border transition-all ${
                      dietPreference === item.id
                        ? 'bg-stone-900 text-white border-stone-900'
                        : 'border-stone-200 text-stone-600 hover:border-stone-300 hover:bg-stone-50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Allergies / Restrictions */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-2">
                Allergies & Intolerances (Optional)
              </label>
              <div className="flex flex-wrap gap-2">
                {commonAllergies.map((allergy) => {
                  const isSelected = allergies.includes(allergy);
                  return (
                    <button
                      key={allergy}
                      type="button"
                      onClick={() => toggleAllergy(allergy)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                        isSelected
                          ? 'bg-amber-50 border-amber-500 text-amber-900 font-semibold'
                          : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      {isSelected ? `✓ No ${allergy}` : `Exclude ${allergy}`}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Submit CTA */}
        <div className="pt-6 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Mifflin-St Jeor clinical equations · Circadian activity scheduling</span>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl shadow-sm shadow-emerald-600/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Computing Clinical Plan...</span>
              </>
            ) : (
              <>
                <span>Generate My Diet & Routine Plan</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
