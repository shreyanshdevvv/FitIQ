import React, { useState } from 'react';
import { apiRequest, setAuthToken, setCurrentUser } from '../api/client';
import { Activity, ShieldCheck, User, Sparkles } from 'lucide-react';

interface AuthPageProps {
  onAuthSuccess: (user: any) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<'USER' | 'COACH'>('USER');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        const res = await apiRequest('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });
        setAuthToken(res.accessToken);
        setCurrentUser(res.user);
        onAuthSuccess(res.user);
      } else {
        const res = await apiRequest('/auth/register', {
          method: 'POST',
          body: JSON.stringify({ email, password, name, role }),
        });
        setAuthToken(res.accessToken);
        setCurrentUser(res.user);
        onAuthSuccess(res.user);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background selection:bg-accent-volt selection:text-black">
      <div className="w-full max-w-md bg-surface border border-border-subtle rounded-xl p-8 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex w-12 h-12 rounded-xl bg-accent-volt/10 border border-accent-volt/30 items-center justify-center text-accent-volt mb-3">
            <Activity className="w-6 h-6 stroke-[2.5]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">FITCOACH AI</h1>
          <p className="text-sm text-slate-400 mt-1">Applied AI Personal Training & Coaching Platform</p>
        </div>

        {/* Tab Toggle: Login vs Register */}
        <div className="grid grid-cols-2 p-1 bg-background/80 rounded-lg border border-border-subtle mb-6 text-sm">
          <button
            type="button"
            onClick={() => { setIsLogin(true); setError(null); }}
            className={`py-2 rounded font-medium transition-colors ${
              isLogin ? 'bg-surface-card text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsLogin(false); setError(null); }}
            className={`py-2 rounded font-medium transition-colors ${
              !isLogin ? 'bg-surface-card text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-md bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              {/* Role Selector */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Account Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('USER')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-lg border text-sm font-medium transition-all ${
                      role === 'USER'
                        ? 'border-accent-volt bg-accent-volt/10 text-white font-semibold'
                        : 'border-border-subtle bg-surface-card text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    <User className="w-4 h-4 text-accent-volt" />
                    Athlete
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('COACH')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-lg border text-sm font-medium transition-all ${
                      role === 'COACH'
                        ? 'border-accent-cyan bg-accent-cyan/10 text-white font-semibold'
                        : 'border-border-subtle bg-surface-card text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 text-accent-cyan" />
                    Coach
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Mercer"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-surface-card border border-border-subtle text-white text-sm focus:outline-none focus:border-accent-volt transition-colors"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="athlete@fitcoach.dev"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg bg-surface-card border border-border-subtle text-white text-sm focus:outline-none focus:border-accent-volt transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg bg-surface-card border border-border-subtle text-white text-sm focus:outline-none focus:border-accent-volt transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-lg bg-accent-volt hover:bg-accent-volt-hover text-background font-bold text-sm tracking-wide transition-all shadow-md hover:shadow-lg disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : isLogin ? 'Sign In to Dashboard' : 'Register & Start Training'}
          </button>
        </form>

        {/* Quick Demo Credentials Helper */}
        <div className="mt-8 pt-6 border-t border-border-subtle text-xs text-slate-400">
          <p className="font-semibold text-slate-300 mb-1">Quick Demo Credentials:</p>
          <div className="flex justify-between items-center bg-background/80 p-2 rounded border border-border-subtle font-mono text-[11px]">
            <span>athlete@fitcoach.dev</span>
            <button
              onClick={() => { setEmail('athlete@fitcoach.dev'); setPassword('securePassword123'); }}
              className="text-accent-volt hover:underline"
            >
              Fill Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
