import React, { useState, useEffect } from "react";
import { 
  Play, Pause, RotateCcw, HelpCircle, 
  Copy, Check, Send, ChevronRight, CornerDownRight, Lightbulb, Activity, ArrowRight, Loader2,
  Calendar, Mail, Bell, ShieldAlert, CheckCircle2, Circle
} from "lucide-react";
import { TargetTask, StuckResponse } from "../types";

interface FocusZoneProps {
  target: TargetTask;
  assessment: string;
  handoffMessage: string;
  onStepComplete: () => void;
  onTargetFullyComplete: () => void;
  onStuckResolve: (blockReason: string) => Promise<StuckResponse>;
  isEmergencyMode?: boolean;
}

export default function FocusZone({
  target,
  assessment,
  handoffMessage,
  onStepComplete,
  onTargetFullyComplete,
  onStuckResolve,
  isEmergencyMode = false
}: FocusZoneProps) {
  const [timeLeft, setTimeLeft] = useState(300); // 5 mins
  const [timerActive, setTimerActive] = useState(false);
  const [selectedSprint, setSelectedSprint] = useState(300);
  const [copied, setCopied] = useState(false);

  // Keyboard done trigger input
  const [doneInput, setDoneInput] = useState("");

  // Stuck state
  const [showStuckModal, setShowStuckModal] = useState(false);
  const [stuckReason, setStuckReason] = useState("");
  const [stuckResponse, setStuckResponse] = useState<StuckResponse | null>(null);
  const [loadingStuck, setLoadingStuck] = useState(false);

  // Proactive integrations simulated triggers
  const [calendarSynced, setCalendarSynced] = useState(true);
  const [reminderSet, setReminderSet] = useState(true);

  // Reset timer on change
  const selectSprintPreset = (seconds: number) => {
    setSelectedSprint(seconds);
    setTimeLeft(seconds);
    setTimerActive(false);
  };

  useEffect(() => {
    let interval: any = null;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleCopyDraft = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const submitStuckBlock = async () => {
    setLoadingStuck(true);
    try {
      const res = await onStuckResolve(stuckReason || "Unable to start or feeling deep mental fatigue.");
      setStuckResponse(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingStuck(false);
    }
  };

  const closeStuckFlow = () => {
    setShowStuckModal(false);
    setStuckReason("");
    setStuckResponse(null);
  };

  const handleHandoffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (doneInput.trim().toLowerCase() === "done") {
      setDoneInput("");
      triggerNextStep();
    } else {
      // General feedback or direct action
      triggerNextStep();
    }
  };

  const triggerNextStep = () => {
    if (target.currentStepIndex + 1 === target.microSteps.length) {
      onTargetFullyComplete();
    } else {
      onStepComplete();
    }
  };

  const progressPercentage = Math.round(
    (target.currentStepIndex / target.microSteps.length) * 100
  );

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-12 py-8 space-y-8 bg-[#FDFDFD] text-[#1A1A1B]">
      
      {/* Assessment validation line */}
      <div>
        <p className="text-xs uppercase tracking-wider text-gray-400 font-bold font-mono mb-1">
          The Assessment
        </p>
        <h2 className="text-xl md:text-2xl font-normal text-gray-800 leading-snug font-sans max-w-3xl">
          &ldquo;{assessment}&rdquo;
        </h2>
      </div>

      {/* Main Focus Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Side: The Target Card (Charcoal Block) */}
        <div className="lg:col-span-7 bg-[#1A1A1B] text-white rounded-3xl p-8 md:p-10 shadow-xl flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl" />
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="inline-block px-3 py-1 bg-white/10 rounded-full text-[10px] uppercase tracking-widest font-bold">
                The Target
              </span>
              {isEmergencyMode && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-red-600 rounded-full text-[10px] font-bold uppercase tracking-wider animate-pulse">
                  <ShieldAlert className="w-3 h-3" /> Emergency Speed
                </span>
              )}
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl md:text-5xl font-light leading-tight tracking-tight italic font-serif text-white">
                {target.title}
              </h1>
              <p className="text-gray-400 text-sm leading-relaxed max-w-md">
                Reason: {target.urgencyReason}
              </p>
            </div>
          </div>

          {/* Proactive Tools Log inside Target card */}
          <div className="mt-8 border-t border-white/10 pt-6 space-y-4">
            <span className="block text-[10px] font-mono text-gray-500 uppercase tracking-widest font-bold">
              Background Operations Autonomously Triggered
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* Calendar Block Trigger */}
              <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-xl p-3 text-xs">
                <Calendar className={`w-4 h-4 shrink-0 ${calendarSynced ? "text-green-400" : "text-gray-400"}`} />
                <div className="min-w-0">
                  <p className="font-semibold text-gray-200 truncate">Google Calendar Slot</p>
                  <p className="text-[10px] text-gray-400 font-mono">Blocked off 1.5 Hours</p>
                </div>
              </div>

              {/* Reminder Trigger */}
              <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-xl p-3 text-xs">
                <Bell className={`w-4 h-4 shrink-0 ${reminderSet ? "text-green-400" : "text-gray-400"}`} />
                <div className="min-w-0">
                  <p className="font-semibold text-gray-200 truncate">Focus Guard Lock</p>
                  <p className="text-[10px] text-gray-400 font-mono">Active reminder set</p>
                </div>
              </div>

            </div>
          </div>

          <div className="mt-8 pt-4">
            <div className="flex items-center gap-4 text-xs text-gray-400 font-mono">
              <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <span>Step {target.currentStepIndex + 1} of {target.microSteps.length}</span>
            </div>
          </div>
        </div>

        {/* Right Side: The Execution Plan (Sleek List) */}
        <div className="lg:col-span-5 bg-white border border-gray-100 rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-sm">
          <div>
            <span className="text-xs uppercase tracking-widest font-bold text-gray-400 block mb-6 font-mono">
              The Execution Plan
            </span>

            <ul className="space-y-6">
              {target.microSteps.map((step, idx) => {
                const isCompleted = idx < target.currentStepIndex;
                const isActive = idx === target.currentStepIndex;

                return (
                  <li 
                    key={idx}
                    className={`flex gap-4 items-start transition-all duration-300 ${
                      isActive ? "opacity-100" : "opacity-30"
                    }`}
                  >
                    <button
                      disabled={!isActive && !isCompleted}
                      onClick={() => {
                        if (isActive) triggerNextStep();
                      }}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-1 transition-all ${
                        isCompleted 
                          ? "border-green-500 bg-green-500 text-white" 
                          : isActive 
                          ? "border-black bg-black text-white hover:bg-gray-800" 
                          : "border-gray-300"
                      }`}
                      id={`step-check-btn-${idx}`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : isActive ? (
                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                      ) : null}
                    </button>
                    <div>
                      <p className={`font-semibold text-base text-gray-900 ${isCompleted ? "line-through text-gray-400" : ""}`}>
                        {step}
                      </p>
                      <p className="text-gray-500 text-xs mt-0.5">
                        {isActive ? "Active immediate focus point." : isCompleted ? "Successfully completed." : "On hold."}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Friction-Reduction Assistant block */}
          {target.helperDraft ? (
            <div className="mt-8 p-5 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-mono font-bold text-gray-400 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-black" /> Proactive Draft Created
                </span>
                <button
                  onClick={() => handleCopyDraft(target.helperDraft || "")}
                  className="text-[10px] text-gray-500 hover:text-black font-semibold flex items-center gap-1 transition-colors"
                  id="copy-helper-draft"
                >
                  {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? "Copied" : "Copy Draft"}</span>
                </button>
              </div>
              <p className="text-xs text-gray-500 mb-3 leading-relaxed">
                We've auto-crafted this email/message to eliminate friction. Just hit copy, paste, and send:
              </p>
              <div className="bg-white border border-gray-100 rounded-xl p-3 max-h-24 overflow-y-auto">
                <pre className="text-[11px] font-mono text-gray-700 whitespace-pre-wrap leading-relaxed select-all">
                  {target.helperDraft}
                </pre>
              </div>
            </div>
          ) : (
            <div className="mt-8 p-4 bg-gray-50 rounded-2xl border border-gray-100/50 flex items-center gap-2.5">
              <Lightbulb className="w-4 h-4 text-gray-400" />
              <p className="text-[11px] text-gray-400 italic">
                No draft required for this step. Use the handoff below once done.
              </p>
            </div>
          )}

          {/* Action trigger links */}
          <div className="mt-6 flex items-center justify-between gap-3">
            <button
              onClick={() => setShowStuckModal(true)}
              className="text-xs text-gray-500 hover:text-black font-semibold font-mono flex items-center gap-1 transition-colors bg-gray-50 border border-gray-200 px-3.5 py-2 rounded-xl"
              id="stuck-trigger-btn"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>I'm Stuck / Roadblocked</span>
            </button>

            <button
              onClick={triggerNextStep}
              className="bg-black hover:bg-gray-800 text-white font-mono font-bold text-xs px-4 py-2 rounded-xl transition-all flex items-center gap-1"
              id="plan-complete-step-btn"
            >
              <span>Mark Active Done</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* Auxiliary: Sprint Timer */}
      <div className="bg-gray-50 border border-gray-100 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="max-w-md">
          <h4 className="text-sm font-semibold text-gray-800">Forced Momentum: 5-Min Sprint</h4>
          <p className="text-xs text-gray-500 leading-relaxed mt-1">
            Paralyzed by overthinking? Select a micro-timer preset and promise yourself you will work on the active step for only that long. No stakes.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white border border-gray-200/60 p-3 rounded-2xl">
          <span className="text-2xl font-bold font-mono text-gray-800 tracking-tight">
            {formatTime(timeLeft)}
          </span>
          
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setTimerActive(!timerActive)}
              className={`p-2 rounded-xl transition-all ${
                timerActive 
                  ? "bg-amber-100 text-amber-700 border border-amber-200" 
                  : "bg-black text-white hover:bg-gray-800"
              }`}
              id="timer-control-toggle"
            >
              {timerActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => {
                setTimerActive(false);
                setTimeLeft(selectedSprint);
              }}
              className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-black rounded-xl transition-colors"
              id="timer-control-reset"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="flex gap-2">
          {[120, 300, 600].map((sec) => (
            <button
              key={sec}
              onClick={() => selectSprintPreset(sec)}
              className={`py-1.5 px-3 rounded-xl font-mono text-[10px] font-semibold transition-all border ${
                selectedSprint === sec 
                  ? "bg-black text-white border-black" 
                  : "bg-white border-gray-200 text-gray-600 hover:border-gray-400"
              }`}
            >
              {sec / 60} MIN SPRINT
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Section: The Handoff Bar */}
      <div className="mt-12 pt-8 border-t border-gray-100">
        <span className="text-xs uppercase tracking-widest font-bold text-gray-400 block mb-3 font-mono">
          The Handoff
        </span>
        
        <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl mb-4">
          <p className="text-sm text-gray-600 font-medium italic">
            &ldquo;{handoffMessage}&rdquo;
          </p>
        </div>

        <form onSubmit={handleHandoffSubmit} className="flex flex-col sm:flex-row items-stretch gap-4">
          <div className="flex-1 relative">
            <input 
              type="text" 
              value={doneInput}
              onChange={(e) => setDoneInput(e.target.value)}
              placeholder="Type 'Done' to automatically progress to the next micro-action..." 
              className="w-full bg-gray-100 border-none rounded-full py-5 px-8 text-base focus:ring-2 focus:ring-black transition-all outline-none italic text-gray-800"
              id="handoff-input-field"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-2">
              <kbd className="bg-white px-2 py-1 rounded text-[10px] border border-gray-200 text-gray-400 font-mono font-bold">ENTER</kbd>
            </div>
          </div>
          <button 
            type="submit"
            className="bg-black text-white px-10 py-5 rounded-full font-bold text-base hover:bg-gray-800 transition-colors shadow-sm cursor-pointer whitespace-nowrap"
            id="handoff-submit-btn"
          >
            I'm on it / Done
          </button>
        </form>
      </div>

      {/* ROADBLOCK MODAL */}
      {showStuckModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#FDFDFD] border border-gray-200 rounded-3xl max-w-lg w-full p-8 shadow-2xl relative animate-fade-in text-[#1A1A1B]">
            <h3 className="text-xl font-bold font-serif italic text-black mb-2 flex items-center">
              ✦ Roadblock Triage Protocol
            </h3>
            <p className="text-xs text-gray-500 mb-4 leading-relaxed">
              If you're stuck, overthinking, or experiencing physical or mental paralysis, we will split this step into a laughably simple 30-second starting trigger.
            </p>

            {!stuckResponse ? (
              <div className="space-y-4">
                <textarea
                  value={stuckReason}
                  onChange={(e) => setStuckReason(e.target.value)}
                  placeholder="Tell us what's blocking you (e.g., 'I don't know what to write', 'I'm exhausted', or 'I'm afraid of failing')"
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-black text-xs resize-none h-24 font-sans focus:ring-1 focus:ring-black"
                />

                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={closeStuckFlow}
                    className="py-2 px-4 rounded-xl text-gray-500 hover:text-black text-xs transition-all font-mono font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitStuckBlock}
                    disabled={loadingStuck}
                    className="py-2.5 px-5 bg-black text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {loadingStuck ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Formulating tiny step...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Generate Absolute Easiest Path</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Motivation Box */}
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
                  <span className="text-[10px] font-mono uppercase text-gray-400 font-bold block mb-1">
                    Companion Motivation
                  </span>
                  <p className="text-xs text-gray-700 italic leading-relaxed">
                    &ldquo;{stuckResponse.motivation}&rdquo;
                  </p>
                </div>

                {/* Simplified Action Step */}
                <div className="bg-black text-white rounded-2xl p-4 flex items-start gap-3">
                  <CornerDownRight className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[9px] font-mono text-gray-400 uppercase font-semibold block">
                      New Zero-Friction 30-Second Micro-Step
                    </span>
                    <p className="text-sm font-semibold mt-0.5 leading-relaxed text-white font-mono">
                      {stuckResponse.simplerStep}
                    </p>
                  </div>
                </div>

                {/* Sub-Draft Helper */}
                {stuckResponse.helperDraft && (
                  <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
                    <span className="text-[9px] font-mono text-gray-400 uppercase font-semibold block mb-2">
                      Zero-Barrier Helper Content
                    </span>
                    <pre className="text-[11px] font-mono bg-white border border-gray-100 rounded-xl p-3 max-h-24 overflow-y-auto whitespace-pre-wrap text-gray-700">
                      {stuckResponse.helperDraft}
                    </pre>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                  <button
                    onClick={() => {
                      // Apply simplified step
                      target.microSteps[target.currentStepIndex] = stuckResponse.simplerStep;
                      if (stuckResponse.helperDraft) {
                        target.helperDraft = stuckResponse.helperDraft;
                      }
                      closeStuckFlow();
                    }}
                    className="py-2.5 px-5 bg-black text-white hover:bg-gray-800 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span>Swap Step & Resume</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
