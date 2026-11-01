import React from 'react';
import { Play, ArrowRight, Activity, Calendar } from 'lucide-react';
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
    todayBiometrics, 
    macros, 
    settings, 
    totalSetsCompleted, 
    totalSetsPrescribed, 
    completionPercentage,
    totalVolumeLifted,
    weeklyStats,
    aiWeeklySummary,
    userProfile
  } = useFitness();

  const totalCalories = Math.round(
    macros.proteinCurrent * 4 + macros.carbsCurrent * 4 + macros.fatsCurrent * 9
  );

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Readiness Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between text-xs font-mono text-slate-500 mb-2">
            <span>READINESS SCORE</span>
            <span className="text-emerald-700 font-semibold">
              {todayBiometrics.readiness >= 85 ? 'Optimal' : 'Moderate'}
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-mono font-bold text-slate-900">
              {todayBiometrics.readiness}
            </span>
            <span className="text-slate-400 font-mono text-xs">/ 100</span>
          </div>
          <p className="text-xs text-slate-500 mt-2 font-mono">
            HRV: {todayBiometrics.hrv}ms • Sleep: {todayBiometrics.sleepHours}h • RHR: {todayBiometrics.restingHr}bpm
          </p>
        </div>

        {/* Workout Progress Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between text-xs font-mono text-slate-500 mb-2">
            <span>TODAY'S VOLUME</span>
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
          <p className="text-xs text-slate-500 mt-2 font-mono">
            Lifted: {totalVolumeLifted.toLocaleString()} {settings.weightUnit}
          </p>
        </div>

        {/* Nutrition Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between text-xs font-mono text-slate-500 mb-2">
            <span>ENERGY INTAKE</span>
            <span className="text-slate-600 font-semibold font-mono">
              {totalCalories} kcal
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-mono font-bold text-slate-900">
              {macros.proteinCurrent}
            </span>
            <span className="text-slate-400 font-mono text-xs">
              / {macros.proteinTarget}g Protein
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2 font-mono">
            Carbs: {macros.carbsCurrent}g • Water: {macros.waterCurrentLiters}L
          </p>
        </div>
      </div>

      {/* Real Weekly Telemetry from PostgreSQL */}
      {weeklyStats && (
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-slate-500">PostgreSQL Adherence Telemetry:</span>
            <span className="font-semibold text-slate-900">
              {weeklyStats.completedSessions} of {weeklyStats.plannedSessions} sessions completed this week
            </span>
          </div>
          <div className="flex items-center gap-4 text-slate-600">
            <span>Adherence: <strong className="text-slate-900">{weeklyStats.adherencePercentage}%</strong></span>
            <span>Duration: <strong className="text-slate-900">{weeklyStats.totalDurationMinutes}m</strong></span>
          </div>
        </div>
      )}

      {/* Today's Prescribed Session */}
      {workout ? (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                Scheduled Routine • {workout.focus}
              </div>
              <h2 className="text-xl font-bold text-slate-900 mt-0.5">
                {workout.title}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('workout')}
                className="px-3.5 py-2 text-xs font-medium text-slate-700 hover:text-slate-950 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Edit Routine
              </button>
              <button
                onClick={onStartSession}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start Session</span>
              </button>
            </div>
          </div>

          {/* Exercise Quick List */}
          <div className="divide-y divide-slate-100 mt-2">
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
                      {ex.targetMuscle} • Tempo {ex.tempo}
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
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-3">
          <Calendar className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">No Active Routine Loaded</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Choose a plan from your database or generate an individualized program with the AI Coach.
          </p>
          <button
            onClick={() => onNavigate('workout')}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800"
          >
            Go to Workout Plan
          </button>
        </div>
      )}

      {/* AI Coach Feedback Card */}
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 flex items-start justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold block mb-1">
            AI Assistant Insight
          </span>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            {aiWeeklySummary ||
              `Current profile configured for ${userProfile?.fitnessLevel || 'INTERMEDIATE'} level focusing on ${
                userProfile?.goals.join(', ') || 'hypertrophy & conditioning'
              }. Ask coach anytime for exercise replacements or load progression.`}
          </p>
        </div>
        <button
          onClick={() => onNavigate('coach')}
          className="text-xs font-semibold text-slate-900 hover:text-slate-700 whitespace-nowrap flex items-center gap-1 mt-1"
        >
          <span>Ask Coach</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
