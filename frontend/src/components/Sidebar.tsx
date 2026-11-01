import React from 'react';
import { 
  Calendar, 
  Dumbbell, 
  MessageSquare, 
  Users, 
  BookOpen, 
  Sliders,
  LogOut,
  TrendingUp
} from 'lucide-react';
import { ViewMode } from '../types/fitness';
import { useFitness } from '../context/FitnessContext';

interface SidebarProps {
  currentView: ViewMode;
  onSelectView: (view: ViewMode) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  mobileOpen,
  onCloseMobile,
}) => {
  const { 
    totalSetsCompleted, 
    totalSetsPrescribed, 
    backendConnected,
    currentUser,
    logout,
    subscriptions,
    coaches
  } = useFitness();

  const activeSubCount = subscriptions.filter((s) => s.status === 'ACTIVE').length;

  const navItems = [
    { id: 'today' as ViewMode, label: 'Dashboard', icon: Calendar },
    { id: 'workout' as ViewMode, label: 'Workout Plan', icon: Dumbbell, badge: `${totalSetsCompleted}/${totalSetsPrescribed}` },
    { id: 'coach' as ViewMode, label: 'AI Coach', icon: MessageSquare },
    { id: 'progress' as ViewMode, label: 'Progress & Logs', icon: TrendingUp },
    { id: 'exercises' as ViewMode, label: 'Exercise Library', icon: BookOpen },
    { id: 'coaches' as ViewMode, label: 'Human Coaches', icon: Users, badge: activeSubCount > 0 ? `${activeSubCount} Active` : undefined },
    { id: 'settings' as ViewMode, label: 'Fitness Profile', icon: Sliders },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-xs md:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-200 ease-in-out md:translate-x-0 ${
          mobileOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full md:shadow-none'
        }`}
      >
        {/* Brand / Top */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-slate-900 text-white font-mono font-bold text-xs flex items-center justify-center">
              K
            </div>
            <div>
              <span className="font-semibold text-sm tracking-tight text-slate-900 block leading-tight">
                KINETIC
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                FitCoach Platform
              </span>
            </div>
          </div>
          <span 
            className={`w-2 h-2 rounded-full ${backendConnected ? 'bg-emerald-500' : 'bg-amber-400'}`} 
            title={backendConnected ? 'NestJS + PostgreSQL + FastAPI connected' : 'Connecting to API...'} 
          />
        </div>

        {/* Navigation List */}
        <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center justify-between">
            <span>Navigation</span>
            <span className="text-[9px] text-emerald-600 font-medium">
              {backendConnected ? 'PostgreSQL Live' : 'Offline'}
            </span>
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectView(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      isActive
                        ? 'bg-slate-800 text-slate-200'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Profile & Logout */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          {currentUser && (
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-semibold text-slate-700 flex-shrink-0">
                  {currentUser.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="text-left min-w-0">
                  <p className="text-xs font-semibold text-slate-900 leading-tight truncate">
                    {currentUser.name}
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">
                    {currentUser.email}
                  </p>
                </div>
              </div>

              <button
                onClick={logout}
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-white transition-colors flex-shrink-0"
                title="Log Out of Session"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
