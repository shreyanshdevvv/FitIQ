import React from 'react';
import { 
  Play, 
  ArrowRight, 
  Calendar, 
  Users, 
  Award, 
  CheckCircle2, 
  Sparkles, 
  Clock, 
  Flame, 
  Dumbbell,
  BookOpen
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
    subscriptions
  } = useFitness();

  const activeSubscriptions = subscriptions.filter((s) => s.status === 'ACTIVE');

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Welcome Banner */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
              Training Dashboard
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[11px] font-mono text-emerald-700 font-medium">PostgreSQL Live</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Welcome back, {currentUser?.name || 'Athlete'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {weeklyStats && weeklyStats.completedSessions > 0
              ? `You have completed ${weeklyStats.completedSessions} workout${weeklyStats.completedSessions > 1 ? 's' : ''} this week. Consistency is solid.`
              : 'Your scheduled training routine is ready. Let’s make progress today.'}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {workout && (
            <button
              onClick={onStartSession}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-all shadow-xs"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Start Workout</span>
            </button>
          )}
          <button
            onClick={() => onNavigate('coach')}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-medium transition-colors border border-slate-200"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Ask AI Coach</span>
          </button>
        </div>
      </div>

      {/* Top 3 Real PostgreSQL Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Weekly Adherence Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-mono text-slate-500 mb-2">
              <span className="uppercase tracking-wider">Weekly Adherence</span>
              <span className="text-emerald-700 font-semibold font-mono">
                {weeklyStats ? `${weeklyStats.adherencePercentage}%` : '0%'}
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-mono font-bold text-slate-900">
                {weeklyStats?.completedSessions || 0}
              </span>
              <span className="text-slate-400 font-mono text-xs">
                / {weeklyStats?.plannedSessions || userProfile?.workoutDaysPerWeek || 4} Sessions
              </span>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-3 font-mono">
            {weeklyStats?.totalDurationMinutes || 0} min total training logged
          </p>
        </div>

        {/* Workout Volume Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-mono text-slate-500 mb-2">
              <span className="uppercase tracking-wider">Today's Session Volume</span>
              <span className="text-slate-900 font-semibold">{completionPercentage}%</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-mono font-bold text-slate-900">
                {totalSetsCompleted}
              </span>
              <span className="text-slate-400 font-mono text-xs">
                / {totalSetsPrescribed} sets
              </span>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-3 font-mono">
            Prescribed load: {totalVolumeLifted.toLocaleString()} {settings.weightUnit}
          </p>
        </div>

        {/* Coach Subscription Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-mono text-slate-500 mb-2">
              <span className="uppercase tracking-wider">Certified Coach</span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                  activeSubscriptions.length > 0
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {activeSubscriptions.length > 0 ? 'Active 1-on-1' : 'Marketplace'}
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-slate-900 truncate">
                {activeSubscriptions.length > 0
                  ? activeSubscriptions[0].coachProfile?.user?.name || 'Coach Sarah Jenkins'
                  : 'Independent Athlete'}
              </span>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-mono text-[11px]">
              {activeSubscriptions.length > 0
                ? `$${activeSubscriptions[0].amountPaid}/mo • CSCS Certified`
                : 'Browse Certified Trainers'}
            </span>
            <button
              onClick={() => onNavigate('coaches')}
              className="text-slate-900 font-semibold hover:underline flex items-center gap-0.5"
            >
              <span>{activeSubscriptions.length > 0 ? 'Manage' : 'Explore'}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Today's Prescribed Session */}
      {workout ? (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                Scheduled Routine • {workout.focus}
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">
                {workout.title}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('workout')}
                className="px-3.5 py-2 text-xs font-medium text-slate-700 hover:text-slate-950 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                View Full Split
              </button>
              <button
                onClick={onStartSession}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors shadow-2xs"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start Workout</span>
              </button>
            </div>
          </div>

          {/* Exercise Quick List */}
          <div className="divide-y divide-slate-100">
            {workout.exercises.map((ex, idx) => (
              <div
                key={ex.id}
                className="py-3 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-slate-400 w-4">{idx + 1}</span>
                  <div>
                    <span className="font-semibold text-slate-900 block">
                      {ex.name}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {ex.targetMuscle} • Tempo: {ex.tempo}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 font-mono">
                  <span className="text-slate-600">
                    {ex.sets} × {ex.reps} @ {ex.weight} {settings.weightUnit}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      ex.completedSets >= ex.sets
                        ? 'bg-emerald-50 text-emerald-700'
                        : ex.completedSets > 0
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {ex.completedSets}/{ex.sets} sets
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-8 text-center space-y-3">
          <Calendar className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">No Routine Assigned For Today</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Today might be an active recovery day, or you can generate a personalized program with the AI Coach.
          </p>
          <button
            onClick={() => onNavigate('workout')}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800"
          >
            Manage Workout Plans
          </button>
        </div>
      )}

      {/* AI Coach Insight & Guidance */}
      <div className="bg-slate-50 rounded-xl border border-slate-200/80 p-5 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-600 font-semibold">
              AI Coach Weekly Insight (Synthesized with Gemini)
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            {aiWeeklySummary ||
              `Profile configured for ${userProfile?.fitnessLevel || 'INTERMEDIATE'} level with target focus on ${
                userProfile?.goals.map(g => g.replace('_', ' ')).join(', ') || 'Muscle Building'
              }. Ask coach anytime for progressive overload targets or exercise modifications.`}
          </p>
        </div>
        <button
          onClick={() => onNavigate('coach')}
          className="text-xs font-semibold text-slate-900 hover:text-slate-700 whitespace-nowrap flex items-center gap-1 mt-1 shrink-0"
        >
          <span>Ask Coach</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Recent Workouts Logged from PostgreSQL */}
      {weeklyStats?.recentLogs && weeklyStats.recentLogs.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-xs font-bold text-slate-900">Recent Completed Sessions</span>
            <button
              onClick={() => onNavigate('progress')}
              className="text-xs text-slate-500 hover:text-slate-900 font-mono flex items-center gap-1"
            >
              <span>View Full History</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {weeklyStats.recentLogs.slice(0, 3).map((log: any) => (
              <div key={log.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-slate-900 block">{log.notes || 'Training Session'}</span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(log.workoutDate))} • {log.durationMinutes} min
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-mono border border-emerald-200">
                  RPE: {log.perceivedDifficulty}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
