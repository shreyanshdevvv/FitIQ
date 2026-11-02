import React, { useState, useEffect } from 'react';
import { useFitness } from '../context/FitnessContext';
import { WeightUnit } from '../types/fitness';
import { 
  Save, 
  Check, 
  Loader2, 
  CheckCircle2,
  X,
  Plus,
  AlertCircle
} from 'lucide-react';
import { CustomDropdown } from './CustomDropdown';

export const SettingsView: React.FC = () => {
  const { 
    userProfile, 
    updateUserProfile, 
    currentUser, 
    settings, 
    updateSettings 
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

  const handleUnitToggle = (unit: WeightUnit) => {
    if (settings.weightUnit === unit) return;
    const currentVal = parseFloat(weight);
    if (!isNaN(currentVal)) {
      if (unit === 'lbs') {
        setWeight((currentVal * 2.20462).toFixed(1));
      } else {
        setWeight((currentVal / 2.20462).toFixed(1));
      }
    }
    updateSettings({ weightUnit: unit });
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
    <div className="max-w-6xl mx-auto w-full space-y-6">
      {/* Page Header */}
      <div className="pb-2 border-b border-slate-200/80">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Fitness Profile & Training Preferences
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Calibrate biometrics, volume targets, and equipment constraints for your AI Coach.
        </p>
      </div>

      {errorMessage && (
        <div 
          role="alert"
          className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl font-medium flex items-center justify-between gap-3 animate-fadeIn"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setErrorMessage(null)}
            className="w-8 h-8 flex items-center justify-center text-rose-500 hover:text-rose-800 rounded-lg hover:bg-rose-100/60 transition-colors"
            aria-label="Dismiss error message"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <form onSubmit={handleSaveAll} className="space-y-6 text-xs">
        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Personal Data, Body Metrics, Schedule */}
          <div className="lg:col-span-5 space-y-6">
            {/* Section 1: Personal Details & Physical Metrics */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
              <div className="pb-3 border-b border-slate-100">
                <h2 className="text-sm font-semibold text-slate-900">
                  Personal Information & Biometrics
                </h2>
              </div>

              <div className="space-y-3.5">
                <div>
                  <label htmlFor="athlete-name" className="block text-slate-700 font-medium mb-1">
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
                  <label htmlFor="athlete-email" className="block text-slate-700 font-medium mb-1">
                    Account Email
                  </label>
                  <input
                    id="athlete-email"
                    type="email"
                    disabled
                    value={currentUser?.email || ''}
                    className="w-full min-h-[44px] px-3.5 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-400 font-mono cursor-not-allowed"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label htmlFor="athlete-weight" className="block text-slate-700 font-medium mb-1">
                      Weight ({settings.weightUnit.toUpperCase()})
                    </label>
                    <div className="relative">
                      <input
                        id="athlete-weight"
                        type="number"
                        step="0.1"
                        inputMode="decimal"
                        min="30"
                        max="300"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        className="w-full min-h-[44px] px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono font-medium text-slate-900 tabular-nums transition-colors pr-12"
                        placeholder={settings.weightUnit === 'lbs' ? '165' : '75'}
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400 uppercase font-semibold pointer-events-none">
                        {settings.weightUnit}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="athlete-height" className="block text-slate-700 font-medium mb-1">
                      Height (cm)
                    </label>
                    <div className="relative">
                      <input
                        id="athlete-height"
                        type="number"
                        step="1"
                        inputMode="numeric"
                        min="100"
                        max="250"
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        className="w-full min-h-[44px] px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono font-medium text-slate-900 tabular-nums transition-colors pr-12"
                        placeholder="178"
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400 uppercase font-semibold pointer-events-none">
                        cm
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="athlete-age" className="block text-slate-700 font-medium mb-1">
                      Age
                    </label>
                    <div className="relative">
                      <input
                        id="athlete-age"
                        type="number"
                        step="1"
                        inputMode="numeric"
                        min="14"
                        max="100"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        className="w-full min-h-[44px] px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono font-medium text-slate-900 tabular-nums transition-colors pr-12"
                        placeholder="26"
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400 uppercase font-semibold pointer-events-none">
                        yrs
                      </span>
                    </div>
                  </div>

                  <div>
                    <CustomDropdown
                      label="Biological Sex"
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

                {/* Unit Preferences */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div>
                    <span id="unit-group-label" className="block text-slate-700 font-medium mb-0.5">
                      Display Unit
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Standardize weights across logs
                    </p>
                  </div>
                  <div 
                    className="inline-flex rounded-xl p-1 bg-slate-100 border border-slate-200/80" 
                    role="radiogroup" 
                    aria-labelledby="unit-group-label"
                  >
                    {(['kg', 'lbs'] as WeightUnit[]).map((unit) => (
                      <button
                        key={unit}
                        type="button"
                        role="radio"
                        aria-checked={settings.weightUnit === unit}
                        onClick={() => handleUnitToggle(unit)}
                        className={`min-h-[36px] min-w-[50px] px-3.5 py-1.5 rounded-lg text-xs font-semibold font-mono transition-colors touch-manipulation uppercase ${
                          settings.weightUnit === unit
                            ? 'bg-white text-slate-900 shadow-2xs'
                            : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        {unit}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Schedule & Commitment */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
              <div className="pb-3 border-b border-slate-100">
                <h2 className="text-sm font-semibold text-slate-900">
                  Training Frequency & Schedule
                </h2>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span id="workouts-per-week-label" className="text-slate-700 font-medium">
                      Workouts Per Week
                    </span>
                    <span className="font-mono text-xs font-semibold text-slate-900 px-2 py-0.5 bg-slate-100 rounded-md">
                      {workoutDays} Days / wk
                    </span>
                  </div>
                  <div 
                    className="grid grid-cols-5 gap-2" 
                    role="radiogroup" 
                    aria-labelledby="workouts-per-week-label"
                  >
                    {[2, 3, 4, 5, 6].map((d) => (
                      <button
                        key={d}
                        type="button"
                        role="radio"
                        aria-checked={workoutDays === d}
                        onClick={() => setWorkoutDays(d)}
                        className={`min-h-[44px] py-2 rounded-xl text-xs font-mono font-medium transition-colors touch-manipulation ${
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

                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <span id="session-duration-label" className="text-slate-700 font-medium">
                      Session Target Duration
                    </span>
                    <span className="font-mono text-xs font-semibold text-slate-900 px-2 py-0.5 bg-slate-100 rounded-md">
                      {duration} Minutes
                    </span>
                  </div>
                  <div 
                    className="grid grid-cols-4 gap-2" 
                    role="radiogroup" 
                    aria-labelledby="session-duration-label"
                  >
                    {[30, 45, 60, 75].map((m) => (
                      <button
                        key={m}
                        type="button"
                        role="radio"
                        aria-checked={duration === m}
                        onClick={() => setDuration(m)}
                        className={`min-h-[44px] py-2 rounded-xl text-xs font-mono font-medium transition-colors touch-manipulation ${
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
          </div>

          {/* Right Column: Goals, Experience, Equipment, Limitations */}
          <div className="lg:col-span-7 space-y-6">
            {/* Section 3: Fitness Goals */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h2 className="text-sm font-semibold text-slate-900">
                  Primary Fitness Goals
                </h2>
                <span className="text-[11px] text-slate-500">Multi-select enabled</span>
              </div>

              <div 
                className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                role="group"
                aria-label="Target fitness goals"
              >
                {[
                  { id: 'BUILD_MUSCLE', label: 'Muscle Building', desc: 'Hypertrophy-focused volume with progressive overload.' },
                  { id: 'LOSE_WEIGHT', label: 'Fat Loss', desc: 'Caloric density optimization with metabolic resistance.' },
                  { id: 'GENERAL_FITNESS', label: 'Strength & Power', desc: 'Compound movement mastery and nervous recruitment.' },
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
                      className={`min-h-[44px] p-3.5 rounded-xl border text-left cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-slate-900 outline-none touch-manipulation flex flex-col justify-between ${
                        isSelected
                          ? 'border-slate-900 bg-slate-50 text-slate-900 ring-1 ring-slate-900 shadow-2xs'
                          : 'border-slate-200 bg-white hover:border-slate-300 text-slate-800 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className="text-xs font-semibold text-slate-900">{g.label}</span>
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        {g.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 4: Training Experience Level */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
              <div className="pb-3 border-b border-slate-100">
                <h2 className="text-sm font-semibold text-slate-900">
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
                ].map((lvl) => {
                  const isSelected = fitnessLevel === lvl.id;
                  return (
                    <button
                      key={lvl.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => setFitnessLevel(lvl.id as any)}
                      className={`min-h-[44px] p-3.5 rounded-xl border text-left cursor-pointer transition-colors flex flex-col justify-between focus-visible:ring-2 focus-visible:ring-slate-900 outline-none touch-manipulation ${
                        isSelected
                          ? 'border-slate-900 bg-slate-50 text-slate-900 ring-1 ring-slate-900 shadow-2xs'
                          : 'border-slate-200 bg-white hover:border-slate-300 text-slate-800 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className="text-xs font-semibold text-slate-900">{lvl.title}</span>
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500">
                        {lvl.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 5: Available Equipment */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h2 className="text-sm font-semibold text-slate-900">
                  Available Equipment
                </h2>
                <span className="text-[11px] text-slate-500 font-mono">
                  {availableEquipment.length} selected
                </span>
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
                      className={`min-h-[44px] px-3 py-2 rounded-xl border text-left cursor-pointer transition-colors flex items-center justify-between focus-visible:ring-2 focus-visible:ring-slate-900 outline-none touch-manipulation ${
                        isSelected
                          ? 'border-slate-900 bg-slate-50 text-slate-900 ring-1 ring-slate-900 shadow-2xs font-semibold'
                          : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700 shadow-2xs'
                      }`}
                    >
                      <span className="text-xs truncate">{eq}</span>
                      {isSelected && (
                        <div className="w-3.5 h-3.5 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0 ml-1">
                          <Check className="w-2 h-2 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 6: Physical Limitations & Injuries */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
              <div className="pb-3 border-b border-slate-100">
                <h2 className="text-sm font-semibold text-slate-900">
                  Movement Restrictions & Limitations
                </h2>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Lower back tightness, Left shoulder impingement"
                  aria-label="Add injury or movement restriction"
                  value={newInjury}
                  onChange={(e) => setNewInjury(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addInjury();
                    }
                  }}
                  className="flex-1 min-h-[44px] px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={addInjury}
                  disabled={!newInjury.trim()}
                  className="min-h-[44px] min-w-[70px] px-4 py-2 bg-slate-900 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-xl hover:bg-slate-800 touch-manipulation shadow-2xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>

              {injuries.length > 0 ? (
                <div className="flex flex-wrap gap-2 pt-1" aria-label="List of restrictions">
                  {injuries.map((inj, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-2 pl-3 pr-1.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 font-medium"
                    >
                      <span>{inj}</span>
                      <button
                        type="button"
                        onClick={() => removeInjury(idx)}
                        aria-label={`Remove restriction ${inj}`}
                        className="w-7 h-7 flex items-center justify-center rounded text-slate-400 hover:text-slate-900 hover:bg-slate-200/80 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-slate-400">
                  No limitations registered. AI Coach will calibrate full range-of-motion movements.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Sticky Action Footer */}
        <div className="sticky bottom-4 z-20 bg-white/95 dark:bg-[#16171B]/95 backdrop-blur-md border border-slate-200 dark:border-[#262933] rounded-2xl p-4 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2">
            {saveSuccess ? (
              <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Profile updated & synced to AI Coach
              </span>
            ) : (
              <span className="text-slate-500 dark:text-slate-400">
                All changes automatically update your workout volume calculations.
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={saving}
            className={`w-full sm:w-auto min-h-[44px] min-w-[190px] flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold transition-colors shadow-sm touch-manipulation ${
              saveSuccess 
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                : 'bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100'
            }`}
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-300" />
                <span>Saving Changes...</span>
              </>
            ) : saveSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>Changes Saved</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Profile & Preferences</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Floating Save Toast Notification - Quiet Light Chrome */}
      {saveSuccess && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 left-4 sm:left-auto z-50 flex items-start gap-3 bg-white dark:bg-[#16171B] text-slate-900 dark:text-slate-100 px-4 py-3.5 rounded-2xl shadow-lg border border-slate-200 dark:border-[#262933] max-w-sm animate-fadeIn"
        >
          <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0 mt-0.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex-1 min-w-0 pr-1">
            <p className="text-xs font-semibold text-slate-900">Fitness Profile Saved</p>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5 leading-relaxed">
              Your biometrics, workout split, and training targets have been updated.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSaveSuccess(false)}
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
