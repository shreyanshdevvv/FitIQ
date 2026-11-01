import { CoachProfile, CoachSubscription } from '../types/fitness';

const API_BASE = '/api';

export interface ApiUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface BackendExercise {
  id: string;
  name: string;
  category: string;
  muscleGroups: string[];
  difficulty: string;
  equipmentNeeded: string[];
  instructions: string;
}

export interface BackendWorkoutPlanExercise {
  id: string;
  planId: string;
  exerciseId: string;
  dayNumber: number;
  orderInDay: number;
  sets: number;
  reps: number | null;
  durationSeconds: number | null;
  restSeconds: number;
  notes: string | null;
  exercise: BackendExercise;
}

export interface BackendWorkoutPlan {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  isAiGenerated: boolean;
  exercises: BackendWorkoutPlanExercise[];
  createdAt: string;
}

export interface BackendWorkoutLog {
  id: string;
  userId: string;
  planId: string | null;
  workoutDate: string;
  durationMinutes: number;
  perceivedDifficulty: 'EASY' | 'MODERATE' | 'HARD' | 'VERY_HARD';
  notes: string | null;
  exercises: {
    id: string;
    exerciseId: string;
    setsCompleted: number;
    repsCompleted: number | null;
    weightUsed: number | null;
    exercise: BackendExercise;
  }[];
}

export interface WeeklyStats {
  plannedSessions: number;
  completedSessions: number;
  adherencePercentage: number;
  totalDurationMinutes: number;
  mostTrainedMuscles: string[];
  recentLogs: any[];
}

export interface AiChatResult {
  conversationId: string;
  response: string;
  sources: { source_file: string; title: string; similarity_score: number }[];
}

