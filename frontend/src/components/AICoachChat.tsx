import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Loader2, 
  BookOpen, 
  RotateCcw
} from 'lucide-react';
import { useFitness } from '../context/FitnessContext';
import { MarkdownContent } from './MarkdownContent';

export const AICoachChat: React.FC = () => {
  const { chatMessages, sendChatMessage, clearChat, isChatLoading } = useFitness();
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
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
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

  return (
    <div className="-m-4 sm:-m-6 lg:-m-8 min-h-[calc(100vh-4rem)] h-[calc(100vh-4rem)] bg-white flex flex-col overflow-hidden relative font-sans w-auto">
      
      {!hasMessages ? (
        /* CENTERED EMPTY STATE (Claude Style: Compact, Centered) */
        <div className="flex-1 overflow-y-auto w-full flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
          <div className="max-w-xl w-full mx-auto text-center space-y-5 my-auto">
            
            <div className="space-y-1.5">
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
                FitIQ Coach
              </h1>
              <p className="text-sm text-slate-500 max-w-sm mx-auto">
                Evidence-based training, overload, and nutrition guidance.
              </p>
            </div>

            {/* Compact Centered Input Box */}
            <form 
              onSubmit={handleSubmit}
              className="flex items-center gap-2 bg-white rounded-2xl border border-slate-200/90 shadow-[0_2px_8px_rgba(15,23,42,0.06),0_12px_24px_-4px_rgba(15,23,42,0.04)] ring-1 ring-slate-900/5 focus-within:ring-2 focus-within:ring-slate-900/10 focus-within:border-slate-300 transition-all p-1.5 sm:p-2 text-left"
            >
              <textarea
                ref={textareaRef}
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about programming, technique, or nutrition..."
                aria-label="Ask your AI coach a question"
                disabled={isChatLoading}
                className="flex-1 resize-none border-0 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0 bg-transparent leading-relaxed max-h-32 min-h-[40px]"
              />

              <button
                type="submit"
                disabled={!input.trim() || isChatLoading}
                aria-label="Send query"
                className="w-10 h-10 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-slate-900 text-white inline-flex items-center justify-center transition-colors shrink-0 shadow-xs focus-visible:outline-2 focus-visible:outline-slate-900"
              >
                {isChatLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Send className="w-4 h-4" aria-hidden="true" />
                )}
              </button>
            </form>

          </div>
        </div>
      ) : (
        /* CONVERSATION ACTIVE STATE: Full Width Layout with Far-Right Scrollbar */
        <div className="flex-1 flex flex-col h-full min-h-0 w-full overflow-hidden">
          
          {/* Top Row: Clean New Chat button aligned to the far right (No navbar) */}
          <div className="w-full flex items-center justify-end px-6 sm:px-8 lg:px-12 pt-3 pb-1 shrink-0 z-10">
            <button
              type="button"
              onClick={clearChat}
              aria-label="Start new conversation"
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 text-xs font-medium inline-flex items-center gap-1.5 transition-colors shadow-2xs focus-visible:outline-2 focus-visible:outline-slate-900"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
              <span>New chat</span>
            </button>
          </div>

          {/* Full-Width Single Scrollable Message Container: Scrollbar sits at the very far-right edge */}
          <div 
            className="flex-1 overflow-y-auto w-full px-6 sm:px-8 lg:px-12 py-4 space-y-6"
            role="log"
            aria-live="polite"
            aria-label="Conversation messages"
          >
            {chatMessages.map((msg) => {
              const isUser = msg.role === 'user';

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col w-full ${isUser ? 'items-end' : 'items-start'}`}
                >
                  {/* Sender Metadata */}
                  <div className="flex items-center gap-2 mb-1.5 px-1 text-xs text-slate-500">
                    <span className="font-medium text-slate-700">{isUser ? 'You' : 'FitIQ Coach'}</span>
                    <span>·</span>
                    <span className="font-mono tabular-nums text-[11px]">{msg.timestamp}</span>
                  </div>

                  <div className={`flex items-start gap-2.5 w-full ${isUser ? 'justify-end' : 'justify-start'}`}>
                    {!isUser && (
                      <div 
                        className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center font-mono font-bold text-[10px] shrink-0 mt-1 shadow-xs"
                        aria-hidden="true"
                      >
                        IQ
                      </div>
                    )}

                    {/* Message Bubble: Left-aligned for AI, Right-aligned for User */}
                    <div
                      className={`rounded-2xl text-sm leading-relaxed ${
                        isUser
                          ? 'bg-slate-900 text-white p-4 shadow-xs rounded-tr-xs max-w-xl'
                          : 'bg-white text-slate-800 p-5 rounded-tl-xs border border-slate-200/90 shadow-[0_1px_3px_rgba(15,23,42,0.04),0_6px_20px_-4px_rgba(15,23,42,0.03)] ring-1 ring-slate-900/5 w-full max-w-4xl text-left'
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

          {/* Full-Width Bottom Input Bar: Extends across the workspace */}
          <div className="border-t border-slate-100 bg-white px-6 sm:px-8 lg:px-12 py-3.5 shrink-0 w-full z-10">
            <form 
              onSubmit={handleSubmit}
              className="w-full flex items-center gap-2 bg-white rounded-2xl border border-slate-200/90 shadow-sm focus-within:ring-2 focus-within:ring-slate-900/10 focus-within:border-slate-300 transition-all p-1.5 sm:p-2"
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
                className="flex-1 resize-none border-0 px-3 py-1.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0 bg-transparent leading-relaxed max-h-32 min-h-[38px]"
              />

              <button
                type="submit"
                disabled={!input.trim() || isChatLoading}
                aria-label="Send message"
                className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-slate-900 text-white inline-flex items-center justify-center transition-colors shrink-0 shadow-xs focus-visible:outline-2 focus-visible:outline-slate-900"
              >
                {isChatLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Send className="w-4 h-4" aria-hidden="true" />
                )}
              </button>
            </form>
          </div>

        </div>
      )}

    </div>
  );
};