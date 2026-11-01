import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  WorkoutSession, 
  Exercise, 
  ChatMessage, 
  UserSettings,
  CoachProfile,
  CoachSubscription,
  WorkoutSplitDay
} from '../types/fitness';
import { 
  api, 
  BackendExercise, 
  BackendWorkoutPlan, 
  WeeklyStats, 
  ApiUser,
  BackendProfile,
  BackendNutritionPlan
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
  updateUserProfile: (profile: Partial<BackendProfile> & { name?: string }) => Promise<void>;
  loadUserData: () => Promise<void>;

  // Real Nutrition & Fueling Plan from DB & Agent
  nutritionPlan: BackendNutritionPlan | null;
  refreshNutritionPlan: () => Promise<void>;
  generateNutritionPlan: () => Promise<void>;
  updateNutritionPlan: (dto: {
    dailyCalories?: number;
    proteinGrams?: number;
    carbsGrams?: number;
    fatsGrams?: number;
    waterMl?: number;
    notes?: string;
  }) => Promise<void>;
  
  // Real Workouts from DB
  workout: WorkoutSession | null;
  savedPlans: BackendWorkoutPlan[];
  splitDays: WorkoutSplitDay[];
  selectedDayNumber: number;
  selectPlan: (plan: BackendWorkoutPlan) => void;
  selectDay: (dayNumber: number) => void;
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
  const [nutritionPlan, setNutritionPlan] = useState<BackendNutritionPlan | null>(null);
  const [savedPlans, setSavedPlans] = useState<BackendWorkoutPlan[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats | null>(null);
  const [aiWeeklySummary, setAiWeeklySummary] = useState<string | null>(null);

  const [coaches, setCoaches] = useState<CoachProfile[]>([]);
  const [subscriptions, setSubscriptions] = useState<CoachSubscription[]>([]);

  // Active workout session & multi-day split state
  const [workout, setWorkout] = useState<WorkoutSession | null>(null);
  const [activePlanId, setActivePlanId] = useState<string | null>(null);
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(1);

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

  const splitTemplates: Record<number, Record<number, { title: string; focus: string }>> = {
    2: {
      1: { title: 'Day 1: Full Body Compound A', focus: 'Squats, Horizontal Press & Rows' },
      2: { title: 'Day 2: Full Body Compound B', focus: 'Hinges, Overhead Press & Pull-ups' },
    },
    3: {
      1: { title: 'Day 1: Push Power', focus: 'Chest, Shoulders & Triceps' },
      2: { title: 'Day 2: Pull Power', focus: 'Upper Back, Lats & Biceps' },
      3: { title: 'Day 3: Legs & Core', focus: 'Quads, Hamstrings & Abs' },
    },
    4: {
      1: { title: 'Day 1: Upper Body Strength', focus: 'Chest, Back & Shoulders' },
      2: { title: 'Day 2: Lower Body Power', focus: 'Quads, Hamstrings & Glutes' },
      3: { title: 'Day 3: Push Hypertrophy', focus: 'Incline Press, Lateral Delts & Arms' },
      4: { title: 'Day 4: Pull & Posterior Chain', focus: 'Lats, Hamstrings & Core' },
    },
    5: {
      1: { title: 'Day 1: Chest & Triceps', focus: 'Heavy Pressing & Extensions' },
      2: { title: 'Day 2: Back & Biceps', focus: 'Rows, Pull-ups & Curls' },
      3: { title: 'Day 3: Quads & Calves', focus: 'Squats, Lunges & Extensions' },
      4: { title: 'Day 4: Shoulders & Traps', focus: 'Overhead Press & Lateral Raises' },
      5: { title: 'Day 5: Posterior Chain & Core', focus: 'Deadlifts, Hamstrings & Abs' },
    },
    6: {
      1: { title: 'Day 1: Push Power', focus: 'Heavy Pressing & Delts' },
      2: { title: 'Day 2: Pull Power', focus: 'Heavy Deadlift & Rows' },
      3: { title: 'Day 3: Legs Power', focus: 'Heavy Squats & Calves' },
      4: { title: 'Day 4: Push Volume', focus: 'Incline Dumbbells & Arms' },
      5: { title: 'Day 5: Pull Volume', focus: 'Lat Pulldowns & Curls' },
      6: { title: 'Day 6: Legs Volume', focus: 'Unilateral Legs & Core' },
    },
  };

  const buildSplitDays = (
    plan: BackendWorkoutPlan | null,
    targetDaysCount: number
  ): WorkoutSplitDay[] => {
    const maxDayInPlan = plan?.exercises?.reduce((max, ex) => Math.max(max, ex.dayNumber || 1), 1) || 1;
    const totalDays = Math.max(targetDaysCount, maxDayInPlan);
    const template = splitTemplates[totalDays] || splitTemplates[4];

    const days: WorkoutSplitDay[] = [];
    for (let d = 1; d <= totalDays; d++) {
      const rawExs = plan?.exercises?.filter((e) => (e.dayNumber || 1) === d) || [];
      // If plan has all exercises on day 1 or not yet assigned, day 1 gets all
      const dayExs = rawExs.length > 0 
        ? rawExs 
        : (d === 1 && plan?.exercises ? plan.exercises : []);

      const meta = template[d] || {
        title: `Day ${d}: Targeted Routine`,
        focus: 'Periodized Training',
      };

      const muscles = Array.from(new Set(dayExs.flatMap((e) => e.exercise.muscleGroups || [])));
      const focusText = muscles.length > 0 ? muscles.slice(0, 3).join(', ') : meta.focus;

      days.push({
        dayNumber: d,
        title: meta.title,
        focus: focusText,
        exerciseCount: dayExs.length,
        exercises: dayExs.map((e) => ({
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
          dayNumber: e.dayNumber || d,
          orderInDay: e.orderInDay,
        })),
      });
    }
    return days;
  };

  const activePlan = savedPlans.find((p) => p.id === activePlanId) || savedPlans[0] || null;
  const targetDaysCount = userProfile?.workoutDaysPerWeek || 4;
  const splitDays = buildSplitDays(activePlan, targetDaysCount);

  const selectDay = (dayNum: number) => {
    setSelectedDayNumber(dayNum);
    const chosenDay = splitDays.find((d) => d.dayNumber === dayNum) || splitDays[0];
    if (chosenDay && activePlan) {
      setWorkout({
        id: `${activePlan.id}-day-${chosenDay.dayNumber}`,
        title: `${activePlan.name} • ${chosenDay.title}`,
        focus: chosenDay.focus,
        dayNumber: chosenDay.dayNumber,
        totalDays: splitDays.length,
        exercises: chosenDay.exercises,
      });
    }
  };

  const selectPlan = (plan: BackendWorkoutPlan) => {
    setActivePlanId(plan.id);
    const planDays = buildSplitDays(plan, userProfile?.workoutDaysPerWeek || 4);
    const chosenDay = planDays.find((d) => d.dayNumber === selectedDayNumber) || planDays[0];
    if (chosenDay) {
      setWorkout({
        id: `${plan.id}-day-${chosenDay.dayNumber}`,
        title: `${plan.name} • ${chosenDay.title}`,
        focus: chosenDay.focus,
        dayNumber: chosenDay.dayNumber,
        totalDays: planDays.length,
        exercises: chosenDay.exercises,
      });
    }
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
    // Parallelize all independent API requests to eliminate startup waterfall
    const [
      profileRes,
      exercisesRes,
      plansRes,
      statsRes,
      coachesRes,
      subsRes,
      convosRes,
      nutritionRes
    ] = await Promise.allSettled([
      api.getProfile(),
      api.getExercises(),
      api.getWorkoutPlans(),
      api.getWeeklyStats(),
      api.getCoaches(),
      api.getMySubscriptions(),
      api.getConversations(),
      api.getNutritionPlan(),
    ]);

    // 1. Profile from PostgreSQL
    if (profileRes.status === 'fulfilled' && profileRes.value) {
      setUserProfile(profileRes.value);
    }

    // 2. Real exercises library
    if (exercisesRes.status === 'fulfilled' && exercisesRes.value) {
      setExercisesLibrary(exercisesRes.value);
    }

    // 3. Real workout plans
    if (plansRes.status === 'fulfilled' && plansRes.value) {
      setSavedPlans(plansRes.value);
      if (plansRes.value.length > 0) {
        const firstPlan = plansRes.value[0];
        setActivePlanId(firstPlan.id);
        const targetDays = (profileRes.status === 'fulfilled' && profileRes.value?.workoutDaysPerWeek) || 4;
        const allDays = buildSplitDays(firstPlan, targetDays);
        const dayOne = allDays[0];
        if (dayOne) {
          setWorkout({
            id: `${firstPlan.id}-day-${dayOne.dayNumber}`,
            title: `${firstPlan.name} • ${dayOne.title}`,
            focus: dayOne.focus,
            dayNumber: dayOne.dayNumber,
            totalDays: allDays.length,
            exercises: dayOne.exercises,
          });
        }
      }
    }

    // 4. Real weekly telemetry
    if (statsRes.status === 'fulfilled' && statsRes.value) {
      setWeeklyStats(statsRes.value);
    }

    // 5. Coaches & Subscriptions
    if (coachesRes.status === 'fulfilled' && coachesRes.value) {
      setCoaches(coachesRes.value);
    }
    if (subsRes.status === 'fulfilled' && subsRes.value) {
      setSubscriptions(subsRes.value);
    }

    // 6. Real conversation history
    if (convosRes.status === 'fulfilled' && convosRes.value && convosRes.value.length > 0) {
      const active = convosRes.value[0];
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

    // 7. Active Nutrition & Fueling Plan
    if (nutritionRes.status === 'fulfilled' && nutritionRes.value) {
      setNutritionPlan(nutritionRes.value);
    }

    // Asynchronously fetch AI weekly summary without blocking dashboard render
    api.getWeeklyAiSummary()
      .then((summaryRes) => {
        if (summaryRes?.deterministicStats) {
          setWeeklyStats(summaryRes.deterministicStats);
        }
        if (summaryRes?.aiSummary?.summary) {
          setAiWeeklySummary(summaryRes.aiSummary.summary);
        }
      })
      .catch(() => {});
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

  const updateUserProfile = async (updates: Partial<BackendProfile> & { name?: string }) => {
    const saved = await api.updateProfile({
      name: updates.name,
      fitnessLevel: updates.fitnessLevel,
      goals: updates.goals,
      availableEquipment: updates.availableEquipment,
      workoutDaysPerWeek: updates.workoutDaysPerWeek,
      sessionDurationMinutes: updates.sessionDurationMinutes,
      injuriesOrLimitations: updates.injuriesOrLimitations,
    });
    setUserProfile(saved);
    if (updates.name && currentUser) {
      setCurrentUser({ ...currentUser, name: updates.name });
    }
  };

  const refreshNutritionPlan = async () => {
    try {
      const plan = await api.getNutritionPlan();
      setNutritionPlan(plan);
    } catch (e) {
      console.error('Failed to refresh nutrition plan:', e);
    }
  };

  const generateNutritionPlan = async () => {
    const plan = await api.generateNutritionPlan();
    setNutritionPlan(plan);
  };

  const updateNutritionPlan = async (dto: {
    dailyCalories?: number;
    proteinGrams?: number;
    carbsGrams?: number;
    fatsGrams?: number;
    waterMl?: number;
    notes?: string;
  }) => {
    const updated = await api.updateNutritionPlan(dto);
    setNutritionPlan(updated);
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
    setActiveConversationId(undefined);
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
        loadUserData,
        nutritionPlan,
        refreshNutritionPlan,
        generateNutritionPlan,
        updateNutritionPlan,
        workout,
        savedPlans,
        splitDays,
        selectedDayNumber,
        selectPlan,
        selectDay,
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