export interface BackendProfile {
  id: string;
  userId: string;
  fitnessLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  goals: ('BUILD_MUSCLE' | 'LOSE_WEIGHT' | 'IMPROVE_ENDURANCE' | 'GENERAL_FITNESS')[];
  availableEquipment: string[];
  workoutDaysPerWeek: number;
  sessionDurationMinutes: number;
  injuriesOrLimitations: string[];
}

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('kinetic_auth_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('kinetic_auth_token', token);
    } else {
      localStorage.removeItem('kinetic_auth_token');
    }
  }

  getToken(): string | null {
    return this.token || localStorage.getItem('kinetic_auth_token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers = new Headers(options.headers || {});
    headers.set('Content-Type', 'application/json');

    const token = this.getToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      const message = errorBody.message || `Request failed with status ${response.status}`;
      throw new Error(Array.isArray(message) ? message.join(', ') : message);
    }

    return response.json();
  }

  logout() {
    this.setToken(null);
    localStorage.removeItem('kinetic_auth_token');
  }

  // Authentication
  async register(email: string, password: string, name: string): Promise<{ accessToken: string; user: ApiUser }> {
    const data = await this.request<{ accessToken: string; user: ApiUser }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
    this.setToken(data.accessToken);
    return data;
  }

  async login(email: string, password: string): Promise<{ accessToken: string; user: ApiUser }> {
    const data = await this.request<{ accessToken: string; user: ApiUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.accessToken);
    return data;
  }

  async getMe(): Promise<{ user: ApiUser }> {
    return this.request<{ user: ApiUser }>('/auth/me');
  }

  async checkSession(): Promise<ApiUser | null> {
    const token = this.getToken();
    if (!token) return null;
    try {
      const res = await this.getMe();
      return res.user;
    } catch {
      this.setToken(null);
      return null;
    }
  }

  // Exercises Library (PostgreSQL exercises table)
  async getExercises(search?: string, category?: string): Promise<BackendExercise[]> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category) params.append('category', category);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return this.request<BackendExercise[]>(`/exercises${qs}`);
  }

  // Workout Plans (PostgreSQL workout_plans table)
  async getWorkoutPlans(): Promise<BackendWorkoutPlan[]> {
    return this.request<BackendWorkoutPlan[]>('/workouts/plans');
  }

  async createWorkoutPlan(dto: {
    name: string;
    description?: string;
    exercises: {
      exerciseId: string;
      dayNumber: number;
      orderInDay: number;
      sets: number;
      reps?: number;
      restSeconds: number;
      notes?: string;
    }[];
  }): Promise<BackendWorkoutPlan> {
    return this.request<BackendWorkoutPlan>('/workouts/plans', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  }

  // Workout Logs (PostgreSQL workout_logs table)
  async createWorkoutLog(dto: {
    planId?: string;
    workoutDate: string;
    durationMinutes: number;
    perceivedDifficulty: 'EASY' | 'MODERATE' | 'HARD' | 'VERY_HARD';
    notes?: string;
    exercises: {
      exerciseId: string;
      setsCompleted: number;
      repsCompleted?: number;
      weightUsed?: number;
    }[];
  }): Promise<BackendWorkoutLog> {
    return this.request<BackendWorkoutLog>('/workouts/logs', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  }

  async getWorkoutLogs(): Promise<BackendWorkoutLog[]> {
    return this.request<BackendWorkoutLog[]>('/workouts/logs');
  }

  async getWeeklyStats(): Promise<WeeklyStats> {
    return this.request<WeeklyStats>('/workouts/stats/weekly');
  }

  // Human Coaches & Subscriptions (PostgreSQL coach_profiles & subscriptions)
  async getCoaches(specialization?: string, maxPrice?: number): Promise<CoachProfile[]> {
    const params = new URLSearchParams();
    if (specialization) params.append('specialization', specialization);
    if (maxPrice) params.append('maxPrice', maxPrice.toString());
    const qs = params.toString() ? `?${params.toString()}` : '';
    return this.request<CoachProfile[]>(`/coaches${qs}`);
  }

  async getMySubscriptions(): Promise<CoachSubscription[]> {
    return this.request<CoachSubscription[]>('/coaches/subscriptions/my');
  }

  async subscribeToCoach(coachProfileId: string): Promise<{ message: string; subscription: CoachSubscription }> {
    return this.request<{ message: string; subscription: CoachSubscription }>(`/coaches/${coachProfileId}/subscribe`, {
      method: 'POST',
    });
  }

  async cancelSubscription(subscriptionId: string): Promise<{ message: string; subscription: CoachSubscription }> {
    return this.request<{ message: string; subscription: CoachSubscription }>(`/coaches/subscriptions/${subscriptionId}/cancel`, {
      method: 'PATCH',
    });
  }

  // AI Service (FastAPI RAG Service via NestJS AI Controller)
  async chatWithAI(message: string, conversationId?: string): Promise<AiChatResult> {
    return this.request<AiChatResult>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message, conversationId }),
    });
  }

  async getConversations(): Promise<any[]> {
    return this.request<any[]>('/ai/conversations');
  }

  async generateAiWorkout(preferences?: { focusAreas?: string[]; notes?: string }): Promise<{ plan: BackendWorkoutPlan }> {
    return this.request<{ plan: BackendWorkoutPlan }>('/ai/generate-workout', {
      method: 'POST',
      body: JSON.stringify(preferences || {}),
    });
  }

  async getWeeklyAiSummary(): Promise<{ deterministicStats: WeeklyStats; aiSummary: any }> {
    return this.request<{ deterministicStats: WeeklyStats; aiSummary: any }>('/ai/weekly-summary', {
      method: 'POST',
    });
  }

  // Fitness Profile (PostgreSQL fitness_profiles table)
  async getProfile(): Promise<BackendProfile> {
    return this.request<BackendProfile>('/profiles/me');
  }

  async upsertProfile(dto: {
    fitnessLevel: string;
    goals: string[];
    availableEquipment: string[];
    workoutDaysPerWeek: number;
    sessionDurationMinutes: number;
    injuriesOrLimitations?: string[];
  }): Promise<BackendProfile> {
    return this.request<BackendProfile>('/profiles', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  }

  // Health Check
  async getHealth(): Promise<{ status: string; service: string }> {
    return this.request<{ status: string; service: string }>('/health');
  }
}

export const api = new ApiClient();
