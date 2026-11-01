import React, { useState, useEffect } from 'react';
import { getAuthToken, getCurrentUser, removeAuthToken } from './api/client';
import { Sidebar } from './components/Navbar';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { WorkoutPlanPage } from './pages/WorkoutPlanPage';
import { WorkoutLoggerPage } from './pages/WorkoutLoggerPage';
import { ChatAssistantPage } from './pages/ChatAssistantPage';
import { CoachMarketplacePage } from './pages/CoachMarketplacePage';

export default function App() {
  const [user, setUser] = useState<any>(getCurrentUser());
  const [token, setToken] = useState<string | null>(getAuthToken());
  const [currentTab, setCurrentTab] = useState<string>('dashboard');

  useEffect(() => {
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

  return (
    <div className="min-h-screen bg-ground text-text flex flex-col md:flex-row font-sans selection:bg-surface-card selection:text-text">
      {/* Precision Open-Plane Sidebar */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        user={user}
        onLogout={handleLogout}
      />

      {/* Main Canvas with Fluid Width */}
      <main className="flex-1 min-w-0 flex flex-col h-screen overflow-y-auto">
        <div className="flex-1 max-w-6xl w-full mx-auto p-5 sm:p-8">
          {currentTab === 'dashboard' && <DashboardPage onNavigate={setCurrentTab} />}
          {currentTab === 'plans' && <WorkoutPlanPage />}
          {currentTab === 'logger' && <WorkoutLoggerPage />}
          {currentTab === 'chat' && <ChatAssistantPage />}
          {currentTab === 'coaches' && <CoachMarketplacePage />}
        </div>
      </main>
    </div>
  );
}
