export type Sex = 'male' | 'female';
export type RoutineType = 'desk_sedentary' | 'hybrid_light' | 'moderate_active' | 'very_active_physical';
export type DietPreference = 'balanced' | 'mediterranean' | 'high_protein' | 'vegetarian' | 'vegan' | 'pescatarian' | 'low_carb';
export type Goal = 'fat_loss' | 'muscle_gain' | 'maintenance' | 'energy_vitality' | 'heart_health';

export interface UserProfile {
  age: number;
  sex: Sex;
  heightCm: number;
  weightKg: number;
  routine: RoutineType;
  wakeTime: string; // e.g. "07:00"
  bedTime: string;  // e.g. "23:00"
  goal: Goal;
  dietPreference: DietPreference;
  allergies: string[]; // e.g. "Dairy", "Gluten", "Nuts", "Seafood"
  cookingSkill: 'quick_easy' | 'moderate' | 'chef';
}

export interface MacroBreakdown {
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatsGrams: number;
  fiberGrams: number;
  waterLiters: number;
}

export interface MetricsSummary {
  bmi: number;
  bmiCategory: 'Underweight' | 'Normal weight' | 'Overweight' | 'Obesity';
  idealWeightRange: { min: number; max: number };
  bmr: number;
  tdee: number;
  targetCalories: number;
  macros: MacroBreakdown;
}

export interface MealItem {
  id: string;
  name: string;
  category: 'breakfast' | 'morning_snack' | 'lunch' | 'afternoon_snack' | 'dinner' | 'bedtime_snack';
  time: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  prepTimeMinutes: number;
  ingredients: string[];
  instructions: string[];
  healthBenefit: string;
}

export interface DayDietPlan {
  dayIndex: number;
  dayName: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
  meals: MealItem[];
  hydrationTargetLiters: number;
  nutritionTip: string;
}

export interface ScheduledActivity {
  id: string;
  time: string;
  title: string;
  category: 'morning_ritual' | 'ergonomics' | 'workout' | 'mobility' | 'digestive_walk' | 'sleep_hygiene';
  durationMinutes: number;
  description: string;
  actionableSteps: string[];
  scientificBenefit: string;
  intensity: 'low' | 'moderate' | 'high';
}

export interface FullHealthPlan {
  user: UserProfile;
  metrics: MetricsSummary;
  weeklyPlan: DayDietPlan[];
  dailySchedule: ScheduledActivity[];
  lifestyleHabits: {
    title: string;
    description: string;
    impact: string;
    icon: string;
  }[];
  groceryCategories: {
    category: string;
    items: { name: string; amount: string; checked?: boolean }[];
  }[];
  generatedAt: string;
}
