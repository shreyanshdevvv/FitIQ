import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Check, 
  Plus, 
  Minus,
  Timer as TimerIcon,
  BellRing
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
  
  const currentEx = workout?.exercises[currentIdx] || workout?.exercises[0];

  const [activeWeight, setActiveWeight] = useState(currentEx ? currentEx.weight : 0);
  const [activeReps, setActiveReps] = useState(currentEx ? currentEx.reps : 8);

  // Timer
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [restSeconds, setRestSeconds] = useState(currentEx ? currentEx.restSec : 90);
  const [elapsedSec, setElapsedSec] = useState(0);
  const hasAlertedRef = useRef(false);

  useEffect(() => {
    if (currentEx) {
      setActiveWeight(currentEx.weight);
      setActiveReps(currentEx.reps);
      setRestSeconds(currentEx.restSec);
      setIsTimerRunning(false);
      hasAlertedRef.current = false;
      setCurrentSet(Math.min(currentEx.sets, (currentEx.completedSets || 0) + 1));
    }
  }, [currentIdx, currentEx]);

  // Elapsed workout duration timer
  useEffect(() => {
    const elapsedInterval = setInterval(() => setElapsedSec((s) => s + 1), 1000);
    return () => clearInterval(elapsedInterval);
  }, []);

  // Web Audio chime & haptic feedback on rest timer completion
  const playTimerCompleteAlert = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.setValueAtTime(880.00, now + 0.12); // A5
      
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.45);
      
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([120, 80, 120]);
      }
    } catch {}
  };

  // Rest interval countdown
  useEffect(() => {
    let t: NodeJS.Timeout | null = null;
    if (isTimerRunning && restSeconds > 0) {
      t = setInterval(() => {
        setRestSeconds((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            if (!hasAlertedRef.current) {
              playTimerCompleteAlert();
              hasAlertedRef.current = true;
            }
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
      hasAlertedRef.current = false;
      setIsTimerRunning(true);
    } else {
      // Completed all sets for this exercise
      if (workout && currentIdx < workout.exercises.length - 1) {
        setCurrentIdx(currentIdx + 1);
      } else {
        await handleFinish();
      }
    }
  };

  if (!currentEx || !workout) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="session-title"
    >
      <div className="bg-white w-full max-w-2xl rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[88vh]">
        {/* Top Header */}
        <div className="px-5 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse motion-reduce:animate-none" />
              <span>Active Session • Elapsed <span className="tabular-nums font-bold text-slate-900">{formatSec(elapsedSec)}</span></span>
            </div>
            <h3 id="session-title" className="text-sm sm:text-base font-bold text-slate-900 mt-0.5 truncate max-w-xs sm:max-w-md">
              {workout.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close active session modal"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center p-2 text-slate-400 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors touch-manipulation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Workspace */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 sm:space-y-6">
          {/* Movement Indicator Strip */}
          <div className="flex items-center justify-between text-xs font-mono text-slate-500 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
            <span>
              Movement <strong className="text-slate-900 tabular-nums">{currentIdx + 1}</strong> of <span className="tabular-nums">{workout.exercises.length}</span>
            </span>
            <span>
              Set <strong className="text-slate-900 tabular-nums">{currentSet}</strong> of <span className="tabular-nums">{currentEx.sets}</span>
            </span>
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{currentEx.name}</h2>
            <p className="text-xs text-slate-500 font-mono mt-1">
              Target: <span className="text-slate-700 font-semibold">{currentEx.targetMuscle}</span> • Tempo: <span className="text-slate-700 font-semibold">{currentEx.tempo}</span>
            </p>
          </div>

          {currentEx.note && (
            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-700 leading-relaxed">
              <span className="font-semibold text-slate-900 block mb-0.5">Execution Cue:</span>
              {currentEx.note}
            </div>
          )}

          {/* Load & Reps Adjuster (Optimized with standard 44px touch targets) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {/* Weight Stepper */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col justify-between">
              <span className="text-[11px] font-mono text-slate-500 uppercase font-semibold">
                Weight ({settings.weightUnit})
              </span>
              <div className="flex items-center justify-between mt-3">
                <button
                  type="button"
                  onClick={() => setActiveWeight(Math.max(0, activeWeight - 2.5))}
                  aria-label="Decrease weight by 2.5"
                  className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-800 hover:bg-slate-100 active:scale-95 transition-transform touch-manipulation shadow-2xs"
                >
                  <Minus className="w-4 h-4 stroke-[2.5]" />
                </button>
                <span className="font-mono tabular-nums text-2xl font-bold text-slate-900 px-2">
                  {activeWeight}
                </span>
                <button
                  type="button"
                  onClick={() => setActiveWeight(activeWeight + 2.5)}
                  aria-label="Increase weight by 2.5"
                  className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-800 hover:bg-slate-100 active:scale-95 transition-transform touch-manipulation shadow-2xs"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            </div>

            {/* Reps Stepper */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col justify-between">
              <span className="text-[11px] font-mono text-slate-500 uppercase font-semibold">
                Target Reps
              </span>
              <div className="flex items-center justify-between mt-3">
                <button
                  type="button"
                  onClick={() => setActiveReps(Math.max(1, activeReps - 1))}
                  aria-label="Decrease repetitions by 1"
                  className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-800 hover:bg-slate-100 active:scale-95 transition-transform touch-manipulation shadow-2xs"
                >
                  <Minus className="w-4 h-4 stroke-[2.5]" />
                </button>
                <span className="font-mono tabular-nums text-2xl font-bold text-slate-900 px-2">
                  {activeReps}
                </span>
                <button
                  type="button"
                  onClick={() => setActiveReps(activeReps + 1)}
                  aria-label="Increase repetitions by 1"
                  className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-800 hover:bg-slate-100 active:scale-95 transition-transform touch-manipulation shadow-2xs"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            </div>
          </div>

          {/* Rest Timer with Audio Notification Support */}
          <div className="p-4 sm:p-5 bg-slate-900 text-white rounded-xl flex items-center justify-between shadow-xs">
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold flex items-center gap-1">
                <TimerIcon className="w-3.5 h-3.5 text-emerald-400" />
                <span>Rest Interval</span>
              </span>
              <span className="text-2xl sm:text-3xl font-mono tabular-nums font-bold tracking-tight">
                {formatSec(restSeconds)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-200 text-xs font-semibold transition-colors touch-manipulation"
              >
                {isTimerRunning ? 'Pause' : 'Start Timer'}
              </button>
              <button
                type="button"
                onClick={() => setRestSeconds((s) => s + 30)}
                aria-label="Add 30 seconds to rest timer"
                className="min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-300 text-xs font-mono font-semibold transition-colors touch-manipulation"
              >
                +30s
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions (Thumbs-first Gym Ergonomics) */}
        <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              if (currentIdx > 0) setCurrentIdx(currentIdx - 1);
            }}
            disabled={currentIdx === 0}
            className="min-h-[44px] px-3 text-xs text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:pointer-events-none transition-colors touch-manipulation"
          >
            ← Previous
          </button>

          <button
            type="button"
            onClick={handleCompleteCurrentSet}
            className="min-h-[44px] flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 active:scale-98 text-white rounded-xl text-xs font-semibold transition-all shadow-xs touch-manipulation"
          >
            <Check className="w-4 h-4 stroke-[3] text-emerald-400" />
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
