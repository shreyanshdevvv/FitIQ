import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useFitness } from '../context/FitnessContext';
import { api } from '../services/api';
import { 
  Sparkles, 
  Flame, 
  Beef, 
  Wheat, 
  Droplet, 
  Clock, 
  RotateCw, 
  Sliders, 
  CheckCircle2, 
  ShieldCheck,
  AlertCircle,
  Plus,
  Search,
  Trash2,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Utensils,
  X,
  Filter
} from 'lucide-react';

export interface MealLogEntry {
  id: string;
  name: string;
  mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack' | 'Post-Workout';
  date: string; // ISO string e.g. '2026-11-02T08:30:00'
  calories: number;
  protein: number; // in grams
  carbs: number;   // in grams
  fats: number;    // in grams
  notes?: string;
}

const STORAGE_KEY = 'fitiq_macro_logs';

const DEFAULT_MEAL_LOGS: MealLogEntry[] = [
  {
    id: 'meal-1',
    name: 'Egg White Omelet & Steel Cut Oats',
    mealType: 'Breakfast',
    date: new Date(Date.now() - 1000 * 60 * 60 * 2.5).toISOString(),
    calories: 560,
    protein: 48,
    carbs: 65,
    fats: 12,
    notes: '4 egg whites + 2 whole eggs, 80g oats, blueberries'
  },
  {
    id: 'meal-2',
    name: 'Whey Isolate Shake & Rice Cakes',
    mealType: 'Post-Workout',
    date: new Date(Date.now() - 1000 * 60 * 60 * 5.5).toISOString(),
    calories: 340,
    protein: 38,
    carbs: 42,
    fats: 3,
    notes: 'Rapid amino replenishment post-compound session'
  },
  {
    id: 'meal-3',
    name: 'Grilled Chicken Breast & Jasmine Rice',
    mealType: 'Lunch',
    date: new Date(Date.now() - 1000 * 60 * 60 * 23).toISOString(),
    calories: 720,
    protein: 56,
    carbs: 85,
    fats: 14,
    notes: '220g grilled chicken, steamed broccoli, olive oil drizzle'
  },
  {
    id: 'meal-4',
    name: 'Greek Yogurt Bowl with Chia & Berries',
    mealType: 'Snack',
    date: new Date(Date.now() - 1000 * 60 * 60 * 27).toISOString(),
    calories: 360,
    protein: 30,
    carbs: 32,
    fats: 12,
    notes: '0% Greek yogurt, 15g chia seeds, mixed berries'
  },
  {
    id: 'meal-5',
    name: 'Grass-Fed Sirloin Steak & Baked Sweet Potato',
    mealType: 'Dinner',
    date: new Date(Date.now() - 1000 * 60 * 60 * 31).toISOString(),
    calories: 820,
    protein: 58,
    carbs: 62,
    fats: 28,
    notes: '200g lean sirloin, medium sweet potato, roasted asparagus'
  },
  {
    id: 'meal-6',
    name: 'Protein Oatmeal with Peanut Butter',
    mealType: 'Breakfast',
    date: new Date(Date.now() - 1000 * 60 * 60 * 47).toISOString(),
    calories: 620,
    protein: 44,
    carbs: 72,
    fats: 16,
    notes: 'Rolled oats, 1 scoop whey, 1 tbsp organic peanut butter'
  },
  {
    id: 'meal-7',
    name: 'Wild Salmon Fillet & Tri-Color Quinoa',
    mealType: 'Dinner',
    date: new Date(Date.now() - 1000 * 60 * 60 * 53).toISOString(),
    calories: 780,
    protein: 52,
    carbs: 54,
    fats: 30,
    notes: 'Wild Atlantic salmon, steamed quinoa, avocado slices'
  },
  {
    id: 'meal-8',
    name: 'Ground Turkey Rice Bowl with Avocado',
    mealType: 'Lunch',
    date: new Date(Date.now() - 1000 * 60 * 60 * 71).toISOString(),
    calories: 690,
    protein: 52,
    carbs: 70,
    fats: 18,
    notes: '93/7 lean ground turkey, basmati rice, sautéed bell peppers'
  }
];

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  formatter?: (val: number) => string;
  className?: string;
}

const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  duration = 750,
  formatter,
  className,
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const prevValueRef = useRef(0);

  useEffect(() => {
    const start = prevValueRef.current;
    const end = value;
    if (start === end) {
      setDisplayValue(end);
      return;
    }

    let startTimestamp: number | null = null;
    let animId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      const progress = Math.min(elapsed / duration, 1);
      // Cubic ease-out curve matching duration-700 ease-out on the progress bar
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (end - start) * ease);
      setDisplayValue(current);

      if (progress < 1) {
        animId = requestAnimationFrame(step);
      } else {
        prevValueRef.current = end;
      }
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [value, duration]);

  const rendered = formatter ? formatter(displayValue) : displayValue.toLocaleString();
  return <span className={className}>{rendered}</span>;
};

