import React, { useState } from 'react';
import { Send, Trash2, Loader2, BookOpen } from 'lucide-react';
import { useFitness } from '../context/FitnessContext';

export const AICoachChat: React.FC = () => {
  const { chatMessages, sendChatMessage, clearChat, isChatLoading, backendConnected } = useFitness();
  const [input, setInput] = useState('');

  const quickPrompts = [
    'How do I safely apply progressive overload?',
    'What is optimal rest interval between heavy sets?',
    'Hamstrings feeling tight today, what adjustments should I make?',
    'How much protein should I consume post-workout?',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isChatLoading) return;
    const text = input.trim();
    setInput('');
    await sendChatMessage(text);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col h-[700px] max-w-4xl">
      {/* Top Bar */}
      <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              FitCoach AI Assistant
            </h3>
            <p className="text-[11px] text-slate-500 font-mono">
              PostgreSQL message history • RAG sports science library
            </p>
          </div>
        </div>

        {chatMessages.length > 0 && (
          <button
            onClick={clearChat}
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-700 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear View</span>
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {chatMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-2">
            <BookOpen className="w-8 h-8 text-slate-300" />
            <p className="text-xs font-medium text-slate-600">
              Ask your AI coach anything regarding technique, tempo, recovery, or diet.
            </p>
            <p className="text-[11px] text-slate-400 font-mono max-w-xs">
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
                <div className="flex items-center gap-2 mb-1 px-1 text-[10px] font-mono text-slate-400">
                  <span>{isUser ? 'You' : 'FitCoach AI'}</span>
                  <span>•</span>
                  <span>{msg.timestamp}</span>
                </div>
                <div
                  className={`p-3.5 rounded-xl text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-50 text-slate-800 border border-slate-200/80 shadow-2xs'
                  }`}
                >
                  <p>{msg.content}</p>

                  {/* Real RAG Source Citations from backend */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-200/70 text-[10px] font-mono text-slate-500 space-y-1">
                      <span className="font-semibold text-slate-700 block">Verified References:</span>
                      {msg.sources.map((src, sIdx) => (
                        <div key={sIdx} className="flex items-center justify-between text-slate-600 bg-white/70 px-2 py-0.5 rounded border border-slate-200/60">
                          <span className="truncate max-w-[280px]">{src.title}</span>
                          <span className="text-slate-400 font-normal ml-2">{Math.round(src.similarity_score * 100)}% match</span>
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
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono pl-1">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-600" />
            <span>Consulting verified sports science knowledge base...</span>
          </div>
        )}
      </div>

      {/* Quick Prompts */}
      <div className="px-5 py-2 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {quickPrompts.map((q, idx) => (
            <button
              key={idx}
              onClick={() => sendChatMessage(q)}
              disabled={isChatLoading}
              className="text-[11px] font-medium text-slate-600 hover:text-slate-950 bg-white border border-slate-200 hover:border-slate-300 px-2.5 py-1 rounded-md whitespace-nowrap transition-colors disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-slate-200 bg-white flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            backendConnected
              ? "Ask coach about form, recovery, RDL tempo, or post-workout fuel..."
              : "Connecting to FitCoach backend..."
          }
          disabled={isChatLoading}
          className="flex-1 px-3.5 py-2 border border-slate-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-slate-900 placeholder:text-slate-400 disabled:bg-slate-50"
        />
        <button
          type="submit"
          disabled={!input.trim() || isChatLoading}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-30 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
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
