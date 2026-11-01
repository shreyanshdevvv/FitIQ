import React, { useState } from 'react';
import { apiRequest, setAuthToken, setCurrentUser } from '../api/client';
import { ArrowRight, Lock, Mail, User as UserIcon } from 'lucide-react';

interface AuthPageProps {
  onAuthSuccess: (user: any) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<'USER' | 'COACH'>('USER');
  const [email, setEmail] = useState('athlete@fitcoach.dev');
  const [password, setPassword] = useState('Password123!');
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
          body: JSON.stringify({ email: email.trim(), password }),
        });
        setAuthToken(res.accessToken);
        setCurrentUser(res.user);
        onAuthSuccess(res.user);
      } else {
        const res = await apiRequest('/auth/register', {
          method: 'POST',
          body: JSON.stringify({ email: email.trim(), password, name: name.trim(), role }),
        });
        setAuthToken(res.accessToken);
        setCurrentUser(res.user);
        onAuthSuccess(res.user);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const setPresetUser = (presetEmail: string, presetRole: 'USER' | 'COACH') => {
    setEmail(presetEmail);
    setPassword('Password123!');
    setRole(presetRole);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-ground flex flex-col justify-center items-center p-4">
      {/* Centered Auth Card */}
      <div className="w-full max-w-sm">
        {/* Brand Header */}
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="w-8 h-8 rounded bg-text text-ground flex items-center justify-center font-mono font-bold text-sm tracking-tight mb-3">
            FC
          </div>
          <h1 className="text-xl font-semibold text-text tracking-tight">FitCoach System</h1>
          <p className="text-xs text-muted mt-1">Exercise science, periodization & intelligent coaching</p>
        </div>

        {/* Panel Form */}
        <div className="bg-surface border border-border rounded-card p-6 shadow-none">
          {/* Segmented Mode Selector */}
          <div className="grid grid-cols-2 p-1 bg-ground border border-border rounded-control mb-5">
            <button
              type="button"
              onClick={() => { setIsLogin(true); setError(null); }}
              className={`py-1.5 text-xs font-medium rounded transition-colors ${
                isLogin ? 'bg-active text-text shadow-sm' : 'text-muted hover:text-text'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setIsLogin(false); setError(null); }}
              className={`py-1.5 text-xs font-medium rounded transition-colors ${
                !isLogin ? 'bg-active text-text shadow-sm' : 'text-muted hover:text-text'
              }`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-xs font-medium text-muted mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Alex Mercer"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-ground border border-border rounded-control px-3 py-2 text-sm text-text placeholder:text-faint focus:outline-none focus:border-text transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted mb-1">Account Role</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole('USER')}
                      className={`py-1.5 text-xs font-medium rounded-control border text-center transition-colors ${
                        role === 'USER'
                          ? 'border-text bg-raised text-text font-semibold'
                          : 'border-border text-muted hover:text-text'
                      }`}
                    >
                      Athlete
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('COACH')}
                      className={`py-1.5 text-xs font-medium rounded-control border text-center transition-colors ${
                        role === 'COACH'
                          ? 'border-text bg-raised text-text font-semibold'
                          : 'border-border text-muted hover:text-text'
                      }`}
                    >
                      Certified Coach
                    </button>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-medium text-muted mb-1">Email Address</label>
              <input
                type="email"
                required
                placeholder="athlete@fitcoach.dev"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-ground border border-border rounded-control px-3 py-2 text-sm text-text placeholder:text-faint focus:outline-none focus:border-text transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-muted">Password</label>
                <span className="text-[11px] text-faint">min. 8 chars</span>
              </div>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-ground border border-border rounded-control px-3 py-2 text-sm text-text placeholder:text-faint focus:outline-none focus:border-text transition-colors"
              />
            </div>

            {error && (
              <div className="text-xs text-negative bg-negative/10 border border-negative/20 px-3 py-2 rounded-control">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-neutral-200 text-primary-ink font-medium text-xs py-2.5 rounded-control transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : isLogin ? 'Sign In' : 'Create Account'}</span>
              {!loading && <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          </form>

          {/* Quick Demo Accounts */}
          <div className="mt-6 pt-5 border-t border-border">
            <div className="text-[11px] text-faint uppercase tracking-wider mb-2 font-mono">
              Quick Test Accounts
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setPresetUser('athlete@fitcoach.dev', 'USER')}
                className="p-2 border border-border hover:border-text/40 rounded-control text-left bg-ground/50 transition-colors"
              >
                <div className="font-medium text-text truncate">Athlete</div>
                <div className="text-[10px] text-muted truncate">athlete@fitcoach.dev</div>
              </button>
              <button
                type="button"
                onClick={() => setPresetUser('coach.sarah@fitcoach.dev', 'COACH')}
                className="p-2 border border-border hover:border-text/40 rounded-control text-left bg-ground/50 transition-colors"
              >
                <div className="font-medium text-text truncate">Coach Sarah</div>
                <div className="text-[10px] text-muted truncate">coach.sarah@...</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
