import React, { useState, useEffect, memo } from 'react';
import { 
  ArrowRight, 
  Check, 
  Timer, 
  MessageSquare, 
  TrendingUp, 
  BookOpen,
  Layers,
  Play,
  Pause,
  RotateCcw,
  Volume2
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

type CoachQueryKey = 'progression' | 'substitution' | 'warmup' | 'nutrition';
type SplitKey = 'ppl' | 'upper_lower' | 'full_body';

// Isolated micro-component for the Rest Timer to prevent root-level re-renders
const RestClockWidget: React.FC = memo(() => {
  const [restSeconds, setRestSeconds] = useState(90);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning && restSeconds > 0) {
      interval = setInterval(() => {
        setRestSeconds((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else if (restSeconds === 0) {
      setIsRunning(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, restSeconds]);

  const toggle = () => setIsRunning((prev) => !prev);
  const reset = () => {
    setIsRunning(false);
    setRestSeconds(90);
  };

  const mins = Math.floor(restSeconds / 60);
  const secs = restSeconds % 60;
  const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  return (
    <div 
      className="p-4 sm:p-5 bg-slate-50/80 rounded-xl border border-slate-200/90 text-center space-y-3"
      aria-live="polite"
      aria-atomic="true"
    >
      <div 
        className="text-3xl sm:text-4xl font-mono font-bold text-slate-900 tracking-tight tabular-nums"
        aria-label={`${mins} minutes and ${secs} seconds remaining`}
      >
        {timeStr}
      </div>
      <div className="flex items-center justify-center gap-3 pt-1">
        <button
          type="button"
          onClick={toggle}
          aria-pressed={isRunning}
          className="min-h-[44px] min-w-[130px] px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold inline-flex items-center justify-center gap-2 transition-[background-color,box-shadow] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 shadow-xs"
        >
          {isRunning ? (
            <>
              <Pause className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Start timer</span>
            </>
          )}
        </button>
        <button
          type="button"
          onClick={reset}
          aria-label="Reset timer to 90 seconds"
          className="min-h-[44px] min-w-[44px] p-2.5 bg-white hover:bg-slate-100 text-slate-700 rounded-lg text-xs border border-slate-200 inline-flex items-center justify-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 shadow-xs"
        >
          <RotateCcw className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
});
RestClockWidget.displayName = 'RestClockWidget';

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onSignIn }) => {
  // Always lock landing page to light mode
  useEffect(() => {
    document.documentElement.classList.remove('dark');
  }, []);

  // Interactive Coach Query State (Hero)
  const [activeQuery, setActiveQuery] = useState<CoachQueryKey>('progression');
  const [set4Completed, setSet4Completed] = useState(false);

  // Interactive Split Switcher State (Bento)
  const [activeSplit, setActiveSplit] = useState<SplitKey>('ppl');

  const splitData: Record<SplitKey, { 
    name: string; 
    frequency: string; 
    desc: string; 
    schedule: string[];
    volumes: { muscle: string; sets: number; max: number }[];
  }> = {
    ppl: {
      name: 'Push / Pull / Legs (6-Day)',
      frequency: '6 days / week',
      desc: 'Optimized frequency targeting major compound movements twice weekly with high hypertrophy stimulus.',
      schedule: ['Push A', 'Pull A', 'Legs A', 'Rest', 'Push B', 'Pull B', 'Legs B'],
      volumes: [
        { muscle: 'Chest & Front Delts', sets: 16, max: 20 },
        { muscle: 'Back & Rear Delts', sets: 18, max: 20 },
        { muscle: 'Quads & Hamstrings', sets: 20, max: 22 },
        { muscle: 'Triceps & Biceps', sets: 12, max: 16 },
      ]
    },
    upper_lower: {
      name: 'Upper / Lower (4-Day)',
      frequency: '4 days / week',
      desc: 'Optimal balance of recovery and high intensity. Perfect for intermediate lifters balancing work & training.',
      schedule: ['Upper Power', 'Lower Power', 'Rest', 'Upper Hypertrophy', 'Lower Hypertrophy', 'Recovery', 'Rest'],
      volumes: [
        { muscle: 'Upper Body Press & Pull', sets: 16, max: 20 },
        { muscle: 'Lower Posterior Chain', sets: 14, max: 18 },
        { muscle: 'Quads & Calves', sets: 14, max: 18 },
        { muscle: 'Core & Stabilizers', sets: 10, max: 14 },
      ]
    },
    full_body: {
      name: 'Full Body High Frequency (3-Day)',
      frequency: '3 days / week',
      desc: 'Whole-body motor unit recruitment each session with maximum rest and recovery between training days.',
      schedule: ['Full Body A', 'Rest', 'Full Body B', 'Rest', 'Full Body C', 'Rest', 'Rest'],
      volumes: [
        { muscle: 'Horizontal Press & Row', sets: 12, max: 16 },
        { muscle: 'Squat & Hinge Patterns', sets: 14, max: 18 },
        { muscle: 'Vertical Press & Pull', sets: 10, max: 14 },
        { muscle: 'Direct Arm Work', sets: 8, max: 12 },
      ]
    }
  };

  // Interactive Progression Calculator State (Bento)
  const [selectedReps, setSelectedReps] = useState<number>(8);

  const coachResponses: Record<CoachQueryKey, { 
    question: string; 
    answer: string; 
    audioText: string;
    citation: string 
  }> = {
    progression: {
      question: 'Should I push 105 kg on set 4?',
      answer: 'Hold at 102.5 kg for set 4. You hit 8 clean reps at RPE 8.0 on set 3. Completing all 4 sets with 8 reps satisfies our mesocycle overload criterion. We advance you to 105 kg next Monday.',
      audioText: '"Keep elbows tucked 45°, drive through midfoot. Finish clean."',
      citation: 'NSCA Essentials of Strength & Conditioning, Ch. 17 (Double Progression)'
    },
    substitution: {
      question: 'Flat bench is occupied, what should I swap in?',
      answer: 'Substitute with Heavy Incline Dumbbell Press (34 kg per dumbbell, 4×8–10) or Weighted Dips. Maintain identical 90–120s rest intervals to preserve horizontal pressing volume.',
      audioText: '"Grab 34kg dumbbells on bench 3. Keep 30° incline to replicate chest load."',
      citation: 'ACSM Guidelines for Exercise Testing & Prescription (Biomechanical Equivalents)'
    },
    warmup: {
      question: 'What ramp-up sets before 102.5 kg working weight?',
      answer: 'Ramp protocol: Empty bar × 10, 60 kg × 5, 80 kg × 3, 95 kg × 1. Rest 90 seconds, then begin working set 1. Keeps neural prep optimal without pre-exhaustion.',
      audioText: '"Empty bar for 10 slow reps, focus on scapular retraction."',
      citation: 'Journal of Strength and Conditioning Research (Specific Warm-Up Protocols)'
    },
    nutrition: {
      question: 'How should I fuel around today\'s heavy session?',
      answer: 'Consume 30–40g fast carbohydrates with 25g whey protein 45 minutes prior. Post-workout target: 45g protein and 60g carbs within 2 hours.',
      audioText: '"Pre-workout logged. Hydrate with 500ml water and electrolytes now."',
      citation: 'ISSN Position Stand: Nutrient Timing & Strength Performance'
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 font-sans selection:bg-slate-900 selection:text-white flex flex-col">
      {/* 1. Accessible Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-mono font-semibold text-sm shadow-xs"
              aria-hidden="true"
            >
              F
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-semibold tracking-tight text-slate-900 text-base">FitIQ</span>
              <span className="text-xs text-slate-500 font-mono">ai coach</span>
            </div>
          </div>

          <nav 
            className="hidden md:flex items-center gap-8 text-xs font-medium text-slate-600"
            aria-label="Main Navigation"
          >
            <a href="#hero-preview" className="hover:text-slate-900 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 rounded-sm">
              Coach in action
            </a>
            <a href="#bento-features" className="hover:text-slate-900 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 rounded-sm">
              Capabilities
            </a>
            <a href="#how-it-works" className="hover:text-slate-900 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 rounded-sm">
              How coaching works
            </a>
          </nav>

          <div className="flex items-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={onSignIn}
              className="min-h-[44px] px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 rounded-lg inline-flex items-center"
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={onGetStarted}
              className="min-h-[44px] px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-[background-color,box-shadow] inline-flex items-center gap-1.5 shadow-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
            >
              <span>Get started</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Landmark Element */}
      <main className="flex-1">
        {/* 2. Hero Section: Asymmetric 2-Column Split */}
        <section 
          className="pt-12 sm:pt-16 pb-20 border-b border-slate-200/80 overflow-hidden"
          aria-labelledby="hero-heading"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
              
              {/* Left Column: Headline & Action Buttons (5 cols) */}
              <div className="lg:col-span-5 pt-2 space-y-6">
                <div className="flex items-center gap-2 text-xs font-mono text-slate-600">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" aria-hidden="true" />
                  <span>Personalized AI strength coaching</span>
                </div>

                <h1 
                  id="hero-heading"
                  className="text-3xl sm:text-5xl font-semibold tracking-tight text-slate-900 leading-[1.12]"
                >
                  An intelligent strength coach in your pocket
                </h1>

                <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl">
                  FitIQ designs your periodized split, guides working sets in the gym, calculates progressive overload, and answers questions with verified sports science literature.
                </p>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={onGetStarted}
                    className="min-h-[44px] px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-semibold inline-flex items-center justify-center gap-2 transition-[background-color,box-shadow] shadow-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
                  >
                    <span>Start coaching with FitIQ</span>
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </button>
                  <a
                    href="#bento-features"
                    className="min-h-[44px] px-4 py-3 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-medium border border-slate-200 inline-flex items-center justify-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
                  >
                    Explore capabilities
                  </a>
                </div>

                <div className="pt-4 border-t border-slate-200/80 space-y-2.5 text-xs text-slate-600 font-mono">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" aria-hidden="true" />
                    <span>24/7 training & form guidance</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" aria-hidden="true" />
                    <span>Literature-cited answers (NSCA, ACSM)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" aria-hidden="true" />
                    <span>Dynamic progressive overload</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Interactive Coach Session Card (7 cols) */}
              <div 
                id="hero-preview" 
                className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 shadow-[0_1px_3px_rgba(15,23,42,0.04),0_6px_20px_-4px_rgba(15,23,42,0.03)] ring-1 ring-slate-900/5 overflow-hidden"
              >
                {/* Session Header Bar */}
                <div className="px-5 py-3.5 border-b border-slate-200/80 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0" aria-hidden="true" />
                    <div>
                      <div className="text-xs sm:text-sm font-semibold text-slate-900">
                        Upper Body A · Hypertrophy
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        Week 4 of 8 · Mesocycle 2
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="px-2.5 py-1 bg-white rounded border border-slate-200 text-slate-700 tabular-nums">
                      Vol: 12,450 kg
                    </span>
                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded border border-emerald-200 tabular-nums inline-flex items-center gap-1.5 font-medium">
                      <Timer className="w-3.5 h-3.5 text-emerald-700" aria-hidden="true" />
                      <span>01:45</span>
                    </span>
                  </div>
                </div>

                {/* Workout Table & Interactive Cues */}
                <div className="p-4 sm:p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-semibold text-slate-500">01</span>
                      <div className="text-xs sm:text-sm font-semibold text-slate-900">Barbell Bench Press</div>
                      <span className="text-xs text-slate-500">· 4 sets · Target RPE 8.0</span>
                    </div>
                    <span className="text-[11px] font-mono text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200 font-medium">
                      {set4Completed ? 'Target met: +2.5 kg next week' : '+2.5 kg overload ready'}
                    </span>
                  </div>

                  {/* Responsive Table Wrapper */}
                  <div className="border border-slate-200/90 rounded-xl overflow-x-auto ring-1 ring-slate-900/5">
                    <table className="w-full text-left text-xs min-w-[340px]">
                      <thead className="bg-slate-50/90 border-b border-slate-200 text-slate-600 font-mono">
                        <tr>
                          <th scope="col" className="py-2.5 px-3.5 font-medium">Set</th>
                          <th scope="col" className="py-2.5 px-3.5 font-medium">Load</th>
                          <th scope="col" className="py-2.5 px-3.5 font-medium">Target</th>
                          <th scope="col" className="py-2.5 px-3.5 font-medium text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono">
                        <tr className="bg-white">
                          <td className="py-2.5 px-3.5 text-slate-600">1</td>
                          <td className="py-2.5 px-3.5 font-medium text-slate-900 tabular-nums">102.5 kg</td>
                          <td className="py-2.5 px-3.5 text-slate-700 tabular-nums">8 reps @ RPE 7.5</td>
                          <td className="py-2.5 px-3.5 text-right">
                            <span 
                              className="inline-flex items-center justify-center w-5 h-5 rounded bg-emerald-600 text-white"
                              aria-label="Set 1 completed"
                            >
                              <Check className="w-3 h-3 stroke-[2.5]" aria-hidden="true" />
                            </span>
                          </td>
                        </tr>
                        <tr className="bg-white">
                          <td className="py-2.5 px-3.5 text-slate-600">2</td>
                          <td className="py-2.5 px-3.5 font-medium text-slate-900 tabular-nums">102.5 kg</td>
                          <td className="py-2.5 px-3.5 text-slate-700 tabular-nums">8 reps @ RPE 8.0</td>
                          <td className="py-2.5 px-3.5 text-right">
                            <span 
                              className="inline-flex items-center justify-center w-5 h-5 rounded bg-emerald-600 text-white"
                              aria-label="Set 2 completed"
                            >
                              <Check className="w-3 h-3 stroke-[2.5]" aria-hidden="true" />
                            </span>
                          </td>
                        </tr>
                        <tr className="bg-white">
                          <td className="py-2.5 px-3.5 text-slate-600">3</td>
                          <td className="py-2.5 px-3.5 font-medium text-slate-900 tabular-nums">102.5 kg</td>
                          <td className="py-2.5 px-3.5 text-slate-700 tabular-nums">8 reps @ RPE 8.0</td>
                          <td className="py-2.5 px-3.5 text-right">
                            <span 
                              className="inline-flex items-center justify-center w-5 h-5 rounded bg-emerald-600 text-white"
                              aria-label="Set 3 completed"
                            >
                              <Check className="w-3 h-3 stroke-[2.5]" aria-hidden="true" />
                            </span>
                          </td>
                        </tr>
                        <tr className={set4Completed ? "bg-white" : "bg-slate-50/80"}>
                          <td className="py-2.5 px-3.5 text-slate-900 font-semibold">4</td>
                          <td className="py-2.5 px-3.5 font-semibold text-slate-900 tabular-nums">102.5 kg</td>
                          <td className="py-2.5 px-3.5 text-slate-700 tabular-nums">
                            {set4Completed ? '8 reps @ RPE 8.5' : '8 reps (active)'}
                          </td>
                          <td className="py-2.5 px-3.5 text-right">
                            <button
                              type="button"
                              onClick={() => setSet4Completed(!set4Completed)}
                              aria-pressed={set4Completed}
                              className={`min-h-[40px] px-3.5 py-1.5 rounded-lg text-xs font-sans font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 inline-flex items-center gap-1.5 ${
                                set4Completed
                                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                  : 'bg-slate-900 text-white hover:bg-slate-800'
                              }`}
                            >
                              {set4Completed ? (
                                <>
                                  <Check className="w-3.5 h-3.5" aria-hidden="true" />
                                  <span>Completed</span>
                                </>
                              ) : (
                                <span>Check Set 4</span>
                              )}
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Interactive Coach Consultation with Question Chips */}
                  <div className="pt-2 border-t border-slate-100 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-900 inline-flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-slate-700" aria-hidden="true" />
                        <span>Ask AI Coach</span>
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">Tap questions to preview response</span>
                    </div>

                    {/* Switcher Chips (44px target envelopes) */}
                    <div 
                      className="flex flex-wrap gap-2"
                      role="tablist"
                      aria-label="Coach consultation prompts"
                    >
                      {[
                        { id: 'progression', label: 'Overload Advice' },
                        { id: 'substitution', label: 'Bench Occupied' },
                        { id: 'warmup', label: 'Warm-Up Protocol' },
                        { id: 'nutrition', label: 'Pre-Workout Fuel' }
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          role="tab"
                          aria-selected={activeQuery === tab.id}
                          onClick={() => setActiveQuery(tab.id as CoachQueryKey)}
                          className={`min-h-[40px] text-xs px-3.5 py-2 rounded-lg transition-colors font-medium inline-flex items-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 ${
                            activeQuery === tab.id
                              ? 'bg-slate-900 text-white'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    {/* Dynamic Response Box */}
                    <div 
                      className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 text-xs space-y-2.5 shadow-2xs"
                      role="tabpanel"
                    >
                      <div className="text-slate-600 font-medium font-mono text-[11px]">
                        Q: "{coachResponses[activeQuery].question}"
                      </div>
                      <div className="text-slate-800 leading-relaxed font-sans">
                        {coachResponses[activeQuery].answer}
                      </div>

                      {/* Spoken Audio Cue Simulation */}
                      <div className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-slate-200 text-[11px] font-mono text-slate-600">
                        <div className="flex items-center gap-2 truncate">
                          <Volume2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" aria-hidden="true" />
                          <span className="truncate italic">{coachResponses[activeQuery].audioText}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-medium shrink-0 ml-2">Audio Cue</span>
                      </div>

                      <div className="pt-1.5 border-t border-slate-200/60 flex items-center gap-1.5 text-[10px] font-mono text-slate-500">
                        <BookOpen className="w-3 h-3 text-slate-500 shrink-0" aria-hidden="true" />
                        <span className="truncate">{coachResponses[activeQuery].citation}</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </section>

        {/* 3. Bento Grid for Capabilities */}
        <section 
          id="bento-features" 
          className="py-20 bg-slate-50 border-b border-slate-200/80"
          aria-labelledby="bento-heading"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mb-12">
              <h2 
                id="bento-heading"
                className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900"
              >
                Capabilities engineered for serious lifting
              </h2>
              <p className="text-sm text-slate-600 mt-2">
                Explore the interactive components powering FitIQ's sports science engine.
              </p>
            </div>

            {/* Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              
              {/* Bento Card 1: Interactive Split Engine & Volume Allocation (7 Cols) */}
              <div className="md:col-span-7 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-[0_1px_3px_rgba(15,23,42,0.04),0_6px_20px_-4px_rgba(15,23,42,0.03)] ring-1 ring-slate-900/5 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700"
                        aria-hidden="true"
                      >
                        <Layers className="w-3.5 h-3.5" />
                      </div>
                      <h3 className="text-sm font-semibold text-slate-900">Program Synthesis Engine</h3>
                    </div>
                    <span className="text-[11px] font-mono text-slate-500">
                      {splitData[activeSplit].frequency}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    {splitData[activeSplit].desc}
                  </p>

                  {/* Interactive Split Selector (44px target envelopes) */}
                  <div 
                    className="flex flex-wrap gap-2 mb-4"
                    role="tablist"
                    aria-label="Training split options"
                  >
                    {(['ppl', 'upper_lower', 'full_body'] as SplitKey[]).map((key) => (
                      <button
                        key={key}
                        type="button"
                        role="tab"
                        aria-selected={activeSplit === key}
                        onClick={() => setActiveSplit(key)}
                        className={`min-h-[44px] text-xs px-3.5 py-2 rounded-lg font-medium transition-colors inline-flex items-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 ${
                          activeSplit === key
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {key === 'ppl' ? 'PPL (6-Day)' : key === 'upper_lower' ? 'Upper/Lower (4-Day)' : 'Full Body (3-Day)'}
                      </button>
                    ))}
                  </div>

                  {/* Dynamic Muscle Volume Allocation Bars */}
                  <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-2.5">
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                      <span>Target Movement Pattern</span>
                      <span>Weekly Sets</span>
                    </div>

                    <div className="space-y-2">
                      {splitData[activeSplit].volumes.map((vol, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex items-center justify-between text-xs font-mono">
                            <span className="text-slate-800">{vol.muscle}</span>
                            <span className="text-emerald-700 font-semibold tabular-nums">{vol.sets} sets</span>
                          </div>
                          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className="bg-slate-900 h-full rounded-full transition-all duration-300"
                              style={{ width: `${(vol.sets / vol.max) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Schedule preview tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {splitData[activeSplit].schedule.map((item, idx) => (
                    <span
                      key={idx}
                      className={`text-[11px] px-2 py-0.5 rounded font-mono ${
                        item.toLowerCase().includes('rest')
                          ? 'bg-slate-100 text-slate-500'
                          : 'bg-white text-slate-800 border border-slate-200'
                      }`}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bento Card 2: Isolated Smart Rest Clock (5 Cols) */}
              <div className="md:col-span-5 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-[0_1px_3px_rgba(15,23,42,0.04),0_6px_20px_-4px_rgba(15,23,42,0.03)] ring-1 ring-slate-900/5 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div 
                      className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700"
                      aria-hidden="true"
                    >
                      <Timer className="w-3.5 h-3.5" />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-900">Active Gym Rest Clock</h3>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    Standardized recovery intervals ensure complete ATP resynthesis between high-load working sets.
                  </p>

                  {/* Isolated Widget */}
                  <RestClockWidget />
                </div>

                <div className="text-[11px] font-mono text-slate-500 border-t border-slate-100 pt-2 flex items-center justify-between">
                  <span>Audio cue on finish:</span>
                  <span className="text-emerald-700 font-medium">Active</span>
                </div>
              </div>

              {/* Bento Card 3: Interactive Double Progression Calculator (7 Cols) */}
              <div className="md:col-span-7 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-[0_1px_3px_rgba(15,23,42,0.04),0_6px_20px_-4px_rgba(15,23,42,0.03)] ring-1 ring-slate-900/5 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700"
                        aria-hidden="true"
                      >
                        <TrendingUp className="w-3.5 h-3.5" />
                      </div>
                      <h3 className="text-sm font-semibold text-slate-900">Double Progression Logic</h3>
                    </div>
                    <span className="text-[11px] font-mono text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200 font-medium">
                      NSCA standard
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    Weight is locked constant until you achieve the top of your rep bracket (8 reps) across all sets. Test how the coach decides:
                  </p>

                  {/* Interactive Rep Goal Trigger (44px target envelopes) */}
                  <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-700 font-medium">Repetitions completed on final set:</span>
                      <div className="flex gap-2">
                        {[6, 7, 8].map((reps) => (
                          <button
                            key={reps}
                            type="button"
                            onClick={() => setSelectedReps(reps)}
                            aria-pressed={selectedReps === reps}
                            className={`min-w-[44px] min-h-[44px] rounded-lg font-mono text-xs font-semibold inline-flex items-center justify-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 ${
                              selectedReps === reps
                                ? 'bg-slate-900 text-white'
                                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {reps}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-500">Coach action:</span>
                      <span className={selectedReps === 8 ? "text-emerald-700 font-semibold" : "text-slate-700"}>
                        {selectedReps === 8 
                          ? 'Advance load: +2.5 kg on next session' 
                          : `Hold load constant: need ${8 - selectedReps} more rep to advance`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bento Card 4: Sports Science RAG Citation Engine (5 Cols) */}
              <div className="md:col-span-5 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-[0_1px_3px_rgba(15,23,42,0.04),0_6px_20px_-4px_rgba(15,23,42,0.03)] ring-1 ring-slate-900/5 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div 
                      className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700"
                      aria-hidden="true"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-900">Literature Citations</h3>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    FitIQ never hallucinates random fitness bro-science. Every coach cue cites peer-reviewed protocols.
                  </p>

                  <div className="space-y-2 text-xs font-mono">
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80 flex items-center justify-between">
                      <span className="text-slate-800">NSCA Periodization</span>
                      <span className="text-emerald-800 text-[10px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-medium">Verified</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80 flex items-center justify-between">
                      <span className="text-slate-800">ACSM RPE Thresholds</span>
                      <span className="text-emerald-800 text-[10px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-medium">Verified</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80 flex items-center justify-between">
                      <span className="text-slate-800">Schoenfeld Hypertrophy Vol</span>
                      <span className="text-emerald-800 text-[10px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-medium">Verified</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* 4. Coaching Architecture Cycle */}
        <section 
          id="how-it-works" 
          className="py-20 bg-white border-b border-slate-200/80"
          aria-labelledby="cycle-heading"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mb-12">
              <h2 
                id="cycle-heading"
                className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900"
              >
                How your coach drives progressive overload
              </h2>
              <p className="text-sm text-slate-600 mt-2">
                From onboarding biometrics to real-time adjustments between sets.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  step: '01',
                  title: 'Biometrics & Goals',
                  desc: 'Your coach maps your training experience, schedule, joint history, and available equipment.',
                },
                {
                  step: '02',
                  title: 'Program Synthesis',
                  desc: 'Synthesizes a 3 to 6-day split with volume, sets, and rep targets built on exercise science.',
                },
                {
                  step: '03',
                  title: 'In-Gym Execution',
                  desc: 'Guides every working set with countdown rest timers, target RPE cues, and live load checks.',
                },
                {
                  step: '04',
                  title: 'Adaptive Progression',
                  desc: 'Calculates when to add weight, when to build volume, and when to prescribe a deload week.',
                }
              ].map((card, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50/80 p-5 rounded-xl border border-slate-200/90 flex flex-col justify-between shadow-2xs"
                >
                  <div>
                    <div className="text-xs font-mono text-slate-500 mb-3 font-medium">
                      Step {card.step}
                    </div>
                    <h3 className="text-sm font-semibold text-slate-900 mb-1.5">{card.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{card.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. Bottom Call to Action */}
        <section 
          className="py-16 bg-slate-900 text-white"
          aria-labelledby="cta-heading"
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5">
            <h2 
              id="cta-heading"
              className="text-2xl sm:text-3xl font-semibold tracking-tight"
            >
              Ready to train with your personal coach?
            </h2>
            <p className="text-slate-300 text-sm max-w-lg mx-auto leading-relaxed">
              Complete your athlete profile in under two minutes to receive your customized split and start coaching.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={onGetStarted}
                className="min-h-[44px] px-5 py-3 bg-white text-slate-900 hover:bg-slate-100 rounded-lg text-xs font-semibold inline-flex items-center gap-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white shadow-xs"
              >
                <span>Start training with FitIQ</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* 6. Footer */}
      <footer className="py-8 bg-white border-t border-slate-200/80 text-xs text-slate-500 font-mono">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div 
              className="w-5 h-5 rounded bg-slate-900 text-white flex items-center justify-center font-semibold text-[10px]"
              aria-hidden="true"
            >
              F
            </div>
            <span className="font-sans font-medium text-slate-800">FitIQ</span>
          </div>
          <p>© 2026 FitIQ · Evidence-based strength architecture</p>
        </div>
      </footer>
    </div>
  );
};