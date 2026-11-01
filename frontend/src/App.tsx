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
import { NutritionView } from './components/NutritionView';
import { ProgressAnalyticsView } from './components/ProgressAnalyticsView';
import { AuthScreen } from './components/AuthScreen';
import { LandingPage } from './components/LandingPage';
import { FitnessOnboarding } from './components/FitnessOnboarding';
import { ViewMode } from './types/fitness';
import { Loader2 } from 'lucide-react';

const AppContent: React.FC = () => {
  const { currentUser, userProfile, isAuthChecking } = useFitness();
  const [currentView, setCurrentView] = useState<ViewMode>('today');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);

  // Unauthenticated page state
  const [unauthPage, setUnauthPage] = useState<'landing' | 'auth'>('landing');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [forceOnboarding, setForceOnboarding] = useState(false);

  // Initial authentication check state
  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-canvas flex flex-col items-center justify-center text-slate-500 font-mono text-xs gap-3">
        <div className="w-9 h-9 rounded-xl bg-slate-900 text-white font-mono font-bold text-xs flex items-center justify-center shadow-xs">
          F
        </div>
        <div className="flex items-center gap-2">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-900" />
          <span>Verifying secure session credentials...</span>
        </div>
      </div>
    );
  }

  // STEP 1 & 2: If logged out, render Landing Page or Auth Screen
  if (!currentUser) {
    if (unauthPage === 'landing') {
      return (
        <LandingPage
          onGetStarted={() => {
            setAuthMode('register');
            setUnauthPage('auth');
          }}
          onSignIn={() => {
            setAuthMode('login');
            setUnauthPage('auth');
          }}
        />
      );
    }

    return (
      <AuthScreen
        initialMode={authMode}
        onBackToLanding={() => setUnauthPage('landing')}
        onRegisteredNewUser={() => setForceOnboarding(true)}
      />
    );
  }

  // STEP 3: If logged in but user has no fitness profile, show Onboarding
  if (!userProfile || forceOnboarding) {
    return (
      <FitnessOnboarding
        onComplete={() => {
          setForceOnboarding(false);
          setCurrentView('today');
        }}
      />
    );
  }

  // STEP 4+: Full Authenticated Application Shell
  return (
    <div className="flex h-screen bg-canvas text-slate-900 font-sans antialiased overflow-hidden">
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
          onSelectView={(view) => setCurrentView(view)}
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

          {currentView === 'nutrition' && <NutritionView />}

          {currentView === 'coach' && <AICoachChat />}

          {currentView === 'progress' && <ProgressAnalyticsView />}

          {currentView === 'coaches' && <CoachesMarketplace />}

          {currentView === 'exercises' && <ExerciseLibraryView />}

          {currentView === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Live Gym Session Runner Modal */}
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
