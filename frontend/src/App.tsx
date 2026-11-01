import React, { useState } from 'react';
import { FitnessProvider, useFitness } from './context/FitnessContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { TodayOverview } from './components/TodayOverview';
import { WorkoutPlanView } from './components/WorkoutPlanView';
import { WorkoutSessionModal } from './components/WorkoutSessionModal';
import { AICoachChat } from './components/AICoachChat';
import { CoachesMarketplace } from './components/CoachesMarketplace';
import { ExerciseLibraryView } from './components/ExerciseLibraryView';
import { SettingsView } from './components/SettingsView';
import { AuthScreen } from './components/AuthScreen';
import { ViewMode } from './types/fitness';
import { Loader2 } from 'lucide-react';

const AppContent: React.FC = () => {
  const { currentUser, isAuthChecking } = useFitness();
  const [currentView, setCurrentView] = useState<ViewMode>('today');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);

  // Initial authentication check state
  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center text-slate-500 font-mono text-xs gap-3">
        <div className="w-8 h-8 rounded-lg bg-slate-900 text-white font-mono font-bold text-xs flex items-center justify-center">
          K
        </div>
        <div className="flex items-center gap-2">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-700" />
          <span>Verifying session credentials...</span>
        </div>
      </div>
    );
  }

  // If logged out: SHOW LOGIN FORM
  if (!currentUser) {
    return <AuthScreen />;
  }

  // If logged in: SHOW FULL DASHBOARD
  return (
    <div className="flex h-screen bg-[#F9FAFB] text-slate-900 font-sans antialiased overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        onSelectView={(view) => setCurrentView(view)}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Minimal Header */}
        <Header
          currentView={currentView}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
        />

        {/* Scrollable View Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {currentView === 'today' && (
            <TodayOverview
              onNavigate={(view) => setCurrentView(view)}
              onStartSession={() => setIsSessionActive(true)}
            />
          )}

          {currentView === 'workout' && (
            <WorkoutPlanView onStartSession={() => setIsSessionActive(true)} />
          )}

          {currentView === 'coach' && <AICoachChat />}

          {currentView === 'coaches' && <CoachesMarketplace />}

          {currentView === 'exercises' && <ExerciseLibraryView />}

          {currentView === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Live Session Runner Modal */}
      {isSessionActive && (
        <WorkoutSessionModal
          onClose={() => setIsSessionActive(false)}
          onFinishWorkout={() => setIsSessionActive(false)}
        />
      )}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <FitnessProvider>
      <AppContent />
    </FitnessProvider>
  );
};

export default App;
