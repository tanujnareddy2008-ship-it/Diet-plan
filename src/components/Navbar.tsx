import React from 'react';
import { Apple, Printer, Sparkles, RotateCcw } from 'lucide-react';

interface NavbarProps {
  onPrint: () => void;
  onReset: () => void;
  hasPlan: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onPrint,
  onReset,
  hasPlan,
  activeTab,
  setActiveTab,
}) => {
  const navItems = [
    { id: 'diet', label: 'Diet Plan' },
    { id: 'routine', label: 'Daily Routine' },
    { id: 'metrics', label: 'Metrics & Macros' },
    { id: 'groceries', label: 'Grocery List' },
    { id: 'tracker', label: 'Daily Tracker' },
    { id: 'coach', label: 'Dietitian Q&A' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Single element brand wordmark */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('diet')}>
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm shadow-emerald-600/20">
              <Apple className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-stone-900 font-display">
              Nutri<span className="text-emerald-600">Life</span>
            </span>
          </div>

          {/* Zone 2: 4-6 clean text navigation links */}
          {hasPlan && (
            <nav className="hidden md:flex items-center gap-1 sm:gap-2">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                      isActive
                        ? 'bg-stone-100 text-emerald-800 font-semibold'
                        : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>
          )}

          {/* Zone 3: 1-2 primary actions */}
          <div className="flex items-center gap-2">
            {hasPlan && (
              <>
                <button
                  onClick={onPrint}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-700 bg-white border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors shadow-2xs whitespace-nowrap"
                  title="Print or Save PDF"
                >
                  <Printer className="w-3.5 h-3.5 text-stone-500" />
                  <span className="hidden sm:inline">Export / Print</span>
                </button>

                <button
                  onClick={onReset}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors whitespace-nowrap"
                  title="Recalculate or Edit Profile"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-stone-500" />
                  <span className="hidden sm:inline">New Plan</span>
                </button>
              </>
            )}

            {!hasPlan && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Science-Backed Precision</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
