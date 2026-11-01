import React, { useEffect, useState, useRef } from 'react';
import { apiRequest } from '../api/client';
import { Sparkles, Send, BookOpen, User, Bot, AlertCircle } from 'lucide-react';

export const ChatAssistantPage: React.FC = () => {
  const [messages, setMessages] = useState<any[]>([
    {
      role: 'assistant',
      content: 'Hello! I am FitCoach AI, powered by Google Gemini and grounded in exercise science. Ask me anything about progressive overload, form mechanics, workout programming, or nutrition recovery.',
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
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const userMessage = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await apiRequest('/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ message: text }),
      });

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: res.response,
          sources: res.sources || [],
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Sorry, I encountered an error: ${err.message}`,
          sources: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col rounded-xl bg-surface border border-border-subtle shadow-xl overflow-hidden">
      {/* Chat Header */}
      <div className="px-6 py-4 border-b border-border-subtle bg-surface-card/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-accent-cyan/10 border border-accent-cyan/30 flex items-center justify-center text-accent-cyan">
            <Sparkles className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-white text-sm">FitCoach AI Assistant</h2>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-accent-volt/10 text-accent-volt border border-accent-volt/30">
                Gemini 3.8 Flash • RAG
              </span>
            </div>
            <p className="text-xs text-slate-400">Grounded in verified sports science knowledge base</p>
          </div>
        </div>
      </div>

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {messages.map((msg, idx) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={idx}
              className={`flex gap-3.5 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-lg bg-accent-cyan/15 border border-accent-cyan/30 flex items-center justify-center text-accent-cyan shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`max-w-xl space-y-2.5 ${isUser ? 'items-end' : 'items-start'}`}>
                <div
                  className={`p-4 rounded-xl text-sm leading-relaxed whitespace-pre-wrap ${
                    isUser
                      ? 'bg-accent-volt text-background font-semibold rounded-br-none shadow-sm'
                      : 'bg-surface-card border border-border-subtle text-slate-100 rounded-bl-none shadow-md'
                  }`}
                >
                  {msg.content}
                </div>

                {/* Grounded Source Citations */}
                {!isUser && msg.sources && msg.sources.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                      <BookOpen className="w-3 h-3 text-accent-cyan" /> Grounded in:
                    </span>
                    {msg.sources.map((s: any, sIdx: number) => (
                      <span
                        key={sIdx}
                        className="px-2 py-0.5 rounded text-[10px] font-mono bg-background border border-border-subtle text-slate-300"
                      >
                        {s.source_file || s}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-lg bg-surface-card border border-border-subtle flex items-center justify-center text-slate-300 shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3.5 items-center text-slate-400 text-xs py-2">
            <div className="w-8 h-8 rounded-lg bg-accent-cyan/15 border border-accent-cyan/30 flex items-center justify-center text-accent-cyan">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <span>FitCoach AI is retrieving knowledge and reasoning with Gemini...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts Carousel */}
      <div className="px-6 py-2.5 bg-background border-t border-border-subtle flex gap-2 overflow-x-auto text-xs">
        <span className="text-slate-500 font-semibold text-[11px] self-center shrink-0">Suggested:</span>
        {[
          'How does the Double Progression model work?',
          'How much protein do I need to build muscle?',
          'How do I brace my core for back squats?',
        ].map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSend(prompt)}
            className="px-2.5 py-1 rounded-md bg-surface-card border border-border-subtle text-slate-300 hover:text-white hover:border-accent-cyan transition-colors whitespace-nowrap text-[11px]"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <div className="p-4 bg-surface border-t border-border-subtle">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Ask about programming, form cues, or nutrition..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="flex-1 px-4 py-3 rounded-lg bg-surface-card border border-border-subtle text-white text-sm focus:outline-none focus:border-accent-volt placeholder:text-slate-500 transition-colors"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="p-3 rounded-lg bg-accent-volt text-background font-bold hover:bg-accent-volt-hover disabled:opacity-40 transition-colors"
          >
            <Send className="w-4 h-4 stroke-[2.5]" />
          </button>
        </form>
      </div>
    </div>
  );
};
