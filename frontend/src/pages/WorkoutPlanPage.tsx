import React, { useEffect, useState } from 'react';
import { apiRequest } from '../api/client';
import { Plus, Sparkles, X, ChevronRight, Check, Clock, Dumbbell } from 'lucide-react';

export const WorkoutPlanPage: React.FC = () => {
  const [plans, setPlans] = useState<any[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [loading, setLoading] = useState(true);

  // AI Generator Modal state
  const [showGenModal, setShowGenModal] = useState(false);
  const [focusAreas, setFocusAreas] = useState<string[]>(['Chest', 'Back']);
  const [genLoading, setGenLoading] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    setLoading(true);
    try {
      const data = await apiRequest('/workouts/plans');
      setPlans(data);
      if (data.length > 0) {
        setSelectedPlan(data[0]);
      }
    } catch (err) {
      console.error('Failed to load workout plans:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAI = async () => {
    setGenLoading(true);
    setGenError(null);
    try {
      const result = await apiRequest('/ai/workout-plan', {
        method: 'POST',
        body: JSON.stringify({
          focusAreas,
          daysPerWeek: 3,
          experienceLevel: 'INTERMEDIATE',
        }),
      });

      setShowGenModal(false);
      await loadPlans();
      if (result) {
        setSelectedPlan(result);
        setSelectedDay(1);
      }
    } catch (err: any) {
      setGenError(err.message || 'AI generation failed. Please try again.');
    } finally {
      setGenLoading(false);
    }
  };

  const toggleFocusArea = (area: string) => {
    if (focusAreas.includes(area)) {
      if (focusAreas.length > 1) {
        setFocusAreas(focusAreas.filter((a) => a !== area));
      }
    } else {
      setFocusAreas([...focusAreas, area]);
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center">
        <div className="text-xs font-mono text-muted animate-pulse">Loading training periodization...</div>
      </div>
    );
  }

  // Get exercises for selected day
  const currentDayExercises = selectedPlan?.exercises?.filter(
    (item: any) => item.dayNumber === selectedDay,
  ) || [];

  const availableDays = Array.from(
    new Set((selectedPlan?.exercises || []).map((e: any) => e.dayNumber)),
  ).sort((a: any, b: any) => a - b);

  return (
    <div className="space-y-8">
      {/* Title Row */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text">Training Plans</h1>
          <p className="text-xs text-muted mt-1">
            Structured periodization schedules, rep-in-reserve targets & volume distributions
          </p>
        </div>
        <button
          onClick={() => setShowGenModal(true)}
          className="px-3.5 py-1.5 text-xs font-medium bg-primary text-primary-ink hover:bg-neutral-200 rounded-control transition-colors flex items-center gap-1.5 self-start"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Generate with Gemini 3.8</span>
        </button>
      </div>

      {/* Plan Selector & Day Tabs */}
      {plans.length > 0 ? (
        <div className="space-y-6">
          {/* Active Plan Metadata Capsule */}
          <div className="bg-surface border border-border rounded-card p-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono uppercase px-1.5 py-0.5 rounded bg-raised border border-border text-muted">
                    Active Program
                  </span>
                  <span className="text-xs text-faint">
                    {selectedPlan?.exercises?.length || 0} Total Movements
                  </span>
                </div>
                <h2 className="text-lg font-semibold text-text">{selectedPlan?.title}</h2>
                <p className="text-xs text-muted mt-1 max-w-2xl">{selectedPlan?.description}</p>
              </div>

              {/* Other Plan Switcher Dropdown / Pills */}
              {plans.length > 1 && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {plans.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setSelectedPlan(p);
                        setSelectedDay(1);
                      }}
                      className={`px-3 py-1.5 text-xs rounded-control border text-nowrap transition-colors ${
                        selectedPlan?.id === p.id
                          ? 'border-text bg-raised text-text font-medium'
                          : 'border-border text-muted hover:text-text hover:bg-raised'
                      }`}
                    >
                      {p.title}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Microcycle Day Selector Tabs */}
            {availableDays.length > 0 && (
              <div className="flex items-center gap-2 mt-6 pt-4 border-t border-border/60">
                <span className="text-xs font-medium text-faint uppercase tracking-wider mr-2">
                  Microcycle:
                </span>
                {availableDays.map((day: any) => (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`px-3 py-1 text-xs font-medium rounded-control transition-colors ${
                      selectedDay === day
                        ? 'bg-text text-ground font-semibold'
                        : 'text-muted hover:text-text hover:bg-raised'
                    }`}
                  >
                    Day 0{day}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Exercise Table for the Day */}
          <div className="bg-surface border border-border rounded-card overflow-hidden">
            <div className="px-5 py-3.5 border-b border-border bg-ground/40 flex items-center justify-between">
              <div className="text-xs font-semibold text-text uppercase tracking-wider">
                Prescribed Movements (Day 0{selectedDay})
              </div>
              <div className="text-xs font-mono text-muted">
                {currentDayExercises.length} Exercises
              </div>
            </div>

            {currentDayExercises.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border text-muted font-medium bg-ground/20">
                      <th className="py-2.5 px-4 font-normal w-12 text-center">#</th>
                      <th className="py-2.5 px-4 font-normal">Exercise</th>
                      <th className="py-2.5 px-4 font-normal">Muscle Focus</th>
                      <th className="py-2.5 px-4 font-normal text-right">Sets</th>
                      <th className="py-2.5 px-4 font-normal text-right">Reps</th>
                      <th className="py-2.5 px-4 font-normal text-right">Rest Interval</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {currentDayExercises.map((item: any, idx: number) => {
                      const exercise = item.exercise;
                      return (
                        <tr key={item.id || idx} className="hover:bg-raised/40 transition-colors">
                          <td className="py-3 px-4 font-mono text-faint text-center">
                            {idx + 1}
                          </td>
                          <td className="py-3 px-4 font-medium text-text">
                            <div>{exercise?.name || 'Movement'}</div>
                            <div className="text-[11px] text-faint font-mono mt-0.5">
                              {exercise?.equipmentNeeded || 'Standard Gym'}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-wrap gap-1">
                              {(exercise?.muscleGroups || ['Chest']).map((mg: string, mIdx: number) => (
                                <span
                                  key={mIdx}
                                  className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-ground border border-border text-muted"
                                >
                                  {mg}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-text text-sm">
                            {item.targetSets}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-text text-sm">
                            {item.targetReps}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-muted">
                            {item.restSeconds ? `${item.restSeconds}s` : '90s'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-muted">
                No exercises registered for Day 0{selectedDay} of this plan.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-card p-12 text-center space-y-4">
          <Dumbbell className="w-8 h-8 text-muted mx-auto stroke-[1.5]" />
          <div>
            <h2 className="text-base font-semibold text-text">No Workout Plans Found</h2>
            <p className="text-xs text-muted max-w-sm mx-auto mt-1">
              Initialize your training with our sports science AI generator or connect with a coach.
            </p>
          </div>
          <button
            onClick={() => setShowGenModal(true)}
            className="px-4 py-2 text-xs font-medium bg-primary text-primary-ink hover:bg-neutral-200 rounded-control transition-colors inline-flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate Periodized Routine</span>
          </button>
        </div>
      )}

      {/* AI Generator Modal / Sheet */}
      {showGenModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-card w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent stroke-[1.5]" />
                <h3 className="text-sm font-semibold text-text">AI Periodization Generator</h3>
              </div>
              <button
                onClick={() => setShowGenModal(false)}
                className="text-muted hover:text-text p-1 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <p className="text-muted">
                Powered by Gemini 3.8 Flash. The routine references empirical hypertrophy literature and selects movements directly from the exercise library.
              </p>

              <div>
                <label className="block text-muted font-medium mb-2">Target Muscle Focus</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Chest', 'Back', 'Shoulders', 'Legs', 'Arms', 'Core'].map((area) => {
                    const isSelected = focusAreas.includes(area);
                    return (
                      <button
                        key={area}
                        type="button"
                        onClick={() => toggleFocusArea(area)}
                        className={`p-2 rounded-control border text-center font-medium transition-colors ${
                          isSelected
                            ? 'border-text bg-raised text-text'
                            : 'border-border text-muted hover:text-text hover:bg-raised/50'
                        }`}
                      >
                        {area}
                      </button>
                    );
                  })}
                </div>
              </div>

              {genError && (
                <div className="p-2.5 rounded-control text-negative bg-negative/10 border border-negative/20 text-xs">
                  {genError}
                </div>
              )}
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-border">
              <button
                type="button"
                onClick={() => setShowGenModal(false)}
                className="px-3 py-1.5 text-xs text-muted hover:text-text rounded-control transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleGenerateAI}
                disabled={genLoading}
                className="px-4 py-1.5 text-xs font-medium bg-primary text-primary-ink hover:bg-neutral-200 rounded-control transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                {genLoading ? (
                  <>
                    <span className="w-3 h-3 border-2 border-primary-ink/30 border-t-primary-ink rounded-full animate-spin" />
                    <span>Synthesizing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate Plan</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
