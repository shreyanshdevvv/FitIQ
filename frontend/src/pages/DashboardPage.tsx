import React, { useEffect, useState } from 'react';
import { apiRequest } from '../api/client';
import { Activity, Dumbbell, Sparkles, CheckCircle2, TrendingUp, Clock, AlertCircle } from 'lucide-react';

interface DashboardProps {
  onNavigate: (tab: string) => void;
}

export const DashboardPage: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<any>(null);
  const [aiSummary, setAiSummary] = useState<any>(null);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [weeklyStats, logs] = await Promise.all([
        apiRequest('/workouts/stats/weekly'),
        apiRequest('/workouts/logs'),
      ]);
      setStats(weeklyStats);
      setRecentLogs(logs.slice(0, 5));
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchAiSummary = async () => {
    setSummaryLoading(true);
    try {
      const res = await apiRequest('/ai/weekly-summary', { method: 'POST' });
      setAiSummary(res.aiSummary);
    } catch (err) {
      console.error('Failed to generate AI summary:', err);
    } finally {
      setSummaryLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <Activity className="w-8 h-8 animate-spin text-accent-volt mx-auto mb-3" />
        <p className="text-sm text-slate-400">Loading your training telemetry...</p>
      </div>
    );
  }

  const adherence = stats?.adherencePercentage || 0;

  return (
    <div className="space-y-8">
      {/* Hero Banner: Progress & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border-subtle">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Athlete Performance Overview</h1>
          <p className="text-sm text-slate-400 mt-1">
            Weekly stimulus telemetry, volume tracking, and AI-grounded coaching insights.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('logger')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-accent-volt text-background font-bold text-sm hover:bg-accent-volt-hover transition-colors shadow-sm"
          >
            <Dumbbell className="w-4 h-4 stroke-[2.5]" />
            Log Active Workout
          </button>
          <button
            onClick={() => onNavigate('chat')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-surface-card border border-border-subtle text-slate-200 font-semibold text-sm hover:border-accent-cyan hover:text-white transition-colors"
          >
            <Sparkles className="w-4 h-4 text-accent-cyan" />
            Ask AI Coach
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-5 rounded-xl bg-surface border border-border-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Weekly Adherence</span>
            <TrendingUp className="w-4 h-4 text-accent-volt" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-white">{adherence}%</span>
            <div className="w-full bg-surface-card h-2 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-accent-volt h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(adherence, 100)}%` }}
              />
            </div>
            <p className="text-xs text-slate-400 mt-2">
              {stats?.completedSessions || 0} of {stats?.plannedSessions || 4} planned sessions
            </p>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-5 rounded-xl bg-surface border border-border-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Total Time Trained</span>
            <Clock className="w-4 h-4 text-accent-cyan" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-white">{stats?.totalDurationMinutes || 0}</span>
            <span className="text-slate-400 text-sm ml-1.5 font-medium">mins</span>
            <p className="text-xs text-slate-400 mt-2">Across past 7 calendar days</p>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-5 rounded-xl bg-surface border border-border-subtle flex flex-col justify-between md:col-span-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Primary Muscle Groups Stimulated</span>
            <Activity className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {stats?.mostTrainedMuscles && stats.mostTrainedMuscles.length > 0 ? (
              stats.mostTrainedMuscles.map((muscle: string, i: number) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-md bg-surface-card border border-border-subtle text-slate-200 text-xs font-semibold capitalize"
                >
                  {muscle}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-400">No logs recorded this week yet.</span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-2">Volume distribution based on compound & isolation movements</p>
        </div>
      </div>

      {/* AI Coach Weekly Synthesis Card */}
      <div className="p-6 rounded-xl bg-surface border border-accent-cyan/30 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-subtle">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-accent-cyan/10 text-accent-cyan">
              <Sparkles className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">AI Progress Analysis & Adaptation</h2>
              <p className="text-xs text-slate-400">Synthesized by Google Gemini 3.8 Flash from your raw workout logs</p>
            </div>
          </div>
          <button
            onClick={handleFetchAiSummary}
            disabled={summaryLoading}
            className="px-4 py-2 rounded-lg bg-surface-card border border-border-subtle hover:border-accent-cyan text-xs font-semibold text-white transition-all disabled:opacity-50"
          >
            {summaryLoading ? 'Analyzing Volume...' : aiSummary ? 'Re-Analyze Progress' : 'Generate AI Report'}
          </button>
        </div>

        {aiSummary ? (
          <div className="mt-5 space-y-4">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Adherence Assessment
              </h3>
              <p className="text-sm text-slate-200 leading-relaxed bg-surface-card/60 p-3.5 rounded-lg border border-border-subtle">
                {aiSummary.adherence_assessment}
              </p>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Next Week Recommended Targets
              </h3>
              <ul className="space-y-2">
                {aiSummary.actionable_recommendations?.map((tip: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-accent-volt shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="py-6 text-center text-sm text-slate-400">
            Click <strong className="text-slate-200">Generate AI Report</strong> to run an evidence-based assessment of your consistency and volume.
          </div>
        )}
      </div>

      {/* Recent Workout Logs */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Recent Completed Sessions</h2>
          <button
            onClick={() => onNavigate('logger')}
            className="text-xs font-semibold text-accent-volt hover:underline"
          >
            View All Logs →
          </button>
        </div>

        {recentLogs.length > 0 ? (
          <div className="overflow-x-auto rounded-xl border border-border-subtle bg-surface">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-surface-card/70 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-border-subtle">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Plan / Session</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Difficulty</th>
                  <th className="py-3 px-4">Exercises Performed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {recentLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-surface-card/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-xs">
                      {new Date(log.workoutDate).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-white">
                      {log.plan?.name || 'Open Gym Session'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs">{log.durationMinutes} mins</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold border border-border-subtle bg-surface-card text-slate-300">
                        {log.perceivedDifficulty}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-400">
                      {log.exercises?.length || 0} movements logged
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 rounded-xl border border-border-subtle bg-surface text-center">
            <AlertCircle className="w-6 h-6 text-slate-500 mx-auto mb-2" />
            <p className="text-sm text-slate-400">No workout sessions logged yet.</p>
            <button
              onClick={() => onNavigate('logger')}
              className="mt-3 text-xs font-semibold text-accent-volt hover:underline"
            >
              Log your first session now →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
