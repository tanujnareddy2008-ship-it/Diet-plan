import React, { useState } from 'react';
import { UserProfile, MetricsSummary } from '../types/diet';
import {
  Send,
  Sparkles,
  MessageSquare,
  HelpCircle,
  Lightbulb,
} from 'lucide-react';

interface DietitianCoachChatProps {
  user: UserProfile;
  metrics: MetricsSummary;
}

interface Message {
  sender: 'user' | 'coach';
  text: string;
  time: string;
}

export const DietitianCoachChat: React.FC<DietitianCoachChatProps> = ({ user, metrics }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'coach',
      text: `Hello! I'm your NutriLife clinical wellness advisor. Based on your physical parameters (${user.heightCm}cm, ${user.weightKg}kg) and ${user.routine.replace('_', ' ')} routine, your target intake is ${metrics.targetCalories} kcal with ${metrics.macros.proteinGrams}g of protein. What dietary or activity questions can I help you with today?`,
      time: 'Just now',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sampleQuestions = [
    'How do I prevent 3 PM afternoon energy crashes?',
    'What is the ideal pre- and post-workout meal timing?',
    'How can I handle social dining out without derailing my caloric target?',
    'Why is the post-lunch walk so effective for my glucose control?',
  ];

  const handleSend = async (questionText?: string) => {
    const q = (questionText || inputValue).trim();
    if (!q || isLoading) return;

    const userMsg: Message = {
      sender: 'user',
      text: q,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/health/ask-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          userContext: {
            age: user.age,
            sex: user.sex,
            heightCm: user.heightCm,
            weightKg: user.weightKg,
            routine: user.routine,
            goal: user.goal,
            dietPreference: user.dietPreference,
            targetCalories: metrics.targetCalories,
            targetProtein: metrics.macros.proteinGrams,
          },
        }),
      });

      if (!res.ok) throw new Error('API unavailable');
      const data = await res.json();
      const coachMsg: Message = {
        sender: 'coach',
        text: data.answer || 'Focus on continuous whole foods and steady hydration.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, coachMsg]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'coach',
          text: 'Consistency in dietary protein distribution and daily physical steps is the bedrock of metabolic vitality. Feel free to rephrase or ask about meal preparation!',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-2 text-emerald-600 text-xs font-semibold uppercase tracking-wider mb-1">
          <Sparkles className="w-4 h-4" />
          <span>Dietitian & Longevity Consultation</span>
        </div>
        <h2 className="text-2xl font-bold font-display text-stone-900">
          Ask Your Registered Dietitian & Exercise Physiologist
        </h2>
        <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-xl">
          Get instantaneous answers grounded in clinical nutrition, meal substitutions, travel strategies, or routine fine-tuning.
        </p>

        {/* Quick Suggestion Chips */}
        <div className="mt-4 pt-4 border-t border-stone-100">
          <div className="text-xs text-stone-400 font-medium mb-2 flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            <span>Frequent Questions:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {sampleQuestions.map((sq, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSend(sq)}
                className="px-3 py-1.5 text-xs font-medium text-stone-700 bg-stone-50 hover:bg-emerald-50 hover:text-emerald-800 rounded-lg border border-stone-200/80 transition-colors text-left cursor-pointer"
              >
                {sq}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Messages Frame */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-2xs space-y-4 min-h-[350px] flex flex-col justify-between">
        <div className="space-y-4 overflow-y-auto max-h-[500px] pr-1">
          {messages.map((msg, idx) => {
            const isCoach = msg.sender === 'coach';
            return (
              <div
                key={idx}
                className={`flex gap-3 ${isCoach ? 'items-start' : 'items-start flex-row-reverse'}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                    isCoach
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-stone-900 text-white'
                  }`}
                >
                  {isCoach ? 'NL' : 'You'}
                </div>

                <div
                  className={`p-4 rounded-2xl max-w-2xl text-xs sm:text-sm leading-relaxed ${
                    isCoach
                      ? 'bg-stone-50 border border-stone-200/70 text-stone-800'
                      : 'bg-emerald-600 text-white'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                  <span
                    className={`block text-[10px] mt-2 font-mono ${
                      isCoach ? 'text-stone-400' : 'text-emerald-200'
                    }`}
                  >
                    {msg.time}
                  </span>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 text-xs font-bold">
                NL
              </div>
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/70 text-stone-500 text-xs flex items-center gap-2">
                <div className="w-3.5 h-3.5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                <span>Consulting clinical nutrition guidelines...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="pt-4 border-t border-stone-100 flex items-center gap-2"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask about meal swaps, recipe adjustments, or energy pacing..."
            className="flex-1 px-4 py-2.5 text-xs sm:text-sm font-medium border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
