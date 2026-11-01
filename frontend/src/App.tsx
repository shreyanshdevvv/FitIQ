import React, { useState, useEffect } from 'react';
import { getAuthToken, getCurrentUser, removeAuthToken } from './api/client';
import { Navbar } from './components/Navbar';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { WorkoutPlanPage } from './pages/WorkoutPlanPage';
import { WorkoutLoggerPage } from './pages/WorkoutLoggerPage';
import { ChatAssistantPage } from './pages/ChatAssistantPage';
import { CoachMarketplacePage } from './pages/CoachMarketplacePage';
import { Activity, Dumbbell, ClipboardList, Sparkles, Users } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<any>(getCurrentUser());
  const [token, setToken] = useState<string | null>(getAuthToken());
  const [currentTab, setCurrentTab] = useState<string>('dashboard');

  useEffect(() => {
    // Sync user state on mount
    const savedUser = getCurrentUser();
    const savedToken = getAuthToken();
    if (savedToken && savedUser) {
      setUser(savedUser);
      setToken(savedToken);
    }
  }, []);

  const handleLogout = () => {
    removeAuthToken();
    setUser(null);
    setToken(null);
    setCurrentTab('dashboard');
  };

  const handleAuthSuccess = (authenticatedUser: any) => {
    setUser(authenticatedUser);
    setToken(getAuthToken());
  };

  if (!token || !user) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  const mobileNavItems = [
    { id: 'dashboard', label: 'Dash', icon: Activity },
    { id: 'plans', label: 'Plans', icon: Dumbbell },
    { id: 'logger', label: 'Logger', icon: ClipboardList },
    { id: 'chat', label: 'AI Chat', icon: Sparkles },
    { id: 'coaches', label: 'Coaches', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-background text-slate-100 flex flex-col font-sans pb-16 md:pb-0">
      {/* Top Header Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        user={user}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {currentTab === 'dashboard' && <DashboardPage onNavigate={setCurrentTab} />}
        {currentTab === 'plans' && <WorkoutPlanPage />}
        {currentTab === 'logger' && <WorkoutLoggerPage />}
        {currentTab === 'chat' && <ChatAssistantPage />}
        {currentTab === 'coaches' && <CoachMarketplacePage />}
      </main>

      {/* Mobile Sticky Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface/95 backdrop-blur border-t border-border-subtle z-50 px-2 py-2 flex items-center justify-around">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[11px] font-medium transition-all ${
                isActive
                  ? 'text-accent-volt font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
