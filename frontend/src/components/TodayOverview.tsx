import React, { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { AnimatedNumber } from './AnimatedNumber';
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
    totalPrescribedVolume,
    splitDays,
    weeklyStats,
    aiWeeklySummary,
    userProfile,
    currentUser,
    subscriptions,
    nutritionPlan,
    sendChatMessage,
    isDemoMode,
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

  // Derive 7-Day Day Activity Matrix & Database Records
  const daysOfWeek = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const recentLogs = weeklyStats?.recentLogs || [];
  
  const realCompletedSessions = weeklyStats?.completedSessions || recentLogs.length;
  const realPlannedSessions = weeklyStats?.plannedSessions || userProfile?.workoutDaysPerWeek || 4;
  const realAdherence = weeklyStats?.adherencePercentage ?? (realPlannedSessions > 0 ? Math.min(100, Math.round((realCompletedSessions / realPlannedSessions) * 100)) : 0);
  const adherenceRate = realAdherence;
  const realTotalMinutes = weeklyStats?.totalDurationMinutes || recentLogs.reduce((acc: number, l: any) => acc + (Number(l.durationMinutes) || 0), 0);
  const realAvgSessionMins = realCompletedSessions > 0 ? Math.round(realTotalMinutes / realCompletedSessions) : (userProfile?.sessionDurationMinutes || 50);

  // Map difficulty enums to RPE scale (EASY=6, MODERATE=7.5, HARD=8.5, VERY_HARD=9.5)
  const difficultyToRpe: Record<string, number> = {
    EASY: 6.0,
    MODERATE: 7.5,
    HARD: 8.5,
    VERY_HARD: 9.5,
  };

  const logsWithRpe = recentLogs.filter((l: any) => l.perceivedDifficulty);
  const realAvgRpe = logsWithRpe.length > 0
    ? (logsWithRpe.reduce((acc: number, l: any) => acc + (difficultyToRpe[l.perceivedDifficulty] || 7.5), 0) / logsWithRpe.length).toFixed(1)
    : '—';

  // Map real logs to 7 days: Mon=0, Tue=1, Wed=2, Thu=3, Fri=4, Sat=5, Sun=6
  const realDayVolume = [0, 0, 0, 0, 0, 0, 0];
  const realDaySets = [0, 0, 0, 0, 0, 0, 0];
  const realDayDuration = [0, 0, 0, 0, 0, 0, 0];
  const realDayRpe = [0, 0, 0, 0, 0, 0, 0];

  recentLogs.forEach((log: any) => {
    if (!log.workoutDate) return;
    const d = new Date(log.workoutDate);
    const dayOfWeek = d.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
    const dayIdx = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // 0=Mon, ..., 6=Sun
    
    const logVol = (log.exercises || []).reduce((acc: number, ex: any) => {
      const sets = Number(ex.setsCompleted) || 0;
      const reps = Number(ex.repsCompleted) || 10;
      const weight = Number(ex.weightUsed) || 0;
      return acc + (sets * reps * weight);
    }, 0);
    const logSets = (log.exercises || []).reduce((acc: number, ex: any) => acc + (Number(ex.setsCompleted) || 0), 0);

    realDayVolume[dayIdx] += logVol;
    realDaySets[dayIdx] += logSets;
    realDayDuration[dayIdx] += Number(log.durationMinutes) || 0;
    realDayRpe[dayIdx] = difficultyToRpe[log.perceivedDifficulty] || 7.5;
  });

  // Inject current active live session if sets/volume logged today
  if (totalVolumeLifted > 0 || totalSetsCompleted > 0) {
    const today = new Date().getDay();
    const todayIdx = today === 0 ? 6 : today - 1;
    realDayVolume[todayIdx] += totalVolumeLifted;
    realDaySets[todayIdx] += totalSetsCompleted;
  }

  const realTotalVolume = realDayVolume.reduce((a, b) => a + b, 0);
  const realTotalSets = realDaySets.reduce((a, b) => a + b, 0);

  // Daily Nutrition & Macro Metrics (Live DB vs Demo Mode)
  const rawStrategy = nutritionPlan?.dietaryStrategy || 'LEAN_BULK_SURPLUS';
  const formatStrategy = (strat: string) => {
    return strat
      .split('_')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  };

  const dailyCalories = isDemoMode ? 2992 : (nutritionPlan?.dailyCalories || 2450);
  const proteinGrams = isDemoMode ? 150 : (nutritionPlan?.proteinGrams || 165);
  const carbsGrams = isDemoMode ? 445 : (nutritionPlan?.carbsGrams || 240);
  const fatsGrams = isDemoMode ? 68 : (nutritionPlan?.fatsGrams || 65);
  const waterLiters = isDemoMode ? '3.2' : ((nutritionPlan?.waterMl || 3000) / 1000).toFixed(1);
  const dietaryStrategy = isDemoMode ? 'Lean Bulk Surplus' : formatStrategy(rawStrategy);

  const currentDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  // =========================================================================
  // Interactive Dashboard States
  // =========================================================================
  const [volumeTimeframe, setVolumeTimeframe] = useState<'7D' | '30D' | '90D'>('7D');
  const [volumeMetric, setVolumeMetric] = useState<'volume' | 'sets'>('volume');
  const [readinessMode, setReadinessMode] = useState<'overall' | 'cns' | 'cardio'>('overall');
  const [selectedDayIdx, setSelectedDayIdx] = useState<number>(() => {
    const today = new Date().getDay();
    return today === 0 ? 6 : today - 1;
  });
  const [muscleFilter, setMuscleFilter] = useState<'all' | 'upper' | 'lower'>('all');
  const [strainMetricMode, setStrainMetricMode] = useState<'both' | 'strain' | 'rpe'>('both');

  // Volume Microcycles Data (Live Database vs Demo Mode)
  const volumeDataMap = isDemoMode
    ? {
        '7D': {
          categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          volumeStimulus: [3850, 4200, 0, 5100, 4600, 0, 5450],
          volumeFatigue: [2600, 2900, 1100, 3800, 3600, 950, 4100],
          setsStimulus: [16, 18, 0, 22, 19, 0, 24],
          setsFatigue: [11, 13, 3, 17, 15, 3, 18],
          activeLoadLabel: '23,200 kg',
        },
        '30D': {
          categories: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
          volumeStimulus: [16800, 18450, 17900, 23200],
          volumeFatigue: [12200, 13800, 13100, 16400],
          setsStimulus: [72, 78, 74, 96],
          setsFatigue: [52, 59, 55, 68],
          activeLoadLabel: '23,200 kg',
        },
        '90D': {
          categories: ['Hypertrophy Block', 'Strength Cycle', 'Deload Phase', 'Peak Overload'],
          volumeStimulus: [74000, 81500, 46000, 98400],
          volumeFatigue: [56000, 63000, 29000, 77000],
          setsStimulus: [310, 345, 180, 420],
          setsFatigue: [235, 270, 120, 335],
          activeLoadLabel: '98,400 kg',
        },
      }
    : {
        '7D': {
          categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          volumeStimulus: realDayVolume,
          volumeFatigue: realDayVolume.map(v => Math.round(v * 0.72)),
          setsStimulus: realDaySets,
          setsFatigue: realDaySets.map(s => Math.round(s * 0.72)),
          activeLoadLabel: `${realTotalVolume.toLocaleString()} kg`,
        },
        '30D': {
          categories: ['Week 1', 'Week 2', 'Week 3', 'Current Week'],
          volumeStimulus: [0, 0, 0, realTotalVolume],
          volumeFatigue: [0, 0, 0, Math.round(realTotalVolume * 0.72)],
          setsStimulus: [0, 0, 0, realTotalSets],
          setsFatigue: [0, 0, 0, Math.round(realTotalSets * 0.72)],
          activeLoadLabel: `${realTotalVolume.toLocaleString()} kg`,
        },
        '90D': {
          categories: ['Month 1', 'Month 2', 'Current Cycle'],
          volumeStimulus: [0, 0, realTotalVolume],
          volumeFatigue: [0, 0, Math.round(realTotalVolume * 0.72)],
          setsStimulus: [0, 0, realTotalSets],
          setsFatigue: [0, 0, Math.round(realTotalSets * 0.72)],
          activeLoadLabel: `${realTotalVolume.toLocaleString()} kg`,
        },
      };

  const currentVolumeData = volumeDataMap[volumeTimeframe];
  const activeStimulusSeries = volumeMetric === 'volume' ? currentVolumeData.volumeStimulus : currentVolumeData.setsStimulus;
  const activeFatigueSeries = volumeMetric === 'volume' ? currentVolumeData.volumeFatigue : currentVolumeData.setsFatigue;

  // 1. ECharts Option: Interactive Volume Progression
  const volumeChartOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#0f172a',
      borderColor: '#334155',
      borderWidth: 1,
      textStyle: { color: '#f8fafc', fontFamily: 'monospace', fontSize: 11 },
      padding: [8, 12],
      formatter: (params: any) => {
        if (!params || !params.length) return '';
        const title = params[0].axisValueLabel;
        const s1 = params[0];
        const s2 = params[1];
        const unit = volumeMetric === 'volume' ? 'kg' : 'sets';
        return `
          <div style="font-weight:600;margin-bottom:4px;color:#94a3b8">${title}</div>
          <div style="display:flex;align-items:center;gap:6px;color:#00F0FF;margin-bottom:2px">
            <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#00F0FF"></span>
            ${s1.seriesName}: <strong>${s1.value.toLocaleString()} ${unit}</strong>
          </div>
          ${s2 ? `
          <div style="display:flex;align-items:center;gap:6px;color:#FF007F">
            <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#FF007F"></span>
            ${s2.seriesName}: <strong>${s2.value.toLocaleString()} ${unit}</strong>
          </div>` : ''}
        `;
      },
    },
    grid: { top: 20, right: 15, bottom: 25, left: 45, containLabel: false },
    xAxis: {
      type: 'category',
      data: currentVolumeData.categories,
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
        formatter: (val: number) => {
          if (volumeMetric === 'sets') return `${val}`;
          return `${Math.round(val / 1000)}k`;
        },
      },
    },
    series: [
      {
        name: 'Workload Stimulus',
        type: 'line',
        smooth: true,
        showSymbol: false,
        data: activeStimulusSeries,
        lineStyle: {
          width: 3,
          color: '#00F0FF',
          shadowColor: 'rgba(0, 240, 255, 0.4)',
          shadowBlur: 8,
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(0, 240, 255, 0.22)' },
              { offset: 1, color: 'rgba(0, 240, 255, 0.0)' },
            ],
          },
        },
      },
      {
        name: 'Systemic Fatigue',
        type: 'line',
        smooth: true,
        showSymbol: false,
        data: activeFatigueSeries,
        lineStyle: {
          width: 2,
          type: 'dashed',
          color: '#FF007F',
          shadowColor: 'rgba(255, 0, 127, 0.4)',
          shadowBlur: 6,
        },
      },
    ],
  };

  // 2. Training Rhythm Data (Live DB vs Demo Mode)
  const demoRhythmData = [
    { day: 'Mon', focus: 'Upper Body Power', sets: 18, duration: 52, rpe: 8.0, volume: 4620, status: 'Completed' },
    { day: 'Tue', focus: 'Posterior Chain & Lats', sets: 20, duration: 60, rpe: 8.5, volume: 5400, status: 'Completed' },
    { day: 'Wed', focus: 'Active Recovery & Core', sets: 8, duration: 30, rpe: 5.5, volume: 1200, status: 'Active Rest' },
    { day: 'Thu', focus: 'Quad Dominance & Squat', sets: 22, duration: 65, rpe: 9.0, volume: 6150, status: 'Peak Overload' },
    { day: 'Fri', focus: 'Delts, Chest & Triceps', sets: 18, duration: 55, rpe: 8.0, volume: 4800, status: 'Scheduled' },
    { day: 'Sat', focus: 'Aerobic Zone 2 Engine', sets: 0, duration: 45, rpe: 6.5, volume: 0, status: 'Cardio' },
    { day: 'Sun', focus: 'Full Neural Restoration', sets: 0, duration: 0, rpe: 0, volume: 0, status: 'Rest' },
  ];

  const liveRhythmData = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((dayName, idx) => {
    const hasLog = realDayDuration[idx] > 0 || realDaySets[idx] > 0;
    const splitIndex = idx < splitDays.length ? idx : -1;
    const splitDay = splitIndex >= 0 ? splitDays[splitIndex] : null;

    let focus = 'Rest & Recovery';
    let status = 'Rest Day';
    let plannedSets = 0;

    if (hasLog) {
      status = 'Completed';
      focus = splitDay?.focus || splitDay?.title?.replace(/^Day \d+:\s*/, '') || 'Workout Completed';
      plannedSets = realDaySets[idx];
    } else if (splitDay && idx < realPlannedSessions) {
      status = 'Scheduled';
      focus = splitDay.focus || splitDay.title?.replace(/^Day \d+:\s*/, '') || 'Scheduled Session';
      plannedSets = splitDay.exercises?.reduce((a: number, e: any) => a + (Number(e.sets) || 3), 0) || 16;
    }

    return {
      day: dayName,
      focus,
      sets: hasLog ? realDaySets[idx] : plannedSets,
      duration: hasLog ? realDayDuration[idx] : 0,
      rpe: hasLog ? realDayRpe[idx] : 0,
      volume: hasLog ? realDayVolume[idx] : 0,
      status,
    };
  });

  const rhythmDailyData = isDemoMode ? demoRhythmData : liveRhythmData;
  const selectedDayTelemetry = rhythmDailyData[selectedDayIdx] || rhythmDailyData[3];

  const rhythmBarOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#0f172a',
      borderColor: '#334155',
      textStyle: { color: '#f8fafc', fontFamily: 'monospace', fontSize: 11 },
      formatter: (params: any) => {
        const item = rhythmDailyData[params[0].dataIndex];
        return `
          <div style="font-weight:600;color:#94a3b8">${item.day} · ${item.focus}</div>
          <div style="color:#00F0FF;font-weight:bold;margin-top:2px">${item.duration > 0 ? `${item.duration} mins` : 'No logs'} · ${item.sets} sets</div>
          <div style="color:#f59e0b;font-size:10px">${item.rpe > 0 ? `RPE ${item.rpe}` : 'Rest'} · ${item.status}</div>
        `;
      },
    },
    grid: { top: 15, right: 8, bottom: 20, left: 8, containLabel: true },
    xAxis: {
      type: 'category',
      data: rhythmDailyData.map(d => d.day),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#94a3b8', fontSize: 10, fontFamily: 'monospace' },
    },
    yAxis: { show: false },
    series: [
      {
        type: 'bar',
        data: rhythmDailyData.map((d, i) => ({
          value: d.duration > 0 ? d.duration : (d.status === 'Scheduled' ? 8 : 0),
          itemStyle: {
            borderRadius: [6, 6, 2, 2],
            color: i === selectedDayIdx
              ? '#00F0FF'
              : d.duration > 0
              ? '#0284c7'
              : '#f1f5f9',
            shadowColor: i === selectedDayIdx ? 'rgba(0, 240, 255, 0.6)' : 'transparent',
            shadowBlur: i === selectedDayIdx ? 10 : 0,
          },
        })),
        barWidth: 16,
      },
    ],
  };

  // 3. ECharts Option: Athlete Readiness Gauge with Mode Toggles (Live DB vs Demo Mode)
  const liveBaseScore = realCompletedSessions > 0 ? Math.min(98, Math.max(65, Math.round(70 + (realAdherence * 0.28)))) : 70;
  const readinessModesConfig = isDemoMode
    ? {
        overall: { score: 88, title: 'Stability index', detailColor: '#0f172a', sub: 'Balanced Training State' },
        cns: { score: 82, title: 'Neural CNS recovery', detailColor: '#0284c7', sub: 'High Motor Recruitment' },
        cardio: { score: 94, title: 'Aerobic efficiency', detailColor: '#10b981', sub: 'Parasympathetic Dominance' },
      }
    : {
        overall: { score: liveBaseScore, title: 'Stability index', detailColor: '#0f172a', sub: realCompletedSessions > 0 ? `${realCompletedSessions}/${realPlannedSessions} sessions completed (${realAdherence}%)` : 'Awaiting first workout check-in' },
        cns: { score: Math.max(50, liveBaseScore - 8), title: 'Neural CNS recovery', detailColor: '#0284c7', sub: `${userProfile?.fitnessLevel || 'Intermediate'} baseline state` },
        cardio: { score: Math.min(98, liveBaseScore + 4), title: 'Aerobic efficiency', detailColor: '#10b981', sub: `${realTotalMinutes}m cardiovascular volume logged` },
      };

  const activeReadinessConfig = readinessModesConfig[readinessMode];

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
          shadowColor: 'rgba(0, 240, 255, 0.4)',
          shadowBlur: 8,
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
          fontSize: 32,
          fontWeight: 'bold',
          fontFamily: 'monospace',
          formatter: '{value}%',
          color: activeReadinessConfig.detailColor,
        },
        data: [{ value: activeReadinessConfig.score, name: activeReadinessConfig.title }],
      },
    ],
  };

  // 4. ECharts Option: Anatomical Muscle Load Radar with Filter
  const muscleDataConfig = {
    all: {
      indicators: [
        { name: 'Chest', max: 100 },
        { name: 'Back', max: 100 },
        { name: 'Quads', max: 100 },
        { name: 'Hams', max: 100 },
        { name: 'Delts', max: 100 },
        { name: 'Core', max: 100 },
      ],
      values: isDemoMode ? [88, 82, 92, 74, 85, 78] : [
        splitDays[0] ? 85 : 0,
        splitDays[1] ? 82 : 0,
        splitDays[2] ? 90 : 0,
        splitDays[3] ? 75 : 0,
        splitDays[0] ? 80 : 0,
        70,
      ],
    },
    upper: {
      indicators: [
        { name: 'Pecs', max: 100 },
        { name: 'Lats', max: 100 },
        { name: 'Traps', max: 100 },
        { name: 'Delts', max: 100 },
        { name: 'Biceps', max: 100 },
        { name: 'Triceps', max: 100 },
      ],
      values: isDemoMode ? [90, 85, 80, 88, 82, 79] : [86, 80, 75, 84, 80, 78],
    },
    lower: {
      indicators: [
        { name: 'Quads', max: 100 },
        { name: 'Hams', max: 100 },
        { name: 'Glutes', max: 100 },
        { name: 'Calves', max: 100 },
        { name: 'Adductors', max: 100 },
        { name: 'Core', max: 100 },
      ],
      values: isDemoMode ? [94, 78, 88, 72, 76, 82] : [90, 76, 84, 70, 74, 80],
    },
  };

  const activeMuscleConfig = muscleDataConfig[muscleFilter];

  const muscleRadarOption = {
    backgroundColor: 'transparent',
    radar: {
      indicator: activeMuscleConfig.indicators,
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
            value: activeMuscleConfig.values,
            name: 'Muscle Activation',
            symbol: 'circle',
            symbolSize: 4,
            lineStyle: {
              width: 2.5,
              color: '#00FFA3',
              shadowColor: 'rgba(0, 255, 163, 0.4)',
              shadowBlur: 6,
            },
            itemStyle: { color: '#00FFA3' },
            areaStyle: {
              color: 'rgba(0, 255, 163, 0.22)',
            },
          },
        ],
      },
    ],
  };

  // 5. Training Duration & Exertion Intensity (Live DB vs Demo Mode)
  const demoStrainDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const demoStrainScores = [14.2, 16.8, 8.4, 18.5, 15.1, 10.5, 4.2];
  const demoRpeScores = [7.5, 8.5, 5.5, 9.0, 8.0, 6.5, 0];

  const activeDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const activePrimaryBars = isDemoMode ? demoStrainScores : realDayDuration;
  const activeIntensityRpe = isDemoMode ? demoRpeScores : realDayRpe;

  const currentAvgRpe = isDemoMode ? '8.1' : realAvgRpe;
  const currentTotalMins = isDemoMode ? '215m' : `${realTotalMinutes}m`;

  // ECharts Option: Intensity & Duration Telemetry Visual
  const intensityBarOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#0f172a',
      borderColor: '#334155',
      textStyle: { color: '#f8fafc', fontFamily: 'monospace', fontSize: 11 },
      formatter: (params: any) => {
        if (!params || !params.length) return '';
        const dayIdx = params[0].dataIndex;
        const dayLabel = activeDays[dayIdx];
        const barVal = activePrimaryBars[dayIdx];
        const rpeVal = activeIntensityRpe[dayIdx];
        const barLabel = isDemoMode ? `Daily Strain: ${barVal} / 21.0` : `Logged Duration: ${barVal} mins`;
        return `
          <div style="font-weight:600;color:#94a3b8;margin-bottom:3px">${dayLabel}</div>
          <div style="color:#FF5500;font-weight:bold">${barLabel}</div>
          <div style="color:#00F0FF;font-weight:bold;margin-top:2px">Intensity: ${rpeVal > 0 ? `RPE ${rpeVal} / 10` : 'No logs recorded'}</div>
        `;
      },
    },
    grid: { top: 20, right: 12, bottom: 20, left: 12, containLabel: true },
    xAxis: {
      type: 'category',
      data: activeDays,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#94a3b8', fontSize: 10, fontFamily: 'monospace' },
    },
    yAxis: [
      {
        type: 'value',
        min: 0,
        max: isDemoMode ? 21 : Math.max(60, ...realDayDuration, 60),
        splitLine: { show: false },
        axisLabel: { show: false },
      },
      {
        type: 'value',
        min: 0,
        max: 10,
        splitLine: { show: false },
        axisLabel: { show: false },
      },
    ],
    series: [
      ...(strainMetricMode !== 'rpe'
        ? [
            {
              name: isDemoMode ? 'Biological Strain' : 'Logged Duration',
              type: 'bar',
              yAxisIndex: 0,
              data: activePrimaryBars.map((val) => ({
                value: val,
                itemStyle: {
                  borderRadius: [6, 6, 2, 2],
                  color: isDemoMode
                    ? (val >= 15 ? '#FF5500' : val >= 10 ? '#F59E0B' : val > 0 ? '#00F0FF' : '#f1f5f9')
                    : (val >= 50 ? '#FF5500' : val >= 30 ? '#00F0FF' : val > 0 ? '#38bdf8' : '#f1f5f9'),
                  shadowColor: val >= (isDemoMode ? 15 : 50) ? 'rgba(255, 85, 0, 0.4)' : 'transparent',
                  shadowBlur: val >= (isDemoMode ? 15 : 50) ? 8 : 0,
                },
              })),
              barWidth: 14,
            },
          ]
        : []),
      ...(strainMetricMode !== 'strain'
        ? [
            {
              name: 'Exertion RPE',
              type: 'line',
              yAxisIndex: 1,
              data: activeIntensityRpe,
              smooth: true,
              symbol: 'circle',
              symbolSize: 6,
              lineStyle: {
                width: 2.5,
                color: '#00FFA3',
                type: 'solid',
                shadowColor: 'rgba(0, 255, 163, 0.5)',
                shadowBlur: 6,
              },
              itemStyle: {
                color: '#00FFA3',
                borderColor: '#0f172a',
                borderWidth: 1.5,
              },
            },
          ]
        : []),
    ],
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto w-full">
      {/* Top Metabolic & Macro Activity Rings Hero Bar (Reduced & Cleaned) */}
      <div className="relative rounded-3xl bg-slate-900 border border-slate-800 dark:bg-[#16171B] dark:border-[#252832] p-6 sm:p-8 text-white overflow-hidden shadow-xl">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left Column: Macro Targets & Fueling Blueprint (Streamlined & Compact) */}
          <div className="max-w-2xl flex-1 space-y-3.5">
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-white font-medium">{currentDate}</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-300 font-semibold">{dietaryStrategy}</span>
            </div>

            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Daily Macro Equilibrium
              </h1>
              <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
                Precision daily fueling engineered for progressive overload, synthesis, and systemic recovery.
              </p>
            </div>

            {/* 4 Macro Breakdown Telemetry Cards with Clean Neutral Chrome */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-0.5">
              <div className="bg-slate-800/80 border border-slate-700/60 hover:border-slate-600 rounded-xl p-3 transition-colors shadow-2xs">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1.5">
                  <span>Calories</span>
                  <div className="w-5 h-5 rounded bg-slate-700/60 text-slate-300 flex items-center justify-center">
                    <Flame className="w-3 h-3" />
                  </div>
                </div>
                <div className="text-xl font-bold font-mono text-white tabular-nums">
                  <AnimatedNumber value={dailyCalories} />
                </div>
                <span className="text-[10px] font-mono text-slate-400 block mt-0.5">Daily target budget</span>
              </div>

              <div className="bg-slate-800/80 border border-slate-700/60 hover:border-slate-600 rounded-xl p-3 transition-colors shadow-2xs">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1.5">
                  <span>Protein</span>
                  <div className="w-5 h-5 rounded bg-slate-700/60 text-slate-300 flex items-center justify-center">
                    <Zap className="w-3 h-3" />
                  </div>
                </div>
                <div className="text-xl font-bold font-mono text-white tabular-nums">
                  <AnimatedNumber value={proteinGrams} suffix="g" />
                </div>
                <span className="text-[10px] font-mono text-slate-400 block mt-0.5">1.8g / kg target</span>
              </div>

              <div className="bg-slate-800/80 border border-slate-700/60 hover:border-slate-600 rounded-xl p-3 transition-colors shadow-2xs">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1.5">
                  <span>Carbs</span>
                  <div className="w-5 h-5 rounded bg-slate-700/60 text-slate-300 flex items-center justify-center">
                    <Activity className="w-3 h-3" />
                  </div>
                </div>
                <div className="text-xl font-bold font-mono text-white tabular-nums">
                  <AnimatedNumber value={carbsGrams} suffix="g" />
                </div>
                <span className="text-[10px] font-mono text-slate-400 block mt-0.5">High-glycogen fuel</span>
              </div>

              <div className="bg-slate-800/80 border border-slate-700/60 hover:border-slate-600 rounded-xl p-3 transition-colors shadow-2xs">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1.5">
                  <span>Healthy Fats</span>
                  <div className="w-5 h-5 rounded bg-slate-700/60 text-slate-300 flex items-center justify-center">
                    <ShieldCheck className="w-3 h-3" />
                  </div>
                </div>
                <div className="text-xl font-bold font-mono text-white tabular-nums">
                  <AnimatedNumber value={fatsGrams} suffix="g" />
                </div>
                <span className="text-[10px] font-mono text-slate-400 block mt-0.5">Hormonal baseline</span>
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
                <span>Adjust nutrition</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right Column: Concentric Macro Activity Rings (Pure Athletic Palette - NO Neon Glows) */}
          <div className="flex flex-col items-center justify-center shrink-0 self-center lg:pr-4">
            <div className="relative w-44 h-44 flex items-center justify-center">
              <svg className="w-44 h-44 -rotate-90 overflow-visible" viewBox="0 0 160 160">
                {/* Ring 1 Track (Calories - Sky) */}
                <circle
                  cx="80"
                  cy="80"
                  r="68"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="5.5"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="68"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="5.5"
                  strokeDasharray="427.26"
                  strokeDashoffset={isDemoMode ? "76.9" : `${(427.26 * (1 - Math.min(1, Math.max(0.25, (totalSetsCompleted > 0 ? totalSetsCompleted / Math.max(1, totalSetsPrescribed) : 0.74))))).toFixed(1)}`}
                  strokeLinecap="round"
                />

                {/* Ring 2 Track (Protein - Synthesis Violet) */}
                <circle
                  cx="80"
                  cy="80"
                  r="56"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="5.5"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="56"
                  fill="none"
                  stroke="#a78bfa"
                  strokeWidth="5.5"
                  strokeDasharray="351.86"
                  strokeDashoffset={isDemoMode ? "59.8" : `${(351.86 * (1 - Math.min(1, Math.max(0.3, adherenceRate / 100)))).toFixed(1)}`}
                  strokeLinecap="round"
                />

                {/* Ring 3 Track (Carbs & Fats - Restorative Emerald) */}
                <circle
                  cx="80"
                  cy="80"
                  r="44"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="5.5"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="44"
                  fill="none"
                  stroke="#34d399"
                  strokeWidth="5.5"
                  strokeDasharray="276.46"
                  strokeDashoffset={isDemoMode ? "41.4" : `${(276.46 * (1 - Math.min(1, Math.max(0.4, (adherenceRate > 0 ? (adherenceRate - 5) / 100 : 0.68))))).toFixed(1)}`}
                  strokeLinecap="round"
                />
              </svg>

              {/* Concentric Ring Center Readout (Generous clear inner diameter 82.5px - 100% unclipped) */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none px-3">
                <AnimatedNumber
                  value={dailyCalories}
                  className="text-lg sm:text-xl font-bold font-mono text-white tracking-normal leading-none"
                />
                <span className="text-[10px] font-mono font-medium text-slate-400 mt-1 uppercase tracking-wider">
                  kcal
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
      {/* Bento Grid Analytics with Interactive Neon ECharts Visualizations */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5">
        {/* Bento Card 1 (Large - 8 Cols): Interactive Volume & Overload Progression */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition-colors">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
              <div>
                <span className="text-[11px] font-mono text-slate-500 font-medium block">
                  Workload & Stimulus Dynamics
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  Volume Progression & Fatigue Balance
                </h3>
              </div>

              {/* Interactive Timeframe & Metric Filter Controls */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Metric Mode Toggle */}
                <div className="inline-flex items-center p-0.5 bg-slate-100 rounded-lg text-[10px] font-mono">
                  <button
                    type="button"
                    onClick={() => setVolumeMetric('volume')}
                    className={`px-2 py-1 rounded-md transition-colors ${
                      volumeMetric === 'volume'
                        ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Load (kg)
                  </button>
                  <button
                    type="button"
                    onClick={() => setVolumeMetric('sets')}
                    className={`px-2 py-1 rounded-md transition-colors ${
                      volumeMetric === 'sets'
                        ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Sets
                  </button>
                </div>

                {/* Timeframe Toggle */}
                <div className="inline-flex items-center p-0.5 bg-slate-100 rounded-lg text-[10px] font-mono">
                  {(['7D', '30D', '90D'] as const).map((tf) => (
                    <button
                      key={tf}
                      type="button"
                      onClick={() => setVolumeTimeframe(tf)}
                      className={`px-2 py-1 rounded-md transition-colors ${
                        volumeTimeframe === tf
                          ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Clean Legend (No Color Names in Text, No Glowing Shadows) */}
            <div className="flex items-center gap-4 text-xs font-mono pt-3 pb-1">
              <span className="flex items-center gap-1.5 text-slate-800 font-semibold">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                <span>Workload Stimulus</span>
              </span>
              <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                <span className="w-2 h-2 rounded-full bg-pink-500" />
                <span>Systemic Fatigue</span>
              </span>
            </div>

            {/* Neon ECharts Line Chart */}
            <div className="pt-1">
              <ReactECharts
                option={volumeChartOption}
                style={{ height: '200px', width: '100%' }}
                opts={{ renderer: 'svg' }}
                notMerge={true}
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-mono">
              Active cycle load: <strong className="text-slate-900 font-bold tabular-nums">{currentVolumeData.activeLoadLabel}</strong> ({volumeTimeframe} window)
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

              {/* Interactive Readiness Domain Toggle */}
              <div className="inline-flex items-center p-0.5 bg-slate-100 rounded-lg text-[10px] font-mono">
                <button
                  type="button"
                  onClick={() => setReadinessMode('overall')}
                  className={`px-1.5 py-0.5 rounded-md transition-colors ${
                    readinessMode === 'overall' ? 'bg-slate-900 text-white font-semibold' : 'text-slate-600'
                  }`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setReadinessMode('cns')}
                  className={`px-1.5 py-0.5 rounded-md transition-colors ${
                    readinessMode === 'cns' ? 'bg-slate-900 text-white font-semibold' : 'text-slate-600'
                  }`}
                >
                  CNS
                </button>
                <button
                  type="button"
                  onClick={() => setReadinessMode('cardio')}
                  className={`px-1.5 py-0.5 rounded-md transition-colors ${
                    readinessMode === 'cardio' ? 'bg-slate-900 text-white font-semibold' : 'text-slate-600'
                  }`}
                >
                  Cardio
                </button>
              </div>
            </div>

            {/* Neon Speedometer Gauge */}
            <div className="pt-1">
              <ReactECharts
                option={readinessGaugeOption}
                style={{ height: '175px', width: '100%' }}
                opts={{ renderer: 'svg' }}
                notMerge={true}
              />
            </div>

            {/* 3 Telemetry Chips (Live DB Supported Metrics vs Demo Prototype) */}
            {isDemoMode ? (
              <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono pt-1">
                <div className="bg-slate-50/80 p-2 rounded-xl border border-slate-200/80">
                  <div className="flex items-center justify-center gap-1 text-slate-400 mb-0.5">
                    <Heart className="w-3 h-3 text-rose-500" />
                    <span>RHR</span>
                  </div>
                  <span className="font-bold text-slate-900 text-xs tabular-nums">
                    <AnimatedNumber value={62} suffix=" bpm" />
                  </span>
                  <span className="text-[9px] text-slate-400 block mt-0.5">Optimal</span>
                </div>

                <div className="bg-slate-50/80 p-2 rounded-xl border border-slate-200/80">
                  <div className="flex items-center justify-center gap-1 text-slate-400 mb-0.5">
                    <Activity className="w-3 h-3 text-cyan-500" />
                    <span>HRV</span>
                  </div>
                  <span className="font-bold text-cyan-700 text-xs tabular-nums">
                    <AnimatedNumber value={74} suffix=" ms" />
                  </span>
                  <span className="text-[9px] text-emerald-700 font-semibold block mt-0.5">+8ms vs avg</span>
                </div>

                <div className="bg-slate-50/80 p-2 rounded-xl border border-slate-200/80">
                  <div className="flex items-center justify-center gap-1 text-slate-400 mb-0.5">
                    <Moon className="w-3 h-3 text-indigo-500" />
                    <span>Sleep</span>
                  </div>
                  <span className="font-bold text-slate-900 text-xs tabular-nums">8h 10m</span>
                  <span className="text-[9px] text-slate-400 block mt-0.5">92% score</span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono pt-1">
                <div className="bg-slate-50/80 p-2 rounded-xl border border-slate-200/80">
                  <div className="flex items-center justify-center gap-1 text-slate-400 mb-0.5">
                    <Clock className="w-3 h-3 text-sky-500" />
                    <span>Time</span>
                  </div>
                  <span className="font-bold text-slate-900 text-xs tabular-nums">
                    <AnimatedNumber value={realTotalMinutes} suffix="m" />
                  </span>
                  <span className="text-[9px] text-slate-400 block mt-0.5">This week</span>
                </div>

                <div className="bg-slate-50/80 p-2 rounded-xl border border-slate-200/80">
                  <div className="flex items-center justify-center gap-1 text-slate-400 mb-0.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    <span>Sessions</span>
                  </div>
                  <span className="font-bold text-slate-900 text-xs tabular-nums">
                    <AnimatedNumber value={realCompletedSessions} />/{realPlannedSessions}
                  </span>
                  <span className="text-[9px] text-emerald-700 font-semibold block mt-0.5">{realAdherence}% met</span>
                </div>

                <div className="bg-slate-50/80 p-2 rounded-xl border border-slate-200/80">
                  <div className="flex items-center justify-center gap-1 text-slate-400 mb-0.5">
                    <Flame className="w-3 h-3 text-amber-500" />
                    <span>Avg Target</span>
                  </div>
                  <span className="font-bold text-slate-900 text-xs tabular-nums">
                    <AnimatedNumber value={realAvgSessionMins} suffix="m" />
                  </span>
                  <span className="text-[9px] text-slate-400 block mt-0.5">Per session</span>
                </div>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-[11px] text-slate-500 font-mono">{activeReadinessConfig.sub}</span>
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

        {/* Bento Card 3 (Compact - 4 Cols): 7-Day Training Rhythm & Interactive Day Inspector */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition-colors">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 border border-slate-200/80 flex items-center justify-center">
                  <Activity className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-slate-900">Training Rhythm</span>
              </div>

              {/* Day Selector Pills */}
              <div className="inline-flex items-center p-0.5 bg-slate-100 rounded-lg text-[9px] font-mono">
                {rhythmDailyData.map((d, i) => (
                  <button
                    key={d.day}
                    type="button"
                    onClick={() => setSelectedDayIdx(i)}
                    className={`px-1.5 py-0.5 rounded-sm transition-colors ${
                      selectedDayIdx === i
                        ? 'bg-slate-900 text-white font-bold shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {d.day[0]}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-1">
              <ReactECharts
                option={rhythmBarOption}
                style={{ height: '135px', width: '100%' }}
                opts={{ renderer: 'svg' }}
                notMerge={true}
              />
            </div>

            {/* Interactive Day Telemetry Chip */}
            <div className="mt-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 text-[11px] font-mono">
              <div className="flex items-center justify-between text-slate-900 font-semibold mb-0.5">
                <span>{selectedDayTelemetry.day} · {selectedDayTelemetry.focus}</span>
                <span className="text-cyan-700 text-[10px] font-medium">{selectedDayTelemetry.status}</span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-500">
                <span>{selectedDayTelemetry.duration > 0 ? `${selectedDayTelemetry.duration}m · ${selectedDayTelemetry.sets} sets` : 'Full Rest Day'}</span>
                <span>RPE {selectedDayTelemetry.rpe || '—'} · {selectedDayTelemetry.volume > 0 ? `${selectedDayTelemetry.volume.toLocaleString()} kg` : 'Active CNS'}</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-[11px] font-mono text-slate-500">5 sessions prescribed / week</span>
            <span className="text-[11px] font-mono text-slate-600 font-medium">
              On schedule
            </span>
          </div>
        </div>

        {/* Bento Card 4 (Compact - 4 Cols): Anatomical Muscle Activation Radar with Focus Filter */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition-colors">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 border border-slate-200/80 flex items-center justify-center">
                  <Dumbbell className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-slate-900">Muscle Activation</span>
              </div>

              {/* Muscle Split Filter Toggle */}
              <div className="inline-flex items-center p-0.5 bg-slate-100 rounded-lg text-[9px] font-mono">
                <button
                  type="button"
                  onClick={() => setMuscleFilter('all')}
                  className={`px-1.5 py-0.5 rounded-sm transition-colors ${
                    muscleFilter === 'all' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600'
                  }`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setMuscleFilter('upper')}
                  className={`px-1.5 py-0.5 rounded-sm transition-colors ${
                    muscleFilter === 'upper' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600'
                  }`}
                >
                  Upper
                </button>
                <button
                  type="button"
                  onClick={() => setMuscleFilter('lower')}
                  className={`px-1.5 py-0.5 rounded-sm transition-colors ${
                    muscleFilter === 'lower' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600'
                  }`}
                >
                  Lower
                </button>
              </div>
            </div>

            <div className="pt-1">
              <ReactECharts
                option={muscleRadarOption}
                style={{ height: '175px', width: '100%' }}
                opts={{ renderer: 'svg' }}
                notMerge={true}
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-mono text-[11px]">Compound overload ratio</span>
            <span className="text-[11px] font-mono text-slate-600 font-medium">
              Balanced ratio
            </span>
          </div>
        </div>

        {/* Bento Card 5 (Compact - 4 Cols): Intensity & Strain Dual Visual */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition-colors">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 border border-slate-200/80 flex items-center justify-center">
                  <Flame className="w-4 h-4 text-orange-500" />
                </div>
                <span className="text-xs font-semibold text-slate-900">Intensity & Strain</span>
              </div>

              {/* Metric filter toggles */}
              <div className="inline-flex items-center p-0.5 bg-slate-100 rounded-lg text-[9px] font-mono">
                <button
                  type="button"
                  onClick={() => setStrainMetricMode('both')}
                  className={`px-1.5 py-0.5 rounded-sm transition-colors ${
                    strainMetricMode === 'both' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600'
                  }`}
                >
                  Both
                </button>
                <button
                  type="button"
                  onClick={() => setStrainMetricMode('strain')}
                  className={`px-1.5 py-0.5 rounded-sm transition-colors ${
                    strainMetricMode === 'strain' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600'
                  }`}
                >
                  Strain
                </button>
                <button
                  type="button"
                  onClick={() => setStrainMetricMode('rpe')}
                  className={`px-1.5 py-0.5 rounded-sm transition-colors ${
                    strainMetricMode === 'rpe' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600'
                  }`}
                >
                  RPE
                </button>
              </div>
            </div>

            {/* Neon ECharts Intensity & Strain Dual Chart */}
            <div className="pt-1">
              <ReactECharts
                option={intensityBarOption}
                style={{ height: '145px', width: '100%' }}
                opts={{ renderer: 'svg' }}
                notMerge={true}
              />
            </div>

            {/* Thermal Intensity & Strain Legend (Live DB vs Demo Mode) */}
            {isDemoMode ? (
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 px-1 pt-1">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-xs bg-cyan-400" />
                  <span>Strain &lt;10</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-xs bg-amber-400" />
                  <span>Strain 10-15</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-xs bg-orange-500" />
                  <span>Strain 15+</span>
                </span>
                <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_4px_rgba(0,255,163,0.8)]" />
                  <span>RPE</span>
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 px-1 pt-1">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-xs bg-sky-400" />
                  <span>Session Duration (min)</span>
                </span>
                <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Perceived RPE</span>
                </span>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold font-mono text-slate-900 tabular-nums">
                <AnimatedNumber
                  value={isDemoMode ? 14.8 : realTotalMinutes}
                  decimals={isDemoMode ? 1 : 0}
                  suffix={isDemoMode ? '' : 'm'}
                />{' '}
                <span className="text-xs font-normal text-slate-500">{isDemoMode ? 'Avg Strain' : 'Logged'}</span>
              </span>
              <span className="text-xs font-mono text-slate-400">·</span>
              <span className="text-sm font-bold font-mono text-slate-700 tabular-nums">
                <AnimatedNumber
                  value={Number(currentAvgRpe) || 7.8}
                  decimals={1}
                /> <span className="text-xs font-normal text-slate-500">RPE</span>
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-600 font-medium">
              {isDemoMode ? 'Overload zone' : (realCompletedSessions > 0 ? `${realCompletedSessions} sessions logged` : 'No logs yet')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
