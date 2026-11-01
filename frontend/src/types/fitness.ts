export type ViewMode = 'today' | 'workout' | 'coach' | 'biometrics' | 'nutrition' | 'settings';

export type WeightUnit = 'kg' | 'lbs';

export interface Exercise {
  id: string;
  name: string;
  targetMuscle: string;
  sets: number;
  reps: number;
  weight: number;
  restSec: number;
  tempo: string;
  note: string;
  completedSets: number;
}

export interface WorkoutSession {
  id: string;
  title: string;
  focus: string;
  exercises: Exercise[];
}

export interface BiometricLog {
  date: string;
  readiness: number;
  hrv: number;
  sleepHours: number;
  restingHr: number;
}

export interface ChatMessage {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  timestamp: string;
  sources?: {
    source_file: string;
    title: string;
    similarity_score: number;
  }[];
}

export interface MacroGoals {
  proteinTarget: number;
  carbsTarget: number;
  fatsTarget: number;
  waterTargetLiters: number;
  proteinCurrent: number;
  carbsCurrent: number;
  fatsCurrent: number;
  waterCurrentLiters: number;
}

export interface UserFitnessProfile {
  id?: string;
  fitnessLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  goals: ('BUILD_MUSCLE' | 'LOSE_WEIGHT' | 'IMPROVE_ENDURANCE' | 'GENERAL_FITNESS')[];
  availableEquipment: string[];
  workoutDaysPerWeek: number;
  sessionDurationMinutes: number;
  injuriesOrLimitations: string[];
}

export interface UserSettings {
  weightUnit: WeightUnit;
}
