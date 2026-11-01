import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  Play, 
  X,
  RefreshCw,
  Loader2,
  Calendar,
  Clock,
  Dumbbell
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
    logCompletedSet,
    settings,
    totalVolumeLifted,
    totalPrescribedVolume,
    exercisesLibrary,
    backendConnected
  } = useFitness();

  const [isAddingExercise, setIsAddingExercise] = useState(false);
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

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

  if (!workout) {
    return (
      <div className="bg-white p-8 rounded-xl border border-slate-200 text-center max-w-xl mx-auto space-y-4">
        <h3 className="text-base font-bold text-slate-900">No Workout Routine Loaded</h3>
        <p className="text-xs text-slate-500">
          Select an existing program or generate a customized workout split with your AI Coach.
        </p>
        <button
          onClick={handleAiGenerateWorkout}
          disabled={isGeneratingAi}
          className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold flex items-center gap-2 mx-auto"
        >
          {isGeneratingAi && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          <span>Generate Plan with AI</span>
        </button>
      </div>
    );
  }

  const totalDaySets = workout.exercises.reduce((acc, ex) => acc + ex.sets, 0);
  const totalDayCompletedSets = workout.exercises.reduce((acc, ex) => acc + ex.completedSets, 0);

  return (
    <div className="space-y-6 max-w-6xl mx-auto w-full">
      {/* Multi-Day Split Tabs */}
      {splitDays.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-500 px-1">
            <span>Prescribed Split Schedule ({splitDays.length} Days)</span>
            <span className="text-slate-400">Click a day to view its routine</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {splitDays.map((day) => {
              const isSelected = selectedDayNumber === day.dayNumber;
              return (
                <button
                  key={day.dayNumber}
                  type="button"
                  onClick={() => selectDay(day.dayNumber)}
                  className={`p-3.5 rounded-2xl border text-left transition-all touch-manipulation ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-white text-slate-700 hover:text-slate-950 border-slate-200 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-[10px] font-mono font-medium ${isSelected ? 'text-slate-400' : 'text-slate-500'}`}>
                      Day {day.dayNumber}
                    </span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${isSelected ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-600'}`}>
                      {day.exerciseCount} exercises
                    </span>
                  </div>
                  <div className={`text-xs sm:text-sm font-semibold truncate ${isSelected ? 'text-white' : 'text-slate-900'}`}>
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

      {/* Session Title & Action Bar */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          {savedPlans.length > 1 && (
            <div className="mb-2">
              <label className="text-[11px] font-mono text-slate-500 font-medium block mb-1">
                Active routine:
              </label>
              <CustomDropdown
                value={workout.id.split('-day-')[0]}
                onChange={(val) => {
                  const found = savedPlans.find((p) => p.id === val);
                  if (found) selectPlan(found);
                }}
                options={savedPlans.map((p) => ({
                  value: p.id,
                  label: p.name,
                  badge: `${p.exercises.length} movements`,
                }))}
              />
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-slate-400 font-medium">
              Training focus:
            </span>
            <input
              type="text"
              value={workout.focus}
              onChange={(e) => updateWorkoutTitle(workout.title, e.target.value)}
              className="text-xs font-mono text-slate-600 border-b border-transparent hover:border-slate-300 focus:border-slate-900 focus:outline-none bg-transparent"
              title="Click to edit focus"
            />
          </div>
          <input
            type="text"
            value={workout.title}
            onChange={(e) => updateWorkoutTitle(e.target.value, workout.focus)}
            className="text-xl sm:text-2xl font-bold text-slate-900 border-b border-transparent hover:border-slate-300 focus:border-slate-900 focus:outline-none bg-transparent mt-1 w-full"
            title="Click to edit session name"
          />
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleAiGenerateWorkout}
            disabled={isGeneratingAi}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors"
            title="Generate personalized workout split matching your training days"
          >
            {isGeneratingAi ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            )}
            <span>Re-generate Split</span>
          </button>

          <button
            onClick={() => setIsAddingExercise(!isAddingExercise)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Movement</span>
          </button>

          <button
            onClick={onStartSession}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors shadow-2xs"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Start Session</span>
          </button>
        </div>
      </div>

      {/* Add Movement Drawer */}
      {isAddingExercise && (
        <form
          onSubmit={handleAddSubmit}
          className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4"
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-mono text-slate-500 font-medium">
              Add movement to Day {selectedDayNumber} ({workout.focus})
            </span>
            <button
              type="button"
              onClick={() => setIsAddingExercise(false)}
              className="text-slate-400 hover:text-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {exercisesLibrary.length > 0 && (
            <div>
              <label className="block text-slate-500 text-xs font-medium mb-1">
                Select from movement directory:
              </label>
              <CustomDropdown
                value={selectedLibraryId}
                onChange={(val) => handleSelectFromLibrary(val)}
                placeholder="-- Choose a movement --"
                className="w-full"
                menuClassName="max-w-none w-full"
                options={[
                  { value: '', label: '-- Choose a movement --' },
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
              <label className="block text-slate-500 font-medium mb-1">Exercise Name</label>
              <input
                type="text"
                placeholder="e.g. Barbell Romanian Deadlift"
                value={newExName}
                onChange={(e) => setNewExName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-500 font-medium mb-1">Target Muscle Group</label>
              <input
                type="text"
                placeholder="e.g. Hamstrings, Glutes"
                value={newExMuscle}
                onChange={(e) => setNewExMuscle(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-medium mb-1">Prescribed Sets</label>
              <input
                type="number"
                min="1"
                max="10"
                value={newExSets}
                onChange={(e) => setNewExSets(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-medium mb-1">Target Reps</label>
              <input
                type="number"
                min="1"
                max="50"
                value={newExReps}
                onChange={(e) => setNewExReps(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-medium mb-1">
                Working Weight ({settings.weightUnit})
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={newExWeight}
                onChange={(e) => setNewExWeight(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-medium mb-1">Tempo Cadence</label>
              <input
                type="text"
                placeholder="3-0-1-0"
                value={newExTempo}
                onChange={(e) => setNewExTempo(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div className="sm:col-span-4">
              <label className="block text-slate-500 font-medium mb-1">Form / Execution Note</label>
              <input
                type="text"
                placeholder="Keep spine neutral; drive through heels."
                value={newExNote}
                onChange={(e) => setNewExNote(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddingExercise(false)}
              className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800"
            >
              Save Movement
            </button>
          </div>
        </form>
      )}

      {/* Movements Breakdown Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between text-xs font-mono text-slate-500 bg-white">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900">Day {selectedDayNumber} Movements ({workout.exercises.length})</span>
            <span>•</span>
            <span>{totalDayCompletedSets}/{totalDaySets} sets completed</span>
          </div>
          <span>
            Load: {totalVolumeLifted.toLocaleString()} / {totalPrescribedVolume.toLocaleString()} {settings.weightUnit}
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {workout.exercises.map((exercise, idx) => {
            const isEditing = editingExerciseId === exercise.id;

            return (
              <div
                key={exercise.id}
                className="p-4 sm:p-5 hover:bg-slate-50/50 transition-colors"
              >
                {isEditing ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                      <div className="sm:col-span-2">
                        <label className="text-[10px] text-slate-400 font-mono">NAME</label>
                        <input
                          type="text"
                          value={exercise.name}
                          onChange={(e) => updateExercise(exercise.id, { name: e.target.value })}
                          className="w-full px-2 py-1 border border-slate-200 rounded text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 font-mono">SETS</label>
                        <input
                          type="number"
                          value={exercise.sets}
                          onChange={(e) => updateExercise(exercise.id, { sets: Number(e.target.value) })}
                          className="w-full px-2 py-1 border border-slate-200 rounded text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 font-mono">REPS</label>
                        <input
                          type="number"
                          value={exercise.reps}
                          onChange={(e) => updateExercise(exercise.id, { reps: Number(e.target.value) })}
                          className="w-full px-2 py-1 border border-slate-200 rounded text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 font-mono">WEIGHT ({settings.weightUnit})</label>
                        <input
                          type="number"
                          step="0.5"
                          value={exercise.weight}
                          onChange={(e) => updateExercise(exercise.id, { weight: Number(e.target.value) })}
                          className="w-full px-2 py-1 border border-slate-200 rounded text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 font-mono">TEMPO</label>
                        <input
                          type="text"
                          value={exercise.tempo}
                          onChange={(e) => updateExercise(exercise.id, { tempo: e.target.value })}
                          className="w-full px-2 py-1 border border-slate-200 rounded text-xs font-mono"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-[10px] text-slate-400 font-mono">NOTE</label>
                        <input
                          type="text"
                          value={exercise.note}
                          onChange={(e) => updateExercise(exercise.id, { note: e.target.value })}
                          className="w-full px-2 py-1 border border-slate-200 rounded text-xs"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditingExerciseId(null)}
                        className="px-3 py-1 bg-slate-900 text-white rounded text-xs font-medium"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <span className="font-mono text-xs text-slate-400 w-4 pt-0.5">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-semibold text-slate-900">
                              {exercise.name}
                            </h4>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                              {exercise.targetMuscle}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {exercise.note}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 text-xs font-mono">
                        <div className="text-slate-600 text-right">
                          <div>
                            <strong className="text-slate-900">{exercise.sets}</strong> sets ×{' '}
                            <strong className="text-slate-900">{exercise.reps}</strong> reps
                          </div>
                          <div className="text-slate-400 text-[11px]">
                            {exercise.weight} {settings.weightUnit} • Tempo {exercise.tempo} • {exercise.restSec}s rest
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setEditingExerciseId(exercise.id)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 rounded transition-colors"
                            title="Edit movement"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => deleteExercise(exercise.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors"
                            title="Delete movement"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Interactive Set Chips */}
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100 flex-wrap">
                      <span className="text-[11px] font-mono text-slate-400 font-medium mr-1">Working Sets:</span>
                      {Array.from({ length: exercise.sets }).map((_, sIdx) => {
                        const setNum = sIdx + 1;
                        const isComplete = setNum <= exercise.completedSets;
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
                            className={`min-h-[28px] px-2.5 py-0.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 touch-manipulation ${
                              isComplete
                                ? 'bg-slate-900 text-white font-medium shadow-2xs'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80'
                            }`}
                            title={`Set ${setNum}: ${exercise.reps} reps`}
                          >
                            {isComplete ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                            )}
                            <span>Set {setNum}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
