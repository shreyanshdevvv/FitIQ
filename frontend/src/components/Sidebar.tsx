import React, { useState } from 'react';
import { 
  Calendar, 
  Dumbbell, 
  MessageSquare, 
  Users, 
  BookOpen, 
  Sliders,
  LogOut,
  TrendingUp,
  Flame,
  PanelLeftClose,
  PanelLeftOpen
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
  } = useFitness();

  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('fitiq_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('fitiq_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  const activeSubCount = subscriptions.filter((s) => s.status === 'ACTIVE').length;

  const navItems = [
    { id: 'today' as ViewMode, label: 'Dashboard', icon: Calendar },
    { id: 'coach' as ViewMode, label: 'AI Coach', icon: MessageSquare },
    { id: 'workout' as ViewMode, label: 'Workout Plan', icon: Dumbbell, badge: `${totalSetsCompleted}/${totalSetsPrescribed}` },
    { id: 'nutrition' as ViewMode, label: 'Nutrition & Fuel', icon: Flame },
    { id: 'progress' as ViewMode, label: 'Progress & Logs', icon: TrendingUp },
    { id: 'exercises' as ViewMode, label: 'Exercise Library', icon: BookOpen },
    { id: 'coaches' as ViewMode, label: 'Human Coaches', icon: Users, badge: activeSubCount > 0 ? `${activeSubCount} Active` : undefined },
    { id: 'settings' as ViewMode, label: 'Fitness Profile', icon: Sliders },
  ];

  const getInitials = (name?: string) => {
    if (!name) return 'A';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

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
        className={`fixed md:static inset-y-0 left-0 z-50 bg-white border-r border-slate-200 flex flex-col justify-between transition-all duration-200 ease-in-out ${
          isCollapsed ? 'md:w-16' : 'md:w-64'
        } ${
          mobileOpen ? 'w-64 translate-x-0 shadow-xl' : '-translate-x-full md:translate-x-0 md:shadow-none'
        }`}
      >
        {/* Brand Header */}
        <div className={`h-14 border-b border-slate-200 flex items-center transition-all ${
          isCollapsed ? 'px-2 justify-center' : 'px-4 justify-between'
        }`}>
          {isCollapsed ? (
            <button
              type="button"
              onClick={toggleCollapse}
              title="Expand sidebar"
              aria-label="Expand sidebar"
              className="flex w-9 h-9 items-center justify-center text-slate-500 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <PanelLeftOpen className="w-4 h-4" />
            </button>
          ) : (
            <>
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-md bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-mono font-bold text-xs flex items-center justify-center shrink-0 theme-exempt shadow-2xs">
                  F
                </div>
                <span className="font-bold text-sm tracking-tight text-slate-900 leading-none">
                  FitIQ
                </span>
              </div>

              {/* Expand / Collapse Icon Button */}
              <button
                type="button"
                onClick={toggleCollapse}
                title="Collapse sidebar"
                aria-label="Collapse sidebar"
                className="flex w-7 h-7 items-center justify-center text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {/* Navigation List */}
        <div className={`flex-1 py-4 space-y-1 overflow-y-auto overflow-x-hidden ${
          isCollapsed ? 'px-2' : 'px-3'
        }`}>
          {!isCollapsed && (
            <div className="px-3 pb-2 text-[11px] font-mono text-slate-400 font-medium">
              <span>Navigation</span>
            </div>
          )}

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            return isCollapsed ? (
              /* Collapsed item with tooltip */
              <div key={item.id} className="relative group flex justify-center w-full">
                <button
                  type="button"
                  onClick={() => {
                    onSelectView(item.id);
                    onCloseMobile();
                  }}
                  className={`w-10 h-10 flex items-center justify-center rounded-xl text-xs font-medium transition-colors relative cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                  aria-label={item.label}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  {item.badge && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500" />
                  )}
                </button>

                {/* Floating Tooltip */}
                <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-slate-900 text-white text-[11px] font-medium rounded-lg whitespace-nowrap shadow-lg z-50 pointer-events-none hidden group-hover:block animate-fadeIn">
                  {item.label}
                  {item.badge && <span className="ml-1.5 text-slate-400 font-mono">({item.badge})</span>}
                </div>
              </div>
            ) : (
              /* Expanded full item */
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectView(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0 ${
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
        <div className={`border-t border-slate-100 bg-slate-50/50 transition-all ${
          isCollapsed ? 'p-2 flex flex-col items-center gap-2' : 'p-4'
        }`}>
          {currentUser && (
            isCollapsed ? (
              <div className="flex flex-col items-center gap-2 w-full">
                <div 
                  className="w-8 h-8 rounded-full bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-100 font-mono font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs border border-slate-200 dark:border-slate-700 theme-exempt"
                  title={`${currentUser.name} (${currentUser.email})`}
                >
                  {getInitials(currentUser.name)}
                </div>
                <button
                  type="button"
                  onClick={logout}
                  className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-rose-600 rounded-lg hover:bg-white transition-colors cursor-pointer"
                  title="Log Out of Session"
                  aria-label="Log Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-100 font-mono font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-2xs border border-slate-200 dark:border-slate-700 theme-exempt">
                    {getInitials(currentUser.name)}
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
                  type="button"
                  onClick={logout}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-white transition-colors flex-shrink-0 cursor-pointer"
                  title="Log Out of Session"
                  aria-label="Log Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )
          )}
        </div>
      </aside>
    </>
  );
};
