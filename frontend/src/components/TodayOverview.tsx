import React, { useState } from 'react';
import ReactECharts from 'echarts-for-react';
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

  const currentDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  // ECharts Option 1: Volume Progression & Overload Dynamics (Large Bento Chart)
  const volumeChartOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#0f172a',
      borderColor: '#1e293b',
      borderWidth: 1,
      textStyle: { color: '#f8fafc', fontFamily: 'monospace', fontSize: 11 },
      padding: [8, 12],
    },
    grid: { top: 25, right: 15, bottom: 25, left: 45, containLabel: false },
    xAxis: {
      type: 'category',
      data: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Current'],
      boundaryGap: false,
      axisLine: { lineStyle: { color: '#e2e8f0' } },
      axisTick: { show: false },
      axisLabel: { color: '#94a3b8', fontSize: 10, fontFamily: 'monospace' },
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' } },
      axisLabel: {
        color: '#94a3b8',
        fontSize: 10,
        fontFamily: 'monospace',
        formatter: (val: number) => `${Math.round(val / 1000)}k`,
      },
    },
    series: [
      {
        name: 'Neural Stimulus',
        type: 'line',
        smooth: true,
        showSymbol: false,
        data: [12500, 14200, 16100, 15400, 18200, 19600, totalVolumeLifted > 0 ? totalVolumeLifted : 21400],
        lineStyle: {
          width: 3,
          color: '#00F0FF',
          shadowColor: 'rgba(0, 240, 255, 0.7)',
          shadowBlur: 10,
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(0, 240, 255, 0.28)' },
              { offset: 1, color: 'rgba(0, 240, 255, 0.0)' },
            ],
          },
        },
      },
      {
        name: 'Fatigue Accumulation',
        type: 'line',
        smooth: true,
        showSymbol: false,
        data: [9800, 11200, 13100, 11900, 14200, 15100, 16400],
        lineStyle: {
          width: 2,
          type: 'dashed',
          color: '#FF007F',
          shadowColor: 'rgba(255, 0, 127, 0.6)',
          shadowBlur: 8,
        },
      },
    ],
  };

  // ECharts Option 2: Athlete Readiness Gauge (Speedometer)
  const readinessGaugeOption = {
    backgroundColor: 'transparent',
    series: [
      {
        type: 'gauge',
        startAngle: 210,
        endAngle: -30,
        min: 0,
        max: 100,
        radius: '95%',
        center: ['50%', '58%'],
        splitNumber: 5,
        itemStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 1, y2: 0,
            colorStops: [
              { offset: 0, color: '#00F0FF' },
              { offset: 1, color: '#00FFA3' },
            ],
          },
          shadowColor: 'rgba(0, 240, 255, 0.65)',
          shadowBlur: 12,
        },
        progress: { show: true, width: 9, roundCap: true },
        pointer: { show: false },
        axisLine: { lineStyle: { width: 9, color: [[1, '#f1f5f9']] }, roundCap: true },
        axisTick: { distance: -16, length: 3, lineStyle: { color: '#cbd5e1', width: 1 } },
        splitLine: { distance: -20, length: 7, lineStyle: { color: '#94a3b8', width: 1.5 } },
        axisLabel: { show: false },
        title: {
          offsetCenter: [0, '32%'],
          fontSize: 10,
          color: '#64748b',
          fontFamily: 'monospace',
        },
        detail: {
          valueAnimation: true,
          offsetCenter: [0, '-8%'],
          fontSize: 30,
          fontWeight: 'bold',
          fontFamily: 'monospace',
          formatter: '{value}%',
          color: '#0f172a',
        },
        data: [{ value: readinessScore, name: 'STABILITY INDEX' }],
      },
    ],
  };

  // ECharts Option 3: 7-Day Training Rhythm Bar Chart
  const rhythmBarOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#0f172a',
      borderColor: '#1e293b',
      textStyle: { color: '#f8fafc', fontFamily: 'monospace', fontSize: 11 },
      formatter: '{b}: {c} min session',
    },
    grid: { top: 15, right: 8, bottom: 20, left: 8, containLabel: true },
    xAxis: {
      type: 'category',
      data: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#94a3b8', fontSize: 10, fontFamily: 'monospace' },
    },
    yAxis: { show: false },
    series: [
      {
        type: 'bar',
        data: [50, 65, 0, 60, 55, 0, 0],
        barWidth: 16,
        itemStyle: {
          borderRadius: [6, 6, 2, 2],
          color: (params: any) => {
            return params.value > 0
              ? {
                  type: 'linear',
                  x: 0, y: 0, x2: 0, y2: 1,
                  colorStops: [
                    { offset: 0, color: '#00F0FF' },
                    { offset: 1, color: '#0284c7' },
                  ],
                }
              : '#f1f5f9';
          },
          shadowColor: 'rgba(0, 240, 255, 0.5)',
          shadowBlur: (params: any) => (params.value > 0 ? 8 : 0),
        },
      },
    ],
  };

  // ECharts Option 4: Anatomical Muscle Load Radar Chart
  const muscleRadarOption = {
    backgroundColor: 'transparent',
    radar: {
      indicator: [
        { name: 'Chest', max: 100 },
        { name: 'Back', max: 100 },
        { name: 'Quads', max: 100 },
        { name: 'Hams', max: 100 },
        { name: 'Delts', max: 100 },
        { name: 'Core', max: 100 },
      ],
      radius: '66%',
      center: ['50%', '52%'],
      axisName: {
        color: '#64748b',
        fontFamily: 'monospace',
        fontSize: 9,
        fontWeight: 600,
      },
      splitArea: { show: false },
      axisLine: { lineStyle: { color: '#e2e8f0' } },
      splitLine: { lineStyle: { color: '#f1f5f9' } },
    },
    series: [
      {
        type: 'radar',
        data: [
          {
            value: [85, 80, 92, 72, 84, 68],
            name: 'Activation Strain',
            symbol: 'circle',
            symbolSize: 4,
            lineStyle: {
              width: 2.5,
              color: '#00FFA3',
              shadowColor: 'rgba(0, 255, 163, 0.8)',
              shadowBlur: 10,
            },
            itemStyle: { color: '#00FFA3' },
            areaStyle: {
              color: 'rgba(0, 255, 163, 0.24)',
            },
          },
        ],
      },
    ],
  };

  // ECharts Option 5: Intensity & RPE Spectrum Bar Chart
  const intensityBarOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#0f172a',
      borderColor: '#1e293b',
      textStyle: { color: '#f8fafc', fontFamily: 'monospace', fontSize: 11 },
      formatter: '{b}: RPE {c}',
    },
    grid: { top: 15, right: 8, bottom: 20, left: 8, containLabel: true },
    xAxis: {
      type: 'category',
      data: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#94a3b8', fontSize: 10, fontFamily: 'monospace' },
    },
    yAxis: { show: false, min: 0, max: 10 },
    series: [
      {
        type: 'bar',
        data: [6.5, 8.5, 0, 8.0, 9.0, 0, 0],
        barWidth: 16,
        itemStyle: {
          borderRadius: [6, 6, 2, 2],
          color: (params: any) => {
            const val = params.value;
            if (val >= 8.5) return '#FF5500';
            if (val >= 7.5) return '#F59E0B';
            if (val > 0) return '#00F0FF';
            return '#f1f5f9';
          },
          shadowColor: 'rgba(255, 85, 0, 0.55)',
          shadowBlur: (params: any) => (params.value >= 8.5 ? 9 : params.value > 0 ? 5 : 0),
        },
      },
    ],
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto w-full">
      {/* Top Metabolic & Macro Activity Rings Hero Bar (Reduced & Cleaned) */}
      <div className="relative rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-7 text-white overflow-hidden shadow-xl">
        <div className="absolute -right-16 -top-16 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -bottom-16 w-56 h-56 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left Column: Macro Targets & Fueling Blueprint (Streamlined & Compact) */}
          <div className="max-w-2xl flex-1 space-y-3.5">
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-white font-medium">{currentDate}</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-300 font-semibold">{dietaryStrategy}</span>
            </div>

            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Daily Macro Equilibrium
              </h1>
            </div>

            {/* 4 Macro Breakdown Telemetry Cards with Functional Color Accents */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-0.5">
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

          {/* Right Column: Concentric Macro Activity Rings (Pure Athletic Palette - NO Neon Glows) */}
          <div className="flex flex-col items-center justify-center shrink-0 self-center lg:pr-4">
            <div className="relative w-44 h-44 flex items-center justify-center">
              <svg className="w-44 h-44 -rotate-90 overflow-visible" viewBox="0 0 150 150">
                {/* Ring 1 Track (Calories - Sky) */}
                <circle
                  cx="75"
                  cy="75"
                  r="62"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="7"
                />
                <circle
                  cx="75"
                  cy="75"
                  r="62"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="7"
                  strokeDasharray="389.56"
                  strokeDashoffset="77.9"
                  strokeLinecap="round"
                />

                {/* Ring 2 Track (Protein - Synthesis Violet) */}
                <circle
                  cx="75"
                  cy="75"
                  r="48"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="7"
                />
                <circle
                  cx="75"
                  cy="75"
                  r="48"
                  fill="none"
                  stroke="#a78bfa"
                  strokeWidth="7"
                  strokeDasharray="301.59"
                  strokeDashoffset="51.2"
                  strokeLinecap="round"
                />

                {/* Ring 3 Track (Carbs & Fats - Restorative Emerald) */}
                <circle
                  cx="75"
                  cy="75"
                  r="34"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="7"
                />
                <circle
                  cx="75"
                  cy="75"
                  r="34"
                  fill="none"
                  stroke="#34d399"
                  strokeWidth="7"
                  strokeDasharray="213.63"
                  strokeDashoffset="32.0"
                  strokeLinecap="round"
                />
              </svg>

              {/* Concentric Ring Center Readout (Spacious & 100% Legible Without Clipping) */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
                <span className="text-xl font-extrabold font-mono text-white tracking-tight tabular-nums leading-none">
                  {dailyCalories.toLocaleString()}
                </span>
                <span className="text-[10px] font-mono font-medium text-slate-300 uppercase tracking-wider mt-1">
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

      {/* ========================================================================= */}
      {/* Bento Grid Analytics with Neon ECharts Visualizations */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5">
        {/* Bento Card 1 (Large - 8 Cols): Volume & Progressive Overload Progression */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition-colors">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3.5">
              <div>
                <span className="text-[11px] font-mono text-slate-500 font-medium block">
                  Workload & Stimulus Dynamics
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  Volume Progression & Fatigue Balance
                </h3>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono">
                <span className="flex items-center gap-1.5 text-slate-800 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(0,240,255,0.9)]" />
                  <span>Stimulus (Neon Cyan)</span>
                </span>
                <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-pink-500 shadow-[0_0_8px_rgba(255,0,127,0.9)]" />
                  <span>Fatigue (Neon Pink)</span>
                </span>
              </div>
            </div>

            {/* Neon ECharts Line Chart */}
            <div className="pt-2">
              <ReactECharts
                option={volumeChartOption}
                style={{ height: '230px', width: '100%' }}
                opts={{ renderer: 'svg' }}
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-mono">
              Prescribed cumulative load: <strong className="text-slate-900 font-bold tabular-nums">{totalVolumeLifted.toLocaleString()} {settings.weightUnit}</strong>
            </span>
            <button
              type="button"
              onClick={() => onNavigate('progress')}
              className="font-semibold text-slate-900 hover:text-slate-700 flex items-center gap-1"
            >
              <span>View full log history</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Bento Card 2 (Medium - 4 Cols): Athlete Readiness & Stability Index Gauge */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition-colors">
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
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200/60 text-[10px] font-mono font-bold">
                Optimal
              </span>
            </div>

            {/* Neon Speedometer Gauge */}
            <div className="pt-1">
              <ReactECharts
                option={readinessGaugeOption}
                style={{ height: '175px', width: '100%' }}
                opts={{ renderer: 'svg' }}
              />
            </div>

            {/* 3 Biometric Telemetry Chips */}
            <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono pt-1">
              <div className="bg-slate-50/80 p-2 rounded-xl border border-slate-200/80">
                <div className="flex items-center justify-center gap-1 text-slate-400 mb-0.5">
                  <Heart className="w-3 h-3 text-rose-500" />
                  <span>RHR</span>
                </div>
                <span className="font-bold text-slate-900 text-xs tabular-nums">62 bpm</span>
                <span className="text-[9px] text-slate-400 block mt-0.5">Optimal</span>
              </div>

              <div className="bg-slate-50/80 p-2 rounded-xl border border-slate-200/80">
                <div className="flex items-center justify-center gap-1 text-slate-400 mb-0.5">
                  <Activity className="w-3 h-3 text-cyan-500" />
                  <span>HRV</span>
                </div>
                <span className="font-bold text-cyan-700 text-xs tabular-nums">82%</span>
                <span className="text-[9px] text-emerald-700 font-semibold block mt-0.5">+4% vs avg</span>
              </div>

              <div className="bg-slate-50/80 p-2 rounded-xl border border-slate-200/80">
                <div className="flex items-center justify-center gap-1 text-slate-400 mb-0.5">
                  <Moon className="w-3 h-3 text-indigo-500" />
                  <span>Sleep</span>
                </div>
                <span className="font-bold text-slate-900 text-xs tabular-nums">7h 45m</span>
                <span className="text-[9px] text-slate-400 block mt-0.5">Restorative</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-[11px] text-slate-500 font-mono">Neural equilibrium state</span>
            <button
              type="button"
              onClick={() => onNavigate('workout')}
              className="text-slate-900 font-semibold hover:text-slate-700 flex items-center gap-1"
            >
              <span>Go to Split</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Bento Card 3 (Compact - 4 Cols): 7-Day Training Rhythm & Duration */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/80 p-5 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition-colors">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 flex items-center justify-center">
                  <Activity className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-slate-900">Training Rhythm</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">7-Day Split</span>
            </div>

            <div className="pt-1">
              <ReactECharts
                option={rhythmBarOption}
                style={{ height: '145px', width: '100%' }}
                opts={{ renderer: 'svg' }}
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-baseline justify-between">
            <div>
              <span className="text-xl font-bold font-mono text-slate-900 tabular-nums">
                {completedCount} <span className="text-xs font-normal text-slate-500">/ {plannedCount} sessions</span>
              </span>
            </div>
            {completedCount > 0 ? (
              <span className="text-[11px] font-mono text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>{adherenceRate}% adherence</span>
              </span>
            ) : (
              <span className="text-[11px] font-mono text-cyan-700 font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(0,240,255,0.8)]" />
                <span>Week starting</span>
              </span>
            )}
          </div>
        </div>

        {/* Bento Card 4 (Compact - 4 Cols): Anatomical Muscle Activation Radar */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/80 p-5 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition-colors">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center">
                  <Dumbbell className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-slate-900">Muscle Activation</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Radar Balance</span>
            </div>

            <div className="pt-1">
              <ReactECharts
                option={muscleRadarOption}
                style={{ height: '145px', width: '100%' }}
                opts={{ renderer: 'svg' }}
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-mono text-[11px]">Primary muscle recruitment</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/60 font-semibold">
              Balanced
            </span>
          </div>
        </div>

        {/* Bento Card 5 (Compact - 4 Cols): Intensity & RPE Spectrum */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/80 p-5 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition-colors">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-orange-500/10 text-orange-500 border border-orange-500/20 flex items-center justify-center">
                  <Flame className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-slate-900">Intensity & Strain</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Scale 1-10</span>
            </div>

            <div className="pt-1">
              <ReactECharts
                option={intensityBarOption}
                style={{ height: '145px', width: '100%' }}
                opts={{ renderer: 'svg' }}
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-baseline justify-between">
            <div>
              <span className="text-xl font-bold font-mono text-slate-900 tabular-nums">
                {avgRpe} <span className="text-xs font-normal text-slate-500">RPE</span>
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-orange-50 text-orange-800 border border-orange-200/60 font-medium">
              Overload Zone
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
