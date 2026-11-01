import React, { useState } from 'react';
import { useFitness } from '../context/FitnessContext';
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
  AlertCircle
} from 'lucide-react';

export const NutritionView: React.FC = () => {
  const { 
    nutritionPlan, 
    generateNutritionPlan, 
    updateNutritionPlan, 
    userProfile 
  } = useFitness();

  const [isRecalibrating, setIsRecalibrating] = useState(false);
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Manual Adjuster Form State
  const [calInput, setCalInput] = useState<number>(nutritionPlan?.dailyCalories || 2400);
  const [proteinInput, setProteinInput] = useState<number>(nutritionPlan?.proteinGrams || 160);
  const [carbsInput, setCarbsInput] = useState<number>(nutritionPlan?.carbsGrams || 280);
  const [fatsInput, setFatsInput] = useState<number>(nutritionPlan?.fatsGrams || 70);
  const [waterInput, setWaterInput] = useState<number>(nutritionPlan?.waterMl || 3000);

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

  return (
    <div className="space-y-6 max-w-6xl mx-auto w-full">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold">
              Fueling & Metabolic Strategy
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Personalized Nutrition Targets
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Calculated from your body weight ({weightKg} kg), training split ({userProfile?.workoutDaysPerWeek || 4} days/week), and primary goals.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
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
            className="min-h-[40px] px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors shadow-2xs"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRecalibrating ? 'animate-spin' : ''}`} />
            <span>{isRecalibrating ? 'Calculating...' : 'Recalibrate with AI'}</span>
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
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
              Manual Macro & Calorie Customization
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

      {/* Strategy Explanation Card */}
      {nutritionPlan?.notes && (
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 shadow-2xs flex items-start gap-3.5">
          <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">
                {nutritionPlan.dietaryStrategy.replace(/_/g, ' ')}
              </span>
              <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-mono font-medium">
                Active Protocol
              </span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              {nutritionPlan.notes}
            </p>
          </div>
        </div>
      )}

      {/* Daily Macro Targets Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Calories Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold">
              Daily Energy
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight tabular-nums">
              {calories.toLocaleString()}
            </span>
            <span className="text-xs font-mono text-slate-400 font-medium">kcal</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span>TDEE Fueling</span>
            <span className="font-semibold text-slate-800">100% Daily Target</span>
          </div>
        </div>

        {/* Protein Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold">
              Protein Target
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Beef className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight tabular-nums">
              {protein}
            </span>
            <span className="text-xs font-mono text-slate-400 font-medium">grams</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span>{proteinPerKg}g / kg bodyweight</span>
            <span className="font-semibold text-emerald-800">{proteinPct}% of cals</span>
          </div>
        </div>

        {/* Carbohydrates Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold">
              Carbohydrates
            </span>
            <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <Wheat className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight tabular-nums">
              {carbs}
            </span>
            <span className="text-xs font-mono text-slate-400 font-medium">grams</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span>Glycogen Refueling</span>
            <span className="font-semibold text-sky-800">{carbsPct}% of cals</span>
          </div>
        </div>

        {/* Fats Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold">
              Healthy Fats
            </span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Droplet className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight tabular-nums">
              {fats}
            </span>
            <span className="text-xs font-mono text-slate-400 font-medium">grams</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span>Hormone Regulation</span>
            <span className="font-semibold text-indigo-800">{fatsPct}% of cals</span>
          </div>
        </div>
      </div>

      {/* Hydration & Nutrient Partitioning Strip */}
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

      {/* Nutrient Timing & Meal Distribution Strategy */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Clock className="w-4 h-4 text-slate-700" />
          <h2 className="text-sm font-bold text-slate-900 uppercase font-mono tracking-wider">
            Nutrient Timing & Meal Distribution Guidelines
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {(nutritionPlan?.mealTimingTips && nutritionPlan.mealTimingTips.length > 0
            ? nutritionPlan.mealTimingTips
            : [
                `Distribute your ${protein}g of protein evenly across 3 to 4 meals (roughly ${Math.round(protein / 3.5)}g per meal) to maximize muscle protein synthesis.`,
                "Consume 30-45g of complex carbohydrates 60-90 minutes prior to your workout to ensure optimal muscle glycogen availability.",
                "Prioritize 30-40g of rapid-digesting protein and moderate carbohydrates within 2 hours post-workout for tissue repair.",
                `Drink at least ${(water / 1000).toFixed(1)} liters of water daily, adding an extra 500ml during high-intensity training sessions.`
              ]
          ).map((tip, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-slate-100 bg-slate-50/70 flex items-start gap-3">
              <div className="w-6 h-6 rounded-lg bg-slate-900 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                {idx + 1}
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {tip}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
