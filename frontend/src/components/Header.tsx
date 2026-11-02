import React, { useState, useRef, useEffect } from 'react';
import { Menu, RefreshCw, User, LogOut, Sliders } from 'lucide-react';
import { ViewMode } from '../types/fitness';
import { useFitness } from '../context/FitnessContext';

interface HeaderProps {
  currentView: ViewMode;
  onOpenMobileSidebar: () => void;
  onSelectView?: (view: ViewMode) => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  currentView, 
  onOpenMobileSidebar,
  onSelectView,
}) => {
  const { 
    resetWorkoutProgress,
    currentUser,
    logout,
    isDemoMode,
    setDemoMode,
  } = useFitness();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  const viewTitles: Record<ViewMode, string> = {
    today: '',
    workout: 'Workout Plan & Sessions',
    nutrition: 'Nutrition & Fueling Strategy',
    coach: 'AI Coaching Assistant',
    progress: 'Progress & Performance Analytics',
    coaches: 'Certified Human Coaches',
    exercises: 'Movement Library',
    settings: 'Athlete Fitness Profile',
  };

  const currentDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  const getInitials = (name?: string) => {
    if (!name) return 'A';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="h-14 border-b border-slate-200 bg-white px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          aria-label="Open navigation sidebar"
          className="md:hidden p-1.5 -ml-1.5 text-slate-600 hover:text-slate-900 rounded-md hover:bg-slate-100 touch-manipulation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs">
          {viewTitles[currentView] ? (
            <span className="font-semibold text-slate-900 text-sm">{viewTitles[currentView]}</span>
          ) : null}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {currentView === 'workout' && (
          <button
            onClick={resetWorkoutProgress}
            className="flex items-center gap-1 text-[11px] font-mono text-slate-500 hover:text-slate-800 transition-colors px-2 py-1 rounded hover:bg-slate-50"
            title="Reset logged sets"
          >
            <RefreshCw className="w-3 h-3" />
            <span className="hidden sm:inline">Reset Sets</span>
          </button>
        )}

        {/* Profile Avatar Trigger & Dropdown */}
        {currentUser && (
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Open athlete profile menu"
              aria-expanded={menuOpen}
              title={currentUser.name}
              className="flex items-center justify-center p-1 rounded-xl hover:bg-slate-100 transition-colors touch-manipulation focus:outline-none"
            >
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-mono font-bold text-xs flex items-center justify-center shadow-2xs border border-slate-200">
                {getInitials(currentUser.name)}
              </div>
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200/80 py-2 z-50 animate-fadeIn">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</p>
                  <p className="text-[11px] font-mono text-slate-500 truncate mt-0.5">{currentUser.email}</p>
                </div>

                <div className="py-1">
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onSelectView?.('settings');
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:text-slate-950 hover:bg-slate-50 transition-colors text-left font-medium"
                  >
                    <Sliders className="w-3.5 h-3.5 text-slate-500" />
                    <span>Athlete Fitness Profile</span>
                  </button>
                </div>

                {/* Data Mode Toggle: Live Backend vs Demo Sample */}
                <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/70">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[11px] font-mono text-slate-500 font-medium">Data Source</span>
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                      isDemoMode 
                        ? 'bg-amber-100 text-amber-800 border border-amber-200/60' 
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200/60'
                    }`}>
                      {isDemoMode ? 'DEMO' : 'LIVE'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 p-0.5 bg-slate-200/80 rounded-lg text-[10px] font-mono">
                    <button
                      type="button"
                      onClick={() => setDemoMode(false)}
                      className={`py-1 rounded-md transition-all font-semibold ${
                        !isDemoMode
                          ? 'bg-white text-slate-900 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Live Backend
                    </button>
                    <button
                      type="button"
                      onClick={() => setDemoMode(true)}
                      className={`py-1 rounded-md transition-all font-semibold ${
                        isDemoMode
                          ? 'bg-slate-900 text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Demo Data
                    </button>
                  </div>
                </div>

                <div className="pt-1 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors text-left font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-500" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
