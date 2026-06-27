import React, { useState, useEffect } from "react";
import { AlertCircle, ArrowRight, BrainCircuit, Activity } from "lucide-react";

interface TriageFormProps {
  onSubmit: (dumpText: string) => void;
  loading: boolean;
}

const PRESETS = [
  {
    label: "🔥 Imminent Implosion",
    text: "It's 8 PM. I have a math assignment due at midnight, I haven't paid my electricity bill, and I need to prep for a job interview tomorrow. I'm totally paralyzed."
  },
  {
    label: "📊 Work Inundation",
    text: "I have 14 unanswered client emails, my presentation deck is due in 3 hours and is only half done, and I haven't eaten lunch. Everyone is waiting for me."
  },
  {
    label: "🏠 Exhausted Life Chaos",
    text: "My apartment is a total disaster, my fridge is completely empty, my credit card bill was due yesterday, and I feel too overwhelmed to even get out of bed."
  }
];

const LOADING_STEPS = [
  "Silencing non-essential noise...",
  "Running triage on task deadlines...",
  "Querying schedule & locating open slots...",
  "Drafting zero-friction communications...",
  "Fending off background distractions...",
  "Securing your step-by-step rescue protocol..."
];

export default function TriageForm({ onSubmit, loading }: TriageFormProps) {
  const [dumpText, setDumpText] = useState("");
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Rotate loading thoughts when loading is true
  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev + 1) % LOADING_STEPS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [loading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (dumpText.trim()) {
      onSubmit(dumpText);
    }
  };

  const handlePresetSelect = (text: string) => {
    setDumpText(text);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-4 text-center max-w-lg mx-auto bg-[#FDFDFD]">
        <div className="relative mb-8">
          {/* Minimalist spinner */}
          <div className="absolute inset-0 border-2 border-gray-100 rounded-full scale-150 animate-ping" />
          <div className="relative bg-black text-white p-5 rounded-2xl shadow-xl">
            <div className="w-8 h-8 border-2 border-white rotate-45 animate-spin"></div>
          </div>
        </div>

        <h3 className="text-2xl font-bold font-display text-gray-900 mb-2 tracking-tight">
          Formulating Rescue Protocol
        </h3>
        
        {/* Dynamic, reassuring steps */}
        <div className="h-6 overflow-hidden mb-4">
          <p className="text-gray-500 font-mono text-xs tracking-wide animate-pulse">
            {LOADING_STEPS[currentStepIndex]}
          </p>
        </div>

        <p className="text-gray-400 text-xs max-w-sm leading-relaxed">
          Take a deep breath. Panicmode.ai is calculating the time required, querying your calendar slots, and crafting micro-steps.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 bg-[#FDFDFD]">
      {/* Friendly, comforting welcoming card */}
      <div className="bg-gray-50 border border-gray-100 rounded-3xl p-6 md:p-8 mb-8 text-center relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gray-100 rounded-full blur-3xl" />

        <div className="inline-flex items-center space-x-1.5 bg-black/5 border border-black/10 px-3 py-1 rounded-full mb-4">
          <Activity className="w-3.5 h-3.5 text-black animate-pulse" />
          <span className="text-[10px] font-mono font-bold text-black uppercase tracking-widest">Autonomous Triage</span>
        </div>

        <h2 className="text-3xl font-extrabold font-display text-gray-900 mb-3 tracking-tight">
          Overwhelmed? Let's take action.
        </h2>
        <p className="text-gray-500 text-sm max-w-lg mx-auto leading-relaxed">
          Dump everything stressing you out right now—deadlines, chores, emails, unfinished work. Panicmode.ai will automatically design your execution plan, find slots on your calendar, draft communication, and temporarily hide the clutter.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="panic-dump" className="block text-xs font-mono uppercase tracking-wider text-gray-500 mb-2 font-semibold">
            Input Your Brain Dump
          </label>
          <div className="relative">
            <textarea
              id="panic-dump"
              rows={6}
              value={dumpText}
              onChange={(e) => setDumpText(e.target.value)}
              placeholder="E.g., I've got an exam tomorrow I haven't studied for, my trash is overflowing, I haven't replied to my client, and I feel completely paralyzed..."
              className="w-full bg-white border border-gray-200 focus:border-black rounded-2xl p-4 text-gray-800 placeholder-gray-400 focus:outline-none transition-all duration-300 shadow-sm font-sans text-sm resize-none focus:ring-1 focus:ring-black"
            />
            {dumpText.trim().length > 0 && (
              <div className="absolute bottom-3 right-3 text-[10px] font-mono text-gray-400">
                {dumpText.length} characters
              </div>
            )}
          </div>
        </div>

        {/* Presets Grid */}
        <div className="space-y-2">
          <span className="block text-xs font-mono uppercase tracking-wider text-gray-500 font-semibold">
            Or Use A Quick Preset:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {PRESETS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handlePresetSelect(preset.text)}
                className="text-left bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-400 p-4 rounded-xl transition-all duration-200 group relative"
              >
                <div className="text-xs font-bold text-gray-900 mb-1 group-hover:text-black transition-colors">
                  {preset.label}
                </div>
                <div className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">
                  {preset.text}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!dumpText.trim()}
          className={`w-full py-4 px-6 rounded-2xl flex items-center justify-center font-display font-semibold transition-all duration-300 shadow-sm ${
            dumpText.trim()
              ? "bg-black hover:bg-gray-900 text-white active:scale-[0.99] cursor-pointer"
              : "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
          }`}
          id="triage-submit-btn"
        >
          <span className="mr-2">Initiate Rescue Protocol</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </form>

      {/* Trust reassurance banner */}
      <div className="mt-8 flex items-center space-x-2.5 bg-gray-50 border border-gray-100 rounded-xl p-4 text-gray-500 text-xs leading-relaxed">
        <AlertCircle className="w-4 h-4 text-gray-400 shrink-0" />
        <span>
          Panicmode.ai operates as an automated companion. By submitting, your tasks are parsed and organized server-side. Your focus and flow is our primary target.
        </span>
      </div>
    </div>
  );
}
