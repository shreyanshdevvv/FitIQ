import React, { useState, useEffect } from 'react';
import { 
  X, 
  Check, 
  Plus, 
  Minus,
} from 'lucide-react';
import { useFitness } from '../context/FitnessContext';

interface WorkoutSessionModalProps {
  onClose: () => void;
  onFinishWorkout: () => void;
}

export const WorkoutSessionModal: React.FC<WorkoutSessionModalProps> = ({
  onClose,
  onFinishWorkout,
}) => {
  const { workout, logCompletedSet, settings, saveCompletedSessionToBackend } = useFitness();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  
  const currentEx = workout.exercises[currentIdx] || workout.exercises[0];

  const [activeWeight, setActiveWeight] = useState(currentEx ? currentEx.weight : 0);
  const [activeReps, setActiveReps] = useState(currentEx ? currentEx.reps : 8);

  // Timer
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [restSeconds, setRestSeconds] = useState(currentEx ? currentEx.restSec : 90);
  const [elapsedSec, setElapsedSec] = useState(0);

  useEffect(() => {
    if (currentEx) {
      setActiveWeight(currentEx.weight);
      setActiveReps(currentEx.reps);
      setRestSeconds(currentEx.restSec);
      setIsTimerRunning(false);
      setCurrentSet(Math.min(currentEx.sets, (currentEx.completedSets || 0) + 1));
    }
  }, [currentIdx, currentEx]);

  useEffect(() => {
    const elapsedInterval = setInterval(() => setElapsedSec((s) => s + 1), 1000);
    return () => clearInterval(elapsedInterval);
  }, []);

  useEffect(() => {
    let t: NodeJS.Timeout | null = null;
    if (isTimerRunning && restSeconds > 0) {
      t = setInterval(() => {
        setRestSeconds((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (t) clearInterval(t);
    };
  }, [isTimerRunning, restSeconds]);

  const formatSec = (total: number) => {
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleFinish = async () => {
    const durationMinutes = Math.max(1, Math.round(elapsedSec / 60));
    await saveCompletedSessionToBackend(durationMinutes);
    onFinishWorkout();
  };

  const handleCompleteCurrentSet = async () => {
    if (currentEx) {
      logCompletedSet(currentEx.id);
    }

    if (currentSet < currentEx.sets) {
      setCurrentSet(currentSet + 1);
      setRestSeconds(currentEx.restSec);
      setIsTimerRunning(true);
    } else {
      // Completed all sets for this exercise
      if (currentIdx < workout.exercises.length - 1) {
        setCurrentIdx(currentIdx + 1);
      } else {
        await handleFinish();
      }
    }
  };

  if (!currentEx) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl border border-slate-200 shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
              Live Session • Elapsed {formatSec(elapsedSec)}
            </div>
            <h3 className="text-base font-bold text-slate-900">{workout.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="flex items-center justify-between text-xs font-mono text-slate-500">
            <span>
              Movement {currentIdx + 1} of {workout.exercises.length}
            </span>
            <span>
              Set {currentSet} of {currentEx.sets}
            </span>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-900">{currentEx.name}</h2>
            <p className="text-xs text-slate-500 font-mono mt-1">
              Target: {currentEx.targetMuscle} • Tempo: {currentEx.tempo}
            </p>
          </div>

          {currentEx.note && (
            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg text-xs text-slate-700">
              <span className="font-semibold text-slate-900 block mb-0.5">Execution Cue:</span>
              {currentEx.note}
            </div>
          )}

          {/* Load & Reps Adjuster */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between">
              <span className="text-[11px] font-mono text-slate-500 uppercase">
                Weight ({settings.weightUnit})
              </span>
              <div className="flex items-center justify-between mt-2">
                <button
                  onClick={() => setActiveWeight(Math.max(0, activeWeight - 2.5))}
                  className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-mono text-2xl font-bold text-slate-900">
                  {activeWeight}
                </span>
                <button
                  onClick={() => setActiveWeight(activeWeight + 2.5)}
                  className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between">
              <span className="text-[11px] font-mono text-slate-500 uppercase">Reps</span>
              <div className="flex items-center justify-between mt-2">
                <button
                  onClick={() => setActiveReps(Math.max(1, activeReps - 1))}
                  className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-mono text-2xl font-bold text-slate-900">
                  {activeReps}
                </span>
                <button
                  onClick={() => setActiveReps(activeReps + 1)}
                  className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Rest Timer */}
          <div className="p-4 bg-slate-900 text-white rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 block">
                Rest Timer
              </span>
              <span className="text-2xl font-mono font-bold">{formatSec(restSeconds)}</span>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
              >
                {isTimerRunning ? 'Pause' : 'Start Timer'}
              </button>
              <button
                onClick={() => setRestSeconds((s) => s + 30)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                +30s
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={() => {
              if (currentIdx > 0) setCurrentIdx(currentIdx - 1);
            }}
            disabled={currentIdx === 0}
            className="text-xs text-slate-500 hover:text-slate-900 disabled:opacity-30"
          >
            ← Previous
          </button>

          <button
            onClick={handleCompleteCurrentSet}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>
              {currentSet === currentEx.sets && currentIdx === workout.exercises.length - 1
                ? 'Finish Workout (Log to DB)'
                : `Log Set ${currentSet}`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
