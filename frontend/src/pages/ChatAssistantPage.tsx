import React, { useEffect, useState, useRef } from 'react';
import { apiRequest } from '../api/client';
import { Sparkles, Send, BookOpen, Bot, User, ArrowUp } from 'lucide-react';

export const ChatAssistantPage: React.FC = () => {
  const [messages, setMessages] = useState<any[]>([
    {
      role: 'assistant',
      content:
        'FitCoach AI research assistant ready. I am grounded directly in empirical sports science literature (progressive overload mechanics, periodization schemes, recovery nutrition, and exercise safety). What would you like to examine?',
      sources: [],
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const queryText = (textToSend || input).trim();
    if (!queryText || loading) return;

    const userMsg = { role: 'user', content: queryText };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await apiRequest('/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ question: queryText }),
      });

      const assistantMsg = {
        role: 'assistant',
        content: res.answer || res.reply || 'Analysis completed.',
        sources: res.sources || res.citations || [],
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Inference failed: ${err.message || 'Unable to contact AI microservice.'}`,
          sources: [],
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const promptSuggestions = [
    'How should I apply progressive overload to break a squat plateau?',
    'What is the optimal weekly set volume per muscle group?',
    'Explain post-exercise muscle protein synthesis and timing.',
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] max-w-4xl mx-auto space-y-4">
      {/* Title Row */}
      <div className="flex items-center justify-between border-b border-border pb-3 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight text-text">Sports Science AI</h1>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-raised border border-border text-muted">
              pgvector RAG
            </span>
          </div>
          <p className="text-xs text-muted mt-0.5">
            Vector embeddings over sports science corpus powered by Gemini 3.8 Flash
          </p>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {messages.map((msg, index) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={index}
              className={`flex gap-3 text-xs leading-relaxed ${
                isUser ? 'justify-end' : 'justify-start'
              }`}
            >
              {!isUser && (
                <div className="w-6 h-6 rounded bg-text text-ground flex items-center justify-center font-mono font-bold text-[10px] shrink-0 mt-0.5">
                  AI
                </div>
              )}

              <div
                className={`max-w-2xl rounded-card p-4 space-y-2.5 ${
                  isUser
                    ? 'bg-raised border border-border text-text'
                    : msg.isError
                    ? 'bg-negative/10 border border-negative/20 text-negative'
                    : 'bg-surface border border-border text-text/95'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>

                {/* Grounded RAG Citations */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="pt-2.5 mt-2 border-t border-border/60">
                    <div className="flex items-center gap-1.5 text-[10px] text-faint uppercase font-mono tracking-wider mb-1.5">
                      <BookOpen className="w-3 h-3" />
                      <span>Retrieved Science Sources</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.sources.map((src: any, sIdx: number) => {
                        const title = typeof src === 'string' ? src : src.title || src.document || 'Corpus';
                        const score = src.similarity ? Math.round(src.similarity * 100) : null;
                        return (
                          <span
                            key={sIdx}
                            className="text-[11px] font-mono px-2 py-0.5 rounded bg-ground border border-border text-muted flex items-center gap-1"
                          >
                            <span>{title}</span>
                            {score && <span className="text-faint text-[10px] font-normal">({score}%)</span>}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {isUser && (
                <div className="w-6 h-6 rounded bg-raised border border-border text-muted flex items-center justify-center text-[10px] font-mono shrink-0 mt-0.5">
                  U
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3 text-xs">
            <div className="w-6 h-6 rounded bg-text text-ground flex items-center justify-center font-mono font-bold text-[10px] shrink-0">
              AI
            </div>
            <div className="p-3 bg-surface border border-border rounded-card text-muted flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="font-mono text-[11px]">Querying pgvector & synthesizing literature...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 shrink-0">
        <span className="text-[10px] font-mono uppercase text-faint shrink-0 mr-1">
          Inquiry:
        </span>
        {promptSuggestions.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            disabled={loading}
            className="text-[11px] text-muted hover:text-text px-2.5 py-1 rounded-control bg-surface border border-border hover:border-text/30 transition-colors whitespace-nowrap shrink-0 disabled:opacity-40"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="shrink-0 relative"
      >
        <input
          type="text"
          placeholder="Ask about volume thresholds, periodization, recovery..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          className="w-full bg-surface border border-border rounded-card pl-4 pr-12 py-3 text-xs text-text placeholder:text-faint focus:outline-none focus:border-text transition-colors shadow-none"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="absolute right-2 top-2 p-1.5 bg-primary text-primary-ink hover:bg-neutral-200 rounded-control transition-colors disabled:opacity-30 disabled:pointer-events-none"
          title="Send query"
        >
          <ArrowUp className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
