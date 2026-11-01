import React from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Dumbbell, 
  CheckCircle2, 
  BrainCircuit, 
  TrendingUp, 
  ShieldCheck, 
  Timer,
  Flame,
  Award,
  ChevronRight
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onSignIn }) => {
  return (
    <div className="min-h-screen bg-canvas text-slate-900 font-sans selection:bg-slate-900 selection:text-white">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-mono font-bold text-sm tracking-tighter shadow-xs">
              F
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-bold tracking-tight text-slate-900 text-base">FitIQ</span>
              <span className="text-[10px] font-mono text-slate-400 font-semibold uppercase">Platform</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-slate-600">
            <a href="#features" className="hover:text-slate-900 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-slate-900 transition-colors">How It Works</a>
            <a href="#science" className="hover:text-slate-900 transition-colors">Sports Science</a>
            <a href="#preview" className="hover:text-slate-900 transition-colors">Interface</a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={onSignIn}
              className="text-xs font-medium text-slate-600 hover:text-slate-900 px-3 py-2 transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={onGetStarted}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium transition-all shadow-xs"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 overflow-hidden border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200/80 text-[11px] font-mono text-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>FitIQ Platform • Evidence-Based Sports Science Engine</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-slate-900 leading-[1.1]">
            Your Fitness Journey.<br />
            <span className="text-slate-500 font-normal">Smarter with AI.</span>
          </h1>

          {/* Subheading */}
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
            Personalized workouts, intelligent fitness guidance, and meaningful progress tracking — all in one place. No gimmicks, no fake metrics.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={onGetStarted}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-semibold transition-all shadow-sm group"
            >
              <span>Start Your Free Training Plan</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <a
              href="#preview"
              className="w-full sm:w-auto flex items-center justify-center px-6 py-3.5 bg-slate-100 hover:bg-slate-200/80 text-slate-800 rounded-xl text-sm font-medium transition-colors border border-slate-200"
            >
              Explore Features
            </a>
          </div>

          {/* Trust markers */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-mono">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Grounded in NSCA & ACSM guidelines</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Real-time cloud sync</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Volume & progressive overload tracking</span>
            </div>
          </div>
        </div>
      </section>

      {/* Product Flow / How It Works */}
      <section id="how-it-works" className="py-20 bg-slate-50 border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 mb-2">
              The Architecture
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              The Science-Backed Training Loop
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Every component works in sync: from onboarding biometrics to in-gym logging and AI performance analysis.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Set Your Goals',
                desc: 'Establish your target experience, available equipment, schedule, and physical limitations.',
                tag: 'Multi-Step Onboarding'
              },
              {
                step: '02',
                title: 'Get AI Plan',
                desc: 'Our sports science engine synthesizes a personalized split matching verified exercise principles.',
                tag: 'Personalized Program Design'
              },
              {
                step: '03',
                title: 'Train & Record',
                desc: 'Execute your workout with live rest timers, set logs, and exact weight & rep tracking.',
                tag: 'Active Session Logger'
              },
              {
                step: '04',
                title: 'Analyze & Progress',
                desc: 'Receive AI weekly performance insights, volume trends, and progressive overload recommendations.',
                tag: 'Progress & Coaching'
              }
            ].map((card, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono font-bold text-slate-400">{card.step}</span>
                    <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {card.tag}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">{card.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{card.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section id="features" className="py-24 bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Engineered For Results
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Built Like Professional Coaching Software
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Combining conventional fitness tracking precision with real AI sports science intelligence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-all">
              <div className="w-10 h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center mb-4">
                <BrainCircuit className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Personalized Split Engine</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Generates complete 3 to 6-day splits (PPL, Upper/Lower, Full Body) matching your exact equipment, schedule, and target muscle groups.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-all">
              <div className="w-10 h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Evidence-Based Coaching</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Interactive sports science assistant citing verified literature on progressive overload, recovery protocols, and injury prevention.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-all">
              <div className="w-10 h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center mb-4">
                <Timer className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Active Gym Session Tracker</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Log completed weight and repetitions per set with built-in rest interval timers, execution cues, and RPE rating on finish.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interface Preview Section */}
      <section id="preview" className="py-24 bg-slate-50 border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Clean & Minimal Design
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Anti-AI Slop. Purposeful Interface.
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              High readability, structured typography, and clear action states designed for high-focus workouts.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-mono text-slate-500 uppercase">Athlete Performance • Cloud Synced</span>
              </div>
              <span className="text-xs font-mono text-slate-400">Intelligent AI Coach</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Weekly Adherence</div>
                <div className="text-2xl font-bold text-slate-900 font-mono mt-1">100%</div>
                <div className="text-xs text-emerald-600 mt-1">4 of 4 planned sessions completed</div>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Total Volume Lifted</div>
                <div className="text-2xl font-bold text-slate-900 font-mono mt-1">12,450 kg</div>
                <div className="text-xs text-slate-500 mt-1">Across 4 primary movement patterns</div>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                <div className="text-[10px] font-mono text-slate-400 uppercase">AI Coach Recommendation</div>
                <div className="text-xs font-medium text-slate-800 mt-1 line-clamp-2">
                  "Maintain weight load on bench press; target +1 rep on final set before increasing load."
                </div>
                <div className="text-[10px] font-mono text-slate-400 mt-1">Evidence-based overload cue</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Ready to upgrade your training routine?
          </h2>
          <p className="text-slate-300 text-sm max-w-xl mx-auto leading-relaxed">
            Join FitIQ today. Complete your fitness profile in under 2 minutes and let our sports science engine build your personalized routine.
          </p>
          <div className="pt-2">
            <button
              onClick={onGetStarted}
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-white text-slate-900 hover:bg-slate-100 rounded-xl text-sm font-semibold transition-all shadow-md group"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="py-8 bg-white border-t border-slate-100 text-center text-xs text-slate-400 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-slate-900 text-white flex items-center justify-center font-bold text-[10px]">
              F
            </div>
            <span>FitIQ Platform</span>
          </div>
          <p>© 2026 FitIQ. Science-grounded personal fitness architecture.</p>
        </div>
      </footer>
    </div>
  );
};
