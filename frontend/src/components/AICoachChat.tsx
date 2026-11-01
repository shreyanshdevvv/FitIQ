import React, { useState } from 'react';
import { Send, Trash2, Loader2, BookOpen } from 'lucide-react';
import { useFitness } from '../context/FitnessContext';
import { MarkdownContent } from './MarkdownContent';

export const AICoachChat: React.FC = () => {
  const { chatMessages, sendChatMessage, clearChat, isChatLoading, backendConnected } = useFitness();
  const [input, setInput] = useState('');

  const quickPrompts = [
    'What are my daily calories & protein for my workout split?',
    'What is optimal rest interval between heavy sets?',
    'How should I fuel before and after today’s workout?',
    'How do I safely apply progressive overload?',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isChatLoading) return;
    const text = input.trim();
    setInput('');
    await sendChatMessage(text);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden flex flex-col h-[calc(100vh-8.5rem)] min-h-[520px] max-w-4xl mx-auto w-full">
      {/* Top Bar */}
      <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse motion-reduce:animate-none" />
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              FitIQ Assistant
            </h3>
            <p className="text-[11px] text-slate-500 font-mono">
              Personalized training guidance • Sports science verified
            </p>
          </div>
        </div>

        {chatMessages.length > 0 && (
          <button
            type="button"
            onClick={clearChat}
            aria-label="Clear active conversation view"
            className="min-h-[36px] flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors px-2 py-1 rounded-lg hover:bg-slate-50 touch-manipulation"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear View</span>
          </button>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div 
        className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4"
        role="log"
        aria-live="polite"
        aria-label="Conversation messages"
      >
        {chatMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-2">
            <BookOpen className="w-8 h-8 text-slate-300 mb-1" />
            <p className="text-xs font-semibold text-slate-700">
              Ask your AI coach anything regarding technique, tempo, recovery, or diet.
            </p>
            <p className="text-[11px] text-slate-500 font-mono max-w-xs leading-relaxed">
              Every answer is synthesized against our verified sports science knowledge base.
            </p>
          </div>
        ) : (
          chatMessages.map((msg) => {
            const isUser = msg.role === 'user';

            return (
              <div
                key={msg.id}
                className={`flex flex-col max-w-xl ${isUser ? 'ml-auto items-end' : 'mr-auto items-start'}`}
              >
                <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] font-mono text-slate-500">
                  <span className="font-medium text-slate-700">{isUser ? 'You' : 'FitIQ Coach'}</span>
                  <span>•</span>
                  <span className="tabular-nums">{msg.timestamp}</span>
                </div>
                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-50 text-slate-800 border border-slate-200/80 shadow-2xs'
                  }`}
                >
                  <MarkdownContent content={msg.content} isUser={isUser} />

                  {/* Real RAG Source Citations from backend */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-200/70 text-[10px] font-mono text-slate-600 space-y-1.5">
                      <span className="font-semibold text-slate-800 block">Verified References:</span>
                      {msg.sources.map((src, sIdx) => (
                        <div key={sIdx} className="flex items-center justify-between text-slate-700 bg-white px-2.5 py-1 rounded-md border border-slate-200/80 shadow-2xs">
                          <span className="truncate max-w-[280px] font-medium">{src.title}</span>
                          <span className="text-slate-500 font-mono tabular-nums ml-2 shrink-0">{Math.round(src.similarity_score * 100)}% match</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}

        {isChatLoading && (
          <div className="flex items-center gap-2 text-xs text-slate-500 font-mono pl-1 py-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-900" />
            <span>Reviewing exercise science guidelines...</span>
          </div>
        )}
      </div>

      {/* Quick Prompts Strip */}
      <div className="px-4 sm:px-5 py-2.5 border-t border-slate-100 bg-slate-50/70 shrink-0">
        <div 
          className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5"
          role="region"
          aria-label="Quick suggested questions"
        >
          {quickPrompts.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => sendChatMessage(q)}
              disabled={isChatLoading}
              className="text-[11px] font-medium text-slate-700 hover:text-slate-950 bg-white border border-slate-200 hover:border-slate-300 px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors disabled:opacity-50 touch-manipulation shadow-2xs"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-3 sm:p-4 border-t border-slate-200 bg-white flex gap-2 shrink-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          aria-label="Ask your AI fitness coach a question"
          placeholder={
            backendConnected
              ? "Ask coach about form, recovery, RDL tempo, or post-workout fuel..."
              : "Connecting to your coach..."
          }
          disabled={isChatLoading}
          className="flex-1 min-h-[44px] px-3.5 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-slate-900 placeholder:text-slate-400 disabled:bg-slate-50"
        />
        <button
          type="submit"
          disabled={!input.trim() || isChatLoading}
          aria-label="Send message"
          className="min-h-[44px] px-5 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-30 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-2xs touch-manipulation"
        >
          {isChatLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Send className="w-3.5 h-3.5" />
          )}
          <span>Send</span>
        </button>
      </form>
    </div>
  );
};
