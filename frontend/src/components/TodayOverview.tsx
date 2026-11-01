import React, { useState } from 'react';
import { 
  ArrowRight, 
  Calendar, 
  Award, 
  CheckCircle2, 
  MessageSquare, 
  Clock, 
  Flame, 
  Dumbbell, 
  Activity, 
  Zap, 
  TrendingUp, 
  Search, 
  ShieldCheck, 
  ChevronRight,
  Droplets,
  Heart,
  Moon
} from 'lucide-react';
import { useFitness } from '../context/FitnessContext';
import { ViewMode } from '../types/fitness';

interface TodayOverviewProps {
  onNavigate: (view: ViewMode) => void;
  onStartSession: () => void;
}

export const TodayOverview: React.FC<TodayOverviewProps> = ({
  onNavigate,
  onStartSession,
}) => {
  const { 
    workout,
    settings, 
    totalSetsCompleted, 
    totalSetsPrescribed, 
    completionPercentage,
    totalVolumeLifted,
    weeklyStats,
    aiWeeklySummary,
    userProfile,
    currentUser,
    subscriptions,
    nutritionPlan,
    sendChatMessage
  } = useFitness();

  const [quickQuery, setQuickQuery] = useState('');

  const handleAskCoach = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickQuery.trim()) {
      onNavigate('coach');
      return;
    }
    sendChatMessage(quickQuery.trim());
    setQuickQuery('');
    onNavigate('coach');
  };

  // Derive 7-Day Day Activity Matrix
  const daysOfWeek = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const completedCount = weeklyStats?.completedSessions || (totalSetsCompleted > 0 ? 1 : 0);
  const plannedCount = weeklyStats?.plannedSessions || userProfile?.workoutDaysPerWeek || 4;
  const adherenceRate = weeklyStats?.adherencePercentage ?? Math.min(100, Math.round((completedCount / plannedCount) * 100));

  // Readiness Score calculated from adherence & volume
  const readinessScore = Math.min(96, Math.max(68, Math.round(75 + (adherenceRate * 0.2))));

  // Average RPE from recent logs or baseline
  const recentLogs = weeklyStats?.recentLogs || [];
  const avgRpe = recentLogs.length > 0
    ? (recentLogs.reduce((acc: number, l: any) => acc + (Number(l.perceivedDifficulty) || 8), 0) / recentLogs.length).toFixed(1)
    : '7.8';

  const totalTimeMins = weeklyStats?.totalDurationMinutes || 165;
  const avgSessionMins = completedCount > 0 ? Math.round(totalTimeMins / completedCount) : (userProfile?.sessionDurationMinutes || 50);

  // Daily Nutrition & Macro Metrics
  const dailyCalories = nutritionPlan?.dailyCalories || 2450;
  const proteinGrams = nutritionPlan?.proteinGrams || 165;
  const carbsGrams = nutritionPlan?.carbsGrams || 240;
  const fatsGrams = nutritionPlan?.fatsGrams || 65;
  const waterLiters = ((nutritionPlan?.waterMl || 3200) / 1000).toFixed(1);
  const rawStrategy = nutritionPlan?.dietaryStrategy || 'LEAN_BULK_SURPLUS';
  
  // Format raw database enum string into clean human-readable copy
  const formatStrategy = (strat: string) => {
    return strat
      .split('_')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  };
  const dietaryStrategy = formatStrategy(rawStrategy);

  return (
    <div className="space-y-6 max-w-6xl mx-auto w-full">
      {/* Top Metabolic & Macro Activity Rings Hero Bar */}
      <div className="relative rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 text-white overflow-hidden shadow-xl">
        <div className="absolute -right-16 -top-16 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -bottom-16 w-56 h-56 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          {/* Left Column: Macro Targets & Fueling Blueprint */}
          <div className="max-w-2xl flex-1 space-y-4">
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-white font-medium">Daily Fueling & Macro Rings</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-300 font-semibold">{dietaryStrategy}</span>
            </div>

            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-white">
                Metabolic Targets & Energy Equilibrium
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed text-pretty">
                Calibrated daily intake engineered to support progressive overload, muscle protein synthesis, and systemic neural recovery.
              </p>
            </div>

            {/* 4 Macro Breakdown Telemetry Cards with Functional Color Accents */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              <div className="bg-slate-800/80 border border-slate-700/60 hover:border-sky-500/40 rounded-xl p-3 transition-colors shadow-2xs">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1.5">
                  <span>Calories</span>
                  <div className="w-5 h-5 rounded bg-sky-500/10 text-sky-400 flex items-center justify-center">
                    <Flame className="w-3 h-3" />
                  </div>
                </div>
                <div className="text-xl font-bold font-mono text-white tabular-nums">
                  {dailyCalories.toLocaleString()}
                </div>
                <span className="text-[10px] font-mono text-slate-400 block mt-0.5">Target kcal</span>
              </div>

              <div className="bg-slate-800/80 border border-slate-700/60 hover:border-violet-500/40 rounded-xl p-3 transition-colors shadow-2xs">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1.5">
                  <span>Protein</span>
                  <div className="w-5 h-5 rounded bg-violet-500/10 text-violet-400 flex items-center justify-center">
                    <Zap className="w-3 h-3" />
                  </div>
                </div>
                <div className="text-xl font-bold font-mono text-white tabular-nums">
                  {proteinGrams}g
                </div>
                <span className="text-[10px] font-mono text-slate-400 block mt-0.5">Synthesis target</span>
              </div>

              <div className="bg-slate-800/80 border border-slate-700/60 hover:border-emerald-500/40 rounded-xl p-3 transition-colors shadow-2xs">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1.5">
                  <span>Carbs</span>
                  <div className="w-5 h-5 rounded bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <Activity className="w-3 h-3" />
                  </div>
                </div>
                <div className="text-xl font-bold font-mono text-white tabular-nums">
                  {carbsGrams}g
                </div>
                <span className="text-[10px] font-mono text-slate-400 block mt-0.5">Glycogen fuel</span>
              </div>

              <div className="bg-slate-800/80 border border-slate-700/60 hover:border-amber-500/40 rounded-xl p-3 transition-colors shadow-2xs">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1.5">
                  <span>Healthy Fats</span>
                  <div className="w-5 h-5 rounded bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <ShieldCheck className="w-3 h-3" />
                  </div>
                </div>
                <div className="text-xl font-bold font-mono text-white tabular-nums">
                  {fatsGrams}g
                </div>
                <span className="text-[10px] font-mono text-slate-400 block mt-0.5">Hormonal balance</span>
              </div>
            </div>

            {/* Bottom Fueling Row & Direct Action */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs border-t border-slate-800">
              <div className="flex items-center gap-2 font-mono text-slate-300">
                <Droplets className="w-4 h-4 text-sky-400" />
                <span>Hydration: <strong className="text-white font-mono">{waterLiters}L</strong> daily baseline</span>
              </div>

              <button
                type="button"
                onClick={() => onNavigate('nutrition')}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg font-mono text-xs transition-colors border border-slate-700/80"
              >
                <span>Adjust Nutrition Blueprint</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right Column: Concentric Macro Activity Rings (Integrated, de-nested) */}
          <div className="flex flex-col items-center justify-center shrink-0 self-center lg:pr-4">
            <div className="relative w-44 h-44 flex items-center justify-center">
              <svg className="w-44 h-44 -rotate-90" viewBox="0 0 140 140">
                {/* Ring 1 Track (Calories - Precision Sky) */}
                <circle
                  cx="70"
                  cy="70"
                  r="56"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="8"
                />
                <circle
                  cx="70"
                  cy="70"
                  r="56"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="8"
                  strokeDasharray="351.86"
                  strokeDashoffset="70.37"
                  strokeLinecap="round"
                />

                {/* Ring 2 Track (Protein - Synthesis Violet) */}
                <circle
                  cx="70"
                  cy="70"
                  r="42"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="8"
                />
                <circle
                  cx="70"
                  cy="70"
                  r="42"
                  fill="none"
                  stroke="#a78bfa"
                  strokeWidth="8"
                  strokeDasharray="263.89"
                  strokeDashoffset="44.86"
                  strokeLinecap="round"
                />

                {/* Ring 3 Track (Carbs & Fats - Restorative Emerald) */}
                <circle
                  cx="70"
                  cy="70"
                  r="28"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="8"
                />
                <circle
                  cx="70"
                  cy="70"
                  r="28"
                  fill="none"
                  stroke="#34d399"
                  strokeWidth="8"
                  strokeDasharray="175.93"
                  strokeDashoffset="26.39"
                  strokeLinecap="round"
                />
              </svg>

              {/* Concentric Ring Center Readout */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center rotate-0">
                <Flame className="w-4 h-4 text-sky-400 mb-0.5" />
                <span className="text-base font-bold font-mono text-white tracking-tight tabular-nums">
                  {dailyCalories.toLocaleString()}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  Target kcal
                </span>
              </div>
            </div>

            {/* Ring Legend Tags */}
            <div className="flex items-center gap-3 mt-3 text-[10px] font-mono text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-sky-400" />
                <span>Calories</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-violet-400" />
                <span>Protein</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Carbs/Fats</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 1: Three Core Telemetry Cards with Mini-Visualizations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Activity & Training Rhythm */}
        <div className="bg-white rounded-2xl border border-slate-200/80 hover:border-slate-300 p-5 shadow-2xs flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                  <Activity className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-slate-900">Training Rhythm</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">7-Day Split</span>
            </div>

            {/* 7-Day Activity Matrix Visualization */}
            <div className="py-2">
              <div className="flex items-end justify-between gap-1.5 h-16 px-1">
                {daysOfWeek.map((day, idx) => {
                  const isTrained = idx < completedCount;
                  const isScheduled = idx >= completedCount && idx < plannedCount;
                  const isRest = idx >= plannedCount;
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1.5">
                      <div className="w-full flex flex-col gap-1 items-center justify-end h-11">
                        {/* 3 Stitched Vertical Pillar Blocks */}
                        <span className={`w-full max-w-[14px] h-2.5 rounded-xs transition-colors ${
                          isTrained ? 'bg-sky-600' : isScheduled ? 'border border-sky-300/80 bg-sky-50/50' : 'bg-slate-100'
                        }`} />
                        <span className={`w-full max-w-[14px] h-2.5 rounded-xs transition-colors ${
                          isTrained ? 'bg-sky-700' : isScheduled ? 'border border-sky-200/70 bg-sky-50/30' : isRest ? 'bg-slate-50' : 'bg-slate-200'
                        }`} />
                        <span className={`w-full max-w-[14px] h-2.5 rounded-xs transition-colors ${
                          isTrained ? 'bg-slate-900' : isScheduled ? 'border border-sky-300/80 bg-sky-50/50' : 'bg-slate-100'
                        }`} />
                      </div>
                      <span className={`text-[10px] font-mono font-medium ${
                        isTrained ? 'text-sky-700 font-bold' : isScheduled ? 'text-slate-700 font-semibold' : 'text-slate-400'
                      }`}>
                        {day}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-2 flex items-baseline justify-between">
            <div>
              <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
                {completedCount} <span className="text-xs font-normal text-slate-500">/ {plannedCount} sessions</span>
              </span>
            </div>
            {completedCount > 0 ? (
              <span className="text-[11px] font-mono text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>{adherenceRate}% adherence</span>
              </span>
            ) : (
              <span className="text-[11px] font-mono text-sky-700 font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
                <span>Week starting</span>
              </span>
            )}
          </div>
        </div>

        {/* Card 2: Training Duration & Load Trend */}
        <div className="bg-white rounded-2xl border border-slate-200/80 hover:border-slate-300 p-5 shadow-2xs flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-slate-900">Training Time</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Total Hours</span>
            </div>

            {/* Stepped Load Progression Waveform with Electric Gradient */}
            <div className="h-16 flex items-center justify-center py-1">
              <svg className="w-full h-12 overflow-visible" viewBox="0 0 160 40">
                <defs>
                  <linearGradient id="durationGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path
                  d="M 0 35 L 25 35 L 25 22 L 60 22 L 60 12 L 105 12 L 105 6 L 160 6"
                  fill="none"
                  stroke="#4f46e5"
                  strokeWidth="2.25"
                  strokeLinecap="round"
                />
                <path
                  d="M 0 35 L 25 35 L 25 22 L 60 22 L 60 12 L 105 12 L 105 6 L 160 6 L 160 40 L 0 40 Z"
                  fill="url(#durationGrad)"
                />
                <circle cx="160" cy="6" r="3.5" fill="#4f46e5" />
              </svg>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-2 flex items-baseline justify-between">
            <div>
              <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
                {Math.floor(totalTimeMins / 60)}h {totalTimeMins % 60}m
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-600">
              Avg <span className="font-semibold text-slate-900">{avgSessionMins}m</span> / session
            </span>
          </div>
        </div>

        {/* Card 3: Intensity & Effort (RPE Gauge with Thermal Exertion Spectrum) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 hover:border-slate-300 p-5 shadow-2xs flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Flame className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-slate-900">Intensity & Strain</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Scale 1-10</span>
            </div>

            {/* RPE Exertion Distribution Pillars with Color Graduation */}
            <div className="py-2">
              <div className="flex items-end justify-between gap-1.5 h-16 px-1">
                {[6, 8, 8, 7, 9, 0, 0].map((val, idx) => {
                  const isDayOff = val === 0;
                  const heightPct = isDayOff ? 15 : (val / 10) * 100;
                  const isOverload = val >= 8.5;
                  const isHypertrophy = val >= 7.5 && val < 8.5;
                  const isActive = val > 0 && val < 7.5;
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1.5">
                      <div className="w-full h-11 flex items-end justify-center">
                        <div
                          style={{ height: `${heightPct}%` }}
                          className={`w-full max-w-[12px] rounded-xs transition-all ${
                            isDayOff
                              ? 'bg-slate-100'
                              : isOverload
                              ? 'bg-amber-500 shadow-2xs'
                              : isHypertrophy
                              ? 'bg-slate-800'
                              : 'bg-sky-600/70'
                          }`}
                          title={`Day ${daysOfWeek[idx]}: RPE ${val || 'Rest'}`}
                        />
                      </div>
                      <span className="text-[9px] font-mono text-slate-400">
                        {daysOfWeek[idx]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-2 flex items-baseline justify-between">
            <div>
              <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
                {avgRpe} <span className="text-xs font-normal text-slate-500">RPE</span>
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/60 font-medium">
              Overload Zone
            </span>
          </div>
        </div>
      </div>

      {/* Row 2: Hero Performance & Readiness Module (Split 2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Multi-Wave Performance & Volume Balance */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-2xs flex flex-col justify-between space-y-6">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <span className="text-[11px] font-mono text-slate-500 font-medium block">
                  Performance & Workload Ratio
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  Volume Progression & Fatigue Balance
                </h3>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="flex items-center gap-1.5 text-slate-800 font-medium">
                  <span className="w-2 h-2 rounded-full bg-slate-900" />
                  <span>Stimulus</span>
                </span>
                <span className="flex items-center gap-1.5 text-amber-700 font-medium">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>Fatigue</span>
                </span>
              </div>
            </div>

            {/* Smooth SVG Dual Waveform with Functional Overload Balance */}
            <div className="py-6">
              <svg className="w-full h-32 overflow-visible" viewBox="0 0 320 100">
                <defs>
                  <linearGradient id="wavePrimary" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0f172a" stopOpacity="0.14" />
                    <stop offset="100%" stopColor="#0f172a" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Stimulus Curve (Neural & Muscular Output) */}
                <path
                  d="M 0 70 C 50 30, 90 85, 140 45 C 190 10, 240 60, 320 25"
                  fill="none"
                  stroke="#0f172a"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <path
                  d="M 0 70 C 50 30, 90 85, 140 45 C 190 10, 240 60, 320 25 L 320 100 L 0 100 Z"
                  fill="url(#wavePrimary)"
                />

                {/* Recovery / Fatigue Balance Curve (Kinetic Amber dashed) */}
                <path
                  d="M 0 85 C 60 75, 100 45, 160 65 C 220 85, 270 40, 320 50"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />

                <circle cx="320" cy="25" r="4" fill="#0f172a" />
              </svg>
            </div>

            {/* Muscle Volume Distribution Segment with Controlled Functional Accents */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-semibold text-slate-800">Anatomical Muscle Distribution</span>
                <span className="text-slate-500 tabular-nums">{totalSetsCompleted} sets logged</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full flex overflow-hidden">
                <div style={{ width: '32%' }} className="bg-slate-900" title="Chest & Triceps: 32%" />
                <div style={{ width: '28%' }} className="bg-sky-600" title="Back & Lats: 28%" />
                <div style={{ width: '24%' }} className="bg-emerald-600" title="Quadriceps & Hamstrings: 24%" />
                <div style={{ width: '16%' }} className="bg-amber-500" title="Shoulders & Core: 16%" />
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-600 pt-1">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-900" /> Chest (32%)</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-sky-600" /> Back (28%)</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-600" /> Legs (24%)</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" /> Delts (16%)</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs">
            <span className="text-slate-500 font-mono">
              Prescribed cumulative load: <span className="font-semibold text-slate-900">{totalVolumeLifted.toLocaleString()} {settings.weightUnit}</span>
            </span>
            <button
              type="button"
              onClick={() => onNavigate('progress')}
              className="font-semibold text-slate-900 hover:text-slate-700 flex items-center gap-1"
            >
              <span>View full analytics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Column (5 cols): Radial Arc Readiness & Fueling Gauge */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-2xs flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[11px] font-mono text-slate-500 font-medium block">
                  Weekly Index
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Athlete Readiness
                </h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 text-[10px] font-mono font-semibold">
                Optimal
              </span>
            </div>

            {/* Telemetry Domain Mode Icons (Directly from Reference Aesthetic) */}
            <div className="flex items-center justify-center gap-2 pt-4 pb-1">
              {[
                { icon: Activity, label: 'Kinetics', active: true },
                { icon: Dumbbell, label: 'Overload', active: false },
                { icon: Zap, label: 'Neural', active: true },
                { icon: Heart, label: 'Cardio', active: false },
                { icon: Moon, label: 'Circadian', active: true },
              ].map((domain, idx) => {
                const IconComponent = domain.icon;
                return (
                  <div
                    key={idx}
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs transition-colors ${
                      domain.active
                        ? 'bg-slate-900 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-400 hover:text-slate-600'
                    }`}
                    title={domain.label}
                  >
                    <IconComponent className="w-3.5 h-3.5" />
                  </div>
                );
              })}
            </div>

            {/* Radial Arc Speedometer Gauge (SVG) */}
            <div className="flex flex-col items-center justify-center py-6">
              <div className="relative w-48 h-32 flex items-center justify-center">
                <svg className="w-48 h-48 overflow-visible" viewBox="0 0 120 120">
                  <defs>
                    <linearGradient id="readinessGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#0284c7" />
                      <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                  </defs>

                  {/* Background Track Arc */}
                  <path
                    d="M 20 95 A 50 50 0 1 1 100 95"
                    fill="none"
                    stroke="#f1f5f9"
                    strokeWidth="10"
                    strokeLinecap="round"
                  />
                  {/* Gauge Ticks */}
                  {Array.from({ length: 25 }).map((_, i) => {
                    const angle = -210 + i * 10;
                    const rad = (angle * Math.PI) / 180;
                    const x1 = 60 + 44 * Math.cos(rad);
                    const y1 = 60 + 44 * Math.sin(rad);
                    const x2 = 60 + 38 * Math.cos(rad);
                    const y2 = 60 + 38 * Math.sin(rad);
                    return (
                      <line
                        key={i}
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke="#cbd5e1"
                        strokeWidth="1"
                      />
                    );
                  })}
                  {/* Active Value Arc (Sky-to-Mint Gradient) */}
                  <path
                    d="M 20 95 A 50 50 0 1 1 100 95"
                    fill="none"
                    stroke="url(#readinessGrad)"
                    strokeWidth="10"
                    strokeDasharray="210"
                    strokeDashoffset={210 - (210 * (readinessScore / 100))}
                    strokeLinecap="round"
                  />
                </svg>

                {/* Centered Readout Value */}
                <div className="absolute top-12 flex flex-col items-center text-center">
                  <span className="text-4xl font-bold font-mono tracking-tight text-slate-900 tabular-nums">
                    {readinessScore}%
                  </span>
                  <span className="text-[11px] font-mono text-slate-500 font-medium">
                    Stability Index
                  </span>
                </div>
              </div>

              <div className="text-center mt-2">
                <p className="text-xs font-semibold text-slate-900">
                  Balanced Training & Recovery State
                </p>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                  Progressive stimulus within adaptive recovery threshold
                </p>
              </div>
            </div>

            {/* Biometric Oscillation & Recovery Breakdown (Inspired by Stability Telemetry) */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-3">
              {/* Harmonic Multi-Wave Oscillation */}
              <div className="h-6 flex items-center justify-center">
                <svg className="w-full h-6 overflow-visible" viewBox="0 0 200 24">
                  <path
                    d="M 0 12 Q 25 3, 50 12 T 100 12 T 150 12 T 200 12"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="1.5"
                    strokeOpacity="0.75"
                  />
                  <path
                    d="M 0 12 Q 25 21, 50 12 T 100 12 T 150 12 T 200 12"
                    fill="none"
                    stroke="#0284c7"
                    strokeWidth="1.5"
                    strokeOpacity="0.75"
                  />
                  <path
                    d="M 0 12 Q 12.5 7, 25 12 T 50 12 T 75 12 T 100 12 T 125 12 T 150 12 T 175 12 T 200 12"
                    fill="none"
                    stroke="#94a3b8"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                </svg>
              </div>

              {/* 3 Biometric Telemetry Chips */}
              <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
                <div className="bg-white p-2 rounded-xl border border-slate-200/80 shadow-2xs">
                  <div className="flex items-center justify-center gap-1 text-slate-400 mb-0.5">
                    <Heart className="w-3 h-3 text-rose-500" />
                    <span>RHR</span>
                  </div>
                  <span className="font-bold text-slate-900 text-xs tabular-nums">62 bpm</span>
                  <span className="text-[9px] text-slate-400 block mt-0.5">Optimal</span>
                </div>

                <div className="bg-white p-2 rounded-xl border border-slate-200/80 shadow-2xs">
                  <div className="flex items-center justify-center gap-1 text-slate-400 mb-0.5">
                    <Activity className="w-3 h-3 text-sky-500" />
                    <span>HRV Rec</span>
                  </div>
                  <span className="font-bold text-slate-900 text-xs tabular-nums">82%</span>
                  <span className="text-[9px] text-emerald-800 font-semibold block mt-0.5">+4% vs avg</span>
                </div>

                <div className="bg-white p-2 rounded-xl border border-slate-200/80 shadow-2xs">
                  <div className="flex items-center justify-center gap-1 text-slate-400 mb-0.5">
                    <Moon className="w-3 h-3 text-indigo-500" />
                    <span>Sleep</span>
                  </div>
                  <span className="font-bold text-slate-900 text-xs tabular-nums">7h 45m</span>
                  <span className="text-[9px] text-slate-400 block mt-0.5">Restorative</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => onNavigate('nutrition')}
              className="text-slate-600 hover:text-slate-950 font-mono text-[11px]"
            >
              Adjust Nutrition
            </button>
            <button
              type="button"
              onClick={() => onNavigate('workout')}
              className="min-h-[36px] px-3.5 py-1.5 bg-slate-900 text-white rounded-xl font-semibold text-xs hover:bg-slate-800 transition-colors shadow-2xs flex items-center gap-1.5"
            >
              <span>Go to Workout Split</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Row 3: Coaching Insight Banner & Recent History */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Weekly Coaching Insight */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-lg bg-slate-900 text-white flex items-center justify-center">
                <MessageSquare className="w-3.5 h-3.5 text-slate-200" />
              </div>
              <span className="text-xs font-semibold text-slate-900">Weekly Coach Guidance</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed text-pretty">
              {aiWeeklySummary ||
                `Profile calibrated for ${userProfile?.fitnessLevel || 'INTERMEDIATE'} level with target focus on ${
                  userProfile?.goals.map(g => g.replace('_', ' ')).join(', ') || 'Muscle Building'
                }. Consistent tempo and progressive overload are on track.`}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('coach')}
            className="text-xs font-semibold text-slate-900 hover:text-slate-700 flex items-center gap-1 self-start"
          >
            <span>Ask for progressive overload cues</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Assigned Human Coach or Verification Banner */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-slate-900 text-white flex items-center justify-center">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-200" />
                </div>
                <span className="text-xs font-semibold text-slate-900">Certified Coaching Support</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                {subscriptions.filter(s => s.status === 'ACTIVE').length > 0 ? 'Active 1-on-1' : 'Independent'}
              </span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              {subscriptions.filter(s => s.status === 'ACTIVE').length > 0
                ? `Dedicated programming review by ${subscriptions[0].coachProfile?.user?.name || 'Coach Sarah Jenkins'}. Form check updates available.`
                : 'Work with verified CSCS strength coaches for customized periodization reviews and live feedback.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('coaches')}
            className="text-xs font-semibold text-slate-900 hover:text-slate-700 flex items-center gap-1 self-start"
          >
            <span>{subscriptions.filter(s => s.status === 'ACTIVE').length > 0 ? 'Manage coaching plan' : 'Explore certified coaches'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
