import React from 'react';
import { MealItem } from '../types/diet';
import { X, Clock, ChefHat, Sparkles, Check, Printer } from 'lucide-react';

interface RecipeModalProps {
  meal: MealItem | null;
  onClose: () => void;
}

export const RecipeModal: React.FC<RecipeModalProps> = ({ meal, onClose }) => {
  if (!meal) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div
        className="bg-white rounded-2xl border border-stone-200 shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-stone-100 flex items-start justify-between gap-4 sticky top-0 bg-white/95 backdrop-blur-md z-10">
          <div>
            <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
              <span className="font-semibold text-emerald-800 uppercase tracking-wider">
                {meal.category.replace('_', ' ')}
              </span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1 font-mono">
                <Clock className="w-3.5 h-3.5 text-stone-400" />
                <span>{meal.prepTimeMinutes} mins</span>
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-stone-900">
              {meal.name}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nutritional Pill / Row */}
        <div className="px-6 py-3 bg-stone-50 border-b border-stone-100 flex flex-wrap items-center gap-3 text-xs text-stone-700 font-medium">
          <span><strong className="text-stone-900 font-mono font-bold">{meal.calories}</strong> kcal</span>
          <span aria-hidden="true" className="text-stone-300">·</span>
          <span><strong className="text-emerald-700 font-mono font-bold">{meal.protein}g</strong> Protein</span>
          <span aria-hidden="true" className="text-stone-300">·</span>
          <span><strong className="text-amber-700 font-mono font-bold">{meal.carbs}g</strong> Carbs</span>
          <span aria-hidden="true" className="text-stone-300">·</span>
          <span><strong className="text-sky-700 font-mono font-bold">{meal.fats}g</strong> Fats</span>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Health Rationale */}
          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/70 text-xs text-emerald-950 flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block mb-0.5">Clinical Dietary Benefit:</span>
              <span className="leading-relaxed text-emerald-900">{meal.healthBenefit}</span>
            </div>
          </div>

          {/* Ingredients */}
          <div>
            <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <ChefHat className="w-4 h-4 text-stone-600" />
              <span>Exact Ingredients</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {meal.ingredients.map((ing, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2.5 rounded-lg bg-stone-50 border border-stone-100 text-xs font-medium text-stone-800"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                  <span>{ing}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Preparation Instructions */}
          <div>
            <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-3">
              Preparation Directions
            </h3>

            <div className="space-y-3">
              {meal.instructions.map((step, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-stone-700 leading-relaxed">
                  <span className="w-5 h-5 rounded-full bg-stone-900 text-white font-bold flex items-center justify-center shrink-0 text-[11px] mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-100 bg-stone-50/50 flex items-center justify-between">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-stone-700 bg-white border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Recipe</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
