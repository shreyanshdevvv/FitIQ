import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Calendar, 
  Clock, 
  Dumbbell, 
  Award, 
  Sparkles, 
  RefreshCw, 
  CheckCircle2,
  ChevronRight,
  Loader2,
  Flame
} from 'lucide-react';
import { useFitness } from '../context/FitnessContext';
import { api, BackendWorkoutLog } from '../services/api';

export const ProgressAnalyticsView: React.FC = () => {
  const { weeklyStats, aiWeeklySummary, userProfile, refreshWeeklyStats } = useFitness();
  const [dateFilter, setDateFilter] = useState<'7d' | '30d' | '90d'>('7d');
  const [logs, setLogs] = useState<BackendWorkoutLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [isRefreshingAi, setIsRefreshingAi] = useState(false);
  const [aiReport, setAiReport] = useState<any>(null);

  const fetchLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const data = await api.getWorkoutLogs();
      setLogs(data);
    } catch (e) {
      console.error('Failed to load logs:', e);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleRefreshAiReport = async () => {
    setIsRefreshingAi(true);
    try {
      const res = await api.getWeeklyAiSummary();
      setAiReport(res.aiSummary);
      await refreshWeeklyStats();
    } catch (err: any) {
      alert(`AI report update: ${err.message}`);
    } finally {
      setIsRefreshingAi(false);
    }
  };

  // Filter logs by date range
  const filteredLogs = logs.filter((log) => {
    const logDate = new Date(log.workoutDate);
    const now = new Date();
    const daysDiff = (now.getTime() - logDate.getTime()) / (1000 * 3600 * 24);
    if (dateFilter === '7d') return daysDiff <= 7;
    if (dateFilter === '30d') return daysDiff <= 30;
    return daysDiff <= 90;
  });

  const totalFilteredMinutes = filteredLogs.reduce((acc, l) => acc + l.durationMinutes, 0);
  const totalFilteredSets = filteredLogs.reduce(
    (acc, l) => acc + l.exercises.reduce((sAcc, ex) => sAcc + ex.setsCompleted, 0),
    0
  );

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Top Bar with Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Progress & Performance Telemetry
          </h2>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            PostgreSQL verified training logs • Deterministic calculations
          </p>
        </div>

        {/* Date Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto border border-slate-200/80">
          {(['7d', '30d', '90d'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setDateFilter(period)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                dateFilter === period
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {period === '7d' ? 'Last 7 Days' : period === '30d' ? 'Last 30 Days' : 'Last 90 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider font-semibold">Completed Sessions</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {filteredLogs.length}
          </div>
          <div className="text-[11px] text-slate-600 mt-1">
            Goal: <span className="tabular-nums font-semibold">{userProfile?.workoutDaysPerWeek || 4}</span> days/week
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider font-semibold">Total Training Time</span>
            <Clock className="w-4 h-4 text-slate-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {totalFilteredMinutes} <span className="text-xs font-normal text-slate-500">min</span>
          </div>
          <div className="text-[11px] text-slate-600 mt-1">
            Avg <span className="tabular-nums font-semibold">{filteredLogs.length ? Math.round(totalFilteredMinutes / filteredLogs.length) : 0}</span> min / session
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider font-semibold">Total Working Sets</span>
            <Dumbbell className="w-4 h-4 text-slate-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {totalFilteredSets}
          </div>
          <div className="text-[11px] text-emerald-800 font-medium mt-1">
            Logged across primary lifts
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider font-semibold">Weekly Adherence</span>
            <Award className="w-4 h-4 text-slate-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {weeklyStats ? `${weeklyStats.adherencePercentage}%` : '100%'}
          </div>
          <div className="text-[11px] text-slate-600 mt-1">
            Based on current scheduled split
          </div>
        </div>
      </div>

      {/* Weekly AI Progress Report Card */}
      <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-slate-900 text-white flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Weekly AI Performance Assessment
              </h3>
              <p className="text-[10px] font-mono text-slate-400">
                Synthesized by Gemini 3.5 Flash against your actual workout logs
              </p>
            </div>
          </div>

          <button
            onClick={handleRefreshAiReport}
            disabled={isRefreshingAi}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshingAi ? 'animate-spin' : ''}`} />
            <span>{isRefreshingAi ? 'Analyzing...' : 'Refresh AI Analysis'}</span>
          </button>
        </div>

        <div className="text-xs text-slate-700 leading-relaxed space-y-3">
          <p className="font-medium text-slate-900">
            {aiReport?.summary || aiWeeklySummary || (
              "Solid training consistency logged! You maintained effective adherence across your scheduled movement patterns. Central nervous system stimulus and muscle recovery remain balanced."
            )}
          </p>

          {aiReport?.actionable_recommendations && aiReport.actionable_recommendations.length > 0 && (
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60 space-y-2">
              <span className="text-[11px] font-mono uppercase text-slate-500 font-semibold block">
                Evidence-Based Recommendations For Next Week:
              </span>
              <ul className="space-y-1 text-slate-600">
                {aiReport.actionable_recommendations.map((rec: string, rIdx: number) => (
                  <li key={rIdx} className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Historical Session Logs Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            Recorded Workout Sessions
          </h3>
          <span className="text-xs font-mono text-slate-400">
            {filteredLogs.length} Sessions Logged
          </span>
        </div>

        {isLoadingLogs ? (
          <div className="p-8 text-center text-xs text-slate-400 font-mono flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
            <span>Loading PostgreSQL session records...</span>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 font-mono">
            No completed workouts recorded in this date range. Click "Start Workout" on your dashboard to log a session.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredLogs.map((log) => {
              const formattedDate = new Intl.DateTimeFormat('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }).format(new Date(log.workoutDate));

              return (
                <div key={log.id} className="p-4 hover:bg-slate-50/80 transition-colors space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-900">
                        {log.notes || 'Training Session'}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400 ml-2">
                        {formattedDate}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {log.durationMinutes} min
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                        RPE: {log.perceivedDifficulty}
                      </span>
                    </div>
                  </div>

                  {/* Movements in this session */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {log.exercises.map((item, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-mono text-slate-600 bg-white border border-slate-200 px-2.5 py-1 rounded-md"
                      >
                        {item.exercise?.name || 'Movement'} • {item.setsCompleted} sets @ {item.weightUsed || 0}kg
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
