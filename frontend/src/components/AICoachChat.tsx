import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Loader2, 
  BookOpen, 
  RotateCcw,
  Timer, 
  Dumbbell, 
  Activity, 
  Apple
} from 'lucide-react';
import { useFitness } from '../context/FitnessContext';
import { MarkdownContent } from './MarkdownContent';

interface StarterPrompt {
  title: string;
  query: string;
  icon: React.ReactNode;
  category: string;
}

export const AICoachChat: React.FC = () => {
  const { chatMessages, sendChatMessage, clearChat, isChatLoading, backendConnected } = useFitness();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const hasMessages = chatMessages.length > 0;

  // Auto-scroll to latest message when conversation updates
  useEffect(() => {
    if (hasMessages) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isChatLoading, hasMessages]);

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [input]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isChatLoading) return;
    const text = input.trim();
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    await sendChatMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handlePromptClick = async (promptQuery: string) => {
    if (isChatLoading) return;
    await sendChatMessage(promptQuery);
  };

  // Starter prompts with uniform monochrome icons
  const starterPrompts: StarterPrompt[] = [
    {
      title: 'Double Progression',
      query: 'How do I safely apply double progression to my compound bench press?',
      icon: <Dumbbell className="w-4 h-4 text-slate-700" />,
      category: 'Overload Rule'
    },
    {
      title: 'Rest Interval Science',
      query: 'What is the scientifically optimal rest interval between heavy compound squats?',
      icon: <Timer className="w-4 h-4 text-slate-700" />,
      category: 'Physiology'
    },
    {
      title: 'Exercise Substitution',
      query: 'My shoulder feels tight on flat bench. What biomechanically equivalent exercise should I swap in?',
      icon: <Activity className="w-4 h-4 text-slate-700" />,
      category: 'Technique'
    },
    {
      title: 'Nutrient Timing',
      query: 'What should my pre- and post-workout nutrition look like for maximum muscle protein synthesis?',
      icon: <Apple className="w-4 h-4 text-slate-700" />,
      category: 'Nutrition'
    }
  ];

  return (
    <div className="-m-4 sm:-m-6 lg:-m-8 min-h-[calc(100vh-4rem)] h-[calc(100vh-4rem)] bg-white flex flex-col overflow-hidden relative font-sans">
      
      {/* 1. Header Navigation Bar */}
      <header className="h-14 border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between bg-white/90 backdrop-blur-md shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div 
            className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-mono font-bold text-xs shadow-xs"
            aria-hidden="true"
          >
            IQ
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900 text-xs sm:text-sm">FitIQ Coach</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" aria-hidden="true" />
              <span className="text-xs text-slate-500">
                {backendConnected ? 'Sports science engine active' : 'Connecting to coach...'}
              </span>
            </div>
          </div>
        </div>

        {hasMessages && (
          <button
            type="button"
            onClick={clearChat}
            aria-label="Start new conversation"
            className="min-h-[36px] px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-xs font-medium inline-flex items-center gap-1.5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
            <span>New chat</span>
          </button>
        )}
      </header>

      {/* 2. Main Content Body */}
      {!hasMessages ? (
        /* CENTERED EMPTY STATE (Claude Style - Unslopped) */
        <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
          <div className="max-w-2xl w-full mx-auto text-center space-y-8 my-auto">
            {/* Branded Identity - No Sparkle Badge */}
            <div className="space-y-3">
              <div 
                className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center mx-auto font-mono font-bold text-base shadow-sm"
                aria-hidden="true"
              >
                IQ
              </div>
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
                FitIQ Strength & Conditioning Assistant
              </h1>
              <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                Exercise prescriptions, progressive overload calculations, and technique guidance synthesized against verified sports science literature.
              </p>
            </div>

            {/* Claude-Style Centered Input Box */}
            <form 
              onSubmit={handleSubmit}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_2px_8px_rgba(15,23,42,0.06),0_12px_32px_-4px_rgba(15,23,42,0.04)] ring-1 ring-slate-900/5 focus-within:ring-2 focus-within:ring-slate-900/10 focus-within:border-slate-300 transition-all p-3 text-left space-y-2"
            >
              <textarea
                ref={textareaRef}
                rows={2}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask your coach anything about programming, technique, or nutrition..."
                aria-label="Ask your AI coach a question"
                disabled={isChatLoading}
                className="w-full resize-none border-0 p-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0 bg-transparent leading-relaxed max-h-40 min-h-[52px]"
              />

              <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                <div className="text-xs text-slate-500 pl-1 hidden sm:block">
                  Press <kbd className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-mono text-[11px]">Enter</kbd> to send
                </div>

                <button
                  type="submit"
                  disabled={!input.trim() || isChatLoading}
                  aria-label="Send query"
                  className="min-h-[44px] px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-slate-900 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition-colors ml-auto shadow-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
                >
                  {isChatLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                  ) : (
                    <Send className="w-3.5 h-3.5" aria-hidden="true" />
                  )}
                  <span>Send</span>
                </button>
              </div>
            </form>

            {/* Quick Starter Prompts */}
            <div className="space-y-2.5 pt-2">
              <div className="text-xs font-medium text-slate-500">Suggested consultations</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left">
                {starterPrompts.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handlePromptClick(item.query)}
                    className="p-3.5 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 hover:border-slate-300 text-left transition-[background-color,border-color] shadow-2xs group focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="p-1.5 rounded-md bg-slate-100 shrink-0" aria-hidden="true">
                        {item.icon}
                      </div>
                      <span className="text-xs font-semibold text-slate-900 group-hover:text-black">
                        {item.title}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {item.query}
                    </p>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      ) : (
        /* CONVERSATION ACTIVE STATE: Messages Top-to-Bottom, Input Docked at Bottom */
        <div className="flex-1 overflow-y-auto flex flex-col justify-between">
          {/* Scrollable Message History Area */}
          <div 
            className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 max-w-3xl mx-auto w-full"
            role="log"
            aria-live="polite"
            aria-label="Conversation messages"
          >
            {chatMessages.map((msg) => {
              const isUser = msg.role === 'user';

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end ml-8' : 'items-start mr-8'}`}
                >
                  {/* Sender Metadata Bar */}
                  <div className="flex items-center gap-2 mb-1.5 px-1 text-xs text-slate-500">
                    <span className="font-medium text-slate-700">{isUser ? 'You' : 'FitIQ Coach'}</span>
                    <span>·</span>
                    <span className="font-mono tabular-nums text-[11px]">{msg.timestamp}</span>
                  </div>

                  <div className="flex items-start gap-2.5 w-full">
                    {!isUser && (
                      <div 
                        className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center font-mono font-bold text-[10px] shrink-0 mt-1 shadow-xs"
                        aria-hidden="true"
                      >
                        IQ
                      </div>
                    )}

                    {/* Message Bubble Container */}
                    <div
                      className={`rounded-2xl text-sm leading-relaxed ${
                        isUser
                          ? 'bg-slate-900 text-white p-4 shadow-xs rounded-tr-xs max-w-xl ml-auto'
                          : 'bg-white text-slate-800 p-5 rounded-tl-xs border border-slate-200/90 shadow-[0_1px_3px_rgba(15,23,42,0.04),0_6px_20px_-4px_rgba(15,23,42,0.03)] ring-1 ring-slate-900/5 max-w-2xl w-full'
                      }`}
                    >
                      <MarkdownContent content={msg.content} isUser={isUser} />

                      {/* Verified Scientific Literature Citations */}
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="mt-4 pt-3.5 border-t border-slate-100 text-xs space-y-2">
                          <div className="flex items-center gap-1.5 text-slate-700 font-semibold text-xs">
                            <BookOpen className="w-3.5 h-3.5 text-emerald-700" aria-hidden="true" />
                            <span>Verified scientific citations</span>
                          </div>

                          <div className="space-y-1.5">
                            {msg.sources.map((src, sIdx) => (
                              <div 
                                key={sIdx} 
                                className="flex items-center justify-between gap-3 text-slate-700 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200/80 text-xs"
                              >
                                <span className="truncate font-medium text-slate-800">{src.title}</span>
                                <span className="text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded text-[11px] font-mono font-semibold shrink-0 border border-emerald-200 tabular-nums">
                                  {Math.round(src.similarity_score * 100)}% match
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* AI Synthesizing State Indicator */}
            {isChatLoading && (
              <div className="flex items-center gap-2.5 text-xs text-slate-600 py-2 pl-2">
                <Loader2 className="w-4 h-4 animate-spin text-slate-900" aria-hidden="true" />
                <span>Reviewing sports science literature & biomechanics...</span>
              </div>
            )}

            <div ref={messagesEndRef} className="h-4" />
          </div>

          {/* DOCKED BOTTOM INPUT BAR (Claude Style) */}
          <div className="border-t border-slate-200/70 bg-gradient-to-t from-white via-white to-white/95 p-4 sm:pb-6 sm:px-6 shrink-0 z-10">
            <div className="max-w-3xl mx-auto w-full">
              <form 
                onSubmit={handleSubmit}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_2px_8px_rgba(15,23,42,0.06),0_12px_24px_-4px_rgba(15,23,42,0.04)] ring-1 ring-slate-900/5 focus-within:ring-2 focus-within:ring-slate-900/10 focus-within:border-slate-300 transition-all p-3 space-y-2"
              >
                <textarea
                  ref={textareaRef}
                  rows={1}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask a follow-up or consult your coach..."
                  aria-label="Ask your AI coach a question"
                  disabled={isChatLoading}
                  className="w-full resize-none border-0 p-1.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0 bg-transparent leading-relaxed max-h-36 min-h-[44px]"
                />

                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                  <div className="text-xs text-slate-500 pl-1 hidden sm:block">
                    Press <kbd className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-mono text-[11px]">Enter</kbd> to send · <kbd className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-mono text-[11px]">Shift+Enter</kbd> for line break
                  </div>

                  <button
                    type="submit"
                    disabled={!input.trim() || isChatLoading}
                    aria-label="Send message"
                    className="min-h-[44px] px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-slate-900 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition-colors ml-auto shadow-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
                  >
                    {isChatLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                    ) : (
                      <Send className="w-3.5 h-3.5" aria-hidden="true" />
                    )}
                    <span>Send</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};