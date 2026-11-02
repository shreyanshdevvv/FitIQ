import React, { useState, useEffect, useMemo } from 'react';
import { api, BackendExercise } from '../services/api';
import { 
  Search, 
  Loader2, 
  Eye, 
  ChevronUp, 
  ChevronDown, 
  X, 
  Dumbbell,
  BookOpen
} from 'lucide-react';
import { CustomDropdown } from './CustomDropdown';

export const ExerciseLibraryView: React.FC = () => {
  const [exercises, setExercises] = useState<BackendExercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedExerciseIds, setSelectedExerciseIds] = useState<Set<string>>(new Set());
  const [selectedExerciseForDetail, setSelectedExerciseForDetail] = useState<BackendExercise | null>(null);
  
  // Sort state
  const [sortField, setSortField] = useState<'name' | 'category' | 'difficulty'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

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

  // Sort and filter helper
  const sortedExercises = useMemo(() => {
    return [...exercises].sort((a, b) => {
      if (sortField === 'name') {
        return sortDirection === 'asc' 
          ? a.name.localeCompare(b.name) 
          : b.name.localeCompare(a.name);
      }
      if (sortField === 'category') {
        return sortDirection === 'asc' 
          ? a.category.localeCompare(b.category) 
          : b.category.localeCompare(a.category);
      }
      if (sortField === 'difficulty') {
        return sortDirection === 'asc' 
          ? a.difficulty.localeCompare(b.difficulty) 
          : b.difficulty.localeCompare(a.difficulty);
      }
      return 0;
    });
  }, [exercises, sortField, sortDirection]);

  const handleSort = (field: 'name' | 'category' | 'difficulty') => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Checkbox selection
  const toggleSelectAll = () => {
    if (selectedExerciseIds.size === sortedExercises.length && sortedExercises.length > 0) {
      setSelectedExerciseIds(new Set());
    } else {
      setSelectedExerciseIds(new Set(sortedExercises.map((e) => e.id)));
    }
  };

  const toggleSelectRow = (id: string) => {
    const updated = new Set(selectedExerciseIds);
    if (updated.has(id)) {
      updated.delete(id);
    } else {
      updated.add(id);
    }
    setSelectedExerciseIds(updated);
  };

  // Category colored pill
  const getCategoryBadge = (category: string) => {
    const cat = category.toUpperCase();
    if (cat === 'STRENGTH') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          <span>Strength</span>
        </span>
      );
    }
    if (cat === 'CARDIO') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          <span>Cardio</span>
        </span>
      );
    }
    if (cat === 'FLEXIBILITY') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>Flexibility</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
        <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
        <span>{category}</span>
      </span>
    );
  };

  // Difficulty colored pill
  const getDifficultyBadge = (difficulty: string) => {
    const diff = difficulty.toUpperCase();
    if (diff === 'BEGINNER') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>Beginner</span>
        </span>
      );
    }
    if (diff === 'INTERMEDIATE') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          <span>Intermediate</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
        <span>Advanced</span>
      </span>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full font-sans">
      
      {/* Exercise Library Table Container (Matching reference image) */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        
        {/* Table Header Bar with Search & Filters */}
        <div className="p-4 sm:px-6 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-900">Exercise Catalog</span>
            <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              {exercises.length} movements
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Search Input matching reference */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search movement or muscle..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium w-52 sm:w-64 focus:outline-none focus:ring-1 focus:ring-slate-900 placeholder:text-slate-400"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </form>

            <CustomDropdown
              value={selectedCategory}
              onChange={(val) => setSelectedCategory(val)}
              placeholder="All Categories"
              align="right"
              options={[
                { value: '', label: 'All Categories' },
                { value: 'STRENGTH', label: 'Strength' },
                { value: 'CARDIO', label: 'Cardio' },
                { value: 'FLEXIBILITY', label: 'Flexibility' },
                { value: 'BALANCE', label: 'Balance' },
              ]}
            />
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200/90 text-slate-600 uppercase font-mono text-[11px]">
              <tr>
                <th scope="col" className="w-10 px-4 py-3 text-center">
                  <input
                    type="checkbox"
                    checked={selectedExerciseIds.size === sortedExercises.length && sortedExercises.length > 0}
                    onChange={toggleSelectAll}
                    aria-label="Select all movements"
                    className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 w-3.5 h-3.5"
                  />
                </th>

                <th scope="col" className="px-4 py-3 font-semibold cursor-pointer select-none" onClick={() => handleSort('name')}>
                  <div className="inline-flex items-center gap-1">
                    <span>EXERCISE NAME</span>
                    {sortField === 'name' ? (
                      sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                    ) : (
                      <span className="text-slate-400">↑↓</span>
                    )}
                  </div>
                </th>

                <th scope="col" className="px-4 py-3 font-semibold">
                  TARGET MUSCLES
                </th>

                <th scope="col" className="px-4 py-3 font-semibold cursor-pointer select-none" onClick={() => handleSort('category')}>
                  <div className="inline-flex items-center gap-1">
                    <span>CATEGORY</span>
                    {sortField === 'category' ? (
                      sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                    ) : (
                      <span className="text-slate-400">↑↓</span>
                    )}
                  </div>
                </th>

                <th scope="col" className="px-4 py-3 font-semibold cursor-pointer select-none" onClick={() => handleSort('difficulty')}>
                  <div className="inline-flex items-center gap-1">
                    <span>DIFFICULTY</span>
                    {sortField === 'difficulty' ? (
                      sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                    ) : (
                      <span className="text-slate-400">↑↓</span>
                    )}
                  </div>
                </th>

                <th scope="col" className="px-4 py-3 font-semibold hidden md:table-cell">
                  EQUIPMENT
                </th>

                <th scope="col" className="px-4 py-3 text-right font-semibold">
                  ACTIONS
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 font-mono">
                    <Loader2 className="w-4 h-4 animate-spin inline-block mr-2" />
                    <span>Loading movements...</span>
                  </td>
                </tr>
              ) : sortedExercises.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No exercises match your search query.
                  </td>
                </tr>
              ) : (
                sortedExercises.map((ex) => {
                  const isSelected = selectedExerciseIds.has(ex.id);

                  return (
                    <tr 
                      key={ex.id}
                      className={`hover:bg-slate-50/80 transition-colors ${isSelected ? 'bg-slate-50/60' : ''}`}
                    >
                      {/* Checkbox */}
                      <td className="px-4 py-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectRow(ex.id)}
                          aria-label={`Select ${ex.name}`}
                          className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 w-3.5 h-3.5"
                        />
                      </td>

                      {/* Primary Exercise Name Column */}
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-slate-900 text-xs sm:text-sm">
                          {ex.name}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {ex.equipmentNeeded.join(', ') || 'Bodyweight Movement'}
                        </div>
                      </td>

                      {/* Muscle Groups */}
                      <td className="px-4 py-3.5">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {ex.muscleGroups.map((m, idx) => (
                            <span 
                              key={idx}
                              className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px]"
                            >
                              {m}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Category Pill with Colored Dot */}
                      <td className="px-4 py-3.5">
                        {getCategoryBadge(ex.category)}
                      </td>

                      {/* Difficulty Pill with Colored Dot */}
                      <td className="px-4 py-3.5">
                        {getDifficultyBadge(ex.difficulty)}
                      </td>

                      {/* Equipment */}
                      <td className="px-4 py-3.5 font-mono text-slate-600 text-[11px] hidden md:table-cell">
                        {ex.equipmentNeeded.join(', ') || 'None'}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedExerciseForDetail(ex)}
                          title="View exercise technique cues"
                          className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors inline-flex items-center justify-center"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Movement Detail Modal */}
      {selectedExerciseForDetail && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden space-y-4 p-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                  {selectedExerciseForDetail.name}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  {getCategoryBadge(selectedExerciseForDetail.category)}
                  {getDifficultyBadge(selectedExerciseForDetail.difficulty)}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedExerciseForDetail(null)}
                className="p-1.5 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <div className="text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                  <span>Kinesiology Execution Cues</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200/70">
                  {selectedExerciseForDetail.instructions}
                </p>
              </div>

              <div>
                <div className="text-xs font-semibold text-slate-700 mb-1">
                  Target Muscle Groups
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedExerciseForDetail.muscleGroups.map((m, idx) => (
                    <span 
                      key={idx}
                      className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 text-xs font-mono font-medium"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold text-slate-700 mb-1">
                  Equipment Prescribed
                </div>
                <div className="text-xs text-slate-600 font-mono">
                  {selectedExerciseForDetail.equipmentNeeded.join(', ') || 'No equipment needed'}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setSelectedExerciseForDetail(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
