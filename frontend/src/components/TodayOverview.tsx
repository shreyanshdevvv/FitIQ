import React from 'react';
import { 
  Play, 
  ArrowRight, 
  Calendar, 
  Users, 
  Award, 
  CheckCircle2, 
  MessageSquare, 
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
    <div className="space-y-6 max-w-6xl mx-auto w-full">
      {/* Overview Context Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-slate-500 font-medium">
              Daily training overview
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight text-balance">
            {workout ? workout.title : "Today's Training"}
          </h1>
          <p className="text-xs text-slate-600 mt-1 text-pretty">
            {workout 
              ? `${workout.exercises.length} prescribed movements • Target: ${workout.focus}`
              : weeklyStats && weeklyStats.completedSessions > 0
              ? `${weeklyStats.completedSessions} workout${weeklyStats.completedSessions > 1 ? 's' : ''} completed this week. Rest or recovery prescribed today.`
              : 'Active recovery day. No structured lifting session scheduled.'}
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => onNavigate('workout')}
            aria-label="View complete workout split"
            className="min-h-[40px] px-3.5 py-2 text-xs font-medium text-slate-700 hover:text-slate-950 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors touch-manipulation"
          >
            View split
          </button>
          <button
            type="button"
            onClick={() => onNavigate('coach')}
            aria-label="Open AI coach assistant"
            className="min-h-[40px] flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-medium transition-colors shadow-2xs touch-manipulation"
          >
            <MessageSquare className="w-3.5 h-3.5 text-slate-300" />
            <span>Ask coach</span>
          </button>
        </div>
      </div>

      {/* Top 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Weekly Adherence Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-mono text-slate-500 mb-2 font-medium">
              <span>Weekly adherence</span>
              <span className="text-slate-900 font-semibold font-mono tabular-nums">
                {weeklyStats ? `${weeklyStats.adherencePercentage}%` : '0%'}
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-mono tabular-nums font-bold text-slate-900">
                {weeklyStats?.completedSessions || 0}
              </span>
              <span className="text-slate-500 font-mono text-xs">
                / <span className="tabular-nums">{weeklyStats?.plannedSessions || userProfile?.workoutDaysPerWeek || 4}</span> sessions
              </span>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-3 font-mono">
            <span className="tabular-nums font-semibold text-slate-700">{weeklyStats?.totalDurationMinutes || 0}</span> min total training logged
          </p>
        </div>

        {/* Workout Volume Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-mono text-slate-500 mb-2 font-medium">
              <span>Today's session volume</span>
              <span className="text-slate-900 font-semibold font-mono tabular-nums">{completionPercentage}%</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-mono tabular-nums font-bold text-slate-900">
                {totalSetsCompleted}
              </span>
              <span className="text-slate-500 font-mono text-xs">
                / <span className="tabular-nums">{totalSetsPrescribed}</span> sets
              </span>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-3 font-mono">
            Prescribed load: <span className="tabular-nums font-semibold text-slate-700">{totalVolumeLifted.toLocaleString()}</span> {settings.weightUnit}
          </p>
        </div>

        {/* Coach Subscription Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-mono text-slate-500 mb-2 font-medium">
              <span>Assigned coach</span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded font-medium ${
                  activeSubscriptions.length > 0
                    ? 'bg-slate-100 text-slate-800 border border-slate-200'
                    : 'bg-slate-50 text-slate-500 border border-slate-200'
                }`}
              >
                {activeSubscriptions.length > 0 ? 'Active 1-on-1' : 'Independent'}
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
            <span className="text-slate-500 font-mono text-[11px]">
              {activeSubscriptions.length > 0
                ? `$${activeSubscriptions[0].amountPaid}/mo • CSCS Certified`
                : 'Browse certified trainers'}
            </span>
            <button
              type="button"
              onClick={() => onNavigate('coaches')}
              className="text-slate-900 font-medium hover:underline flex items-center gap-0.5"
            >
              <span>{activeSubscriptions.length > 0 ? 'Manage' : 'Explore'}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Today's Prescribed Session */}
      {workout ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="text-[11px] font-mono text-slate-500 font-medium">
                Scheduled routine • {workout.focus}
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5 text-balance">
                {workout.title}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onNavigate('workout')}
                className="min-h-[40px] px-3.5 py-2 text-xs font-medium text-slate-700 hover:text-slate-950 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors touch-manipulation"
              >
                View full split
              </button>
              <button
                type="button"
                onClick={onStartSession}
                className="min-h-[40px] flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors shadow-2xs touch-manipulation"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start workout</span>
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
                  <span className="font-mono tabular-nums text-slate-400 w-4 font-medium">{idx + 1}</span>
                  <div>
                    <span className="font-semibold text-slate-900 block">
                      {ex.name}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {ex.targetMuscle} • Tempo: {ex.tempo}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:gap-4 font-mono">
                  <span className="text-slate-600">
                    <span className="tabular-nums font-medium text-slate-800">{ex.sets}</span> × <span className="tabular-nums font-medium text-slate-800">{ex.reps}</span> @ <span className="tabular-nums font-medium text-slate-800">{ex.weight}</span> {settings.weightUnit}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-medium tabular-nums ${
                      ex.completedSets >= ex.sets
                        ? 'bg-slate-900 text-white'
                        : ex.completedSets > 0
                        ? 'bg-slate-100 text-slate-800 border border-slate-300'
                        : 'bg-slate-50 text-slate-500 border border-slate-200'
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
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-8 text-center space-y-3">
          <Calendar className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">No routine assigned for today</h3>
          <p className="text-xs text-slate-600 max-w-sm mx-auto text-pretty">
            Today might be an active recovery day, or you can generate a personalized program with the AI coach.
          </p>
          <button
            type="button"
            onClick={() => onNavigate('workout')}
            className="min-h-[40px] px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors"
          >
            Manage workout plans
          </button>
        </div>
      )}

      {/* AI Coach Insight & Guidance */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200/80 p-5 flex items-start justify-between gap-4 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <MessageSquare className="w-4 h-4 text-slate-700" />
            <span className="text-[11px] font-mono text-slate-600 font-medium">
              Weekly coaching insight
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed text-pretty">
            {aiWeeklySummary ||
              `Profile configured for ${userProfile?.fitnessLevel || 'INTERMEDIATE'} level with target focus on ${
                userProfile?.goals.map(g => g.replace('_', ' ')).join(', ') || 'Muscle Building'
              }. Ask coach anytime for progressive overload targets or exercise modifications.`}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onNavigate('coach')}
          className="min-h-[40px] text-xs font-semibold text-slate-900 hover:text-slate-700 whitespace-nowrap flex items-center gap-1 shrink-0"
        >
          <span>Ask coach</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Recent Workouts Logged from PostgreSQL */}
      {weeklyStats?.recentLogs && weeklyStats.recentLogs.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 sm:p-6 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-xs font-semibold text-slate-900 font-mono">
              Recent completed sessions
            </span>
            <button
              type="button"
              onClick={() => onNavigate('progress')}
              className="text-xs text-slate-600 hover:text-slate-950 font-mono flex items-center gap-1 font-medium"
            >
              <span>View full history</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {weeklyStats.recentLogs.slice(0, 3).map((log: any) => (
              <div key={log.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-slate-900 block">{log.notes || 'Training Session'}</span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(log.workoutDate))} • <span className="tabular-nums font-medium text-slate-700">{log.durationMinutes}</span> min
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-mono border border-slate-200 font-medium">
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
    </div>
  );
};
