import React, { useState } from 'react';
import { ScheduledActivity, UserProfile } from '../types/diet';
import {
  Clock,
  Sun,
  Activity,
  Footprints,
  Moon,
  Eye,
  CheckCircle2,
  Circle,
  Sparkles,
  Dumbbell,
  ShieldAlert,
} from 'lucide-react';

interface DailyRoutineTimelineProps {
  schedule: ScheduledActivity[];
  user: UserProfile;
}

export const DailyRoutineTimeline: React.FC<DailyRoutineTimelineProps> = ({ schedule, user }) => {
  const [completedActivities, setCompletedActivities] = useState<string[]>([]);

  const toggleComplete = (id: string) => {
    if (completedActivities.includes(id)) {
      setCompletedActivities(completedActivities.filter((actId) => actId !== id));
    } else {
      setCompletedActivities([...completedActivities, id]);
    }
  };

  const getCategoryIcon = (category: ScheduledActivity['category']) => {
    switch (category) {
      case 'morning_ritual':
        return <Sun className="w-4 h-4 text-amber-500" />;
      case 'mobility':
        return <Activity className="w-4 h-4 text-emerald-500" />;
      case 'ergonomics':
        return <Eye className="w-4 h-4 text-indigo-500" />;
      case 'digestive_walk':
        return <Footprints className="w-4 h-4 text-teal-500" />;
      case 'workout':
        return <Dumbbell className="w-4 h-4 text-rose-500" />;
      case 'sleep_hygiene':
        return <Moon className="w-4 h-4 text-purple-500" />;
      default:
        return <Activity className="w-4 h-4 text-stone-500" />;
    }
  };

  const completedPct = Math.round((completedActivities.length / schedule.length) * 100);

  return (
    <div className="space-y-6">
      {/* Visual Editorial Header with Generated Asset */}
      <div className="relative rounded-2xl overflow-hidden border border-stone-200 bg-stone-900 text-white min-h-[180px] sm:min-h-[220px] flex items-end p-6 sm:p-8">
        <img
          src="/src/assets/images/healthy_vitality_routine_lifestyle_1790582021760.jpg"
          alt="Healthy vitality lifestyle morning routine"
          className="absolute inset-0 w-full h-full object-cover opacity-35"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-900/60 to-transparent" />

        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold tracking-wider uppercase mb-1">
            <span>Circadian Rhythm Protocol</span>
            <span aria-hidden="true">·</span>
            <span>Longevity & Healthy Living</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-white">
            Daily Activities for a High-Vitality Life
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-stone-300 leading-relaxed">
            Personalized micro-actions aligned with your {user.wakeTime} wake-up time and {user.routine.replace('_', ' ')} schedule to prevent fatigue, support posture, and maximize sleep quality.
          </p>
        </div>
      </div>

      {/* Routine Compliance Progress Card */}
      <div className="bg-white border border-stone-200 rounded-xl p-4 sm:p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-stone-900">Today's Activity Adherence</div>
          <p className="text-xs text-stone-500 mt-0.5">
            {completedActivities.length} of {schedule.length} daily wellness habits checked off
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-36 bg-stone-100 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${completedPct}%` }}
            />
          </div>
          <span className="text-xs font-mono font-bold text-stone-900 tabular-nums">
            {completedPct}%
          </span>
        </div>
      </div>

      {/* Chronological Timeline */}
      <div className="space-y-4">
        {schedule.map((activity, idx) => {
          const isDone = completedActivities.includes(activity.id);

          return (
            <div
              key={activity.id}
              className={`bg-white border rounded-xl p-5 shadow-2xs transition-all ${
                isDone ? 'border-emerald-300 bg-emerald-50/20' : 'border-stone-200 hover:border-stone-300'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3.5">
                  {/* Category icon */}
                  <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100 shrink-0 mt-0.5">
                    {getCategoryIcon(activity.category)}
                  </div>

                  {/* Title and details */}
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
                      <span className="font-mono font-semibold text-stone-900 tabular-nums">
                        {activity.time}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{activity.durationMinutes} min</span>
                      <span aria-hidden="true">·</span>
                      <span className="capitalize">{activity.intensity} intensity</span>
                    </div>

                    <h3 className={`text-base font-bold font-display ${isDone ? 'text-stone-700 line-through' : 'text-stone-900'}`}>
                      {activity.title}
                    </h3>

                    <p className="text-xs text-stone-600 leading-relaxed max-w-3xl">
                      {activity.description}
                    </p>

                    {/* Actionable Steps */}
                    <div className="pt-2">
                      <div className="text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                        How to Execute:
                      </div>
                      <ul className="space-y-1">
                        {activity.actionableSteps.map((step, sIdx) => (
                          <li key={sIdx} className="text-xs text-stone-600 flex items-start gap-2">
                            <span className="text-emerald-600 font-bold shrink-0 mt-0.5">•</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Scientific Benefit Callout */}
                    <div className="mt-2.5 pt-2 border-t border-stone-100 flex items-start gap-2 text-[11px] text-stone-500">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong className="text-stone-700 font-medium">Physiological Rationale:</strong> {activity.scientificBenefit}</span>
                    </div>
                  </div>
                </div>

                {/* Checkbox button */}
                <button
                  type="button"
                  onClick={() => toggleComplete(activity.id)}
                  className={`p-2 rounded-lg transition-colors shrink-0 cursor-pointer ${
                    isDone
                      ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
                      : 'text-stone-300 hover:text-stone-500 hover:bg-stone-50'
                  }`}
                  title={isDone ? 'Mark as incomplete' : 'Mark as completed'}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-6 h-6 fill-emerald-100 text-emerald-600" />
                  ) : (
                    <Circle className="w-6 h-6 text-stone-300" />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Golden Rules for Healthy Living */}
      <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6">
        <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-4">
          Core Pillars to Lead a Healthy Life
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-stone-200/80 shadow-2xs">
            <div className="text-xs font-bold text-stone-900 mb-1 flex items-center gap-1.5">
              <Footprints className="w-4 h-4 text-emerald-600" />
              <span>Step Count Baseline</span>
            </div>
            <p className="text-xs text-stone-500 leading-relaxed">
              Target 8,000–10,000 non-exercise physical activity steps daily. Regular low-grade movement preserves mitochondrial health better than 1 intense workout followed by 8 hours of unbroken sitting.
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-stone-200/80 shadow-2xs">
            <div className="text-xs font-bold text-stone-900 mb-1 flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-indigo-600" />
              <span>Postural Decompression</span>
            </div>
            <p className="text-xs text-stone-500 leading-relaxed">
              Every 45 minutes of desk work, activate your glutes and open your chest against a doorway for 30 seconds to prevent anterior pelvic tilt and forward-head postural syndrome.
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-stone-200/80 shadow-2xs">
            <div className="text-xs font-bold text-stone-900 mb-1 flex items-center gap-1.5">
              <Moon className="w-4 h-4 text-purple-600" />
              <span>Circadian Sleep Sanctuary</span>
            </div>
            <p className="text-xs text-stone-500 leading-relaxed">
              Maintain your bedroom at 18-20°C (65-68°F) in pitch-black darkness. A drop in core body temperature is mandatory to enter stage-4 slow-wave restorative sleep.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