export const NutritionView: React.FC = () => {
  const { 
    nutritionPlan, 
    generateNutritionPlan, 
    updateNutritionPlan, 
    userProfile,
    isDemoMode 
  } = useFitness();

  const [isRecalibrating, setIsRecalibrating] = useState(false);
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  // Manual Adjuster Form State
  const [calInput, setCalInput] = useState<number>(nutritionPlan?.dailyCalories || 2400);
  const [proteinInput, setProteinInput] = useState<number>(nutritionPlan?.proteinGrams || 160);
  const [carbsInput, setCarbsInput] = useState<number>(nutritionPlan?.carbsGrams || 280);
  const [fatsInput, setFatsInput] = useState<number>(nutritionPlan?.fatsGrams || 70);
  const [waterInput, setWaterInput] = useState<number>(nutritionPlan?.waterMl || 3000);

  // Macro Logger State - strictly no hardcoded mock data in Live Mode
  const [macroLogs, setMacroLogs] = useState<MealLogEntry[]>([]);

  // Trigger progress bar & numbers animation on mount
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 30);
    return () => clearTimeout(timer);
  }, []);

  // Load logs depending on Demo Mode vs Live Mode
  useEffect(() => {
    if (isDemoMode) {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMacroLogs(parsed);
            return;
          }
        }
      } catch (e) {
        console.error('Failed to load demo macro logs', e);
      }
      setMacroLogs(DEFAULT_MEAL_LOGS);
    } else {
      // Live Mode: Strictly fetch from database! Zero hardcoded demo logs.
      setIsLoadingLogs(true);
      api.getMealLogs()
        .then((dbLogs) => {
          const mapped: MealLogEntry[] = (dbLogs || []).map((l: any) => ({
            id: l.id,
            name: l.name,
            mealType: l.mealType as any,
            date: l.mealDate,
            calories: l.calories,
            protein: l.protein,
            carbs: l.carbs,
            fats: l.fats,
            notes: l.notes || undefined,
          }));
          setMacroLogs(mapped);
        })
        .catch((err) => {
          console.error('Failed to fetch meal logs from DB:', err);
          setMacroLogs([]);
        })
        .finally(() => setIsLoadingLogs(false));
    }
  }, [isDemoMode]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newMealName, setNewMealName] = useState('');
  const [newMealType, setNewMealType] = useState<MealLogEntry['mealType']>('Lunch');
  const [newCalories, setNewCalories] = useState<number>(650);
  const [newProtein, setNewProtein] = useState<number>(45);
  const [newCarbs, setNewCarbs] = useState<number>(65);
  const [newFats, setNewFats] = useState<number>(18);
  const [newDate, setNewDate] = useState(() => {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - offset).toISOString().slice(0, 16);
  });
  const [newNotes, setNewNotes] = useState('');

  // Table filtering, sorting, pagination state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMealTypeFilter, setSelectedMealTypeFilter] = useState<'All' | MealLogEntry['mealType']>('All');
  const [sortField, setSortField] = useState<'date' | 'name' | 'calories' | 'protein'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(5);
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());

  // In Demo Mode only, sync changes to localStorage
  useEffect(() => {
    if (isDemoMode && macroLogs.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(macroLogs));
      } catch (e) {
        console.error('Failed to save demo macro logs to localStorage', e);
      }
    }
  }, [macroLogs, isDemoMode]);

  // Keep manual inputs synced when plan updates
  useEffect(() => {
    if (nutritionPlan) {
      setCalInput(nutritionPlan.dailyCalories);
      setProteinInput(nutritionPlan.proteinGrams);
      setCarbsInput(nutritionPlan.carbsGrams);
      setFatsInput(nutritionPlan.fatsGrams);
      setWaterInput(nutritionPlan.waterMl || 3000);
    }
  }, [nutritionPlan]);

  const handleRecalibrate = async () => {
    setIsRecalibrating(true);
    setSuccessMsg(null);
    try {
      await generateNutritionPlan();
      setSuccessMsg('Plan recalculated with live workout split and profile biometrics!');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (e: any) {
      console.error(e);
    } finally {
      setIsRecalibrating(false);
    }
  };

  const handleSaveManualAdjustments = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateNutritionPlan({
        dailyCalories: Number(calInput),
        proteinGrams: Number(proteinInput),
        carbsGrams: Number(carbsInput),
        fatsGrams: Number(fatsInput),
        waterMl: Number(waterInput),
      });
      setIsAdjusting(false);
      setSuccessMsg('Custom nutrition targets saved!');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (e) {
      console.error(e);
    }
  };

  // Open modal with fresh defaults
  const handleOpenModal = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    const localISOTime = new Date(now.getTime() - offset).toISOString().slice(0, 16);
    setNewDate(localISOTime);
    setNewMealName('');
    setNewNotes('');
    setNewMealType('Lunch');
    setNewCalories(650);
    setNewProtein(45);
    setNewCarbs(65);
    setNewFats(18);
    setIsModalOpen(true);
  };

  const handleCreateMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMealName.trim()) return;

    const mealPayload = {
      name: newMealName.trim(),
      mealType: newMealType,
      mealDate: new Date(newDate).toISOString(),
      calories: Math.max(0, Number(newCalories)),
      protein: Math.max(0, Number(newProtein)),
      carbs: Math.max(0, Number(newCarbs)),
      fats: Math.max(0, Number(newFats)),
      notes: newNotes.trim() ? newNotes.trim() : undefined,
    };

    if (isDemoMode) {
      const newEntry: MealLogEntry = {
        id: `meal-${Date.now()}`,
        ...mealPayload,
        date: mealPayload.mealDate,
      };
      setMacroLogs((prev) => [newEntry, ...prev]);
      setIsModalOpen(false);
      setSuccessMsg(`Logged "${newEntry.name}" (Demo)!`);
      setTimeout(() => setSuccessMsg(null), 3500);
    } else {
      try {
        const created = await api.createMealLog(mealPayload);
        const newEntry: MealLogEntry = {
          id: created.id,
          name: created.name,
          mealType: created.mealType as any,
          date: created.mealDate,
          calories: created.calories,
          protein: created.protein,
          carbs: created.carbs,
          fats: created.fats,
          notes: created.notes || undefined,
        };
        setMacroLogs((prev) => [newEntry, ...prev]);
        setIsModalOpen(false);
        setSuccessMsg(`Logged "${newEntry.name}" to database!`);
        setTimeout(() => setSuccessMsg(null), 3500);
      } catch (err) {
        console.error('Failed to create meal log in DB', err);
        setSuccessMsg('Failed to save meal to database. Please try again.');
        setTimeout(() => setSuccessMsg(null), 4000);
      }
    }
  };

  const handleDeleteLog = async (id: string) => {
    if (isDemoMode) {
      setMacroLogs((prev) => prev.filter((item) => item.id !== id));
    } else {
      try {
        await api.deleteMealLog(id);
        setMacroLogs((prev) => prev.filter((item) => item.id !== id));
      } catch (err) {
        console.error('Failed to delete meal log from DB', err);
      }
    }
    setSelectedRowIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleDeleteSelected = async () => {
    if (selectedRowIds.size === 0) return;
    const ids = Array.from(selectedRowIds);
    if (isDemoMode) {
      setMacroLogs((prev) => prev.filter((item) => !selectedRowIds.has(item.id)));
    } else {
      try {
        await Promise.all(ids.map((id) => api.deleteMealLog(id)));
        setMacroLogs((prev) => prev.filter((item) => !selectedRowIds.has(item.id)));
      } catch (err) {
        console.error('Failed to batch delete meal logs from DB', err);
      }
    }
    setSelectedRowIds(new Set());
  };

  // Sort toggle helper
  const handleSort = (field: 'date' | 'name' | 'calories' | 'protein') => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Checkbox helpers
  const toggleSelectRow = (id: string) => {
    const updated = new Set(selectedRowIds);
    if (updated.has(id)) {
      updated.delete(id);
    } else {
      updated.add(id);
    }
    setSelectedRowIds(updated);
  };

  // Filtered and sorted logs
  const filteredLogs = useMemo(() => {
    return macroLogs
      .filter((log) => {
        if (selectedMealTypeFilter !== 'All' && log.mealType !== selectedMealTypeFilter) {
          return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = log.name.toLowerCase().includes(q);
          const matchNotes = log.notes?.toLowerCase().includes(q);
          const matchType = log.mealType.toLowerCase().includes(q);
          if (!matchName && !matchNotes && !matchType) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortField === 'date') {
          const tA = new Date(a.date).getTime();
          const tB = new Date(b.date).getTime();
          return sortDirection === 'asc' ? tA - tB : tB - tA;
        }
        if (sortField === 'name') {
          return sortDirection === 'asc' 
            ? a.name.localeCompare(b.name) 
            : b.name.localeCompare(a.name);
        }
        if (sortField === 'calories') {
          return sortDirection === 'asc' ? a.calories - b.calories : b.calories - a.calories;
        }
        if (sortField === 'protein') {
          return sortDirection === 'asc' ? a.protein - b.protein : b.protein - a.protein;
        }
        return 0;
      });
  }, [macroLogs, selectedMealTypeFilter, searchQuery, sortField, sortDirection]);

  // Reset to page 1 if current page exceeds total pages
  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / pageSize));
  const activePage = Math.min(currentPage, totalPages);

  const paginatedLogs = useMemo(() => {
    const startIndex = (activePage - 1) * pageSize;
    return filteredLogs.slice(startIndex, startIndex + pageSize);
  }, [filteredLogs, activePage, pageSize]);

  const toggleSelectAllPage = () => {
    const currentPageIds = paginatedLogs.map((l) => l.id);
    const allSelected = currentPageIds.every((id) => selectedRowIds.has(id));
    const next = new Set(selectedRowIds);
    if (allSelected) {
      currentPageIds.forEach((id) => next.delete(id));
    } else {
      currentPageIds.forEach((id) => next.add(id));
    }
    setSelectedRowIds(next);
  };

  // Compute Today's Logged Totals for live feedback
  const todayTotals = useMemo(() => {
    const todayStr = new Date().toDateString();
    const todayEntries = macroLogs.filter(
      (m) => new Date(m.date).toDateString() === todayStr
    );
    return todayEntries.reduce(
      (acc, m) => ({
        calories: acc.calories + m.calories,
        protein: acc.protein + m.protein,
        carbs: acc.carbs + m.carbs,
        fats: acc.fats + m.fats,
        count: acc.count + 1,
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0, count: 0 }
    );
  }, [macroLogs]);

  const calories = nutritionPlan?.dailyCalories || 2400;
  const protein = nutritionPlan?.proteinGrams || 160;
  const carbs = nutritionPlan?.carbsGrams || 280;
  const fats = nutritionPlan?.fatsGrams || 70;
  const water = nutritionPlan?.waterMl || 3000;

  const proteinPct = Math.round(((protein * 4) / calories) * 100) || 27;
  const carbsPct = Math.round(((carbs * 4) / calories) * 100) || 47;
  const fatsPct = Math.round(((fats * 9) / calories) * 100) || 26;

  const weightKg = userProfile?.weightKg || 75;
  const proteinPerKg = (protein / weightKg).toFixed(1);

  // Animated progress bar calculations for the 4 macro KPIs
  const caloriesProgress = Math.min(100, Math.round((todayTotals.calories / (calories || 1)) * 100)) || 0;
  const proteinProgress = Math.min(100, Math.round((todayTotals.protein / (protein || 1)) * 100)) || 0;
  const carbsProgress = Math.min(100, Math.round((todayTotals.carbs / (carbs || 1)) * 100)) || 0;
  const fatsProgress = Math.min(100, Math.round((todayTotals.fats / (fats || 1)) * 100)) || 0;

  // Status badge for macro balance in table
  const getMacroProfileBadge = (entry: MealLogEntry) => {
    const totalMacroCals = (entry.protein * 4) + (entry.carbs * 4) + (entry.fats * 9);
    const pShare = totalMacroCals > 0 ? (entry.protein * 4) / totalMacroCals : 0;
    const cShare = totalMacroCals > 0 ? (entry.carbs * 4) / totalMacroCals : 0;
    const fShare = totalMacroCals > 0 ? (entry.fats * 9) / totalMacroCals : 0;

    if (pShare >= 0.35) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/80">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>High Protein</span>
        </span>
      );
    }
    if (cShare >= 0.45) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200/80">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          <span>Carb Refuel</span>
        </span>
      );
    }
    if (fShare >= 0.40) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200/80">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          <span>Fat Dense</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200/80">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
        <span>Balanced Fuel</span>
      </span>
    );
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto w-full">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-slate-500 font-medium">
              Fueling & metabolic strategy
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Personalized Nutrition Targets
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Calculated from your body weight ({weightKg} kg), training split ({userProfile?.workoutDaysPerWeek || 4} days/week), and primary goals.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 flex-wrap">
          <button
            type="button"
            onClick={handleOpenModal}
            className="min-h-[40px] px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Meal & Macros</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAdjusting(!isAdjusting)}
            className="min-h-[40px] px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Adjust Macros</span>
          </button>

          <button
            type="button"
            onClick={handleRecalibrate}
            disabled={isRecalibrating}
            className="min-h-[40px] px-3.5 py-2 border border-slate-200 hover:bg-slate-50 disabled:opacity-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors shadow-2xs"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRecalibrating ? 'animate-spin' : ''}`} />
            <span>{isRecalibrating ? 'Calculating...' : 'Recalibrate'}</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-medium flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Manual Adjuster Drawer */}
      {isAdjusting && (
        <form onSubmit={handleSaveManualAdjustments} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-mono text-slate-700 font-medium">
              Manual macro & calorie customization
            </span>
            <span className="text-[11px] font-mono text-slate-400">Total: {(proteinInput * 4) + (carbsInput * 4) + (fatsInput * 9)} kcal</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Calories (kcal)</label>
              <input
                type="number"
                value={calInput}
                onChange={(e) => setCalInput(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-bold font-mono text-slate-900"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Protein (g)</label>
              <input
                type="number"
                value={proteinInput}
                onChange={(e) => setProteinInput(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-bold font-mono text-slate-900"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Carbs (g)</label>
              <input
                type="number"
                value={carbsInput}
                onChange={(e) => setCarbsInput(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-bold font-mono text-slate-900"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Fats (g)</label>
              <input
                type="number"
                value={fatsInput}
                onChange={(e) => setFatsInput(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-bold font-mono text-slate-900"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Water (ml)</label>
              <input
                type="number"
                step="250"
                value={waterInput}
                onChange={(e) => setWaterInput(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-bold font-mono text-slate-900"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdjusting(false)}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800"
            >
              Save Targets
            </button>
          </div>
        </form>
      )}

      {/* Daily Macro Targets Grid with Animated Progress Bars & Animated Numbers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Calories Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-slate-500 font-medium">
              Daily energy
            </span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold text-slate-900 font-mono tracking-tight tabular-nums">
              <AnimatedNumber value={todayTotals.calories} />
            </span>
            <span className="text-xs font-mono text-slate-400 font-medium">/ {calories.toLocaleString()} kcal</span>
          </div>

          {/* Animated Progress Bar */}
          <div className="mt-3.5 space-y-1.5">
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-slate-900 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${isMounted ? caloriesProgress : 0}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-0.5">
              <span><AnimatedNumber value={caloriesProgress} />% of daily budget</span>
              <span className="font-semibold text-slate-700 tabular-nums">
                <AnimatedNumber value={Math.max(0, calories - todayTotals.calories)} /> kcal left
              </span>
            </div>
          </div>
        </div>

        {/* Protein Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-slate-500 font-medium">
              Protein target
            </span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <Beef className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold text-slate-900 font-mono tracking-tight tabular-nums">
              <AnimatedNumber value={todayTotals.protein} />g
            </span>
            <span className="text-xs font-mono text-slate-400 font-medium">/ {protein}g</span>
          </div>

          {/* Animated Progress Bar */}
          <div className="mt-3.5 space-y-1.5">
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-emerald-500 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${isMounted ? proteinProgress : 0}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-0.5">
              <span className="text-emerald-700 font-medium"><AnimatedNumber value={proteinProgress} />% achieved</span>
              <span className="font-semibold text-slate-700 tabular-nums">
                <AnimatedNumber value={Math.max(0, protein - todayTotals.protein)} />g left
              </span>
            </div>
          </div>
        </div>

        {/* Carbohydrates Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-slate-500 font-medium">
              Carbohydrates
            </span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <Wheat className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold text-slate-900 font-mono tracking-tight tabular-nums">
              <AnimatedNumber value={todayTotals.carbs} />g
            </span>
            <span className="text-xs font-mono text-slate-400 font-medium">/ {carbs}g</span>
          </div>

          {/* Animated Progress Bar */}
          <div className="mt-3.5 space-y-1.5">
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-blue-500 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${isMounted ? carbsProgress : 0}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-0.5">
              <span className="text-blue-700 font-medium"><AnimatedNumber value={carbsProgress} />% fueling</span>
              <span className="font-semibold text-slate-700 tabular-nums">
                <AnimatedNumber value={Math.max(0, carbs - todayTotals.carbs)} />g left
              </span>
            </div>
          </div>
        </div>

        {/* Fats Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-slate-500 font-medium">
              Healthy fats
            </span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <Droplet className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold text-slate-900 font-mono tracking-tight tabular-nums">
              <AnimatedNumber value={todayTotals.fats} />g
            </span>
            <span className="text-xs font-mono text-slate-400 font-medium">/ {fats}g</span>
          </div>

          {/* Animated Progress Bar */}
          <div className="mt-3.5 space-y-1.5">
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-amber-500 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${isMounted ? fatsProgress : 0}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-0.5">
              <span className="text-amber-700 font-medium"><AnimatedNumber value={fatsProgress} />% balance</span>
              <span className="font-semibold text-slate-700 tabular-nums">
                <AnimatedNumber value={Math.max(0, fats - todayTotals.fats)} />g left
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Hydration & Baseline Strip */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Droplet className="w-5 h-5 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900">
                Daily Baseline Hydration: {(water / 1000).toFixed(1)} Liters
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-800 font-medium">
                {water} ml
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Supports muscular hydration, cellular volumization, and recovery from intense compound lifting sessions.
            </p>
          </div>
        </div>
      </div>

      {/* Macros & Nutrition Logger Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs space-y-5">
        {/* Header & Intake Tracking Progress */}
        <div className="pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2 mb-1">
            <Utensils className="w-4 h-4 text-slate-700" />
            <span className="text-xs font-mono text-slate-500 font-medium">
              Daily macro ledger & history
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            Macro & Nutrition Logger
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Track meals, monitor protein distribution, and verify daily caloric equilibrium against your plan.
          </p>
        </div>

        {/* Today's Logged Summary Strip */}
        <div className="bg-slate-50/80 rounded-xl border border-slate-200/60 p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-mono font-semibold text-slate-700">Today's Intake:</span>
              <span className="font-mono text-slate-500">
                {todayTotals.count} {todayTotals.count === 1 ? 'meal logged' : 'meals logged'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-6 font-mono">
              <div>
                <span className="text-[11px] text-slate-400 block">Calories</span>
                <span className="font-bold text-slate-900 tabular-nums">
                  <AnimatedNumber value={todayTotals.calories} /> <span className="text-slate-400 font-normal">/ {calories} kcal</span>
                </span>
              </div>
              <div>
                <span className="text-[11px] text-emerald-600 font-medium block">Protein</span>
                <span className="font-bold text-slate-900 tabular-nums">
                  <AnimatedNumber value={todayTotals.protein} />g <span className="text-slate-400 font-normal">/ {protein}g</span>
                </span>
              </div>
              <div>
                <span className="text-[11px] text-blue-600 font-medium block">Carbs</span>
                <span className="font-bold text-slate-900 tabular-nums">
                  <AnimatedNumber value={todayTotals.carbs} />g <span className="text-slate-400 font-normal">/ {carbs}g</span>
                </span>
              </div>
              <div>
                <span className="text-[11px] text-amber-600 font-medium block">Fats</span>
                <span className="font-bold text-slate-900 tabular-nums">
                  <AnimatedNumber value={todayTotals.fats} />g <span className="text-slate-400 font-normal">/ {fats}g</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          {/* Search Box */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search meals, food or notes..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-8 py-2 bg-slate-50/70 border border-slate-200/80 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-slate-400 focus:bg-white transition-all font-mono"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Meal Type Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs">
              <Filter className="w-3 h-3 text-slate-400" />
              <select
                value={selectedMealTypeFilter}
                onChange={(e) => {
                  setSelectedMealTypeFilter(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="bg-transparent border-none text-xs font-medium text-slate-700 focus:outline-hidden cursor-pointer"
              >
                <option value="All">All Meal Types</option>
                <option value="Breakfast">Breakfast</option>
                <option value="Lunch">Lunch</option>
                <option value="Dinner">Dinner</option>
                <option value="Snack">Snack</option>
                <option value="Post-Workout">Post-Workout</option>
              </select>
            </div>

            {/* Batch Delete when items selected */}
            {selectedRowIds.size > 0 && (
              <button
                type="button"
                onClick={handleDeleteSelected}
                className="px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete ({selectedRowIds.size})</span>
              </button>
            )}
          </div>
        </div>

        {/* Meal History Table (Matches ProgressAnalyticsView styling) */}
        <div className="overflow-x-auto border border-slate-200/80 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[11px] font-mono text-slate-500 uppercase tracking-wider border-b border-slate-200/80">
              <tr>
                {/* Checkbox */}
                <th scope="col" className="px-3.5 py-2.5 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={
                      paginatedLogs.length > 0 &&
                      paginatedLogs.every((l) => selectedRowIds.has(l.id))
                    }
                    onChange={toggleSelectAllPage}
                    aria-label="Select all rows on page"
                    className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 w-3.5 h-3.5"
                  />
                </th>

                {/* Meal / Food item */}
                <th 
                  scope="col" 
                  className="px-4 py-2.5 font-semibold cursor-pointer select-none"
                  onClick={() => handleSort('name')}
                >
                  <div className="inline-flex items-center gap-1">
                    <span>MEAL & FOOD ITEM</span>
                    {sortField === 'name' ? (
                      sortDirection === 'asc' ? <ChevronUp className="w-3 h-3 text-slate-700" /> : <ChevronDown className="w-3 h-3 text-slate-700" />
                    ) : (
                      <span className="text-slate-400">↑↓</span>
                    )}
                  </div>
                </th>

                {/* Meal Type */}
                <th scope="col" className="px-4 py-2.5 font-semibold">
                  <span>TYPE</span>
                </th>

                {/* Date & Time */}
                <th 
                  scope="col" 
                  className="px-4 py-2.5 font-semibold cursor-pointer select-none"
                  onClick={() => handleSort('date')}
                >
                  <div className="inline-flex items-center gap-1">
                    <span>DATE & TIME</span>
                    {sortField === 'date' ? (
                      sortDirection === 'asc' ? <ChevronUp className="w-3 h-3 text-slate-700" /> : <ChevronDown className="w-3 h-3 text-slate-700" />
                    ) : (
                      <span className="text-slate-400">↑↓</span>
                    )}
                  </div>
                </th>

                {/* Calories */}
                <th 
                  scope="col" 
                  className="px-4 py-2.5 font-semibold cursor-pointer select-none"
                  onClick={() => handleSort('calories')}
                >
                  <div className="inline-flex items-center gap-1">
                    <span>CALORIES</span>
                    {sortField === 'calories' ? (
                      sortDirection === 'asc' ? <ChevronUp className="w-3 h-3 text-slate-700" /> : <ChevronDown className="w-3 h-3 text-slate-700" />
                    ) : (
                      <span className="text-slate-400">↑↓</span>
                    )}
                  </div>
                </th>

                {/* Macros P / C / F */}
                <th 
                  scope="col" 
                  className="px-4 py-2.5 font-semibold cursor-pointer select-none"
                  onClick={() => handleSort('protein')}
                >
                  <div className="inline-flex items-center gap-1">
                    <span>MACROS (P / C / F)</span>
                    {sortField === 'protein' ? (
                      sortDirection === 'asc' ? <ChevronUp className="w-3 h-3 text-slate-700" /> : <ChevronDown className="w-3 h-3 text-slate-700" />
                    ) : (
                      <span className="text-slate-400">↑↓</span>
                    )}
                  </div>
                </th>

                {/* Macro Ratio Status */}
                <th scope="col" className="px-4 py-2.5 font-semibold">
                  <span>MACRO PROFILE</span>
                </th>

                {/* Action Column */}
                <th scope="col" className="px-4 py-2.5 text-right font-semibold">
                  <span>ACTION</span>
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {isLoadingLogs ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 font-mono text-xs">
                    Loading meal records from database...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 text-xs">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Utensils className="w-6 h-6 text-slate-300" />
                      <p className="font-medium text-slate-600">
                        {!isDemoMode 
                          ? 'No meals recorded in database yet.' 
                          : 'No meals logged matching your filter.'}
                      </p>
                      <button
                        type="button"
                        onClick={handleOpenModal}
                        className="mt-1 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors"
                      >
                        Log Your First Meal
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((log) => {
                  const dateObj = new Date(log.date);
                  const formattedDate = new Intl.DateTimeFormat('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  }).format(dateObj);
                  const formattedTime = new Intl.DateTimeFormat('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                  }).format(dateObj);

                  const isSelected = selectedRowIds.has(log.id);

                  return (
                    <tr
                      key={log.id}
                      className={`hover:bg-slate-50/80 transition-colors ${isSelected ? 'bg-slate-50/60' : ''}`}
                    >
                      {/* Checkbox */}
                      <td className="px-3.5 py-2.5 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectRow(log.id)}
                          aria-label={`Select ${log.name}`}
                          className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 w-3.5 h-3.5"
                        />
                      </td>

                      {/* Meal & Food Item */}
                      <td className="px-4 py-2.5">
                        <div className="font-semibold text-slate-900 text-xs">
                          {log.name}
                        </div>
                        {log.notes && (
                          <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                            {log.notes}
                          </div>
                        )}
                      </td>

                      {/* Meal Type */}
                      <td className="px-4 py-2.5">
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-slate-100 text-slate-700">
                          {log.mealType}
                        </span>
                      </td>

                      {/* Date & Time */}
                      <td className="px-4 py-2.5 font-mono text-xs">
                        <div className="text-slate-900 font-medium">{formattedDate}</div>
                        <div className="text-[11px] text-slate-400">{formattedTime}</div>
                      </td>

                      {/* Calories */}
                      <td className="px-4 py-2.5 font-mono tabular-nums text-xs">
                        <span className="font-bold text-slate-900">{log.calories.toLocaleString()}</span>
                        <span className="text-[11px] text-slate-400 ml-1">kcal</span>
                      </td>

                      {/* Macros P / C / F */}
                      <td className="px-4 py-2.5 font-mono tabular-nums text-xs">
                        <div className="flex items-center gap-2 text-[11px]">
                          <span className="text-emerald-700 font-semibold" title="Protein">
                            P: {log.protein}g
                          </span>
                          <span className="text-slate-300">·</span>
                          <span className="text-blue-700 font-semibold" title="Carbs">
                            C: {log.carbs}g
                          </span>
                          <span className="text-slate-300">·</span>
                          <span className="text-amber-700 font-semibold" title="Fats">
                            F: {log.fats}g
                          </span>
                        </div>
                      </td>

                      {/* Macro Profile Status Badge */}
                      <td className="px-4 py-2.5">
                        {getMacroProfileBadge(log)}
                      </td>

                      {/* Delete Action */}
                      <td className="px-4 py-2.5 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteLog(log.id)}
                          title="Delete meal entry"
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors inline-flex items-center justify-center"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs font-mono text-slate-500">
          <div className="flex items-center gap-3">
            <span>
              {filteredLogs.length === 0
                ? '0 entries'
                : `Showing ${(activePage - 1) * pageSize + 1} to ${Math.min(activePage * pageSize, filteredLogs.length)} of ${filteredLogs.length} entries`}
            </span>

            {/* Page Size Selector */}
            <div className="flex items-center gap-1 text-[11px]">
              <span>Show</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-slate-700 font-mono text-xs focus:outline-hidden"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
              <span>per page</span>
            </div>
          </div>

          {/* Page Buttons */}
          <div className="flex items-center gap-1 self-center sm:self-auto">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={activePage <= 1}
              className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 transition-colors"
              title="Previous page"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                type="button"
                onClick={() => setCurrentPage(pageNum)}
                className={`min-w-[28px] h-7 px-2 rounded-lg text-xs font-mono font-medium transition-colors ${
                  activePage === pageNum
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-700 hover:bg-slate-100 border border-transparent'
                }`}
              >
                {pageNum}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={activePage >= totalPages}
              className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 transition-colors"
              title="Next page"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Log Meal & Macronutrients Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white dark:bg-[#16171B] rounded-2xl border border-slate-200 dark:border-[#262933] shadow-2xl max-w-lg w-full overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#262933] pb-3">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                  Log Meal & Macronutrients
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                  Record food intake, calories, and macro breakdown
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateMeal} className="space-y-4">
              {/* Meal Name Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Meal / Food Description <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Grilled Salmon with Jasmine Rice & Broccoli"
                  value={newMealName}
                  onChange={(e) => setNewMealName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-[#2D313C] rounded-xl text-xs bg-white dark:bg-[#1C1F26] text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:ring-1 focus:ring-slate-900 dark:focus:ring-slate-100 font-medium"
                />
              </div>

              {/* Meal Type Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Meal Category
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                  {(['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Post-Workout'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setNewMealType(type)}
                      className={`px-2 py-1.5 text-[11px] font-mono rounded-lg border transition-colors ${
                        newMealType === type
                          ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white font-semibold'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 dark:bg-[#1C1F26] dark:text-slate-300 dark:border-[#2D313C] dark:hover:bg-[#282C36]'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date & Time Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 dark:border-[#2D313C] rounded-xl text-xs font-mono bg-white dark:bg-[#1C1F26] text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-slate-900 dark:focus:ring-slate-100"
                />
              </div>

              {/* Macro Values Grid */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Macronutrients & Energy</span>
                  <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                    Calculated: {(newProtein * 4) + (newCarbs * 4) + (newFats * 9)} kcal
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="bg-slate-50 dark:bg-[#1C1F26] p-2.5 rounded-xl border border-slate-200/60 dark:border-[#2D313C]">
                    <label className="block text-[11px] font-mono text-slate-500 dark:text-slate-400 mb-0.5">Calories</label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        value={newCalories}
                        onChange={(e) => setNewCalories(Number(e.target.value))}
                        className="w-full bg-white dark:bg-[#121316] px-2 py-1 border border-slate-200 dark:border-[#2D313C] rounded-md text-xs font-bold font-mono text-slate-900 dark:text-slate-100"
                      />
                      <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">kcal</span>
                    </div>
                  </div>

                  <div className="bg-emerald-50/50 dark:bg-emerald-950/25 p-2.5 rounded-xl border border-emerald-100 dark:border-emerald-800/40">
                    <label className="block text-[11px] font-mono text-emerald-700 dark:text-emerald-400 font-medium mb-0.5">Protein</label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        value={newProtein}
                        onChange={(e) => setNewProtein(Number(e.target.value))}
                        className="w-full bg-white dark:bg-[#121316] px-2 py-1 border border-emerald-200 dark:border-emerald-800/50 rounded-md text-xs font-bold font-mono text-emerald-900 dark:text-emerald-300"
                      />
                      <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">g</span>
                    </div>
                  </div>

                  <div className="bg-blue-50/50 dark:bg-blue-950/25 p-2.5 rounded-xl border border-blue-100 dark:border-blue-800/40">
                    <label className="block text-[11px] font-mono text-blue-700 dark:text-blue-400 font-medium mb-0.5">Carbs</label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        value={newCarbs}
                        onChange={(e) => setNewCarbs(Number(e.target.value))}
                        className="w-full bg-white dark:bg-[#121316] px-2 py-1 border border-blue-200 dark:border-blue-800/50 rounded-md text-xs font-bold font-mono text-blue-900 dark:text-blue-300"
                      />
                      <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400">g</span>
                    </div>
                  </div>

                  <div className="bg-amber-50/50 dark:bg-amber-950/25 p-2.5 rounded-xl border border-amber-100 dark:border-amber-800/40">
                    <label className="block text-[11px] font-mono text-amber-700 dark:text-amber-400 font-medium mb-0.5">Fats</label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        value={newFats}
                        onChange={(e) => setNewFats(Number(e.target.value))}
                        className="w-full bg-white dark:bg-[#121316] px-2 py-1 border border-amber-200 dark:border-amber-800/50 rounded-md text-xs font-bold font-mono text-amber-900 dark:text-amber-300"
                      />
                      <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400">g</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Optional Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Notes & Nutrient Timing (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Pre-workout fueling 60 mins prior, high hydration"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 dark:border-[#2D313C] rounded-xl text-xs bg-white dark:bg-[#1C1F26] text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:ring-1 focus:ring-slate-900 dark:focus:ring-slate-100"
                />
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-[#262933]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 rounded-xl text-xs font-semibold transition-colors shadow-2xs"
                >
                  Save Meal Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
