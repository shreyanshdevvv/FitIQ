import React, { useState } from 'react';
import { useFitness } from '../context/FitnessContext';
import { Plus, Droplets, PieChart } from 'lucide-react';

export const NutritionEngine: React.FC = () => {
  const { macros, updateMacroTargets, logIntake } = useFitness();

  const [mealProtein, setMealProtein] = useState(30);
  const [mealCarbs, setMealCarbs] = useState(40);
  const [mealFats, setMealFats] = useState(12);

  const [isEditingTargets, setIsEditingTargets] = useState(false);
  const [targetP, setTargetP] = useState(macros.proteinTarget);
  const [targetC, setTargetC] = useState(macros.carbsTarget);
  const [targetF, setTargetF] = useState(macros.fatsTarget);
  const [targetW, setTargetW] = useState(macros.waterTargetLiters);

  const totalCalories = Math.round(
    macros.proteinCurrent * 4 + macros.carbsCurrent * 4 + macros.fatsCurrent * 9
  );
  const targetCalories = Math.round(
    macros.proteinTarget * 4 + macros.carbsTarget * 4 + macros.fatsTarget * 9
  );

  const handleSaveTargets = () => {
    updateMacroTargets({
      proteinTarget: Number(targetP),
      carbsTarget: Number(targetC),
      fatsTarget: Number(targetF),
      waterTargetLiters: Number(targetW),
    });
    setIsEditingTargets(false);
  };

  const handleLogMeal = (e: React.FormEvent) => {
    e.preventDefault();
    logIntake(Number(mealProtein), Number(mealCarbs), Number(mealFats), 0);
  };

  const macroItems = [
    {
      name: 'Protein',
      current: macros.proteinCurrent,
      target: macros.proteinTarget,
      unit: 'g',
      barColor: 'bg-slate-900',
    },
    {
      name: 'Carbohydrates',
      current: macros.carbsCurrent,
      target: macros.carbsTarget,
      unit: 'g',
      barColor: 'bg-slate-600',
    },
    {
      name: 'Fats',
      current: macros.fatsCurrent,
      target: macros.fatsTarget,
      unit: 'g',
      barColor: 'bg-slate-400',
    },
    {
      name: 'Hydration',
      current: macros.waterCurrentLiters,
      target: macros.waterTargetLiters,
      unit: 'L',
      barColor: 'bg-blue-600',
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold block mb-1">
            Energy Balance
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-mono font-bold text-slate-900">
              {totalCalories}
            </span>
            <span className="text-slate-400 font-mono text-sm">
              / {targetCalories} kcal
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-mono">
            {Math.max(0, targetCalories - totalCalories)} kcal remaining for today
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => logIntake(0, 0, 0, 0.25)}
            className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
          >
            <Droplets className="w-3.5 h-3.5 text-blue-600" />
            <span>+250ml Water</span>
          </button>

          <button
            onClick={() => setIsEditingTargets(!isEditingTargets)}
            className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium transition-colors"
          >
            {isEditingTargets ? 'Cancel Edit' : 'Edit Targets'}
          </button>
        </div>
      </div>

      {/* Target Editor Drawer */}
      {isEditingTargets && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold block pb-2 border-b border-slate-100">
            Configure Daily Nutritional Targets
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="text-slate-500 block mb-1">Protein (g)</label>
              <input
                type="number"
                value={targetP}
                onChange={(e) => setTargetP(Number(e.target.value))}
                className="w-full px-2 py-1.5 border border-slate-200 rounded font-mono"
              />
            </div>
            <div>
              <label className="text-slate-500 block mb-1">Carbs (g)</label>
              <input
                type="number"
                value={targetC}
                onChange={(e) => setTargetC(Number(e.target.value))}
                className="w-full px-2 py-1.5 border border-slate-200 rounded font-mono"
              />
            </div>
            <div>
              <label className="text-slate-500 block mb-1">Fats (g)</label>
              <input
                type="number"
                value={targetF}
                onChange={(e) => setTargetF(Number(e.target.value))}
                className="w-full px-2 py-1.5 border border-slate-200 rounded font-mono"
              />
            </div>
            <div>
              <label className="text-slate-500 block mb-1">Water (L)</label>
              <input
                type="number"
                step="0.1"
                value={targetW}
                onChange={(e) => setTargetW(Number(e.target.value))}
                className="w-full px-2 py-1.5 border border-slate-200 rounded font-mono"
              />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button
              onClick={handleSaveTargets}
              className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold"
            >
              Save Targets
            </button>
          </div>
        </div>
      )}

      {/* Macro Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {macroItems.map((item, idx) => {
          const pct = Math.min(100, Math.round((item.current / item.target) * 100));

          return (
            <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between text-xs font-mono text-slate-500 mb-2">
                <span>{item.name.toUpperCase()}</span>
                <span>{pct}%</span>
              </div>
              <div className="flex items-baseline gap-1 my-1">
                <span className="text-3xl font-mono font-bold text-slate-900">
                  {item.current}
                </span>
                <span className="text-slate-400 font-mono text-xs">
                  / {item.target} {item.unit}
                </span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-3">
                <div
                  className={`h-full rounded-full ${item.barColor}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Meal Intake Logger */}
      <form
        onSubmit={handleLogMeal}
        className="bg-white p-5 rounded-xl border border-slate-200 space-y-4"
      >
        <span className="text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold block">
          Log Intake (Add to today's tally)
        </span>
        <div className="grid grid-cols-3 gap-3 text-xs">
          <div>
            <label className="text-slate-500 block mb-1">Protein (g)</label>
            <input
              type="number"
              min="0"
              value={mealProtein}
              onChange={(e) => setMealProtein(Number(e.target.value))}
              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg font-mono text-xs"
            />
          </div>
          <div>
            <label className="text-slate-500 block mb-1">Carbs (g)</label>
            <input
              type="number"
              min="0"
              value={mealCarbs}
              onChange={(e) => setMealCarbs(Number(e.target.value))}
              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg font-mono text-xs"
            />
          </div>
          <div>
            <label className="text-slate-500 block mb-1">Fats (g)</label>
            <input
              type="number"
              min="0"
              value={mealFats}
              onChange={(e) => setMealFats(Number(e.target.value))}
              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg font-mono text-xs"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Meal</span>
          </button>
        </div>
      </form>
    </div>
  );
};
