import React, { useEffect, useState } from 'react';
import { apiRequest } from '../api/client';
import { Dumbbell, Sparkles, Plus, Clock, Target, Check, ChevronRight } from 'lucide-react';

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
      console.error('Failed to load plans:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePlan = async () => {
    setGenLoading(true);
    setGenError(null);
    try {
      const res = await apiRequest('/ai/generate-workout', {
        method: 'POST',
        body: JSON.stringify({
          focusAreas: focusAreas.map((f) => f.toLowerCase()),
        }),
      });

      setShowGenModal(false);
      await loadPlans();
      if (res.plan) {
        setSelectedPlan(res.plan);
      }
    } catch (err: any) {
      setGenError(err.message || 'Failed to generate AI plan. Ensure your fitness profile is set up.');
    } finally {
      setGenLoading(false);
    }
  };

  const toggleFocusArea = (area: string) => {
    setFocusAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <Dumbbell className="w-8 h-8 animate-spin text-accent-volt mx-auto mb-3" />
        <p className="text-sm text-slate-400">Loading workout programs...</p>
      </div>
    );
  }

  // Group exercises by dayNumber
  const exercisesByDay: Record<number, any[]> = {};
  if (selectedPlan?.exercises) {
    selectedPlan.exercises.forEach((item: any) => {
      const day = item.dayNumber || 1;
      if (!exercisesByDay[day]) exercisesByDay[day] = [];
      exercisesByDay[day].push(item);
    });
  }

  const daysAvailable = Object.keys(exercisesByDay).map(Number).sort((a, b) => a - b);
  const activeDayExercises = exercisesByDay[selectedDay] || (daysAvailable.length > 0 ? exercisesByDay[daysAvailable[0]] : []);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-subtle">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Workout Programs</h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage your structured splits and generate progressive routines via Gemini 3.8 Flash.
          </p>
        </div>
        <button
          onClick={() => setShowGenModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-accent-volt text-background font-bold text-sm hover:bg-accent-volt-hover transition-colors shadow-sm"
        >
          <Sparkles className="w-4 h-4 stroke-[2.5]" />
          Generate AI Routine with Gemini
        </button>
      </div>

      {plans.length === 0 ? (
        <div className="p-12 text-center rounded-xl bg-surface border border-border-subtle">
          <Dumbbell className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <h2 className="text-base font-semibold text-white">No Workout Plans Found</h2>
          <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">
            You haven't generated or saved a training split yet. Use the Gemini AI generator to create a program based on your available equipment.
          </p>
          <button
            onClick={() => setShowGenModal(true)}
            className="mt-4 px-5 py-2.5 rounded-lg bg-accent-volt text-background font-bold text-sm"
          >
            Create Your First Plan
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Plan Selector Column */}
          <div className="space-y-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 px-1">
              Your Saved Plans
            </h2>
            {plans.map((p) => {
              const isSelected = selectedPlan?.id === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => {
                    setSelectedPlan(p);
                    setSelectedDay(1);
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-accent-volt bg-surface-card text-white shadow-md'
                      : 'border-border-subtle bg-surface text-slate-300 hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm line-clamp-1">{p.name}</span>
                    {p.isAiGenerated && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20">
                        AI
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                    {p.exercises?.length || 0} scheduled movements
                  </p>
                </div>
              );
            })}
          </div>

          {/* Plan Details & Day Tabs */}
          <div className="lg:col-span-3 space-y-4">
            {selectedPlan && (
              <div className="p-6 rounded-xl bg-surface border border-border-subtle">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-border-subtle">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-white">{selectedPlan.name}</h2>
                      {selectedPlan.isAiGenerated && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan">
                          Gemini 3.8 Flash
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{selectedPlan.description}</p>
                  </div>
                </div>

                {/* Day Tabs */}
                <div className="flex gap-2 mt-4 pb-2 border-b border-border-subtle overflow-x-auto">
                  {daysAvailable.map((d) => (
                    <button
                      key={d}
                      onClick={() => setSelectedDay(d)}
                      className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                        selectedDay === d
                          ? 'bg-accent-volt text-background'
                          : 'bg-surface-card text-slate-400 hover:text-white'
                      }`}
                    >
                      Day {d} Focus
                    </button>
                  ))}
                </div>

                {/* Exercises List for Selected Day */}
                <div className="mt-4 space-y-3">
                  {activeDayExercises.map((item: any, idx: number) => (
                    <div
                      key={item.id || idx}
                      className="p-4 rounded-lg bg-surface-card/60 border border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-slate-500">#{item.orderInDay || idx + 1}</span>
                          <span className="font-semibold text-sm text-white">{item.exercise?.name}</span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-background border border-border-subtle text-slate-300">
                            {item.exercise?.category}
                          </span>
                        </div>
                        {item.notes && (
                          <p className="text-xs text-slate-400 pl-5">{item.notes}</p>
                        )}
                      </div>

                      {/* Prescribed Sets / Reps / Rest */}
                      <div className="flex items-center gap-4 text-xs font-mono self-end sm:self-center shrink-0">
                        <div className="px-2.5 py-1 rounded bg-background border border-border-subtle text-slate-200">
                          <span className="text-slate-400 mr-1">SETS</span>
                          <strong className="text-accent-volt">{item.sets}</strong>
                        </div>
                        <div className="px-2.5 py-1 rounded bg-background border border-border-subtle text-slate-200">
                          <span className="text-slate-400 mr-1">REPS</span>
                          <strong className="text-accent-volt">{item.reps || 'Timed'}</strong>
                        </div>
                        <div className="px-2.5 py-1 rounded bg-background border border-border-subtle text-slate-200 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{item.restSeconds}s</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI Routine Generator Modal */}
      {showGenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl bg-surface border border-border-subtle p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent-cyan" />
                <h3 className="font-bold text-white text-base">Generate AI Workout Routine</h3>
              </div>
              <button
                onClick={() => setShowGenModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            {genError && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {genError}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Select Muscle Focus Areas
              </label>
              <div className="flex flex-wrap gap-2">
                {['Chest', 'Back', 'Quads', 'Hamstrings', 'Shoulders', 'Arms', 'Core'].map((area) => {
                  const isSelected = focusAreas.includes(area);
                  return (
                    <button
                      key={area}
                      type="button"
                      onClick={() => toggleFocusArea(area)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        isSelected
                          ? 'bg-accent-volt/15 border-accent-volt text-white font-semibold'
                          : 'bg-surface-card border-border-subtle text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      {area}
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                Gemini 3.8 Flash will query your fitness profile, available equipment, and injuries to architect a personalized split.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
              <button
                type="button"
                onClick={() => setShowGenModal(false)}
                className="px-4 py-2 rounded-lg bg-surface-card border border-border-subtle text-xs font-medium text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={genLoading}
                onClick={handleGeneratePlan}
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-accent-volt hover:bg-accent-volt-hover text-background font-bold text-xs disabled:opacity-50"
              >
                {genLoading ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                    Generating with Gemini...
                  </>
                ) : (
                  'Generate Program'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
