import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, BrainCircuit, Loader2 } from "lucide-react";
import { ChatMessage } from "../types";

interface CompanionChatProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  loading: boolean;
}

const QUICK_REPLIES = [
  "Draft an email explaining why I'm late.",
  "Write an email requesting a deadline extension.",
  "Create a 1-hour study outline for my topic.",
  "Give me absolute laser-focused motivation."
];

export default function CompanionChat({ messages, onSendMessage, loading }: CompanionChatProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !loading) {
      onSendMessage(input.trim());
      setInput("");
    }
  };

  const handleQuickReply = (text: string) => {
    if (!loading) {
      onSendMessage(text);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 flex flex-col h-[520px] bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
      {/* Companion Chat Header */}
      <div className="border-b border-gray-100 pb-3 mb-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-black text-white rounded-xl">
            <BrainCircuit className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-900 font-display">Rescue Companion</h4>
            <p className="text-[10px] text-gray-500 font-mono uppercase tracking-wider font-semibold">Active Guard Agent</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-[9px] font-mono font-bold text-gray-500 uppercase tracking-wide">Interactive Session</span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin scrollbar-thumb-gray-200">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col justify-center items-center text-center p-6 space-y-3">
            <Bot className="w-10 h-10 text-gray-400 animate-pulse" />
            <h5 className="text-xs font-bold text-gray-800">Your Empathetic Ally</h5>
            <p className="text-xs text-gray-500 max-w-sm leading-relaxed">
              Struggling with focus, or need a text draft? Chat with Panicmode.ai. We'll automatically generate structures, email drafts, schedules, and letters for you so you can bypass friction.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => {
              const isAssistant = msg.role === "assistant";
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 ${
                    isAssistant ? "justify-start" : "justify-end"
                  }`}
                >
                  {isAssistant && (
                    <div className="p-1.5 bg-gray-100 border border-gray-200 rounded-lg text-black shrink-0 mt-1">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div
                    className={`p-3 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                      isAssistant
                        ? "bg-gray-50 border border-gray-200 text-gray-800 shadow-sm"
                        : "bg-[#1A1A1B] text-white shadow-sm"
                    }`}
                  >
                    {msg.content}
                  </div>

                  {!isAssistant && (
                    <div className="p-1.5 bg-gray-100 border border-gray-200 rounded-lg text-gray-600 shrink-0 mt-1">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              );
            })}

            {loading && (
              <div className="flex items-start gap-2.5 justify-start">
                <div className="p-1.5 bg-gray-100 border border-gray-200 rounded-lg text-black shrink-0 mt-1">
                  <Bot className="w-3.5 h-3.5 animate-bounce" />
                </div>
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs text-gray-500 flex items-center gap-1.5 font-mono">
                  <Loader2 className="w-3 h-3 animate-spin text-black" />
                  <span>Formulating momentum strategy...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Quick accelerator responses */}
      <div className="mt-3 shrink-0">
        <span className="block text-[9px] font-mono uppercase text-gray-400 mb-1.5 tracking-wider font-bold">
          Friction-reducing templates:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_REPLIES.map((reply, idx) => (
            <button
              key={idx}
              onClick={() => handleQuickReply(reply)}
              disabled={loading}
              className="text-[10px] bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-400 text-gray-600 font-semibold py-1 px-2.5 rounded-full transition-all cursor-pointer disabled:opacity-40"
            >
              {reply}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="mt-4 flex items-center gap-2 shrink-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="E.g., Write the email to my math professor..."
          disabled={loading}
          className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all duration-300 font-sans"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className={`p-3 rounded-2xl transition-all ${
            input.trim() && !loading
              ? "bg-black hover:bg-gray-900 text-white shadow-sm cursor-pointer"
              : "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
          }`}
          id="companion-send-btn"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
