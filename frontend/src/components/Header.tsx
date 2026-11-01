import React from 'react';
import { Menu, RefreshCw, LogOut, LogIn } from 'lucide-react';
import { ViewMode } from '../types/fitness';
import { useFitness } from '../context/FitnessContext';

interface HeaderProps {
  currentView: ViewMode;
  onOpenMobileSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  currentView, 
  onOpenMobileSidebar,
}) => {
  const { 
    todayBiometrics, 
    totalVolumeLifted, 
    settings, 
    resetWorkoutProgress,
    currentUser,
    logout
  } = useFitness();

  const viewTitles: Record<ViewMode, string> = {
    today: 'Today’s Overview',
    workout: 'Workout Routine',
    coach: 'AI Coaching Assistant',
    biometrics: 'Biometric Telemetry',
    nutrition: 'Nutrition & Hydration',
    settings: 'App Preferences',
  };

  const currentDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  return (
    <header className="h-14 border-b border-slate-200 bg-white px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="md:hidden p-1.5 -ml-1.5 text-slate-600 hover:text-slate-900 rounded-md hover:bg-slate-100"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-slate-900 text-sm">{viewTitles[currentView]}</span>
          <span className="text-slate-300 hidden sm:inline">•</span>
          <span className="text-slate-500 font-mono hidden sm:inline">{currentDate}</span>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs font-mono">
        <div className="hidden sm:flex items-center gap-1.5 text-slate-600">
          <span className="text-slate-400">Readiness:</span>
          <span className="font-semibold text-slate-900">{todayBiometrics.readiness}%</span>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-slate-600">
          <span className="text-slate-400">Volume:</span>
          <span className="font-semibold text-slate-900">
            {totalVolumeLifted.toLocaleString()} {settings.weightUnit}
          </span>
        </div>

        {currentView === 'workout' && (
          <button
            onClick={resetWorkoutProgress}
            className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-800 transition-colors"
            title="Reset logged sets"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset Sets</span>
          </button>
        )}

        {currentUser && (
          <button
            onClick={logout}
            className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-rose-600 px-2 py-1 rounded hover:bg-slate-50 transition-colors"
            title="Log Out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        )}
      </div>
    </header>
  );
};
