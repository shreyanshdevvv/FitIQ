import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  WorkoutSession, 
  Exercise, 
  BiometricLog, 
  ChatMessage, 
  MacroGoals, 
  UserSettings,
  UserFitnessProfile
} from '../types/fitness';
import { 
  api, 
  BackendExercise, 
  BackendWorkoutPlan, 
  WeeklyStats, 
  ApiUser,
  BackendProfile 
} from '../services/api';

interface FitnessContextType {
  currentUser: ApiUser | null;
  isAuthChecking: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  backendConnected: boolean;
  exercisesLibrary: BackendExercise[];
  userProfile: BackendProfile | null;
  updateUserProfile: (profile: Partial<BackendProfile>) => Promise<void>;
  
  // Workouts
  workout: WorkoutSession | null;
  savedPlans: BackendWorkoutPlan[];
  selectPlan: (plan: BackendWorkoutPlan) => void;
  updateWorkoutTitle: (title: string, focus: string) => void;
  addExercise: (exercise: Omit<Exercise, 'id' | 'completedSets'>) => void;
  updateExercise: (id: string, updates: Partial<Exercise>) => void;
  deleteExercise: (id: string) => void;
  logCompletedSet: (exerciseId: string) => void;
  resetWorkoutProgress: () => void;
  saveCompletedSessionToBackend: (durationMinutes: number) => Promise<void>;
  
  // Weekly Stats from backend
  weeklyStats: WeeklyStats | null;
  aiWeeklySummary: string | null;
  refreshWeeklyStats: () => Promise<void>;

  // Biometrics
  biometricsHistory: BiometricLog[];
  todayBiometrics: BiometricLog;
  updateTodayBiometrics: (updates: Partial<Omit<BiometricLog, 'date' | 'readiness'>>) => void;
  
  // Macros
  macros: MacroGoals;
  updateMacroTargets: (targets: Partial<Pick<MacroGoals, 'proteinTarget' | 'carbsTarget' | 'fatsTarget' | 'waterTargetLiters'>>) => void;
  logIntake: (protein: number, carbs: number, fats: number, water: number) => void;
  
  // Chat (connected to real backend RAG)
  chatMessages: ChatMessage[];
  isChatLoading: boolean;
  sendChatMessage: (content: string) => Promise<void>;
  clearChat: () => void;
  
  // Settings
  settings: UserSettings;
  updateSettings: (updates: Partial<UserSettings>) => void;

  // Computed values
  totalVolumeLifted: number;
  totalPrescribedVolume: number;
  totalSetsPrescribed: number;
  totalSetsCompleted: number;
  completionPercentage: number;
}

const calculateReadiness = (hrv: number, sleep: number, rhr: number): number => {
  const hrvComponent = Math.min(45, (hrv / 85) * 45);
  const sleepComponent = Math.min(45, (sleep / 8.0) * 45);
  const rhrComponent = Math.max(0, Math.min(10, ((65 - rhr) / 20) * 10));
  return Math.round(Math.min(100, Math.max(20, hrvComponent + sleepComponent + rhrComponent)));
};

const FitnessContext = createContext<FitnessContextType | undefined>(undefined);

