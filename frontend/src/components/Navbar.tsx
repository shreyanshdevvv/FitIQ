import React from 'react';
import { Activity, Dumbbell, Sparkles, Users, ClipboardList, LogOut } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  user: any;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab, user, onLogout }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'plans', label: 'Workout Plans', icon: Dumbbell },
    { id: 'logger', label: 'Gym Logger', icon: ClipboardList },
    { id: 'chat', label: 'AI Assistant', icon: Sparkles },
    { id: 'coaches', label: 'Coach Marketplace', icon: Users },
  ];

  return (
    <header className="border-b border-border-subtle bg-surface/90 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentTab('dashboard')}>
          <div className="w-9 h-9 rounded-lg bg-accent-volt/10 border border-accent-volt/30 flex items-center justify-center text-accent-volt">
            <Activity className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <span className="font-bold tracking-tight text-white text-base">FITCOACH</span>
            <span className="ml-1 text-xs font-semibold px-1.5 py-0.5 rounded bg-surface-card border border-border-subtle text-accent-cyan">
              AI
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-accent-volt text-background font-semibold shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-surface-card'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* User Account / Sign Out */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end text-xs">
            <span className="font-semibold text-slate-200">{user?.name}</span>
            <span className="text-slate-400 font-mono tracking-wider text-[10px]">
              {user?.role}
            </span>
          </div>
          <button
            onClick={onLogout}
            title="Sign Out"
            className="p-2 rounded-md hover:bg-surface-card text-slate-400 hover:text-rose-400 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
