import React, { useState } from 'react';
import { ShoppingCart, Check, Copy, Printer, CheckCircle2 } from 'lucide-react';

interface GroceryCategory {
  category: string;
  items: { name: string; amount: string; checked?: boolean }[];
}

interface GroceryListViewProps {
  categories: GroceryCategory[];
  dietPreference: string;
}

export const GroceryListView: React.FC<GroceryListViewProps> = ({
  categories: initialCategories,
  dietPreference,
}) => {
  const [categories, setCategories] = useState<GroceryCategory[]>(initialCategories);
  const [copied, setCopied] = useState(false);

  const toggleItem = (catIdx: number, itemIdx: number) => {
    const updated = [...categories];
    const current = updated[catIdx].items[itemIdx].checked;
    updated[catIdx].items[itemIdx].checked = !current;
    setCategories(updated);
  };

  const handleCopy = () => {
    let text = `🛒 NutriLife Weekly Whole-Food Grocery List (${dietPreference})\n\n`;
    categories.forEach((cat) => {
      text += `--- ${cat.category.toUpperCase()} ---\n`;
      cat.items.forEach((item) => {
        text += `[${item.checked ? 'x' : ' '}] ${item.name} (${item.amount})\n`;
      });
      text += `\n`;
    });

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const totalItems = categories.reduce((sum, c) => sum + c.items.length, 0);
  const checkedItems = categories.reduce(
    (sum, c) => sum + c.items.filter((i) => i.checked).length,
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 text-xs font-semibold uppercase tracking-wider mb-1">
            <ShoppingCart className="w-4 h-4" />
            <span>Weekly Whole-Food Preparation</span>
          </div>
          <h2 className="text-2xl font-bold font-display text-stone-900">
            Categorized Grocery Checklist
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-xl">
            Streamlined grocery list aggregated across your 7-day meal plan to eliminate food waste and stock whole, nutrient-dense ingredients.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy List</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print List</span>
          </button>
        </div>
      </div>

      {/* Progress pill */}
      <div className="flex items-center justify-between bg-emerald-50/50 border border-emerald-200/60 rounded-xl px-4 py-3 text-xs text-emerald-950 font-medium">
        <span>Shopping Cart Completion</span>
        <span className="font-mono font-semibold">
          {checkedItems} of {totalItems} items in cart ({Math.round((checkedItems / totalItems) * 100)}%)
        </span>
      </div>

      {/* 4 Categorized Columns / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map((category, catIdx) => (
          <div
            key={category.category}
            className="bg-white border border-stone-200 rounded-2xl p-6 shadow-2xs space-y-3"
          >
            <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider pb-2 border-b border-stone-100">
              {category.category}
            </h3>

            <div className="space-y-2">
              {category.items.map((item, itemIdx) => {
                const isChecked = !!item.checked;
                return (
                  <div
                    key={item.name}
                    onClick={() => toggleItem(catIdx, itemIdx)}
                    className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-all ${
                      isChecked
                        ? 'bg-stone-50 border-stone-200 text-stone-400 line-through'
                        : 'border-stone-100 hover:border-stone-200 hover:bg-stone-50 text-stone-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                          isChecked ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-stone-300'
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className="text-xs font-medium">{item.name}</span>
                    </div>

                    <span className="text-[11px] font-mono text-stone-500 shrink-0">
                      {item.amount}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
