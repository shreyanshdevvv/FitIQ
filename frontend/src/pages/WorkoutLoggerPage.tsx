import React, { useEffect, useState } from 'react';
import { apiRequest } from '../api/client';
import { Plus, Trash2, CheckCircle2, Clock, Play, Pause, RotateCcw, AlertCircle } from 'lucide-react';

export const WorkoutLoggerPage: React.FC = () => {
  const [exercises, setExercises] = useState<any[]>([]);
  const [selectedExerciseId, setSelectedExerciseId] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(50);
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

  // Timer interval countdown
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      // Subtle audio ping if available
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, audioCtx.currentTime);
        osc.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
      } catch (e) {
        // AudioContext not allowed or not supported
      }
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
          { exerciseId: data[0].id, setsCompleted: 3, repsCompleted: 10, weightUsed: 60, notes: '' },
        ]);
      }
    } catch (err) {
      console.error('Failed to load exercises:', err);
    }
  };

  const addSetRow = () => {
    setLoggedSets([
      ...loggedSets,
      {
        exerciseId: selectedExerciseId || (exercises[0]?.id ?? ''),
        setsCompleted: 3,
        repsCompleted: 10,
        weightUsed: 60,
        notes: '',
      },
    ]);
  };

  const removeSetRow = (index: number) => {
    if (loggedSets.length > 1) {
      setLoggedSets(loggedSets.filter((_, i) => i !== index));
    }
  };

  const updateSetRow = (index: number, field: string, value: any) => {
    const updated = [...loggedSets];
    updated[index][field] = value;
    setLoggedSets(updated);
  };

  const startRestTimer = (seconds: number) => {
    setTimerSeconds(seconds);
    setIsTimerRunning(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage(null);

    try {
      await apiRequest('/workouts/logs', {
        method: 'POST',
        body: JSON.stringify({
          durationMinutes: Number(durationMinutes),
          difficulty,
          notes: notes.trim(),
          exercises: loggedSets.map((s) => ({
            exerciseId: s.exerciseId,
            setsCompleted: Number(s.setsCompleted),
            repsCompleted: Number(s.repsCompleted),
            weightUsed: Number(s.weightUsed),
            notes: s.notes,
          })),
        }),
      });

      setSuccessMessage('Training session recorded successfully.');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to record workout session');
    } finally {
      setSaving(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Title Row */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text">Active Session Logger</h1>
          <p className="text-xs text-muted mt-1">
            Input working sets, actual load (kg), repetition counts and exertion indices
          </p>
        </div>

        {/* Digital Rest Timer Capsule */}
        <div className="flex items-center gap-3 p-2 px-3.5 bg-surface border border-border rounded-control self-start sm:self-auto">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-muted" />
            <span className="font-mono text-base font-semibold text-text tabular">
              {formatTimer(timerSeconds)}
            </span>
          </div>

          <div className="flex items-center gap-1 border-l border-border pl-3">
            <button
              type="button"
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="p-1 text-muted hover:text-text rounded hover:bg-raised transition-colors"
              title={isTimerRunning ? 'Pause' : 'Start'}
            >
              {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsTimerRunning(false);
                setTimerSeconds(0);
              }}
              className="p-1 text-muted hover:text-text rounded hover:bg-raised transition-colors"
              title="Reset"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-1 border-l border-border pl-3">
            {[60, 90, 120].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => startRestTimer(s)}
                className="px-1.5 py-0.5 text-[11px] font-mono rounded border border-border/80 hover:bg-raised text-muted hover:text-text transition-colors"
              >
                {s}s
              </button>
            ))}
          </div>
        </div>
      </div>

      {successMessage && (
        <div className="p-3 bg-positive/10 border border-positive/20 text-positive text-xs rounded-control flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Main Logging Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Session Meta Panel */}
        <div className="bg-surface border border-border rounded-card p-5">
          <div className="text-xs font-semibold text-text uppercase tracking-wider mb-4 border-b border-border/70 pb-2">
            Session Context
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-muted font-medium mb-1.5">Duration (Minutes)</label>
              <input
                type="number"
                min="5"
                max="240"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full bg-ground border border-border rounded-control px-3 py-2 text-sm text-text font-mono focus:outline-none focus:border-text transition-colors"
              />
            </div>

            <div>
              <label className="block text-muted font-medium mb-1.5">Perceived Exertion (RPE)</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full bg-ground border border-border rounded-control px-3 py-2 text-sm text-text focus:outline-none focus:border-text transition-colors"
              >
                <option value="EASY">Light / Deload (RPE 6)</option>
                <option value="MODERATE">Moderate / Target (RPE 7-8)</option>
                <option value="HARD">Heavy / Near Failure (RPE 8.5-9)</option>
                <option value="VERY_HARD">Maximal / All Out (RPE 10)</option>
              </select>
            </div>

            <div>
              <label className="block text-muted font-medium mb-1.5">Session Notes</label>
              <input
                type="text"
                placeholder="Good bar speed on squat, felt recovered..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-ground border border-border rounded-control px-3 py-2 text-sm text-text placeholder:text-faint focus:outline-none focus:border-text transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Set Rows Panel */}
        <div className="bg-surface border border-border rounded-card overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border bg-ground/40 flex items-center justify-between">
            <div className="text-xs font-semibold text-text uppercase tracking-wider">
              Working Movements & Load
            </div>
            <button
              type="button"
              onClick={addSetRow}
              className="text-xs text-text hover:text-muted flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Movement Row</span>
            </button>
          </div>

          <div className="p-5 space-y-3">
            {loggedSets.map((row, index) => (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-12 gap-3 p-3 bg-ground border border-border/80 rounded-control items-center text-xs"
              >
                <div className="md:col-span-5">
                  <label className="block text-[11px] text-muted mb-1 md:hidden">Exercise</label>
                  <select
                    value={row.exerciseId}
                    onChange={(e) => updateSetRow(index, 'exerciseId', e.target.value)}
                    className="w-full bg-surface border border-border rounded-control px-2.5 py-1.5 text-xs text-text focus:outline-none focus:border-text transition-colors"
                  >
                    {exercises.map((ex) => (
                      <option key={ex.id} value={ex.id}>
                        {ex.name} ({ex.category})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[11px] text-muted mb-1 md:hidden">Sets</label>
                  <div className="flex items-center gap-1.5">
                    <span className="hidden md:inline text-[11px] text-faint font-mono">Sets</span>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={row.setsCompleted}
                      onChange={(e) => updateSetRow(index, 'setsCompleted', Number(e.target.value))}
                      className="w-full bg-surface border border-border rounded-control px-2 py-1.5 text-xs text-text font-mono text-center focus:outline-none focus:border-text"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[11px] text-muted mb-1 md:hidden">Reps</label>
                  <div className="flex items-center gap-1.5">
                    <span className="hidden md:inline text-[11px] text-faint font-mono">Reps</span>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={row.repsCompleted}
                      onChange={(e) => updateSetRow(index, 'repsCompleted', Number(e.target.value))}
                      className="w-full bg-surface border border-border rounded-control px-2 py-1.5 text-xs text-text font-mono text-center focus:outline-none focus:border-text"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[11px] text-muted mb-1 md:hidden">Load (kg)</label>
                  <div className="flex items-center gap-1.5">
                    <span className="hidden md:inline text-[11px] text-faint font-mono">Kg</span>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="600"
                      value={row.weightUsed}
                      onChange={(e) => updateSetRow(index, 'weightUsed', Number(e.target.value))}
                      className="w-full bg-surface border border-border rounded-control px-2 py-1.5 text-xs text-text font-mono text-center focus:outline-none focus:border-text"
                    />
                  </div>
                </div>

                <div className="md:col-span-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeSetRow(index)}
                    disabled={loggedSets.length === 1}
                    className="p-1.5 text-muted hover:text-negative disabled:opacity-30 transition-colors"
                    title="Remove Movement"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="px-5 py-3 border-t border-border bg-ground/20 flex justify-between items-center text-xs text-muted">
            <span>
              Total calculated volume:{' '}
              <span className="font-mono font-semibold text-text">
                {loggedSets
                  .reduce((acc, curr) => acc + curr.setsCompleted * curr.repsCompleted * curr.weightUsed, 0)
                  .toLocaleString()}{' '}
                kg
              </span>
            </span>

            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-xs font-medium bg-primary text-primary-ink hover:bg-neutral-200 rounded-control transition-colors disabled:opacity-50"
            >
              {saving ? 'Recording Telemetry...' : 'Save Workout Session'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
