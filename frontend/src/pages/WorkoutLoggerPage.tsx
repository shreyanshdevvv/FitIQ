import React, { useEffect, useState } from 'react';
import { apiRequest } from '../api/client';
import { ClipboardList, Plus, Trash2, CheckCircle, Clock, Check, AlertCircle } from 'lucide-react';

export const WorkoutLoggerPage: React.FC = () => {
  const [exercises, setExercises] = useState<any[]>([]);
  const [selectedExerciseId, setSelectedExerciseId] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [difficulty, setDifficulty] = useState<'EASY' | 'MODERATE' | 'HARD' | 'VERY_HARD'>('MODERATE');
  const [notes, setNotes] = useState('');

  // Logged exercise sets
  const [loggedSets, setLoggedSets] = useState<any[]>([
    { exerciseId: '', setsCompleted: 3, repsCompleted: 10, weightUsed: 60, notes: '' },
  ]);

  // Floating Rest Timer
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    loadExercises();
  }, []);

  // Timer countdown hook
  useEffect(() => {
    let interval: any;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0 && isTimerRunning) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  const loadExercises = async () => {
    try {
      const data = await apiRequest('/exercises');
      setExercises(data);
      if (data.length > 0) {
        setSelectedExerciseId(data[0].id);
        setLoggedSets([
          { exerciseId: data[0].id, setsCompleted: 4, repsCompleted: 8, weightUsed: 60, notes: 'Felt solid' },
        ]);
      }
    } catch (err) {
      console.error('Failed to load exercises:', err);
    }
  };

  const startTimer = (seconds: number) => {
    setTimerSeconds(seconds);
    setIsTimerRunning(true);
  };

  const addSetRow = () => {
    setLoggedSets((prev) => [
      ...prev,
      { exerciseId: selectedExerciseId || (exercises[0]?.id ?? ''), setsCompleted: 3, repsCompleted: 10, weightUsed: 0, notes: '' },
    ]);
  };

  const removeSetRow = (idx: number) => {
    setLoggedSets((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateSetRow = (idx: number, field: string, value: any) => {
    setLoggedSets((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      return copy;
    });
  };

  const handleSaveLog = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage(null);

    try {
      const payload = {
        workoutDate: new Date().toISOString(),
        durationMinutes: Number(durationMinutes),
        perceivedDifficulty: difficulty,
        notes: notes || undefined,
        exercises: loggedSets.map((s) => ({
          exerciseId: s.exerciseId,
          setsCompleted: Number(s.setsCompleted),
          repsCompleted: Number(s.repsCompleted),
          weightUsed: Number(s.weightUsed) || 0,
          notes: s.notes || undefined,
        })),
      };

      await apiRequest('/workouts/logs', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      setSuccessMessage('Workout logged successfully! Telemetry updated in database.');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to save workout log');
    } finally {
      setSaving(false);
    }
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-subtle">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Active Gym Logger</h1>
          <p className="text-sm text-slate-400 mt-1">
            Log weights, sets, and rest intervals in real time.
          </p>
        </div>

        {/* Floating In-Gym Rest Timer */}
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-surface border border-accent-volt/40 shadow-md">
          <Clock className={`w-5 h-5 ${isTimerRunning ? 'text-accent-volt animate-pulse' : 'text-slate-400'}`} />
          <span className="font-mono text-lg font-bold text-white tracking-widest">
            {formatTimer(timerSeconds)}
          </span>
          <div className="flex gap-1.5 ml-2">
            {[60, 90, 120].map((sec) => (
              <button
                key={sec}
                type="button"
                onClick={() => startTimer(sec)}
                className="px-2 py-1 rounded bg-surface-card hover:bg-accent-volt hover:text-black text-slate-300 text-xs font-mono font-semibold transition-colors"
              >
                {sec}s
              </button>
            ))}
          </div>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl bg-accent-volt/10 border border-accent-volt/30 text-accent-volt flex items-center gap-2 text-sm font-semibold">
          <CheckCircle className="w-5 h-5" />
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSaveLog} className="space-y-6">
        {/* Session Telemetry Card */}
        <div className="p-6 rounded-xl bg-surface border border-border-subtle grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Duration (Minutes)
            </label>
            <input
              type="number"
              min="5"
              max="240"
              required
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              className="w-full px-3.5 py-2 rounded-lg bg-surface-card border border-border-subtle text-white text-sm focus:outline-none focus:border-accent-volt"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Perceived Exertion
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as any)}
              className="w-full px-3.5 py-2 rounded-lg bg-surface-card border border-border-subtle text-white text-sm focus:outline-none focus:border-accent-volt"
            >
              <option value="EASY">EASY (Recovery)</option>
              <option value="MODERATE">MODERATE (Target RPE 7-8)</option>
              <option value="HARD">HARD (RPE 9-10)</option>
              <option value="VERY_HARD">VERY HARD (Near Failure)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Session Notes
            </label>
            <input
              type="text"
              placeholder="e.g. Focused on chest pause reps"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg bg-surface-card border border-border-subtle text-white text-sm focus:outline-none focus:border-accent-volt"
            />
          </div>
        </div>

        {/* Exercises Tracker Table */}
        <div className="p-6 rounded-xl bg-surface border border-border-subtle space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
            <h2 className="text-base font-bold text-white">Logged Movements</h2>
            <button
              type="button"
              onClick={addSetRow}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-card border border-border-subtle text-xs font-semibold text-slate-200 hover:text-white hover:border-slate-400 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-accent-volt" />
              Add Movement
            </button>
          </div>

          <div className="space-y-3">
            {loggedSets.map((row, idx) => (
              <div
                key={idx}
                className="p-4 rounded-lg bg-surface-card/60 border border-border-subtle grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
              >
                {/* Exercise selection */}
                <div className="sm:col-span-5">
                  <label className="block text-[10px] font-semibold uppercase text-slate-400 mb-1">
                    Movement
                  </label>
                  <select
                    value={row.exerciseId}
                    onChange={(e) => updateSetRow(idx, 'exerciseId', e.target.value)}
                    className="w-full px-3 py-1.5 rounded bg-background border border-border-subtle text-white text-xs focus:outline-none focus:border-accent-volt"
                  >
                    {exercises.map((ex) => (
                      <option key={ex.id} value={ex.id}>
                        {ex.name} ({ex.category})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sets */}
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-semibold uppercase text-slate-400 mb-1">
                    Sets
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={row.setsCompleted}
                    onChange={(e) => updateSetRow(idx, 'setsCompleted', Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded bg-background border border-border-subtle text-white text-xs font-mono"
                  />
                </div>

                {/* Reps */}
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-semibold uppercase text-slate-400 mb-1">
                    Reps
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={row.repsCompleted}
                    onChange={(e) => updateSetRow(idx, 'repsCompleted', Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded bg-background border border-border-subtle text-white text-xs font-mono"
                  />
                </div>

                {/* Weight */}
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-semibold uppercase text-slate-400 mb-1">
                    Load (kg)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={row.weightUsed}
                    onChange={(e) => updateSetRow(idx, 'weightUsed', Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded bg-background border border-border-subtle text-white text-xs font-mono text-accent-volt font-bold"
                  />
                </div>

                {/* Delete button */}
                <div className="sm:col-span-1 flex justify-end sm:pt-4">
                  <button
                    type="button"
                    disabled={loggedSets.length === 1}
                    onClick={() => removeSetRow(idx)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 disabled:opacity-30 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-border-subtle flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-lg bg-accent-volt hover:bg-accent-volt-hover text-background font-bold text-sm shadow-md transition-all disabled:opacity-50"
            >
              {saving ? 'Saving Session...' : 'Finish & Save Workout'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