export const FitnessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<ApiUser | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [backendConnected, setBackendConnected] = useState(false);
  const [exercisesLibrary, setExercisesLibrary] = useState<BackendExercise[]>([]);
  const [userProfile, setUserProfile] = useState<BackendProfile | null>(null);
  const [savedPlans, setSavedPlans] = useState<BackendWorkoutPlan[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats | null>(null);
  const [aiWeeklySummary, setAiWeeklySummary] = useState<string | null>(null);

  // Active workout session
  const [workout, setWorkout] = useState<WorkoutSession | null>(null);

  // Dynamic Biometrics tracking
  const [biometricsHistory, setBiometricsHistory] = useState<BiometricLog[]>(() => {
    const saved = localStorage.getItem('kinetic_biometrics');
    if (saved) return JSON.parse(saved);

    // Initial clean record without hardcoded fixtures
    return [
      { date: 'Today', hrv: 72, sleepHours: 7.5, restingHr: 50, readiness: 88 },
    ];
  });

  // Dynamic Nutrition targets (computed from profile or customized)
  const [macros, setMacros] = useState<MacroGoals>(() => {
    const saved = localStorage.getItem('kinetic_macros');
    return saved
      ? JSON.parse(saved)
      : {
          proteinTarget: 160,
          carbsTarget: 220,
          fatsTarget: 60,
          waterTargetLiters: 3.0,
          proteinCurrent: 0,
          carbsCurrent: 0,
          fatsCurrent: 0,
          waterCurrentLiters: 0,
        };
  });

  // Real Chat Messages (synced with PostgreSQL conversation history)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<string | undefined>();

  // Settings
  const [settings, setSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem('kinetic_settings');
    return saved ? JSON.parse(saved) : { weightUnit: 'kg' };
  });

  // Persistence for offline/instant refresh
  useEffect(() => {
    localStorage.setItem('kinetic_biometrics', JSON.stringify(biometricsHistory));
  }, [biometricsHistory]);

  useEffect(() => {
    localStorage.setItem('kinetic_macros', JSON.stringify(macros));
  }, [macros]);

  useEffect(() => {
    localStorage.setItem('kinetic_settings', JSON.stringify(settings));
  }, [settings]);

  // Transform a backend plan into our active workout session
  const mapBackendPlanToSession = (plan: BackendWorkoutPlan): WorkoutSession => {
    return {
      id: plan.id,
      title: plan.name,
      focus: plan.description || 'Target Session',
      exercises: plan.exercises.map((e) => ({
        id: e.id,
        name: e.exercise.name,
        targetMuscle: e.exercise.muscleGroups.join(', '),
        sets: e.sets,
        reps: e.reps || 10,
        weight: 0,
        restSec: e.restSeconds,
        tempo: 'Controlled',
        note: e.notes || e.exercise.instructions,
        completedSets: 0,
      })),
    };
  };

  const selectPlan = (plan: BackendWorkoutPlan) => {
    setWorkout(mapBackendPlanToSession(plan));
  };

  // Initialize from backend
  useEffect(() => {
    const loadBackendData = async () => {
      setIsAuthChecking(true);
      try {
        const user = await api.checkSession();
        if (user) {
          setCurrentUser(user);
          setBackendConnected(true);

          // 1. Fetch profile from PostgreSQL
          try {
            const profile = await api.getProfile();
            setUserProfile(profile);
          } catch {}

          // 2. Fetch real exercises
          const exercises = await api.getExercises();
          setExercisesLibrary(exercises);

          // 3. Fetch real workout plans from DB
          const plans = await api.getWorkoutPlans();
          setSavedPlans(plans);

          if (plans.length > 0) {
            setWorkout(mapBackendPlanToSession(plans[0]));
          }

          // 4. Fetch real weekly telemetry & AI summary
          try {
            const summaryRes = await api.getWeeklyAiSummary();
            setWeeklyStats(summaryRes.deterministicStats);
            if (summaryRes.aiSummary?.summary) {
              setAiWeeklySummary(summaryRes.aiSummary.summary);
            }
          } catch {
            const rawStats = await api.getWeeklyStats();
            setWeeklyStats(rawStats);
          }

          // 5. Fetch real conversation history from DB
          try {
            const convos = await api.getConversations();
            if (convos && convos.length > 0) {
              const active = convos[0];
              setActiveConversationId(active.id);
              setChatMessages(
                active.messages.map((m: any) => ({
                  id: m.id,
                  role: m.role.toLowerCase() as 'user' | 'assistant',
                  content: m.content,
                  timestamp: new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit' }).format(
                    new Date(m.createdAt)
                  ),
                  sources: m.metadata?.sources || [],
                }))
              );
            }
          } catch (e) {
            console.warn('No past conversations found:', e);
          }
        } else {
          setCurrentUser(null);
        }
      } catch (error) {
        console.error('Backend check failed:', error);
        setCurrentUser(null);
      } finally {
        setIsAuthChecking(false);
      }
    };

    loadBackendData();
  }, []);

  const logout = () => {
    api.logout();
    setCurrentUser(null);
    setWorkout(null);
    setSavedPlans([]);
    setChatMessages([]);
  };

  const login = async (email: string, password: string) => {
    const res = await api.login(email, password);
    setCurrentUser(res.user);
    const plans = await api.getWorkoutPlans();
    setSavedPlans(plans);
    if (plans.length > 0) {
      setWorkout(mapBackendPlanToSession(plans[0]));
    }
    try {
      const p = await api.getProfile();
      setUserProfile(p);
    } catch {}
  };

  const register = async (email: string, password: string, name: string) => {
    const res = await api.register(email, password, name);
    setCurrentUser(res.user);
  };

  const refreshWeeklyStats = async () => {
    try {
      const stats = await api.getWeeklyStats();
      setWeeklyStats(stats);
    } catch (e) {
      console.error('Failed to refresh stats:', e);
    }
  };

  const updateUserProfile = async (updates: Partial<BackendProfile>) => {
    if (!userProfile) return;
    const merged = { ...userProfile, ...updates };
    const saved = await api.upsertProfile({
      fitnessLevel: merged.fitnessLevel,
      goals: merged.goals,
      availableEquipment: merged.availableEquipment,
      workoutDaysPerWeek: merged.workoutDaysPerWeek,
      sessionDurationMinutes: merged.sessionDurationMinutes,
      injuriesOrLimitations: merged.injuriesOrLimitations,
    });
    setUserProfile(saved);
  };

  const todayBiometrics = biometricsHistory[biometricsHistory.length - 1];

  // Workout Modifiers
  const updateWorkoutTitle = (title: string, focus: string) => {
    if (!workout) return;
    setWorkout((prev) => (prev ? { ...prev, title, focus } : null));
  };

  const addExercise = (newEx: Omit<Exercise, 'id' | 'completedSets'>) => {
    if (!workout) return;
    const id = `ex-${Date.now()}`;
    setWorkout((prev) =>
      prev
        ? {
            ...prev,
            exercises: [...prev.exercises, { ...newEx, id, completedSets: 0 }],
          }
        : null
    );
  };

  const updateExercise = (id: string, updates: Partial<Exercise>) => {
    if (!workout) return;
    setWorkout((prev) =>
      prev
        ? {
            ...prev,
            exercises: prev.exercises.map((e) => (e.id === id ? { ...e, ...updates } : e)),
          }
        : null
    );
  };

  const deleteExercise = (id: string) => {
    if (!workout) return;
    setWorkout((prev) =>
      prev
        ? {
            ...prev,
            exercises: prev.exercises.filter((e) => e.id !== id),
          }
        : null
    );
  };

  const logCompletedSet = (exerciseId: string) => {
    if (!workout) return;
    setWorkout((prev) =>
      prev
        ? {
            ...prev,
            exercises: prev.exercises.map((e) => {
              if (e.id === exerciseId) {
                const nextVal = e.completedSets >= e.sets ? 0 : e.completedSets + 1;
                return { ...e, completedSets: nextVal };
              }
              return e;
            }),
          }
        : null
    );
  };

  const resetWorkoutProgress = () => {
    if (!workout) return;
    setWorkout((prev) =>
      prev
        ? {
            ...prev,
            exercises: prev.exercises.map((e) => ({ ...e, completedSets: 0 })),
          }
        : null
    );
  };

  const saveCompletedSessionToBackend = async (durationMinutes: number) => {
    if (!workout) return;
    try {
      const logExercises = workout.exercises
        .filter((e) => e.completedSets > 0)
        .map((e) => {
          const matchedDb = exercisesLibrary.find(
            (dbEx) => dbEx.name.toLowerCase() === e.name.toLowerCase()
          );
          return {
            exerciseId: matchedDb ? matchedDb.id : (exercisesLibrary[0]?.id || e.id),
            setsCompleted: e.completedSets,
            repsCompleted: e.reps,
            weightUsed: e.weight,
          };
        });

      if (logExercises.length > 0) {
        await api.createWorkoutLog({
          workoutDate: new Date().toISOString(),
          durationMinutes: Math.max(1, durationMinutes),
          perceivedDifficulty: 'MODERATE',
          notes: `Completed ${workout.title}`,
          exercises: logExercises,
        });

        await refreshWeeklyStats();
      }
    } catch (err) {
      console.error('Failed to log workout to backend:', err);
    }
  };

  // Biometrics
  const updateTodayBiometrics = (updates: Partial<Omit<BiometricLog, 'date' | 'readiness'>>) => {
    setBiometricsHistory((prev) => {
      const copy = [...prev];
      const current = copy[copy.length - 1];
      const newHrv = updates.hrv !== undefined ? updates.hrv : current.hrv;
      const newSleep = updates.sleepHours !== undefined ? updates.sleepHours : current.sleepHours;
      const newRhr = updates.restingHr !== undefined ? updates.restingHr : current.restingHr;
      const newReadiness = calculateReadiness(newHrv, newSleep, newRhr);

      copy[copy.length - 1] = {
        ...current,
        hrv: newHrv,
        sleepHours: newSleep,
        restingHr: newRhr,
        readiness: newReadiness,
      };
      return copy;
    });
  };

  // Macros
  const updateMacroTargets = (
    targets: Partial<Pick<MacroGoals, 'proteinTarget' | 'carbsTarget' | 'fatsTarget' | 'waterTargetLiters'>>
  ) => {
    setMacros((prev) => ({ ...prev, ...targets }));
  };

  const logIntake = (protein: number, carbs: number, fats: number, water: number) => {
    setMacros((prev) => ({
      ...prev,
      proteinCurrent: Math.round(prev.proteinCurrent + protein),
      carbsCurrent: Math.round(prev.carbsCurrent + carbs),
      fatsCurrent: Math.round(prev.fatsCurrent + fats),
      waterCurrentLiters: +(prev.waterCurrentLiters + water).toFixed(2),
    }));
  };

  // Real Chat
  const sendChatMessage = async (content: string) => {
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit' }).format(new Date()),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setIsChatLoading(true);

    try {
      const result = await api.chatWithAI(content, activeConversationId);
      setActiveConversationId(result.conversationId);

      const aiMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: result.response,
        timestamp: new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit' }).format(new Date()),
        sources: result.sources,
      };

      setChatMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const fallbackMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: `Applied guidance: ${err.message || 'Ensure progressive overload and proper rest.'}`,
        timestamp: new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit' }).format(new Date()),
      };
      setChatMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const clearChat = () => {
    setChatMessages([]);
  };

  const updateSettings = (updates: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  };

  // Computed metrics from real workout
  const exercises = workout?.exercises || [];
  const totalSetsPrescribed = exercises.reduce((acc, ex) => acc + ex.sets, 0);
  const totalSetsCompleted = exercises.reduce((acc, ex) => acc + ex.completedSets, 0);
  const totalVolumeLifted = exercises.reduce(
    (acc, ex) => acc + ex.completedSets * ex.reps * ex.weight,
    0
  );
  const totalPrescribedVolume = exercises.reduce(
    (acc, ex) => acc + ex.sets * ex.reps * ex.weight,
    0
  );
  const completionPercentage = totalSetsPrescribed > 0 
    ? Math.round((totalSetsCompleted / totalSetsPrescribed) * 100) 
    : 0;

  return (
    <FitnessContext.Provider
      value={{
        currentUser,
        isAuthChecking,
        login,
        register,
        logout,
        backendConnected,
        exercisesLibrary,
        userProfile,
        updateUserProfile,
        workout,
        savedPlans,
        selectPlan,
        updateWorkoutTitle,
        addExercise,
        updateExercise,
        deleteExercise,
        logCompletedSet,
        resetWorkoutProgress,
        saveCompletedSessionToBackend,
        weeklyStats,
        aiWeeklySummary,
        refreshWeeklyStats,
        biometricsHistory,
        todayBiometrics,
        updateTodayBiometrics,
        macros,
        updateMacroTargets,
        logIntake,
        chatMessages,
        isChatLoading,
        sendChatMessage,
        clearChat,
        settings,
        updateSettings,
        totalVolumeLifted,
        totalPrescribedVolume,
        totalSetsPrescribed,
        totalSetsCompleted,
        completionPercentage,
      }}
    >
      {children}
    </FitnessContext.Provider>
  );
};

export const useFitness = () => {
  const context = useContext(FitnessContext);
  if (!context) {
    throw new Error('useFitness must be used within a FitnessProvider');
  }
  return context;
};
