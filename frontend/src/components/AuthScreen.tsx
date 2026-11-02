import React, { useState, useEffect } from 'react';
import { useFitness } from '../context/FitnessContext';
import { Loader2, LogIn, UserPlus, ArrowLeft, KeyRound, Sparkles, Check } from 'lucide-react';

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
  const [copied, setCopied] = useState(false);

  // Always lock auth screen to light mode
  useEffect(() => {
    document.documentElement.classList.remove('dark');
  }, []);

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

  const handleFillDemo = async (autoSubmit = false) => {
    setEmail('demo@fitiq.ai');
    setPassword('DemoUser2026!');
    setMode('login');
    setError(null);

    if (autoSubmit) {
      setLoading(true);
      try {
        await login('demo@fitiq.ai', 'DemoUser2026!');
      } catch (err: any) {
        setError(err.message || 'Demo login failed');
        setLoading(false);
      }
    }
  };

  const handleCopyCredentials = () => {
    navigator.clipboard.writeText('Email: demo@fitiq.ai | Password: DemoUser2026!');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 flex flex-col justify-center items-center p-4 selection:bg-slate-200">
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
            F
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            FitIQ
          </h1>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Personalized Sports Science Platform
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

          {/* Recruiter & Demo Access Section */}
          <div className="pt-3 border-t border-slate-100 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-500 font-medium flex items-center gap-1">
                <KeyRound className="w-3 h-3 text-slate-600" />
                <span>Recruiter & Demo Access</span>
              </span>
              <button
                type="button"
                onClick={handleCopyCredentials}
                className="text-[10px] font-mono text-slate-400 hover:text-slate-700 transition-colors inline-flex items-center gap-1"
                title="Copy email & password"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-600">Copied</span>
                  </>
                ) : (
                  <span>Copy</span>
                )}
              </button>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] font-mono text-slate-600 space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Email:</span>
                <span className="font-semibold text-slate-800">demo@fitiq.ai</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Password:</span>
                <span className="font-semibold text-slate-800">DemoUser2026!</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleFillDemo(false)}
                className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-medium font-mono transition-colors text-center"
              >
                Fill Form
              </button>

              <button
                type="button"
                onClick={() => handleFillDemo(true)}
                disabled={loading}
                className="flex-1 py-1.5 px-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[11px] font-semibold font-mono transition-colors flex items-center justify-center gap-1 shadow-2xs"
              >
                <Sparkles className="w-3 h-3 text-slate-300" />
                <span>1-Click Sign In</span>
              </button>
            </div>
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
