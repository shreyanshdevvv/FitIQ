import React, { useState, useEffect } from 'react';
import { api, BackendExercise } from '../services/api';
import { Search, Filter, Dumbbell, Loader2, Info } from 'lucide-react';

export const ExerciseLibraryView: React.FC = () => {
  const [exercises, setExercises] = useState<BackendExercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const fetchExercises = async () => {
    setLoading(true);
    try {
      const data = await api.getExercises(searchTerm || undefined, selectedCategory || undefined);
      setExercises(data);
    } catch (err) {
      console.error('Failed to fetch exercises:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExercises();
  }, [selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchExercises();
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Banner & Search */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold block mb-1">
            Movement & Exercise Library
          </span>
          <h2 className="text-xl font-bold text-slate-900">
            Movement & Exercise Catalog
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified kinesiology movements referenced by the AI training generator.
          </p>
        </div>

        {/* Search & Category Filter */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search movement or muscle..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-2 border border-slate-200 rounded-lg text-xs font-medium w-48 sm:w-56 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </form>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs font-medium border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-800"
          >
            <option value="">All Categories</option>
            <option value="STRENGTH">Strength</option>
            <option value="CARDIO">Cardio</option>
            <option value="FLEXIBILITY">Flexibility</option>
            <option value="BALANCE">Balance</option>
          </select>
        </div>
      </div>

      {/* Exercises Catalog */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between text-xs font-mono text-slate-500">
          <span>CATALOG MOVEMENTS ({exercises.length})</span>
          <span>EXERCISE DIRECTORY</span>
        </div>

        {loading ? (
          <div className="p-12 flex items-center justify-center gap-2 text-xs text-slate-500 font-mono">
            <Loader2 className="w-4 h-4 animate-spin text-slate-700" />
            <span>Loading movements...</span>
          </div>
        ) : exercises.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            No exercises match your search query.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {exercises.map((ex) => (
              <div key={ex.id} className="p-4 sm:p-5 hover:bg-slate-50/50 transition-colors space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <h4 className="text-sm font-bold text-slate-900">{ex.name}</h4>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                      {ex.category}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold">
                      {ex.difficulty}
                    </span>
                  </div>

                  <div className="text-[11px] font-mono text-slate-500">
                    Equipment: {ex.equipmentNeeded.join(', ') || 'Bodyweight'}
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {ex.instructions}
                </p>

                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Muscles:</span>
                  {ex.muscleGroups.map((m, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-50 text-slate-600 border border-slate-200"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
