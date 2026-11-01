import React, { useState } from 'react';
import { useFitness } from '../context/FitnessContext';
import { Loader2, LogIn, UserPlus, ArrowLeft } from 'lucide-react';

interface AuthScreenProps {
  initialMode?: 'login' | 'register';
  onBackToLanding?: () => void;
  onRegisteredNewUser?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ 
  initialMode = 'login', 
  onBackToLanding,
  onRegisteredNewUser 
}) => {
  const { login, register } = useFitness();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === 'register' && password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email.trim(), password);
      } else {
        await register(email.trim(), password, name.trim() || 'Athlete');
        if (onRegisteredNewUser) {
          onRegisteredNewUser();
        }
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('alex@example.com');
    setPassword('Password123');
    setMode('login');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col justify-center items-center p-4 selection:bg-slate-200">
      <div className="w-full max-w-sm">
        {onBackToLanding && (
          <button
            onClick={onBackToLanding}
            className="flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-slate-800 mb-6 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </button>
        )}

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-9 h-9 rounded-xl bg-slate-900 text-white font-mono font-bold text-sm flex items-center justify-center mx-auto mb-2.5 shadow-xs">
            K
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            FitCoach AI
          </h1>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Personalized Sports Science Architecture
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-7 space-y-5">
          {/* Mode Switcher */}
          <div className="flex border-b border-slate-100">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              className={`flex-1 pb-2.5 text-xs font-semibold text-center transition-colors border-b-2 -mb-px ${
                mode === 'login'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError(null);
              }}
              className={`flex-1 pb-2.5 text-xs font-semibold text-center transition-colors border-b-2 -mb-px ${
                mode === 'register'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              Create Account
            </button>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-mono leading-relaxed">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            {mode === 'register' && (
              <div>
                <label className="block text-slate-700 font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Alex Johnson"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900 text-xs transition-colors"
                />
              </div>
            )}

            <div>
              <label className="block text-slate-700 font-medium mb-1">Email Address</label>
              <input
                type="email"
                required
                placeholder="athlete@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900 text-xs font-mono transition-colors"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Password</label>
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900 text-xs font-mono transition-colors"
              />
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-slate-700 font-medium mb-1">Confirm Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900 text-xs font-mono transition-colors"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 shadow-xs mt-2"
            >
              {loading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : mode === 'login' ? (
                <LogIn className="w-3.5 h-3.5" />
              ) : (
                <UserPlus className="w-3.5 h-3.5" />
              )}
              <span>{mode === 'login' ? 'Sign In to Dashboard' : 'Complete Registration'}</span>
            </button>
          </form>

          {/* Quick Demo Helper */}
          <div className="pt-3 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={handleFillDemo}
              className="text-[11px] font-mono text-slate-500 hover:text-slate-900 transition-colors underline"
            >
              Prefill Demo Credentials (alex@example.com)
            </button>
          </div>
        </div>

        {/* Minimal Footer */}
        <div className="text-center mt-5 text-[11px] font-mono text-slate-400">
          Encrypted & Secure • Athlete Member Portal
        </div>
      </div>
    </div>
  );
};
