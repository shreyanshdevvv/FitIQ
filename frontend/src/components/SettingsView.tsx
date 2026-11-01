import React, { useState, useEffect } from 'react';
import { useFitness } from '../context/FitnessContext';
import { WeightUnit } from '../types/fitness';
import { Save, Check, Loader2 } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { userProfile, updateUserProfile, currentUser, settings, updateSettings, backendConnected } =
    useFitness();

  const [fitnessLevel, setFitnessLevel] = useState<string>('INTERMEDIATE');
  const [workoutDays, setWorkoutDays] = useState<number>(4);
  const [duration, setDuration] = useState<number>(60);
  const [selectedGoals, setSelectedGoals] = useState<string[]>(['BUILD_MUSCLE']);
  const [equipmentInput, setEquipmentInput] = useState<string>('barbell, dumbbells, bench');
  
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setFitnessLevel(userProfile.fitnessLevel);
      setWorkoutDays(userProfile.workoutDaysPerWeek);
      setDuration(userProfile.sessionDurationMinutes);
      setSelectedGoals(userProfile.goals);
      setEquipmentInput(userProfile.availableEquipment.join(', '));
    }
  }, [userProfile]);

  const toggleGoal = (goal: string) => {
    if (selectedGoals.includes(goal)) {
      if (selectedGoals.length > 1) {
        setSelectedGoals(selectedGoals.filter((g) => g !== goal));
      }
    } else {
      setSelectedGoals([...selectedGoals, goal]);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      const equipmentArray = equipmentInput
        .split(',')
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);

      await updateUserProfile({
        fitnessLevel: fitnessLevel as any,
        workoutDaysPerWeek: Number(workoutDays),
        sessionDurationMinutes: Number(duration),
        goals: selectedGoals as any,
        availableEquipment: equipmentArray,
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl bg-white p-6 rounded-xl border border-slate-200">
      <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900">Athlete Profile & Preferences</h3>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Synchronized directly with PostgreSQL database
          </p>
        </div>
        <span
          className={`text-[10px] font-mono px-2 py-0.5 rounded ${
            backendConnected
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-amber-50 text-amber-700'
          }`}
        >
          {backendConnected ? 'PostgreSQL Live' : 'Connecting...'}
        </span>
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-5 text-xs">
        {/* User Account info */}
        <div>
          <label className="block text-slate-500 font-medium mb-1">Account</label>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 font-mono text-slate-700">
            {currentUser?.name || 'Athlete'} ({currentUser?.email || 'alex@example.com'}) • Role: {currentUser?.role || 'USER'}
          </div>
        </div>

        {/* Weight Unit preference */}
        <div>
          <label className="block text-slate-700 font-medium mb-1.5">Weight Measurement Unit</label>
          <div className="flex gap-2">
            {(['kg', 'lbs'] as WeightUnit[]).map((unit) => (
              <button
                type="button"
                key={unit}
                onClick={() => updateSettings({ weightUnit: unit })}
                className={`px-4 py-1.5 rounded-lg text-xs font-mono font-medium border transition-colors ${
                  settings.weightUnit === unit
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {unit.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Experience Level */}
        <div>
          <label className="block text-slate-700 font-medium mb-1.5">Fitness Experience Level</label>
          <select
            value={fitnessLevel}
            onChange={(e) => setFitnessLevel(e.target.value)}
            className="w-full sm:w-80 px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white font-medium"
          >
            <option value="BEGINNER">BEGINNER (0-1 yrs training)</option>
            <option value="INTERMEDIATE">INTERMEDIATE (1-3 yrs progressive overload)</option>
            <option value="ADVANCED">ADVANCED (3+ yrs structured periodization)</option>
          </select>
        </div>

        {/* Goals */}
        <div>
          <label className="block text-slate-700 font-medium mb-1.5">Primary Training Goals</label>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'BUILD_MUSCLE', label: 'Hypertrophy / Build Muscle' },
              { id: 'LOSE_WEIGHT', label: 'Fat Loss / Caloric Deficit' },
              { id: 'IMPROVE_ENDURANCE', label: 'Endurance & Stamina' },
              { id: 'GENERAL_FITNESS', label: 'General Movement Quality' },
            ].map((g) => {
              const isSelected = selectedGoals.includes(g.id);
              return (
                <button
                  type="button"
                  key={g.id}
                  onClick={() => toggleGoal(g.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs border font-medium transition-colors ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {g.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Workout Days & Duration */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-700 font-medium mb-1">
              Target Sessions per Week (1-7)
            </label>
            <input
              type="number"
              min="1"
              max="7"
              value={workoutDays}
              onChange={(e) => setWorkoutDays(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">
              Session Duration (minutes)
            </label>
            <input
              type="number"
              min="15"
              max="180"
              step="5"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono"
            />
          </div>
        </div>

        {/* Equipment */}
        <div>
          <label className="block text-slate-700 font-medium mb-1">
            Available Equipment (comma separated)
          </label>
          <input
            type="text"
            value={equipmentInput}
            onChange={(e) => setEquipmentInput(e.target.value)}
            placeholder="barbell, dumbbells, bench, pull-up bar, resistance bands"
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
          />
        </div>

        <div className="pt-2 flex items-center justify-between">
          {saveSuccess ? (
            <span className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
              <Check className="w-3.5 h-3.5" />
              <span>Profile saved to PostgreSQL database.</span>
            </span>
          ) : (
            <span />
          )}

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            {saving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>Save Profile</span>
          </button>
        </div>
      </form>
    </div>
  );
};
