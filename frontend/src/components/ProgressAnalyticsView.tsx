import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, 
  Info, 
  RefreshCw, 
  Search,
  Eye,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  X,
  Dumbbell
} from 'lucide-react';
import { useFitness } from '../context/FitnessContext';
import { api, BackendWorkoutLog } from '../services/api';

export const ProgressAnalyticsView: React.FC = () => {
  const { 
    weeklyStats, 
    aiWeeklySummary, 
    userProfile, 
    refreshWeeklyStats,
    workoutLogs,
    refreshWorkoutLogs
  } = useFitness();
  const [dateFilter, setDateFilter] = useState<'7d' | '30d' | '90d'>('30d');
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [isRefreshingAi, setIsRefreshingAi] = useState(false);
  const [aiReport, setAiReport] = useState<any>(null);
  
  // Table state
  const logs = workoutLogs;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLogIds, setSelectedLogIds] = useState<Set<string>>(new Set());
  const [selectedLogForDetail, setSelectedLogForDetail] = useState<BackendWorkoutLog | null>(null);
  const [sortField, setSortField] = useState<'date' | 'name' | 'duration' | 'rpe'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const fetchLogs = async () => {
    setIsLoadingLogs(true);
    try {
      await refreshWorkoutLogs();
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

  // Filter logs by date range and search query
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const logDate = new Date(log.workoutDate);
      const now = new Date();
      const daysDiff = (now.getTime() - logDate.getTime()) / (1000 * 3600 * 24);
      
      const inDateRange = 
        dateFilter === '7d' ? daysDiff <= 7 :
        dateFilter === '30d' ? daysDiff <= 30 :
        daysDiff <= 90;

      if (!inDateRange) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = (log.notes || 'Training Session').toLowerCase().includes(q);
        const matchesExercise = log.exercises.some((ex) => 
          (ex.exercise?.name || '').toLowerCase().includes(q)
        );
        return matchesName || matchesExercise;
      }

      return true;
    }).sort((a, b) => {
      if (sortField === 'date') {
        const tA = new Date(a.workoutDate).getTime();
        const tB = new Date(b.workoutDate).getTime();
        return sortDirection === 'asc' ? tA - tB : tB - tA;
      }
      if (sortField === 'name') {
        const nA = (a.notes || 'Training Session').toLowerCase();
        const nB = (b.notes || 'Training Session').toLowerCase();
        return sortDirection === 'asc' ? nA.localeCompare(nB) : nB.localeCompare(nA);
      }
      if (sortField === 'duration') {
        return sortDirection === 'asc' ? a.durationMinutes - b.durationMinutes : b.durationMinutes - a.durationMinutes;
      }
      if (sortField === 'rpe') {
        const rpeA = a.perceivedDifficulty || 0;
        const rpeB = b.perceivedDifficulty || 0;
        return sortDirection === 'asc' ? rpeA - rpeB : rpeB - rpeA;
      }
      return 0;
    });
  }, [logs, dateFilter, searchQuery, sortField, sortDirection]);

  const totalFilteredMinutes = useMemo(() => {
    return filteredLogs.reduce((acc, l) => acc + l.durationMinutes, 0);
  }, [filteredLogs]);

  const totalFilteredSets = useMemo(() => {
    return filteredLogs.reduce(
      (acc, l) => acc + l.exercises.reduce((sAcc, ex) => sAcc + ex.setsCompleted, 0),
      0
    );
  }, [filteredLogs]);

  // Checkbox helpers
  const toggleSelectAll = () => {
    if (selectedLogIds.size === filteredLogs.length && filteredLogs.length > 0) {
      setSelectedLogIds(new Set());
    } else {
      setSelectedLogIds(new Set(filteredLogs.map((l) => l.id)));
    }
  };

  const toggleSelectRow = (id: string) => {
    const updated = new Set(selectedLogIds);
    if (updated.has(id)) {
      updated.delete(id);
    } else {
      updated.add(id);
    }
    setSelectedLogIds(updated);
  };

  // Sort toggle helper
  const handleSort = (field: 'date' | 'name' | 'duration' | 'rpe') => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Distinct status pill generator based on session RPE
  const getStatusBadge = (rpe: number | undefined) => {
    const val = rpe || 7.0;
    if (val <= 7.0) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/80">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>Optimal Recovery</span>
        </span>
      );
    }
    if (val <= 8.0) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200/80">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          <span>Target Overload</span>
        </span>
      );
    }
    if (val <= 9.0) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200/80">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          <span>High Intensity</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200/80">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
        <span>Peak Strain</span>
      </span>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full font-sans">
      
      {/* 1. Date Filter Strip (Title & description removed as requested) */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
          {(['7d', '30d', '90d'] as const).map((period) => (
            <button
              key={period}
              type="button"
              onClick={() => setDateFilter(period)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                dateFilter === period
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {period === '7d' ? 'Last 7 Days' : period === '30d' ? 'Last 30 Days' : 'Last 90 Days'}
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-500 font-mono">
          {filteredLogs.length} logged sessions
        </div>
      </div>

      {/* 2. KPI Cards (Info icon 'i' on every card with hover tooltip) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium text-slate-600">Completed Sessions</span>
            <div className="relative group inline-flex items-center">
              <button 
                type="button" 
                aria-label="Info about completed sessions"
                className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer p-0.5 rounded focus:outline-none"
              >
                <Info className="w-4 h-4" />
              </button>
              <div className="absolute right-0 top-full mt-1.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all duration-150 z-30 w-52 p-2.5 bg-slate-900 text-white rounded-xl shadow-xl pointer-events-none">
                <p className="font-semibold text-[11px] text-white">Completed Sessions</p>
                <p className="text-[10px] text-slate-300 font-normal leading-relaxed mt-0.5">
                  Total workout sessions logged and recorded inside your selected date range.
                </p>
              </div>
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {filteredLogs.length}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Goal: <span className="tabular-nums font-semibold text-slate-700">{userProfile?.workoutDaysPerWeek || 4}</span> days / week
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium text-slate-600">Total Training Time</span>
            <div className="relative group inline-flex items-center">
              <button 
                type="button" 
                aria-label="Info about total training time"
                className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer p-0.5 rounded focus:outline-none"
              >
                <Info className="w-4 h-4" />
              </button>
              <div className="absolute right-0 top-full mt-1.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all duration-150 z-30 w-52 p-2.5 bg-slate-900 text-white rounded-xl shadow-xl pointer-events-none">
                <p className="font-semibold text-[11px] text-white">Total Training Time</p>
                <p className="text-[10px] text-slate-300 font-normal leading-relaxed mt-0.5">
                  Cumulative active duration spent training across all recorded sessions in minutes.
                </p>
              </div>
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {totalFilteredMinutes} <span className="text-xs font-normal text-slate-500">min</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Avg <span className="tabular-nums font-semibold text-slate-700">{filteredLogs.length ? Math.round(totalFilteredMinutes / filteredLogs.length) : 0}</span> min / session
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium text-slate-600">Total Working Sets</span>
            <div className="relative group inline-flex items-center">
              <button 
                type="button" 
                aria-label="Info about total working sets"
                className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer p-0.5 rounded focus:outline-none"
              >
                <Info className="w-4 h-4" />
              </button>
              <div className="absolute right-0 top-full mt-1.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all duration-150 z-30 w-52 p-2.5 bg-slate-900 text-white rounded-xl shadow-xl pointer-events-none">
                <p className="font-semibold text-[11px] text-white">Total Working Sets</p>
                <p className="text-[10px] text-slate-300 font-normal leading-relaxed mt-0.5">
                  Sum of all completed working sets executed across movement patterns.
                </p>
              </div>
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {totalFilteredSets}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Logged across compound lifts
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium text-slate-600">Weekly Adherence</span>
            <div className="relative group inline-flex items-center">
              <button 
                type="button" 
                aria-label="Info about weekly adherence"
                className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer p-0.5 rounded focus:outline-none"
              >
                <Info className="w-4 h-4" />
              </button>
              <div className="absolute right-0 top-full mt-1.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all duration-150 z-30 w-52 p-2.5 bg-slate-900 text-white rounded-xl shadow-xl pointer-events-none">
                <p className="font-semibold text-[11px] text-white">Weekly Adherence</p>
                <p className="text-[10px] text-slate-300 font-normal leading-relaxed mt-0.5">
                  Percentage adherence to your prescribed {userProfile?.workoutDaysPerWeek || 4}-day training split.
                </p>
              </div>
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {weeklyStats ? `${weeklyStats.adherencePercentage}%` : '100%'}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Prescribed mesocycle compliance
          </div>
        </div>
      </div>

      {/* 3. AI Performance Assessment (Kept as requested) */}
      <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Weekly AI Performance Assessment
              </h3>
              <p className="text-[11px] text-slate-500">
                Synthesized by your coach based on historical volume and RPE trends
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRefreshAiReport}
            disabled={isRefreshingAi}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshingAi ? 'animate-spin' : ''}`} />
            <span>{isRefreshingAi ? 'Analyzing...' : 'Refresh AI Analysis'}</span>
          </button>
        </div>

        <div className="text-xs text-slate-700 leading-relaxed space-y-3">
          <p className="font-medium text-slate-800">
            {aiReport?.summary || aiWeeklySummary || (
              "Solid training consistency logged! You maintained effective adherence across your scheduled movement patterns. Central nervous system stimulus and muscle recovery remain balanced."
            )}
          </p>

          {aiReport?.actionable_recommendations && aiReport.actionable_recommendations.length > 0 && (
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/70 space-y-2">
              <span className="text-[11px] font-semibold text-slate-700 block">
                Evidence-Based Recommendations For Next Week:
              </span>
              <ul className="space-y-1.5 text-slate-600">
                {aiReport.actionable_recommendations.map((rec: string, rIdx: number) => (
                  <li key={rIdx} className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* 4. Redesigned Workout Logs Table (Matching Reference Layout) */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {/* Table Top Controls Bar */}
        <div className="p-4 sm:px-6 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-900">Workout History</span>
            <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              {filteredLogs.length} total
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Input matching reference design */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search workouts or movements..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium w-64 focus:outline-none focus:ring-1 focus:ring-slate-900 placeholder:text-slate-400 font-sans"
              />
            </div>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/80 border-b border-slate-200/90 text-slate-500 uppercase font-mono text-[10px] tracking-wider">
              <tr>
                <th scope="col" className="w-10 px-4 py-2.5 text-center">
                  <input
                    type="checkbox"
                    checked={selectedLogIds.size === filteredLogs.length && filteredLogs.length > 0}
                    onChange={toggleSelectAll}
                    aria-label="Select all rows"
                    className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 w-3.5 h-3.5"
                  />
                </th>
                
                <th scope="col" className="px-4 py-2.5 font-semibold cursor-pointer select-none" onClick={() => handleSort('name')}>
                  <div className="inline-flex items-center gap-1">
                    <span>WORKOUT SESSION</span>
                    {sortField === 'name' ? (
                      sortDirection === 'asc' ? <ChevronUp className="w-3 h-3 text-slate-700" /> : <ChevronDown className="w-3 h-3 text-slate-700" />
                    ) : (
                      <span className="text-slate-400">↑↓</span>
                    )}
                  </div>
                </th>

                <th scope="col" className="px-4 py-2.5 font-semibold cursor-pointer select-none" onClick={() => handleSort('date')}>
                  <div className="inline-flex items-center gap-1">
                    <span>DATE & TIME</span>
                    {sortField === 'date' ? (
                      sortDirection === 'asc' ? <ChevronUp className="w-3 h-3 text-slate-700" /> : <ChevronDown className="w-3 h-3 text-slate-700" />
                    ) : (
                      <span className="text-slate-400">↑↓</span>
                    )}
                  </div>
                </th>

                <th scope="col" className="px-4 py-2.5 font-semibold cursor-pointer select-none" onClick={() => handleSort('duration')}>
                  <div className="inline-flex items-center gap-1">
                    <span>DURATION & VOLUME</span>
                    {sortField === 'duration' ? (
                      sortDirection === 'asc' ? <ChevronUp className="w-3 h-3 text-slate-700" /> : <ChevronDown className="w-3 h-3 text-slate-700" />
                    ) : (
                      <span className="text-slate-400">↑↓</span>
                    )}
                  </div>
                </th>

                <th scope="col" className="px-4 py-2.5 font-semibold cursor-pointer select-none" onClick={() => handleSort('rpe')}>
                  <div className="inline-flex items-center gap-1">
                    <span>STRAIN / STATUS</span>
                    {sortField === 'rpe' ? (
                      sortDirection === 'asc' ? <ChevronUp className="w-3 h-3 text-slate-700" /> : <ChevronDown className="w-3 h-3 text-slate-700" />
                    ) : (
                      <span className="text-slate-400">↑↓</span>
                    )}
                  </div>
                </th>

                <th scope="col" className="px-4 py-2.5 text-right font-semibold">
                  ACTIONS
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {isLoadingLogs ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 font-mono text-xs">
                    Loading workout logs...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 text-xs">
                    No workout sessions recorded in this date range.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const dateObj = new Date(log.workoutDate);
                  const formattedDate = new Intl.DateTimeFormat('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  }).format(dateObj);
                  const formattedTime = new Intl.DateTimeFormat('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                  }).format(dateObj);

                  const sessionVolume = log.exercises.reduce(
                    (acc, ex) => acc + (ex.weightUsed || 0) * (ex.setsCompleted || 0) * 8,
                    0
                  );

                  const isSelected = selectedLogIds.has(log.id);

                  return (
                    <tr 
                      key={log.id} 
                      className={`hover:bg-slate-50/80 transition-colors ${isSelected ? 'bg-slate-50/60' : ''}`}
                    >
                      {/* Checkbox */}
                      <td className="px-4 py-2.5 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectRow(log.id)}
                          aria-label={`Select ${log.notes || 'session'}`}
                          className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 w-3.5 h-3.5"
                        />
                      </td>

                      {/* Workout Session Primary Column */}
                      <td className="px-4 py-2.5">
                        <div className="font-semibold text-slate-900 text-xs">
                          {log.notes || 'Training Session'}
                        </div>
                        <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                          {log.exercises.map((e) => e.exercise?.name).filter(Boolean).join(', ') || 'Compound Movements'}
                        </div>
                      </td>

                      {/* Date & Time */}
                      <td className="px-4 py-2.5 font-mono text-xs">
                        <div className="text-slate-900 font-medium">{formattedDate}</div>
                        <div className="text-[11px] text-slate-400">{formattedTime}</div>
                      </td>

                      {/* Duration & Volume */}
                      <td className="px-4 py-2.5 font-mono tabular-nums text-xs">
                        <div className="text-slate-900 font-semibold">{log.durationMinutes} min</div>
                        <div className="text-[11px] text-slate-500">
                          {sessionVolume > 0 ? `${sessionVolume.toLocaleString()} kg est.` : `${log.exercises.length} movements`}
                        </div>
                      </td>

                      {/* Strain Status Badge with Different Colors */}
                      <td className="px-4 py-2.5">
                        {getStatusBadge(log.perceivedDifficulty)}
                      </td>

                      {/* Action Icon */}
                      <td className="px-4 py-2.5 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedLogForDetail(log)}
                          title="View session exercise logs"
                          className="p-1 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors inline-flex items-center justify-center"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Session Details Modal */}
      {selectedLogForDetail && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white dark:bg-[#16171B] rounded-2xl border border-slate-200 dark:border-[#262933] shadow-2xl max-w-lg w-full overflow-hidden space-y-4 p-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#262933] pb-3">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base">
                  {selectedLogForDetail.notes || 'Session Details'}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                  {new Date(selectedLogForDetail.workoutDate).toLocaleString()} · {selectedLogForDetail.durationMinutes} min
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLogForDetail(null)}
                className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto">
              <div className="flex items-center justify-between text-xs font-mono text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-[#262933] pb-1">
                <span>Exercise Movement</span>
                <span>Sets Completed</span>
              </div>
              {selectedLogForDetail.exercises.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-[#1C1F26] rounded-lg text-xs border border-transparent dark:border-[#262933]">
                  <div className="flex items-center gap-2">
                    <Dumbbell className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                    <span className="font-medium text-slate-800 dark:text-slate-200">{item.exercise?.name || 'Movement'}</span>
                  </div>
                  <span className="font-mono text-slate-700 dark:text-slate-300 tabular-nums">
                    {item.setsCompleted} sets @ {item.weightUsed || 0} kg
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-[#262933] flex items-center justify-between text-xs font-mono">
              <span className="text-slate-500 dark:text-slate-400">Perceived RPE Rating:</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">{selectedLogForDetail.perceivedDifficulty || 7.0} / 10</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
