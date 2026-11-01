import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  WorkoutSession, 
  Exercise, 
  ChatMessage, 
  UserSettings,
  CoachProfile,
  CoachSubscription
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

  // Real Exercises from DB
  exercisesLibrary: BackendExercise[];
  
  // Real Profile from DB
  userProfile: BackendProfile | null;
  updateUserProfile: (profile: Partial<BackendProfile>) => Promise<void>;
  
  // Real Workouts from DB
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
  
  // Real Weekly Stats & AI Summary from DB / FastAPI
  weeklyStats: WeeklyStats | null;
  aiWeeklySummary: string | null;
  refreshWeeklyStats: () => Promise<void>;

  // Real Coaches & Subscriptions from DB
  coaches: CoachProfile[];
  subscriptions: CoachSubscription[];
  refreshCoachesAndSubs: () => Promise<void>;
  
  // Real Chat (connected to real backend RAG)
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

  const [coaches, setCoaches] = useState<CoachProfile[]>([]);
  const [subscriptions, setSubscriptions] = useState<CoachSubscription[]>([]);

  // Active workout session
  const [workout, setWorkout] = useState<WorkoutSession | null>(null);

  // Real Chat Messages (synced with PostgreSQL conversation history)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<string | undefined>();

  // Settings
  const [settings, setSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem('kinetic_settings');
    return saved ? JSON.parse(saved) : { weightUnit: 'kg' };
  });

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

  const refreshCoachesAndSubs = async () => {
    try {
      const [coachList, mySubs] = await Promise.all([
        api.getCoaches(),
        api.getMySubscriptions(),
      ]);
      setCoaches(coachList);
      setSubscriptions(mySubs);
    } catch (e) {
      console.warn('Failed to refresh coaches/subs:', e);
    }
  };

  const loadUserData = async () => {
    // 1. Profile from PostgreSQL
    try {
      const profile = await api.getProfile();
      setUserProfile(profile);
    } catch {}

    // 2. Real exercises library
    try {
      const exercises = await api.getExercises();
      setExercisesLibrary(exercises);
    } catch {}

    // 3. Real workout plans
    try {
      const plans = await api.getWorkoutPlans();
      setSavedPlans(plans);
      if (plans.length > 0) {
        setWorkout(mapBackendPlanToSession(plans[0]));
      }
    } catch {}

    // 4. Real weekly telemetry & AI summary
    try {
      const summaryRes = await api.getWeeklyAiSummary();
      setWeeklyStats(summaryRes.deterministicStats);
      if (summaryRes.aiSummary?.summary) {
        setAiWeeklySummary(summaryRes.aiSummary.summary);
      }
    } catch {
      try {
        const rawStats = await api.getWeeklyStats();
        setWeeklyStats(rawStats);
      } catch {}
    }

    // 5. Real Coaches & Subscriptions
    await refreshCoachesAndSubs();

    // 6. Real conversation history
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
    } catch {}
  };

  // Check authentication session on mount
  useEffect(() => {
    const init = async () => {
      setIsAuthChecking(true);
      try {
        const user = await api.checkSession();
        if (user) {
          setCurrentUser(user);
          setBackendConnected(true);
          await loadUserData();
        } else {
          setCurrentUser(null);
        }
      } catch (e) {
        console.error('Session check failed:', e);
        setCurrentUser(null);
      } finally {
        setIsAuthChecking(false);
      }
    };
    init();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.login(email, password);
    setCurrentUser(res.user);
    setBackendConnected(true);
    await loadUserData();
  };

  const register = async (email: string, password: string, name: string) => {
    const res = await api.register(email, password, name);
    setCurrentUser(res.user);
    setBackendConnected(true);
    await loadUserData();
  };

  const logout = () => {
    api.logout();
    setCurrentUser(null);
    setWorkout(null);
    setSavedPlans([]);
    setChatMessages([]);
    setUserProfile(null);
    setWeeklyStats(null);
    setCoaches([]);
    setSubscriptions([]);
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

  // Real Chat (backed by FastAPI RAG + PostgreSQL messages table)
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
        coaches,
        subscriptions,
        refreshCoachesAndSubs,
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
