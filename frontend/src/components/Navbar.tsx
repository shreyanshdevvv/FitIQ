import React, { useState } from 'react';
import {
  Activity,
  Dumbbell,
  ClipboardList,
  Sparkles,
  Users,
  LogOut,
  Menu,
  X,
  Shield,
  User as UserIcon,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  user: any;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  user,
  onLogout,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: Activity, description: 'Weekly volume & stats' },
    { id: 'plans', label: 'Workout Plans', icon: Dumbbell, description: 'Periodized training routines' },
    { id: 'logger', label: 'Active Session', icon: ClipboardList, description: 'Log sets, reps & load' },
    { id: 'chat', label: 'AI Science Assistant', icon: Sparkles, description: 'Gemini RAG over exercise science' },
    { id: 'coaches', label: 'Coach Marketplace', icon: Users, description: 'Certified coaching network' },
  ];

  const handleTabClick = (tabId: string) => {
    setCurrentTab(tabId);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Top Header (48px height as specified in taste-skill) */}
      <header className="md:hidden sticky top-0 z-40 bg-surface/90 backdrop-blur border-b border-border h-14 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded bg-text text-ground flex items-center justify-center font-mono font-semibold text-xs tracking-tight">
            FC
          </div>
          <span className="font-medium text-sm text-text tracking-tight">FitCoach</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1.5 rounded text-muted hover:text-text hover:bg-raised transition-colors"
          aria-label="Toggle Navigation"
        >
          {mobileOpen ? <X className="w-5 h-5 stroke-[1.5]" /> : <Menu className="w-5 h-5 stroke-[1.5]" />}
        </button>
      </header>

      {/* Mobile Backdrop & Drawer */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-30 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside
        className={`md:hidden fixed top-14 bottom-0 left-0 z-40 w-72 bg-surface border-r border-border p-4 flex flex-col justify-between transition-transform duration-200 ease-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="space-y-6">
          <div className="px-2 py-1.5 border border-border rounded-control bg-surface-card">
            <div className="text-xs text-muted font-medium">Signed in as</div>
            <div className="text-sm font-semibold text-text truncate">{user?.name}</div>
            <div className="text-[11px] text-faint font-mono mt-0.5">{user?.role}</div>
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-control text-sm transition-colors text-left ${
                    isActive
                      ? 'bg-active text-text font-medium'
                      : 'text-muted hover:text-text hover:bg-raised'
                  }`}
                >
                  <Icon className="w-4 h-4 stroke-[1.5]" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-control text-sm text-muted hover:text-negative hover:bg-raised transition-colors"
        >
          <LogOut className="w-4 h-4 stroke-[1.5]" />
          <span>Sign Out</span>
        </button>
      </aside>

      {/* Desktop Sidebar (240px wide, taste-skill open plane) */}
      <aside className="hidden md:flex flex-col w-60 shrink-0 border-r border-border bg-ground h-screen sticky top-0 select-none">
        {/* Workspace Brand Block */}
        <div className="p-4 pb-3 flex items-center justify-between border-b border-border/50">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded bg-text text-ground flex items-center justify-center font-mono font-bold text-xs tracking-tight">
              FC
            </div>
            <div>
              <div className="text-sm font-medium text-text leading-tight tracking-tight">FitCoach</div>
              <div className="text-[11px] text-muted leading-tight font-mono">Precision System</div>
            </div>
          </div>
          <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border border-border text-muted bg-surface-card">
            v2.4
          </span>
        </div>

        {/* User Scope Capsule */}
        <div className="mx-3 mt-3 px-3 py-2 rounded-control bg-surface border border-border/70 flex items-center justify-between">
          <div className="min-w-0 pr-2">
            <div className="text-[11px] text-muted font-medium uppercase tracking-wider">Account</div>
            <div className="text-xs font-medium text-text truncate">{user?.name}</div>
          </div>
          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
            user?.role === 'COACH' ? 'bg-amber-950/40 text-amber-300 border border-amber-900/40' : 'bg-surface-card text-muted border border-border'
          }`}>
            {user?.role}
          </span>
        </div>

        {/* Main Navigation */}
        <div className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
          <div>
            <div className="px-2 mb-2 text-[11px] font-medium text-faint uppercase tracking-wider">
              Platform
            </div>
            <nav className="space-y-0.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentTab(item.id)}
                    className={`w-full group flex items-center justify-between px-2.5 py-2 rounded-control text-sm transition-colors text-left ${
                      isActive
                        ? 'bg-active text-text font-medium'
                        : 'text-muted hover:text-text hover:bg-raised'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 stroke-[1.5] ${isActive ? 'text-text' : 'text-muted group-hover:text-text'}`} />
                      <span>{item.label}</span>
                    </div>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-muted stroke-[1.5]" />}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Bottom Utility / Sign Out */}
        <div className="p-3 border-t border-border/60">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-between px-2.5 py-2 rounded-control text-xs text-muted hover:text-negative hover:bg-raised transition-colors"
          >
            <span className="flex items-center gap-2">
              <LogOut className="w-3.5 h-3.5 stroke-[1.5]" />
              <span>Sign Out</span>
            </span>
            <span className="text-[10px] font-mono text-faint">ESC</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export const Navbar = Sidebar;
