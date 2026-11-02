import React, { useState } from 'react';
import { 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  ShieldAlert, 
  Loader2,
  CheckCircle2,
  Sliders
} from 'lucide-react';
import { api } from '../services/api';
import { useFitness } from '../context/FitnessContext';
import { CustomDropdown } from './CustomDropdown';

interface FitnessOnboardingProps {
  onComplete: () => void;
}

export const FitnessOnboarding: React.FC<FitnessOnboardingProps> = ({ onComplete }) => {
  const { loadUserData } = useFitness();
  const [step, setStep] = useState(1);
  const totalSteps = 8;

  // Step 1: Personal Info
  const [age, setAge] = useState(26);
  const [heightCm, setHeightCm] = useState(178);
  const [weightKg, setWeightKg] = useState(74);
  const [gender, setGender] = useState('Male');

  // Step 2: Goals
  const [selectedGoals, setSelectedGoals] = useState<string[]>(['BUILD_MUSCLE']);
  const [primaryGoal, setPrimaryGoal] = useState<string>('BUILD_MUSCLE');

  // Step 3: Experience
  const [fitnessLevel, setFitnessLevel] = useState<'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'>('BEGINNER');

  // Step 4: Training Preferences
  const [workoutDaysPerWeek, setWorkoutDaysPerWeek] = useState(4);
  const [sessionDurationMinutes, setSessionDurationMinutes] = useState(60);

  // Step 5: Equipment Availability
  const [availableEquipment, setAvailableEquipment] = useState<string[]>([
    'Barbell & Plates',
    'Dumbbells',
    'Bench',
    'Cable Machine',
    'Pull-Up Bar'
  ]);

  // Step 6: Exercise Restrictions & Injuries
  const [injuries, setInjuries] = useState<string[]>([]);
  const [newInjury, setNewInjury] = useState('');

  // Step 7: Dietary Preferences
  const [dietaryPreference, setDietaryPreference] = useState('Non-vegetarian');

  // Saving state
  const [isSaving, setIsSaving] = useState(false);
  const [savingStatus, setSavingStatus] = useState('Saving profile...');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const toggleGoal = (goal: string) => {
    if (selectedGoals.includes(goal)) {
      if (selectedGoals.length > 1) {
        setSelectedGoals(selectedGoals.filter((g) => g !== goal));
        if (primaryGoal === goal) {
          setPrimaryGoal(selectedGoals.filter((g) => g !== goal)[0]);
        }
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

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setErrorMsg(null);

    try {
      // 1. Save profile to secure athlete account
      setSavingStatus('Saving athlete profile...');
      await api.upsertProfile({
        fitnessLevel,
        goals: selectedGoals,
        availableEquipment: availableEquipment.length > 0 ? availableEquipment : ['Full Gym'],
        workoutDaysPerWeek,
        sessionDurationMinutes,
        injuriesOrLimitations: injuries,
        heightCm,
        weightKg,
        age,
        gender,
      });

      // 2. Generate personalized AI Workout Plan matched to new profile
      setSavingStatus('AI architecting personalized workout split...');
      try {
        await api.generateAiWorkout({
          focusAreas: selectedGoals,
          notes: `Generated on onboarding for ${fitnessLevel} level, ${workoutDaysPerWeek} days/week split`,
        });
      } catch (workoutErr) {
        console.warn('AI Workout generation fallback:', workoutErr);
      }

      // 3. Generate personalized AI Nutrition & Macro Targets calibrated to profile
      setSavingStatus('AI calibrating metabolic & daily macro targets...');
      try {
        await api.generateNutritionPlan();
      } catch (nutritionErr) {
        console.warn('AI Nutrition generation fallback:', nutritionErr);
      }

      // 4. Refresh local app context & enter dashboard immediately
      setSavingStatus('Finalizing athlete dashboard...');
      if (typeof loadUserData === 'function') {
        await loadUserData();
      }
      onComplete();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save profile. Please verify your connection.');
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas text-slate-900 flex flex-col justify-between p-4 sm:p-6 lg:p-8 font-sans">
      {/* Top Header & Progress */}
      <div className="max-w-2xl mx-auto w-full pt-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center font-mono font-bold text-xs shadow-2xs">
              F
            </div>
            <span className="font-bold text-sm text-slate-900">FitIQ Onboarding</span>
          </div>
          <span className="text-xs font-mono text-slate-500 font-medium">
            Step <span className="tabular-nums font-bold text-slate-900">{step}</span> of <span className="tabular-nums">{totalSteps}</span>
          </span>
        </div>

        {/* Progress bar */}
        <div 
          className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-8"
          role="progressbar"
          aria-valuenow={step}
          aria-valuemin={1}
          aria-valuemax={totalSteps}
          aria-label="Onboarding progress"
        >
          <div 
            className="bg-slate-900 h-full transition-all duration-300"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Step Container */}
      <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col justify-center">
        {/* Step 1: Personal Information */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <span className="text-[11px] font-mono text-slate-500 font-medium">
                Screen 01
              </span>
              <h2 className="text-2xl font-bold text-slate-900 mt-1">Personal Metrics</h2>
              <p className="text-xs text-slate-600 mt-1">
                We use these baseline parameters to calculate appropriate working load intensities, recovery rates, and volume thresholds.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
                <label htmlFor="age-input" className="text-xs font-mono text-slate-600 block mb-1 font-medium">Age (Years)</label>
                <input
                  id="age-input"
                  type="number"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  min={14}
                  max={90}
                  className="w-full text-xl font-bold font-mono tabular-nums text-slate-900 bg-transparent border-none outline-none focus:ring-0"
                />
              </div>

              <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
                <label htmlFor="height-input" className="text-xs font-mono text-slate-600 block mb-1 font-medium">Height (cm)</label>
                <input
                  id="height-input"
                  type="number"
                  value={heightCm}
                  onChange={(e) => setHeightCm(Number(e.target.value))}
                  min={120}
                  max={230}
                  className="w-full text-xl font-bold font-mono tabular-nums text-slate-900 bg-transparent border-none outline-none focus:ring-0"
                />
              </div>

              <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
                <label htmlFor="weight-input" className="text-xs font-mono text-slate-600 block mb-1 font-medium">Current Weight (kg)</label>
                <input
                  id="weight-input"
                  type="number"
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  min={35}
                  max={250}
                  className="w-full text-xl font-bold font-mono tabular-nums text-slate-900 bg-transparent border-none outline-none focus:ring-0"
                />
              </div>

              <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
                <label className="text-xs font-mono text-slate-600 block mb-1 font-medium">Biological Sex</label>
                <CustomDropdown
                  value={gender}
                  onChange={(val) => setGender(val)}
                  className="w-full"
                  triggerClassName="border-none px-0 py-1 shadow-none font-bold text-slate-900"
                  options={[
                    { value: 'Male', label: 'Male' },
                    { value: 'Female', label: 'Female' },
                    { value: 'Prefer not to say', label: 'Prefer not to say' },
                  ]}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Fitness Goals (Keyboard Accessible) */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <span className="text-[11px] font-mono text-slate-500 font-medium">
                Screen 02
              </span>
              <h2 className="text-2xl font-bold text-slate-900 mt-1">What are your primary goals?</h2>
              <p className="text-xs text-slate-600 mt-1">
                Select all that apply. Choose one as your primary focus for program periodization.
              </p>
            </div>

            <div 
              className="grid grid-cols-1 sm:grid-cols-2 gap-3"
              role="group"
              aria-label="Fitness goals selection"
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
                    onKeyDown={(e) => {
                      if (e.key === ' ' || e.key === 'Enter') {
                        e.preventDefault();
                        toggleGoal(g.id);
                      }
                    }}
                    className={`p-4 rounded-2xl border text-left cursor-pointer transition-all focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 outline-none touch-manipulation ${
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
        )}

        {/* Step 3: Experience Level */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <span className="text-[11px] font-mono text-slate-500 font-medium">
                Screen 03
              </span>
              <h2 className="text-2xl font-bold text-slate-900 mt-1">Current Training Experience</h2>
              <p className="text-xs text-slate-600 mt-1">
                Helps determine your weekly set volume benchmarks and exercise complexity.
              </p>
            </div>

            <div 
              className="space-y-3"
              role="radiogroup"
              aria-label="Training experience level"
            >
              {[
                { id: 'BEGINNER', title: 'Beginner (0–1 years)', desc: 'Learning movement mechanics, building consistency, rapid neural adaptations.' },
                { id: 'INTERMEDIATE', title: 'Intermediate (1–3 years)', desc: 'Consistent training history, familiar with compound lifts and progressive overload.' },
                { id: 'ADVANCED', title: 'Advanced (3+ years)', desc: 'High work capacity, requires targeted volume management and periodized splits.' }
              ].map((lvl) => (
                <button
                  key={lvl.id}
                  type="button"
                  role="radio"
                  aria-checked={fitnessLevel === lvl.id}
                  onClick={() => setFitnessLevel(lvl.id as any)}
                  onKeyDown={(e) => {
                    if (e.key === ' ' || e.key === 'Enter') {
                      e.preventDefault();
                      setFitnessLevel(lvl.id as any);
                    }
                  }}
                  className={`w-full p-4 rounded-2xl border text-left cursor-pointer transition-all flex items-center justify-between focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 outline-none touch-manipulation ${
                    fitnessLevel === lvl.id
                      ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300 text-slate-800 shadow-2xs'
                  }`}
                >
                  <div>
                    <h4 className="text-sm font-bold">{lvl.title}</h4>
                    <p className={`text-xs mt-0.5 leading-relaxed ${fitnessLevel === lvl.id ? 'text-slate-300' : 'text-slate-500'}`}>
                      {lvl.desc}
                    </p>
                  </div>
                  {fitnessLevel === lvl.id && <Check className="w-4 h-4 text-emerald-400 stroke-[3] shrink-0 ml-3" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Training Preferences */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <span className="text-[11px] font-mono text-slate-500 font-medium">
                Screen 04
              </span>
              <h2 className="text-2xl font-bold text-slate-900 mt-1">Schedule & Time Commitment</h2>
              <p className="text-xs text-slate-600 mt-1">
                We calibrate your weekly training volume so it fits comfortably into your real life.
              </p>
            </div>

            <div className="space-y-6">
              <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-600 font-medium">Days per week</span>
                  <span className="text-base font-bold font-mono tabular-nums text-slate-900">{workoutDaysPerWeek} Days</span>
                </div>
                <div 
                  className="grid grid-cols-5 gap-2"
                  role="radiogroup"
                  aria-label="Select training days per week"
                >
                  {[2, 3, 4, 5, 6].map((d) => (
                    <button
                      key={d}
                      type="button"
                      role="radio"
                      aria-checked={workoutDaysPerWeek === d}
                      onClick={() => setWorkoutDaysPerWeek(d)}
                      className={`min-h-[44px] py-2 rounded-xl text-xs font-mono tabular-nums font-bold transition-all touch-manipulation focus-visible:ring-2 focus-visible:ring-slate-900 ${
                        workoutDaysPerWeek === d
                          ? 'bg-slate-900 text-white shadow-2xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {d}d
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-600 font-medium">Target session duration</span>
                  <span className="text-base font-bold font-mono tabular-nums text-slate-900">{sessionDurationMinutes} Minutes</span>
                </div>
                <div 
                  className="grid grid-cols-4 gap-2"
                  role="radiogroup"
                  aria-label="Select session duration"
                >
                  {[30, 45, 60, 75].map((m) => (
                    <button
                      key={m}
                      type="button"
                      role="radio"
                      aria-checked={sessionDurationMinutes === m}
                      onClick={() => setSessionDurationMinutes(m)}
                      className={`min-h-[44px] py-2 rounded-xl text-xs font-mono tabular-nums font-bold transition-all touch-manipulation focus-visible:ring-2 focus-visible:ring-slate-900 ${
                        sessionDurationMinutes === m
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
        )}

        {/* Step 5: Equipment Availability */}
        {step === 5 && (
          <div className="space-y-6">
            <div>
              <span className="text-[11px] font-mono text-slate-500 font-medium">
                Screen 05
              </span>
              <h2 className="text-2xl font-bold text-slate-900 mt-1">Available Equipment</h2>
              <p className="text-xs text-slate-600 mt-1">
                Your AI Coach will select exercises matching what you actually have access to.
              </p>
            </div>

            <div 
              className="grid grid-cols-1 sm:grid-cols-2 gap-3"
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
                    onKeyDown={(e) => {
                      if (e.key === ' ' || e.key === 'Enter') {
                        e.preventDefault();
                        toggleEquipment(eq);
                      }
                    }}
                    className={`min-h-[44px] p-3.5 rounded-2xl border text-left cursor-pointer transition-all flex items-center justify-between focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 outline-none touch-manipulation ${
                      isSelected
                        ? 'border-slate-900 bg-slate-900 text-white shadow-2xs'
                        : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700 shadow-2xs'
                    }`}
                  >
                    <span className="text-xs font-semibold">{eq}</span>
                    {isSelected && <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 6: Exercise Restrictions & Injuries */}
        {step === 6 && (
          <div className="space-y-6">
            <div>
              <span className="text-[11px] font-mono text-slate-500 font-medium">
                Screen 06
              </span>
              <h2 className="text-2xl font-bold text-slate-900 mt-1">Injuries & Movement Restrictions</h2>
              <p className="text-xs text-slate-600 mt-1">
                Let us know of any joint issues, disc discomfort, or exercises you need to avoid.
              </p>
            </div>

            <div className="p-3.5 bg-amber-50 border border-amber-200/80 rounded-2xl text-xs text-amber-900 flex items-start gap-2.5 leading-relaxed">
              <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <p>
                <strong>Medical Notice:</strong> FitIQ provides conditioning adaptations and safe movement substitutions, but does not provide clinical diagnosis or replace a physical therapist.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Mild lower back tightness, Left shoulder impingement"
                  aria-label="Add injury, discomfort, or exercise to avoid"
                  value={newInjury}
                  onChange={(e) => setNewInjury(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addInjury();
                    }
                  }}
                  className="flex-1 min-h-[44px] px-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none"
                />
                <button
                  type="button"
                  onClick={addInjury}
                  aria-label="Add specified restriction"
                  className="min-h-[44px] px-5 py-2.5 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-800 touch-manipulation shadow-2xs"
                >
                  Add
                </button>
              </div>

              {injuries.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2" aria-label="Current list of restrictions">
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
          </div>
        )}

        {/* Step 7: Dietary Preferences */}
        {step === 7 && (
          <div className="space-y-6">
            <div>
              <span className="text-[11px] font-mono text-slate-500 font-medium">
                Screen 07
              </span>
              <h2 className="text-2xl font-bold text-slate-900 mt-1">Dietary Preferences (Optional)</h2>
              <p className="text-xs text-slate-600 mt-1">
                Helps your AI coach tailor recovery and protein intake guidelines. You can skip this step.
              </p>
            </div>

            <div 
              className="grid grid-cols-1 sm:grid-cols-2 gap-3"
              role="radiogroup"
              aria-label="Dietary preference selection"
            >
              {['Non-vegetarian', 'Vegetarian', 'Vegan', 'Jain', 'Pescatarian', 'No Preference'].map((diet) => (
                <button
                  key={diet}
                  type="button"
                  role="radio"
                  aria-checked={dietaryPreference === diet}
                  onClick={() => setDietaryPreference(diet)}
                  onKeyDown={(e) => {
                    if (e.key === ' ' || e.key === 'Enter') {
                      e.preventDefault();
                      setDietaryPreference(diet);
                    }
                  }}
                  className={`min-h-[44px] p-4 rounded-2xl border text-left cursor-pointer transition-all flex items-center justify-between focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 outline-none touch-manipulation ${
                    dietaryPreference === diet
                      ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700 shadow-2xs'
                  }`}
                >
                  <span className="text-xs font-bold">{diet}</span>
                  {dietaryPreference === diet && <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 8: Profile Summary & Save */}
        {step === 8 && (
          <div className="space-y-6">
            <div>
              <span className="text-[11px] font-mono text-slate-500 font-medium">
                Screen 08
              </span>
              <h2 className="text-2xl font-bold text-slate-900 mt-1">Review & Save Profile</h2>
              <p className="text-xs text-slate-600 mt-1">
                Verify your parameters. Once saved, your profile and training preferences will be stored in your account. You can generate or customize workout plans from your dashboard at any time.
              </p>
            </div>

            <div className="p-5 sm:p-6 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 font-mono block">Level</span>
                  <span className="font-bold text-slate-900">{fitnessLevel}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-mono block">Frequency</span>
                  <span className="font-bold font-mono tabular-nums text-slate-900">{workoutDaysPerWeek} Days / wk</span>
                </div>
                <div>
                  <span className="text-slate-500 font-mono block">Duration</span>
                  <span className="font-bold font-mono tabular-nums text-slate-900">{sessionDurationMinutes} min</span>
                </div>
                <div>
                  <span className="text-slate-500 font-mono block">Equipment</span>
                  <span className="font-bold font-mono tabular-nums text-slate-900">{availableEquipment.length} items</span>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3 text-xs">
                <span className="text-slate-500 font-mono block mb-1.5 font-medium">Target Goals</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedGoals.map((g) => (
                    <span key={g} className="px-2.5 py-1 bg-slate-100 rounded-lg text-slate-800 font-medium">
                      {g.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>

              {injuries.length > 0 && (
                <div className="border-t border-slate-100 pt-3 text-xs">
                  <span className="text-slate-500 font-mono block mb-1 font-medium">Movement Considerations</span>
                  <p className="text-slate-800 font-medium">{injuries.join(', ')}</p>
                </div>
              )}
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
                {errorMsg}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Navigation Buttons */}
      <div className="max-w-2xl mx-auto w-full pt-8 flex items-center justify-between border-t border-slate-100">
        <button
          type="button"
          onClick={() => setStep(Math.max(1, step - 1))}
          disabled={step === 1 || isSaving}
          className="min-h-[44px] flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:pointer-events-none transition-colors touch-manipulation"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>

        {step < totalSteps ? (
          <button
            type="button"
            onClick={() => setStep(step + 1)}
            className="min-h-[44px] flex items-center gap-1.5 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-all shadow-xs touch-manipulation"
          >
            <span>Continue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSaveProfile}
            disabled={isSaving}
            className="min-h-[44px] flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition-all shadow-md touch-manipulation"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                <span>{savingStatus}</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                <span>Save Profile & Enter Dashboard</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
