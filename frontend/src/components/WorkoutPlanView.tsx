import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  Play, 
  X, 
  RefreshCw, 
  Loader2, 
  Dumbbell, 
  CheckCircle2, 
  Search,
  ChevronUp,
  ChevronDown,
  Eye,
  SlidersHorizontal
} from 'lucide-react';
import { useFitness } from '../context/FitnessContext';
import { api } from '../services/api';
import { Exercise } from '../types/fitness';
import { CustomDropdown } from './CustomDropdown';

interface WorkoutPlanViewProps {
  onStartSession: () => void;
}

export const WorkoutPlanView: React.FC<WorkoutPlanViewProps> = ({ onStartSession }) => {
  const { 
    workout, 
    savedPlans,
    splitDays,
    selectedDayNumber,
    selectDay,
    selectPlan,
    updateWorkoutTitle, 
    addExercise, 
    updateExercise, 
    deleteExercise, 
    resetWorkoutProgress,
    logWorkoutSession,
    settings,
    totalVolumeLifted,
    totalPrescribedVolume,
    exercisesLibrary
  } = useFitness();

  const [isAddingExercise, setIsAddingExercise] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // Title Editing State
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitleValue, setEditTitleValue] = useState('');
  const [editFocusValue, setEditFocusValue] = useState('');

  // Table State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'COMPLETED' | 'PENDING'>('ALL');
  const [sortField, setSortField] = useState<'name' | 'muscle' | 'volume' | 'status'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Quick Log Modal State
  const [isQuickLogOpen, setIsQuickLogOpen] = useState(false);
  const [quickDuration, setQuickDuration] = useState(50);
  const [quickDifficulty, setQuickDifficulty] = useState<'EASY' | 'MODERATE' | 'HARD' | 'VERY_HARD'>('MODERATE');
  const [quickNotes, setQuickNotes] = useState('');
  const [isLoggingSaving, setIsLoggingSaving] = useState(false);
  const [logSuccessToast, setLogSuccessToast] = useState(false);

  // Form states for adding exercise
  const [selectedLibraryId, setSelectedLibraryId] = useState('');
  const [newExName, setNewExName] = useState('');
  const [newExMuscle, setNewExMuscle] = useState('');
  const [newExSets, setNewExSets] = useState(3);
  const [newExReps, setNewExReps] = useState(10);
  const [newExWeight, setNewExWeight] = useState(50);
  const [newExTempo, setNewExTempo] = useState('2-0-1-0');
  const [newExNote, setNewExNote] = useState('');

  const handleSelectFromLibrary = (id: string) => {
    setSelectedLibraryId(id);
    const found = exercisesLibrary.find((ex) => ex.id === id);
    if (found) {
      setNewExName(found.name);
      setNewExMuscle(found.muscleGroups.join(', '));
      setNewExNote(found.instructions);
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExName.trim()) return;

    addExercise({
      name: newExName.trim(),
      targetMuscle: newExMuscle.trim() || 'General',
      sets: Number(newExSets) || 3,
      reps: Number(newExReps) || 10,
      weight: Number(newExWeight) || 0,
      restSec: 90,
      tempo: newExTempo.trim() || 'Controlled',
      note: newExNote.trim() || 'Standard execution.',
      dayNumber: workout?.dayNumber || selectedDayNumber,
    });

    // Reset form
    setSelectedLibraryId('');
    setNewExName('');
    setNewExMuscle('');
    setNewExSets(3);
    setNewExReps(10);
    setNewExWeight(50);
    setNewExTempo('2-0-1-0');
    setNewExNote('');
    setIsAddingExercise(false);
  };

  const handleAiGenerateWorkout = async () => {
    setIsGeneratingAi(true);
    try {
      const res = await api.generateAiWorkout();
      if (res.plan) {
        selectPlan(res.plan);
      }
    } catch (err: any) {
      alert(`AI Plan Generation note: ${err.message}`);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // One-click quick log session
  const handleConfirmQuickLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workout) return;
    setIsLoggingSaving(true);
    try {
      await logWorkoutSession({
        notes: quickNotes.trim() || `Completed ${workout.title}`,
        durationMinutes: Number(quickDuration) || 45,
        difficulty: quickDifficulty,
      });
      setIsQuickLogOpen(false);
      setLogSuccessToast(true);
      setTimeout(() => setLogSuccessToast(false), 4500);
    } catch (err: any) {
      alert(`Failed to log workout: ${err.message}`);
    } finally {
      setIsLoggingSaving(false);
    }
  };

  // Mark all sets of the active workout as complete
  const handleCompleteAllSets = () => {
    if (!workout) return;
    workout.exercises.forEach((ex) => {
      updateExercise(ex.id, { completedSets: ex.sets });
    });
  };

  // Filter and sort movements
  const filteredExercises = useMemo(() => {
    if (!workout) return [];
    return workout.exercises.filter((ex) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q || 
        ex.name.toLowerCase().includes(q) || 
        ex.targetMuscle.toLowerCase().includes(q) ||
        (ex.note && ex.note.toLowerCase().includes(q));

      const isCompleted = ex.completedSets >= ex.sets;
      const matchStatus = 
        statusFilter === 'ALL' ? true :
        statusFilter === 'COMPLETED' ? isCompleted : !isCompleted;

      return matchSearch && matchStatus;
    }).sort((a, b) => {
      if (sortField === 'name') {
        return sortDirection === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      }
      if (sortField === 'muscle') {
        return sortDirection === 'asc' ? a.targetMuscle.localeCompare(b.targetMuscle) : b.targetMuscle.localeCompare(a.targetMuscle);
      }
      if (sortField === 'volume') {
        const vA = a.sets * a.reps * (a.weight || 1);
        const vB = b.sets * b.reps * (b.weight || 1);
        return sortDirection === 'asc' ? vA - vB : vB - vA;
      }
      if (sortField === 'status') {
        const sA = a.completedSets / a.sets;
        const sB = b.completedSets / b.sets;
        return sortDirection === 'asc' ? sA - sB : sB - sA;
      }
      return 0;
    });
  }, [workout, searchQuery, statusFilter, sortField, sortDirection]);

  const handleSort = (field: 'name' | 'muscle' | 'volume' | 'status') => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  if (!workout) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center max-w-xl mx-auto space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-700">
          <Dumbbell className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900">No Workout Routine Loaded</h3>
        <p className="text-xs text-slate-500">
          Select an existing program or generate a customized workout split with your AI Coach.
        </p>
        <button
          onClick={handleAiGenerateWorkout}
          disabled={isGeneratingAi}
          className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-semibold flex items-center gap-2 mx-auto shadow-sm"
        >
          {isGeneratingAi && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          <span>Generate Plan with AI</span>
        </button>
      </div>
    );
  }

  const totalDaySets = workout.exercises.reduce((acc, ex) => acc + ex.sets, 0);
  const totalDayCompletedSets = workout.exercises.reduce((acc, ex) => acc + ex.completedSets, 0);
  const isDayFullyCompleted = totalDaySets > 0 && totalDayCompletedSets >= totalDaySets;

  // Status Badge Helper matching reference table design
  const getMovementStatusBadge = (completed: number, total: number) => {
    if (completed >= total && total > 0) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/80">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>Completed</span>
        </span>
      );
    }
    if (completed > 0) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200/80">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          <span>In Progress</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200/80">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        <span>Pending</span>
      </span>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full font-sans">
      {/* 1. Split Schedule Tabs */}
      {splitDays.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span className="font-semibold text-slate-800">Prescribed Training Split ({splitDays.length} Days)</span>
            <span className="text-slate-400">Click a day to view or log routine</span>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {splitDays.map((day) => {
              const isSelected = selectedDayNumber === day.dayNumber;
              const dayCompleted = day.exercises.length > 0 && 
                day.exercises.every(e => (e.completedSets || 0) >= e.sets);

              return (
                <button
                  key={day.dayNumber}
                  type="button"
                  onClick={() => selectDay(day.dayNumber)}
                  className={`p-3.5 rounded-2xl border text-left transition-colors touch-manipulation cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 dark:bg-[#22252E] dark:border-[#3E4352] dark:text-white shadow-sm'
                      : 'bg-white text-slate-700 hover:text-slate-950 border-slate-200/90 hover:border-slate-300 dark:bg-[#16171B] dark:border-[#252832] dark:text-slate-400 dark:hover:text-slate-200 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-[11px] font-mono font-medium ${isSelected ? 'text-slate-400' : 'text-slate-500'}`}>
                      Day {day.dayNumber}
                    </span>
                    {dayCompleted ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-medium">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                        Done
                      </span>
                    ) : (
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${isSelected ? 'bg-slate-800 text-slate-300 dark:bg-slate-700 dark:text-slate-200' : 'bg-slate-100 text-slate-600 dark:bg-[#21242C] dark:text-slate-400'}`}>
                        {day.exerciseCount} exercises
                      </span>
                    )}
                  </div>
                  <div className={`text-xs sm:text-sm font-semibold truncate ${isSelected ? 'text-white' : 'text-slate-900 dark:text-slate-200'}`}>
                    {day.title.replace(/^Day \d+:\s*/, '')}
                  </div>
                  <div className={`text-[11px] truncate mt-1 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                    {day.focus}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Top Routine Control & Action Strip */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex-1 min-w-0">
            {isEditingTitle ? (
              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-slate-400 font-medium">Focus:</span>
                  <input
                    type="text"
                    value={editFocusValue}
                    onChange={(e) => setEditFocusValue(e.target.value)}
                    className="text-xs font-mono text-slate-800 px-2.5 py-1 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 bg-white"
                    placeholder="e.g. Upper Body Hypertrophy"
                  />
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <input
                    type="text"
                    value={editTitleValue}
                    onChange={(e) => setEditTitleValue(e.target.value)}
                    className="text-base sm:text-xl font-bold text-slate-900 px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 bg-white flex-1 min-w-[220px]"
                    placeholder="Workout title"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => {
                      updateWorkoutTitle(editTitleValue.trim() || workout.title, editFocusValue.trim() || workout.focus);
                      setIsEditingTitle(false);
                    }}
                    className="min-h-[36px] px-3.5 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Save</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingTitle(false)}
                    className="min-h-[36px] px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-slate-500 font-medium">
                    Focus: <strong className="text-slate-700">{workout.focus}</strong>
                  </span>
                </div>
                <div className="mt-1">
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-snug">
                    <span>{workout.title}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setEditTitleValue(workout.title);
                        setEditFocusValue(workout.focus);
                        setIsEditingTitle(true);
                      }}
                      className="inline-flex items-center justify-center w-7 h-7 ml-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer align-middle"
                      title="Rename workout title"
                      aria-label="Rename workout title"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </h1>
                </div>
              </div>
            )}
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            {/* Quick Log Button - Prominent & Frictionless */}
            <button
              type="button"
              onClick={() => setIsQuickLogOpen(true)}
              className="min-h-[44px] flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors touch-manipulation cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Log Workout Session</span>
            </button>

            {/* Add Exercise */}
            <button
              type="button"
              onClick={() => setIsAddingExercise(!isAddingExercise)}
              className="min-h-[44px] flex items-center gap-1.5 px-3.5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-medium transition-colors touch-manipulation cursor-pointer shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Movement</span>
            </button>

            {/* AI Re-generate */}
            <button
              type="button"
              onClick={handleAiGenerateWorkout}
              disabled={isGeneratingAi}
              className="min-h-[44px] flex items-center gap-1.5 px-3.5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-medium transition-colors touch-manipulation cursor-pointer"
              title="Re-generate personalized workout split"
            >
              {isGeneratingAi ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              )}
            </button>
          </div>
        </div>

        {/* Live Completion Telemetry Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">Session Progress:</span>
              <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                {totalDayCompletedSets} / {totalDaySets} Sets Completed
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">Estimated Volume:</span>
              <span className="font-mono font-bold text-slate-900">
                {totalVolumeLifted.toLocaleString()} / {totalPrescribedVolume.toLocaleString()} {settings.weightUnit}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCompleteAllSets}
              className="text-xs text-slate-600 hover:text-slate-900 font-medium underline-offset-2 hover:underline cursor-pointer"
            >
              Mark all movements done
            </button>
            <span className="text-slate-300">•</span>
            <button
              type="button"
              onClick={resetWorkoutProgress}
              className="text-xs text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              Reset progress
            </button>
          </div>
        </div>
      </div>

      {/* 3. Add Movement Drawer */}
      {isAddingExercise && (
        <form
          onSubmit={handleAddSubmit}
          className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4 animate-fadeIn"
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-900">
              Add Exercise to Day {selectedDayNumber} ({workout.focus})
            </h3>
            <button
              type="button"
              onClick={() => setIsAddingExercise(false)}
              className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {exercisesLibrary.length > 0 && (
            <div>
              <label className="block text-slate-600 text-xs font-medium mb-1">
                Select from movement directory (or type below):
              </label>
              <CustomDropdown
                value={selectedLibraryId}
                onChange={(val) => handleSelectFromLibrary(val)}
                placeholder="-- Choose from exercise catalog --"
                className="w-full"
                menuClassName="max-w-none w-full"
                options={[
                  { value: '', label: '-- Choose from exercise catalog --' },
                  ...exercisesLibrary.map((libEx) => ({
                    value: libEx.id,
                    label: libEx.name,
                    sublabel: `${libEx.category} • ${libEx.muscleGroups.join(', ')}`,
                  })),
                ]}
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="sm:col-span-2">
              <label className="block text-slate-600 font-medium mb-1">Exercise Name</label>
              <input
                type="text"
                placeholder="e.g. Barbell Romanian Deadlift"
                value={newExName}
                onChange={(e) => setNewExName(e.target.value)}
                required
                className="w-full min-h-[44px] px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-600 font-medium mb-1">Target Muscle Group</label>
              <input
                type="text"
                placeholder="e.g. Hamstrings, Glutes"
                value={newExMuscle}
                onChange={(e) => setNewExMuscle(e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">Prescribed Sets</label>
              <input
                type="number"
                min="1"
                max="10"
                value={newExSets}
                onChange={(e) => setNewExSets(Number(e.target.value))}
                className="w-full min-h-[44px] px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-mono font-medium focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">Target Reps</label>
              <input
                type="number"
                min="1"
                max="50"
                value={newExReps}
                onChange={(e) => setNewExReps(Number(e.target.value))}
                className="w-full min-h-[44px] px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-mono font-medium focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">
                Weight ({settings.weightUnit})
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={newExWeight}
                onChange={(e) => setNewExWeight(Number(e.target.value))}
                className="w-full min-h-[44px] px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-mono font-medium focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">Tempo Cadence</label>
              <input
                type="text"
                placeholder="3-0-1-0"
                value={newExTempo}
                onChange={(e) => setNewExTempo(e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div className="sm:col-span-4">
              <label className="block text-slate-600 font-medium mb-1">Execution Cue / Note</label>
              <input
                type="text"
                placeholder="Keep chest tall, push floor away through mid-foot."
                value={newExNote}
                onChange={(e) => setNewExNote(e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddingExercise(false)}
              className="min-h-[40px] px-4 py-2 text-xs text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="min-h-[40px] px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors shadow-2xs"
            >
              Add Movement
            </button>
          </div>
        </form>
      )}

      {/* 4. Movements SaaS Table (Matching Reference Image & Analytics Table) */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {/* Table Top Toolbar */}
        <div className="p-4 sm:px-6 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-900">
              Day {selectedDayNumber} Movements
            </span>
            <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              {filteredExercises.length} movements · {totalDayCompletedSets}/{totalDaySets} sets
            </span>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            {/* Search Input matching reference design */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search movement or muscle..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium w-52 sm:w-64 focus:outline-none focus:ring-1 focus:ring-slate-900 placeholder:text-slate-400 font-sans"
              />
            </div>

            {/* Status Filter Toggle */}
            <div className="inline-flex rounded-lg p-0.5 bg-slate-100 border border-slate-200/80 text-xs">
              {(['ALL', 'COMPLETED', 'PENDING'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-md font-medium text-[11px] transition-colors ${
                    statusFilter === st
                      ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {st === 'ALL' ? 'All' : st === 'COMPLETED' ? 'Done' : 'Pending'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/80 border-b border-slate-200/90 text-slate-500 uppercase font-mono text-[10px] tracking-wider">
              <tr>
                <th scope="col" className="w-10 px-4 py-2.5 text-center">
                  <input
                    type="checkbox"
                    checked={isDayFullyCompleted}
                    onChange={handleCompleteAllSets}
                    aria-label="Toggle all movements completed"
                    className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 w-3.5 h-3.5 cursor-pointer"
                  />
                </th>

                <th scope="col" className="px-4 py-2.5 font-semibold cursor-pointer select-none" onClick={() => handleSort('name')}>
                  <div className="inline-flex items-center gap-1">
                    <span>EXERCISE NAME</span>
                    {sortField === 'name' ? (
                      sortDirection === 'asc' ? <ChevronUp className="w-3 h-3 text-slate-700" /> : <ChevronDown className="w-3 h-3 text-slate-700" />
                    ) : (
                      <span className="text-slate-400">↑↓</span>
                    )}
                  </div>
                </th>

                <th scope="col" className="px-4 py-2.5 font-semibold cursor-pointer select-none" onClick={() => handleSort('muscle')}>
                  <div className="inline-flex items-center gap-1">
                    <span>TARGET MUSCLE</span>
                    {sortField === 'muscle' ? (
                      sortDirection === 'asc' ? <ChevronUp className="w-3 h-3 text-slate-700" /> : <ChevronDown className="w-3 h-3 text-slate-700" />
                    ) : (
                      <span className="text-slate-400">↑↓</span>
                    )}
                  </div>
                </th>

                <th scope="col" className="px-4 py-2.5 font-semibold cursor-pointer select-none" onClick={() => handleSort('volume')}>
                  <div className="inline-flex items-center gap-1">
                    <span>PRESCRIBED VOLUME</span>
                    {sortField === 'volume' ? (
                      sortDirection === 'asc' ? <ChevronUp className="w-3 h-3 text-slate-700" /> : <ChevronDown className="w-3 h-3 text-slate-700" />
                    ) : (
                      <span className="text-slate-400">↑↓</span>
                    )}
                  </div>
                </th>

                <th scope="col" className="px-4 py-2.5 font-semibold">
                  WORKING SETS
                </th>

                <th scope="col" className="px-4 py-2.5 font-semibold cursor-pointer select-none" onClick={() => handleSort('status')}>
                  <div className="inline-flex items-center gap-1">
                    <span>STATUS</span>
                    {sortField === 'status' ? (
                      sortDirection === 'asc' ? <ChevronUp className="w-3 h-3 text-slate-700" /> : <ChevronDown className="w-3 h-3 text-slate-700" />
                    ) : (
                      <span className="text-slate-400">↑↓</span>
                    )}
                  </div>
                </th>

                <th scope="col" className="px-4 py-2.5 text-right font-semibold">
                  ACTIONS
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredExercises.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 text-xs">
                    No movements match your filter query.
                  </td>
                </tr>
              ) : (
                filteredExercises.map((exercise) => {
                  const isComplete = exercise.completedSets >= exercise.sets;

                  return (
                    <tr 
                      key={exercise.id}
                      className={`hover:bg-slate-50/80 transition-colors ${isComplete ? 'bg-slate-50/40' : ''}`}
                    >
                      {/* Checkbox Column */}
                      <td className="px-4 py-2.5 text-center">
                        <input
                          type="checkbox"
                          checked={isComplete}
                          onChange={() => {
                            if (isComplete) {
                              updateExercise(exercise.id, { completedSets: 0 });
                            } else {
                              updateExercise(exercise.id, { completedSets: exercise.sets });
                            }
                          }}
                          aria-label={`Mark ${exercise.name} as complete`}
                          className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 w-3.5 h-3.5 cursor-pointer"
                        />
                      </td>

                      {/* Exercise Name & Cue */}
                      <td className="px-4 py-2.5">
                        <div className="font-semibold text-slate-900 text-xs">
                          {exercise.name}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5 max-w-xs truncate">
                          {exercise.note || `Tempo: ${exercise.tempo}`}
                        </div>
                      </td>

                      {/* Muscle Group */}
                      <td className="px-4 py-2.5">
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[10px]">
                          {exercise.targetMuscle}
                        </span>
                      </td>

                      {/* Prescribed Volume */}
                      <td className="px-4 py-2.5 font-mono text-xs">
                        <div className="text-slate-900 font-semibold tabular-nums">
                          {exercise.sets} sets × {exercise.reps} reps
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {exercise.weight > 0 ? `${exercise.weight} ${settings.weightUnit}` : 'Bodyweight'}
                        </div>
                      </td>

                      {/* Working Set Chips right in row */}
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-1 flex-wrap">
                          {Array.from({ length: exercise.sets }).map((_, sIdx) => {
                            const setNum = sIdx + 1;
                            const isSetDone = setNum <= exercise.completedSets;
                            return (
                              <button
                                key={setNum}
                                type="button"
                                onClick={() => {
                                  if (exercise.completedSets === setNum) {
                                    updateExercise(exercise.id, { completedSets: setNum - 1 });
                                  } else {
                                    updateExercise(exercise.id, { completedSets: setNum });
                                  }
                                }}
                                className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors flex items-center gap-1 touch-manipulation cursor-pointer ${
                                  isSetDone
                                    ? 'bg-slate-900 text-white font-medium shadow-2xs'
                                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80'
                                }`}
                                title={`Toggle Set ${setNum}`}
                              >
                                {isSetDone ? (
                                  <Check className="w-2.5 h-2.5 text-emerald-400 stroke-[3]" />
                                ) : (
                                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                )}
                                <span>{setNum}</span>
                              </button>
                            );
                          })}
                        </div>
                      </td>

                      {/* Status Pill Badge */}
                      <td className="px-4 py-2.5">
                        {getMovementStatusBadge(exercise.completedSets, exercise.sets)}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-2.5 text-right">
                        <div className="inline-flex items-center gap-1 justify-end">
                          <button
                            type="button"
                            onClick={() => setEditingExercise(exercise)}
                            title="Edit exercise parameters"
                            className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteExercise(exercise.id)}
                            title="Delete exercise"
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {/* Table Footer - Clean inline status (never floating or obstructing rows) */}
          <div className="border-t border-slate-100 px-4 py-3 bg-slate-50/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span className="font-mono text-slate-600">
                Day {selectedDayNumber} ({workout.focus}) • <strong className="text-slate-900">{totalDayCompletedSets}/{totalDaySets}</strong> sets completed
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsQuickLogOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Log & Save Workout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Log Modal Dialog */}
      {isQuickLogOpen && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
          role="dialog"
          aria-modal="true"
          aria-labelledby="quick-log-title"
        >
          <div className="bg-white w-full max-w-lg rounded-2xl border border-slate-200 shadow-2xl overflow-hidden p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 id="quick-log-title" className="text-base font-bold text-slate-900">
                  Log Workout Session
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Save this workout to your training logs and sync live analytics.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsQuickLogOpen(false)}
                className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmQuickLog} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Session Title
                </label>
                <input
                  type="text"
                  value={workout.title}
                  disabled
                  className="w-full min-h-[40px] px-3.5 py-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-600 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Session Duration (Minutes)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="5"
                    max="300"
                    value={quickDuration}
                    onChange={(e) => setQuickDuration(Number(e.target.value))}
                    className="w-24 min-h-[40px] px-3 py-2 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                  <div className="flex gap-1.5 flex-wrap">
                    {[30, 45, 60, 75].map((mins) => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => setQuickDuration(mins)}
                        className={`min-h-[36px] px-3 py-1.5 rounded-lg font-mono text-xs font-semibold transition-colors ${
                          quickDuration === mins
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {mins}m
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">
                  Perceived Strain / RPE
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'EASY', label: 'Recovery' },
                    { id: 'MODERATE', label: 'Overload' },
                    { id: 'HARD', label: 'High Strain' },
                    { id: 'VERY_HARD', label: 'Peak Strain' },
                  ].map((lvl) => {
                    const isSelected = quickDifficulty === lvl.id;
                    return (
                      <button
                        key={lvl.id}
                        type="button"
                        onClick={() => setQuickDifficulty(lvl.id as any)}
                        className={`min-h-[40px] p-2 rounded-xl border text-center font-medium transition-colors cursor-pointer ${
                          isSelected
                            ? 'border-slate-900 bg-slate-900 text-white shadow-2xs font-bold'
                            : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        {lvl.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Athlete Notes / Recovery Feedback (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Felt strong on bench press, good tempo."
                  value={quickNotes}
                  onChange={(e) => setQuickNotes(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 placeholder:text-slate-400"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsQuickLogOpen(false)}
                  className="min-h-[44px] px-4 py-2 text-slate-600 hover:text-slate-900 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoggingSaving}
                  className="min-h-[44px] min-w-[170px] flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                >
                  {isLoggingSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-slate-300" />
                      <span>Saving Log...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Confirm & Log Workout</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. Edit Movement Modal */}
      {editingExercise && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white w-full max-w-lg rounded-2xl border border-slate-200 shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                Edit Movement Parameters
              </h3>
              <button
                type="button"
                onClick={() => setEditingExercise(null)}
                className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="col-span-2">
                <label className="block text-slate-600 font-medium mb-1">Exercise Name</label>
                <input
                  type="text"
                  value={editingExercise.name}
                  onChange={(e) => setEditingExercise({ ...editingExercise, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Prescribed Sets</label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={editingExercise.sets}
                  onChange={(e) => setEditingExercise({ ...editingExercise, sets: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Target Reps</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={editingExercise.reps}
                  onChange={(e) => setEditingExercise({ ...editingExercise, reps: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">
                  Weight ({settings.weightUnit})
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={editingExercise.weight}
                  onChange={(e) => setEditingExercise({ ...editingExercise, weight: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Tempo Cadence</label>
                <input
                  type="text"
                  value={editingExercise.tempo}
                  onChange={(e) => setEditingExercise({ ...editingExercise, tempo: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-slate-600 font-medium mb-1">Execution Cue / Note</label>
                <input
                  type="text"
                  value={editingExercise.note}
                  onChange={(e) => setEditingExercise({ ...editingExercise, note: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingExercise(null)}
                className="px-4 py-2 text-xs text-slate-600 hover:text-slate-900 font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  updateExercise(editingExercise.id, {
                    name: editingExercise.name,
                    sets: editingExercise.sets,
                    reps: editingExercise.reps,
                    weight: editingExercise.weight,
                    tempo: editingExercise.tempo,
                    note: editingExercise.note,
                  });
                  setEditingExercise(null);
                }}
                className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. Success Toast */}
      {logSuccessToast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 left-4 sm:left-auto z-50 flex items-start gap-3 bg-white text-slate-900 px-4 py-3.5 rounded-2xl shadow-lg border border-slate-200 max-w-sm animate-fadeIn"
        >
          <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0 mt-0.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex-1 min-w-0 pr-1">
            <p className="text-xs font-semibold text-slate-900">Workout Successfully Logged</p>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5 leading-relaxed">
              Session recorded and telemetry synced to your Progress & Logs table.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setLogSuccessToast(false)}
            className="w-7 h-7 -mr-1 -mt-1 flex items-center justify-center text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
