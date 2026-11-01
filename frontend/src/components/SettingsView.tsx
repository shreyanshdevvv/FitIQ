import React, { useState, useEffect } from 'react';
import { useFitness } from '../context/FitnessContext';
import { WeightUnit } from '../types/fitness';
import { 
  Save, 
  Check, 
  Loader2, 
  User, 
  Target, 
  Dumbbell, 
  Calendar, 
  ShieldAlert, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { CustomDropdown } from './CustomDropdown';

export const SettingsView: React.FC = () => {
  const { 
    userProfile, 
    updateUserProfile, 
    currentUser, 
    settings, 
    updateSettings, 
    backendConnected 
  } = useFitness();

  // Personal details
  const [name, setName] = useState('');
  const [weight, setWeight] = useState<string>('74');
  const [height, setHeight] = useState<string>('178');
  const [age, setAge] = useState<string>('26');
  const [gender, setGender] = useState<string>('Male');
  
  // Fitness details
  const [fitnessLevel, setFitnessLevel] = useState<'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'>('BEGINNER');
  const [workoutDays, setWorkoutDays] = useState<number>(4);
  const [duration, setDuration] = useState<number>(60);
  const [selectedGoals, setSelectedGoals] = useState<string[]>(['BUILD_MUSCLE']);
  const [availableEquipment, setAvailableEquipment] = useState<string[]>([
    'Barbell & Plates',
    'Dumbbells',
    'Bench',
    'Cable Machine',
    'Pull-Up Bar'
  ]);
  const [injuries, setInjuries] = useState<string[]>([]);
  const [newInjury, setNewInjury] = useState('');

  // Status
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
    }
    if (userProfile) {
      setFitnessLevel(userProfile.fitnessLevel);
      setWorkoutDays(userProfile.workoutDaysPerWeek);
      setDuration(userProfile.sessionDurationMinutes);
      setSelectedGoals(userProfile.goals || ['BUILD_MUSCLE']);
      setAvailableEquipment(userProfile.availableEquipment || []);
      setInjuries(userProfile.injuriesOrLimitations || []);
      
      // Populate weight & height
      if (userProfile.weightKg !== undefined && userProfile.weightKg !== null) {
        if (settings.weightUnit === 'lbs') {
          setWeight((userProfile.weightKg * 2.20462).toFixed(1));
        } else {
          setWeight(String(userProfile.weightKg));
        }
      }
      if (userProfile.heightCm !== undefined && userProfile.heightCm !== null) {
        setHeight(String(userProfile.heightCm));
      }
      if (userProfile.age !== undefined && userProfile.age !== null) {
        setAge(String(userProfile.age));
      }
      if (userProfile.gender) {
        setGender(userProfile.gender);
      }
    }
  }, [userProfile, currentUser, settings.weightUnit]);

  const toggleGoal = (goal: string) => {
    if (selectedGoals.includes(goal)) {
      if (selectedGoals.length > 1) {
        setSelectedGoals(selectedGoals.filter((g) => g !== goal));
      }
    } else {
      setSelectedGoals([...selectedGoals, goal]);
    }
  };

  const toggleEquipment = (item: string) => {
    if (availableEquipment.includes(item)) {
      setAvailableEquipment(availableEquipment.filter((e) => e !== item));
    } else {
      setAvailableEquipment([...availableEquipment, item]);
    }
  };

  const addInjury = () => {
    if (newInjury.trim() && !injuries.includes(newInjury.trim())) {
      setInjuries([...injuries, newInjury.trim()]);
      setNewInjury('');
    }
  };

  const removeInjury = (index: number) => {
    setInjuries(injuries.filter((_, i) => i !== index));
  };

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    setErrorMessage(null);

    try {
      const parsedWeight = parseFloat(weight);
      const parsedHeight = parseFloat(height);
      const parsedAge = parseInt(age, 10);

      // Convert lbs to kg if unit is lbs for standardized storage
      const weightKg = !isNaN(parsedWeight) 
        ? (settings.weightUnit === 'lbs' ? parsedWeight / 2.20462 : parsedWeight)
        : undefined;

      await updateUserProfile({
        name: name.trim(),
        fitnessLevel,
        goals: selectedGoals as any,
        availableEquipment: availableEquipment.length > 0 ? availableEquipment : ['Full Gym'],
        workoutDaysPerWeek: Number(workoutDays),
        sessionDurationMinutes: Number(duration),
        injuriesOrLimitations: injuries,
        weightKg: weightKg ? parseFloat(weightKg.toFixed(2)) : undefined,
        heightCm: !isNaN(parsedHeight) ? parsedHeight : undefined,
        age: !isNaN(parsedAge) ? parsedAge : undefined,
        gender: gender || undefined,
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto w-full">
      {/* Top Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-slate-500 font-medium">
              Athlete profile & goals
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Edit Profile & Training Preferences
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Your personal parameters are used by your AI Coach to calibrate working sets, volume targets, and recovery advice.
          </p>
        </div>

        {saveSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-mono font-medium animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Profile Updated</span>
          </div>
        )}
      </div>

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl font-medium">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSaveAll} className="space-y-6 text-xs">
        {/* Section 1: Personal Details */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <User className="w-4 h-4 text-slate-700" />
            <h2 className="text-sm font-bold text-slate-900 uppercase font-mono tracking-wider">
              Personal Information
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="athlete-name" className="block text-slate-700 font-semibold mb-1">
                Full Name
              </label>
              <input
                id="athlete-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium text-slate-900 transition-colors"
                placeholder="e.g. Alex Johnson"
              />
            </div>

            <div>
              <label htmlFor="athlete-email" className="block text-slate-700 font-semibold mb-1">
                Email Address
              </label>
              <input
                id="athlete-email"
                type="email"
                disabled
                value={currentUser?.email || ''}
                className="w-full min-h-[44px] px-3.5 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-500 font-mono cursor-not-allowed"
              />
            </div>
          </div>

          {/* Body Metrics: Weight, Height, Age, Gender */}
          <div className="pt-2 border-t border-slate-100">
            <span className="block text-slate-700 font-semibold mb-3 text-xs font-mono">
              Body metrics & physical parameters
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label htmlFor="athlete-weight" className="block text-slate-700 font-semibold mb-1">
                  Current Weight ({settings.weightUnit.toUpperCase()})
                </label>
                <div className="relative">
                  <input
                    id="athlete-weight"
                    type="number"
                    step="0.1"
                    min="30"
                    max="300"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono font-bold text-slate-900 tabular-nums transition-colors pr-12"
                    placeholder={settings.weightUnit === 'lbs' ? '165' : '75'}
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400 uppercase font-semibold pointer-events-none">
                    {settings.weightUnit}
                  </span>
                </div>
              </div>

              <div>
                <label htmlFor="athlete-height" className="block text-slate-700 font-semibold mb-1">
                  Height (cm)
                </label>
                <div className="relative">
                  <input
                    id="athlete-height"
                    type="number"
                    step="1"
                    min="100"
                    max="250"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono font-bold text-slate-900 tabular-nums transition-colors pr-12"
                    placeholder="178"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400 uppercase font-semibold pointer-events-none">
                    cm
                  </span>
                </div>
              </div>

              <div>
                <label htmlFor="athlete-age" className="block text-slate-700 font-semibold mb-1">
                  Age (Years)
                </label>
                <div className="relative">
                  <input
                    id="athlete-age"
                    type="number"
                    step="1"
                    min="14"
                    max="100"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono font-bold text-slate-900 tabular-nums transition-colors pr-12"
                    placeholder="26"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400 uppercase font-semibold pointer-events-none">
                    yrs
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Biological Sex
                </label>
                <CustomDropdown
                  value={gender}
                  onChange={(val) => setGender(val)}
                  className="w-full"
                  triggerClassName="min-h-[44px]"
                  options={[
                    { value: 'Male', label: 'Male' },
                    { value: 'Female', label: 'Female' },
                    { value: 'Prefer not to say', label: 'Prefer not to say' },
                  ]}
                />
              </div>
            </div>
          </div>

          {/* Unit Toggle */}
          <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-0.5">
                Preferred Display Unit
              </label>
              <p className="text-[11px] text-slate-500">
                Choose kilograms (kg) or pounds (lbs) across all workout logs and exercise targets.
              </p>
            </div>
            <div className="flex gap-2 shrink-0" role="radiogroup" aria-label="Weight measurement unit">
              {(['kg', 'lbs'] as WeightUnit[]).map((unit) => (
                <button
                  key={unit}
                  type="button"
                  role="radio"
                  aria-checked={settings.weightUnit === unit}
                  onClick={() => {
                    const currentVal = parseFloat(weight);
                    if (!isNaN(currentVal)) {
                      if (unit === 'lbs' && settings.weightUnit === 'kg') {
                        setWeight((currentVal * 2.20462).toFixed(1));
                      } else if (unit === 'kg' && settings.weightUnit === 'lbs') {
                        setWeight((currentVal / 2.20462).toFixed(1));
                      }
                    }
                    updateSettings({ weightUnit: unit });
                  }}
                  className={`min-h-[40px] px-5 py-2 rounded-xl text-xs font-bold transition-all touch-manipulation uppercase font-mono ${
                    settings.weightUnit === unit
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {unit}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section 2: Fitness Goals */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Target className="w-4 h-4 text-slate-700" />
            <h2 className="text-sm font-bold text-slate-900 uppercase font-mono tracking-wider">
              Primary Fitness Goals
            </h2>
          </div>

          <div 
            className="grid grid-cols-1 sm:grid-cols-2 gap-3"
            role="group"
            aria-label="Target fitness goals"
          >
            {[
              { id: 'BUILD_MUSCLE', label: 'Muscle Building', desc: 'Hypertrophy-focused volume with progressive overload.' },
              { id: 'LOSE_WEIGHT', label: 'Fat Loss', desc: 'Caloric density optimization with metabolic resistance.' },
              { id: 'GENERAL_FITNESS', label: 'Strength & Power', desc: 'Compound movement mastery and nervous system recruitment.' },
              { id: 'IMPROVE_ENDURANCE', label: 'Endurance & Work Capacity', desc: 'Sustained pacing and cardiovascular conditioning.' }
            ].map((g) => {
              const isSelected = selectedGoals.includes(g.id);
              return (
                <button
                  key={g.id}
                  type="button"
                  role="checkbox"
                  aria-checked={isSelected}
                  onClick={() => toggleGoal(g.id)}
                  className={`p-4 rounded-2xl border text-left cursor-pointer transition-all focus-visible:ring-2 focus-visible:ring-slate-900 outline-none touch-manipulation ${
                    isSelected
                      ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300 text-slate-800 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold">{g.label}</span>
                    {isSelected && <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />}
                  </div>
                  <p className={`text-xs leading-relaxed ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                    {g.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 3: Training Experience Level */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Sparkles className="w-4 h-4 text-slate-700" />
            <h2 className="text-sm font-bold text-slate-900 uppercase font-mono tracking-wider">
              Experience Level
            </h2>
          </div>

          <div 
            className="grid grid-cols-1 sm:grid-cols-3 gap-3"
            role="radiogroup"
            aria-label="Training experience level"
          >
            {[
              { id: 'BEGINNER', title: 'Beginner', desc: '0–1 years lifting' },
              { id: 'INTERMEDIATE', title: 'Intermediate', desc: '1–3 years consistent' },
              { id: 'ADVANCED', title: 'Advanced', desc: '3+ years periodized' }
            ].map((lvl) => (
              <button
                key={lvl.id}
                type="button"
                role="radio"
                aria-checked={fitnessLevel === lvl.id}
                onClick={() => setFitnessLevel(lvl.id as any)}
                className={`min-h-[44px] p-4 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between focus-visible:ring-2 focus-visible:ring-slate-900 outline-none touch-manipulation ${
                  fitnessLevel === lvl.id
                    ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300 text-slate-800 shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-sm font-bold">{lvl.title}</span>
                  {fitnessLevel === lvl.id && <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />}
                </div>
                <span className={`text-[11px] ${fitnessLevel === lvl.id ? 'text-slate-300' : 'text-slate-500'}`}>
                  {lvl.desc}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Section 4: Schedule Commitment */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Calendar className="w-4 h-4 text-slate-700" />
            <h2 className="text-sm font-bold text-slate-900 uppercase font-mono tracking-wider">
              Schedule & Frequency
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-2">
                Workouts Per Week: <span className="font-mono tabular-nums text-slate-900 font-bold">{workoutDays} Days</span>
              </label>
              <div className="grid grid-cols-5 gap-2" role="radiogroup" aria-label="Workouts per week">
                {[2, 3, 4, 5, 6].map((d) => (
                  <button
                    key={d}
                    type="button"
                    role="radio"
                    aria-checked={workoutDays === d}
                    onClick={() => setWorkoutDays(d)}
                    className={`min-h-[44px] py-2 rounded-xl text-xs font-mono font-bold transition-all touch-manipulation ${
                      workoutDays === d
                        ? 'bg-slate-900 text-white shadow-2xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {d}d
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-2">
                Session Duration: <span className="font-mono tabular-nums text-slate-900 font-bold">{duration} Minutes</span>
              </label>
              <div className="grid grid-cols-4 gap-2" role="radiogroup" aria-label="Session duration">
                {[30, 45, 60, 75].map((m) => (
                  <button
                    key={m}
                    type="button"
                    role="radio"
                    aria-checked={duration === m}
                    onClick={() => setDuration(m)}
                    className={`min-h-[44px] py-2 rounded-xl text-xs font-mono font-bold transition-all touch-manipulation ${
                      duration === m
                        ? 'bg-slate-900 text-white shadow-2xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {m}m
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section 5: Available Equipment */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Dumbbell className="w-4 h-4 text-slate-700" />
            <h2 className="text-sm font-bold text-slate-900 uppercase font-mono tracking-wider">
              Available Equipment
            </h2>
          </div>

          <div 
            className="grid grid-cols-2 sm:grid-cols-4 gap-2.5"
            role="group"
            aria-label="Available exercise equipment"
          >
            {[
              'Barbell & Plates',
              'Dumbbells',
              'Bench',
              'Cable Machine',
              'Pull-Up Bar',
              'Resistance Bands',
              'Squat Rack',
              'Kettlebells'
            ].map((eq) => {
              const isSelected = availableEquipment.includes(eq);
              return (
                <button
                  key={eq}
                  type="button"
                  role="checkbox"
                  aria-checked={isSelected}
                  onClick={() => toggleEquipment(eq)}
                  className={`min-h-[44px] p-3 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between focus-visible:ring-2 focus-visible:ring-slate-900 outline-none touch-manipulation ${
                    isSelected
                      ? 'border-slate-900 bg-slate-900 text-white shadow-2xs'
                      : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700 shadow-2xs'
                  }`}
                >
                  <span className="text-xs font-semibold truncate">{eq}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3] shrink-0 ml-1" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 6: Physical Limitations & Injuries */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <ShieldAlert className="w-4 h-4 text-slate-700" />
            <h2 className="text-sm font-bold text-slate-900 uppercase font-mono tracking-wider">
              Movement Restrictions & Injuries
            </h2>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. Lower back tightness, Left knee pain"
              aria-label="Add injury or restriction"
              value={newInjury}
              onChange={(e) => setNewInjury(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addInjury();
                }
              }}
              className="flex-1 min-h-[44px] px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none"
            />
            <button
              type="button"
              onClick={addInjury}
              className="min-h-[44px] px-5 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-800 touch-manipulation shadow-2xs"
            >
              Add
            </button>
          </div>

          {injuries.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1" aria-label="List of restrictions">
              {injuries.map((inj, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-800 font-medium"
                >
                  <span>{inj}</span>
                  <button
                    type="button"
                    onClick={() => removeInjury(idx)}
                    aria-label={`Remove restriction ${inj}`}
                    className="text-slate-400 hover:text-slate-800 font-bold ml-1 text-sm leading-none"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Submit Action Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="min-h-[44px] flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition-all shadow-md touch-manipulation"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Profile & Goals</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
