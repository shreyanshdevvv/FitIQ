export type ViewMode = 'today' | 'workout' | 'coach' | 'coaches' | 'exercises' | 'settings';

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

export interface UserFitnessProfile {
  id?: string;
  fitnessLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  goals: ('BUILD_MUSCLE' | 'LOSE_WEIGHT' | 'IMPROVE_ENDURANCE' | 'GENERAL_FITNESS')[];
  availableEquipment: string[];
  workoutDaysPerWeek: number;
  sessionDurationMinutes: number;
  injuriesOrLimitations: string[];
}

export interface CoachProfile {
  id: string;
  userId: string;
  bio: string;
  specializations: ('WEIGHT_LOSS' | 'MUSCLE_BUILDING' | 'ENDURANCE' | 'YOGA' | 'REHABILITATION')[];
  experienceYears: number;
  certifications: string[];
  monthlyPriceUsd: string;
  isAcceptingClients: boolean;
  profileImageUrl?: string | null;
  user: {
    id: string;
    name: string;
    email: string;
  };
  _count?: {
    subscriptions: number;
  };
}

export interface CoachSubscription {
  id: string;
  userId: string;
  coachProfileId: string;
  status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED';
  paymentStatus: 'MOCK_PAID' | 'MOCK_PENDING' | 'MOCK_FAILED';
  startDate: string;
  endDate: string;
  amountPaid: string;
  mockTransactionId: string;
  createdAt: string;
  coachProfile: CoachProfile;
}

export interface UserSettings {
  weightUnit: WeightUnit;
}
