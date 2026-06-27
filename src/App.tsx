import { useState, useEffect } from "react";
import Header from "./components/Header";
import TriageForm from "./components/TriageForm";
import FocusZone from "./components/FocusZone";
import BacklogView from "./components/BacklogView";
import CompanionChat from "./components/CompanionChat";
import { BacklogTask, TargetTask, ChatMessage, StuckResponse, TriageResponse } from "./types";
import { HelpCircle, X, ShieldCheck, Flame, MessageSquare, ListTodo, Target, ArrowLeft } from "lucide-react";

export default function App() {
  const [loading, setLoading] = useState(false);
  const [triageResponse, setTriageResponse] = useState<TriageResponse | null>(() => {
    const saved = localStorage.getItem("panic_triage_session");
    return saved ? JSON.parse(saved) : null;
  });
  
  // Streak counter from localStorage or default
  const [streak, setStreak] = useState<number>(() => {
    const saved = localStorage.getItem("panic_streak");
    return saved ? parseInt(saved, 10) : 3; // Defaults to 3 to encourage momentum
  });

  const [activeTab, setActiveTab] = useState<"focus" | "backlog" | "chat">("focus");
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Chat message state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem("panic_chat_messages");
    return saved ? JSON.parse(saved) : [];
  });
  const [loadingChat, setLoadingChat] = useState(false);

  // Persist session states
  useEffect(() => {
    localStorage.setItem("panic_streak", streak.toString());
  }, [streak]);

  useEffect(() => {
    if (triageResponse) {
      localStorage.setItem("panic_triage_session", JSON.stringify(triageResponse));
    } else {
      localStorage.removeItem("panic_triage_session");
    }
  }, [triageResponse]);

  useEffect(() => {
    localStorage.setItem("panic_chat_messages", JSON.stringify(chatMessages));
  }, [chatMessages]);

  // Handle Initial Panic Dump Triage
  const handleTriageSubmit = async (dumpText: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/panic/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dump: dumpText }),
      });
      if (!res.ok) throw new Error("Triage failed");
      const data: TriageResponse = await res.json();
      
      // Initialize target current step
      data.target.currentStepIndex = 0;
      
      setTriageResponse(data);
      setActiveTab("focus");

      // Generate initial greeting in chat
      setChatMessages([
        {
          id: "welcome",
          role: "assistant",
          content: `Rescue protocol activated. ${data.assessment} I have extracted "${data.target.title}" as your primary target to focus on first, and tucked the remaining tasks safely in your Backlog Guard. Let's make momentum together.`,
          timestamp: new Date().toISOString(),
        }
      ]);
    } catch (err) {
      console.error(err);
      alert("Unable to reach the Panicmode.ai server. Please ensure your backend is compiled and running.");
    } finally {
      setLoading(false);
    }
  };

  // Handle stuck modal callback from FocusZone
  const handleStuckResolve = async (blockReason: string): Promise<StuckResponse> => {
    if (!triageResponse) throw new Error("No active rescue target");
    const currentStep = triageResponse.target.microSteps[triageResponse.target.currentStepIndex];
    
    const res = await fetch("/api/panic/stuck", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        targetTask: triageResponse.target.title,
        currentStep: currentStep,
        blockReason: blockReason,
      }),
    });
    if (!res.ok) throw new Error("Stuck resolution failed");
    return await res.json();
  };

  // Step completed callback
  const handleStepComplete = () => {
    if (!triageResponse) return;
    const updatedTarget = { ...triageResponse.target };
    updatedTarget.currentStepIndex += 1;
    
    setTriageResponse({
      ...triageResponse,
      target: updatedTarget,
    });

    // Add supportive assistant chat update
    setChatMessages((prev) => [
      ...prev,
      {
        id: `step-${Date.now()}`,
        role: "assistant",
        content: `Nicely done on finishing that micro-step! Let's tackle the next step together: "${triageResponse.target.microSteps[updatedTarget.currentStepIndex]}". Remember, action beats overthinking.`,
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  // Target fully completed callback
  const handleCompleteTarget = () => {
    if (!triageResponse) return;
    
    // Increment streak
    setStreak((prev) => prev + 1);

    // Filter pending backlog
    const nextPending = triageResponse.backlog.filter((t) => t.status !== "completed");
    const completionMsg = `Target Completed! Excellent execution on "${triageResponse.target.title}". Your productivity streak has risen to ${streak + 1} days!`;

    if (nextPending.length > 0) {
      // Auto-promote the next backlog task to keep momentum alive!
      const nextTask = nextPending[0];
      
      const newTarget: TargetTask = {
        title: nextTask.title,
        originalTask: nextTask.originalTask,
        urgencyReason: `Promoted from your Backlog Guard to maintain momentum.`,
        microSteps: [
          `Open necessary files or references for: ${nextTask.title}`,
          `Do a quick 2-minute starting step`,
          `Complete and verify outcomes`
        ],
        currentStepIndex: 0,
        helperDraft: `Let's keep the streak of ${streak + 1} days burning. Let's do this next!`,
      };

      // Set the backlog status of this task as completed or promoted
      const updatedBacklog = triageResponse.backlog.map((t) => 
        t.id === nextTask.id ? { ...t, status: "completed" as const } : t
      );

      setTriageResponse({
        assessment: `Maintaining perfect momentum after completing your last target!`,
        target: newTarget,
        backlog: updatedBacklog,
        handoffMessage: `You're in the flow state. Let's complete the next promoted target!`,
      });
      setActiveTab("focus");

      setChatMessages((prev) => [
        ...prev,
        {
          id: `victory-${Date.now()}`,
          role: "assistant",
          content: `${completionMsg} I've automatically prepared your next prioritized task: "${nextTask.title}". Your Backlog Guard is updated. Let's dive right in.`,
          timestamp: new Date().toISOString(),
        }
      ]);
    } else {
      // Backlog is entirely empty! Absolute victory.
      setTriageResponse(null);
      setChatMessages([]);
      alert(`CONGRATULATIONS! You've successfully cleared all active pressure and completed all tasks. Your streak is now ${streak + 1} days!`);
    }
  };

  // Promote task from backlog manually
  const handlePromoteTask = async (taskId: string) => {
    if (!triageResponse) return;
    const taskToPromote = triageResponse.backlog.find((t) => t.id === taskId);
    if (!taskToPromote) return;

    setLoading(true);
    try {
      // Call triage to build structured micro-steps for this specific backlog task
      const res = await fetch("/api/panic/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          dump: `Focus entirely on this task: ${taskToPromote.originalTask}`,
          currentBacklog: triageResponse.backlog.filter((t) => t.id !== taskId)
        }),
      });
      if (!res.ok) throw new Error("Promotion triage failed");
      const data: TriageResponse = await res.json();
      data.target.currentStepIndex = 0;

      // Keep original backlog completed status intact
      const promotedBacklog = triageResponse.backlog.map((t) => 
        t.id === taskId ? { ...t, status: "completed" as const } : t
      );

      setTriageResponse({
        ...data,
        backlog: promotedBacklog,
      });
      setActiveTab("focus");

      setChatMessages((prev) => [
        ...prev,
        {
          id: `promote-${Date.now()}`,
          role: "assistant",
          content: `Successfully promoted "${taskToPromote.title}" to your primary active focus. I've configured custom micro-steps to remove starting friction. Let's go!`,
          timestamp: new Date().toISOString(),
        }
      ]);
    } catch (err) {
      console.error(err);
      // Fallback manual promotion
      const fallbackTarget: TargetTask = {
        title: taskToPromote.title,
        originalTask: taskToPromote.originalTask,
        urgencyReason: "Manually selected as primary priority.",
        microSteps: [
          "Open your workspace and remove distractions",
          "Work for a focused 15-minute sprint",
          "Complete the core requirements"
        ],
        currentStepIndex: 0,
        helperDraft: null
      };
      
      const promotedBacklog = triageResponse.backlog.map((t) => 
        t.id === taskId ? { ...t, status: "completed" as const } : t
      );

      setTriageResponse({
        ...triageResponse,
        target: fallbackTarget,
        backlog: promotedBacklog,
      });
      setActiveTab("focus");
    } finally {
      setLoading(false);
    }
  };

  // Send message in Companion Chat
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || loadingChat) return;
    
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setLoadingChat(true);

    try {
      const res = await fetch("/api/panic/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...chatMessages, userMsg],
          currentTarget: triageResponse?.target.title || "None",
          backlog: triageResponse?.backlog || [],
        }),
      });
      if (!res.ok) throw new Error("Chat response failed");
      const data = await res.json();

      setChatMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: data.reply,
          timestamp: new Date().toISOString(),
        }
      ]);
    } catch (err) {
      console.error(err);
      setChatMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          content: "I ran into a connection glitch formulating your strategy, but I'm still right here. Let's keep working through your primary steps!",
          timestamp: new Date().toISOString(),
        }
      ]);
    } finally {
      setLoadingChat(false);
    }
  };

  // Reset entire session
  const handleResetAll = () => {
    setTriageResponse(null);
    setChatMessages([]);
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-[#1A1A1B] flex flex-col font-sans selection:bg-black selection:text-white">
      {/* HEADER */}
      <Header 
        streak={streak} 
        onResetAll={triageResponse ? handleResetAll : undefined} 
        showHelp={() => setShowHelpModal(true)} 
        isEmergencyMode={!!triageResponse} 
      />

      <main className="flex-1">
        {!triageResponse ? (
          // INITIAL TRIAGE STATE
          <TriageForm onSubmit={handleTriageSubmit} loading={loading} />
        ) : (
          // ACTIVE RESCUE MODE - DASHBOARD
          <div className="py-6 space-y-6">
            
            {/* Minimalist Dashboard Navigation Tabs */}
            <div className="max-w-2xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex bg-gray-100 p-1 rounded-2xl border border-gray-200 shadow-sm overflow-x-auto max-w-full">
                <button
                  onClick={() => setActiveTab("focus")}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold font-mono transition-all uppercase flex items-center gap-2 shrink-0 cursor-pointer ${
                    activeTab === "focus"
                      ? "bg-white text-black shadow-sm"
                      : "text-gray-500 hover:text-black"
                  }`}
                  id="tab-btn-focus"
                >
                  <Target className="w-3.5 h-3.5" />
                  <span>Focus Target</span>
                </button>
                <button
                  onClick={() => setActiveTab("backlog")}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold font-mono transition-all uppercase flex items-center gap-2 shrink-0 cursor-pointer ${
                    activeTab === "backlog"
                      ? "bg-white text-black shadow-sm"
                      : "text-gray-500 hover:text-black"
                  }`}
                  id="tab-btn-backlog"
                >
                  <ListTodo className="w-3.5 h-3.5" />
                  <span>Backlog Guard ({triageResponse.backlog.filter(t => t.status !== "completed").length})</span>
                </button>
                <button
                  onClick={() => setActiveTab("chat")}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold font-mono transition-all uppercase flex items-center gap-2 shrink-0 cursor-pointer ${
                    activeTab === "chat"
                      ? "bg-white text-black shadow-sm"
                      : "text-gray-500 hover:text-black"
                  }`}
                  id="tab-btn-chat"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Rescue Chat</span>
                </button>
              </div>

              <button
                onClick={() => {
                  if (confirm("Go back to Home and start a new brain-dump? This will clear your current priorities and active steps.")) {
                    handleResetAll();
                  }
                }}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 hover:text-black hover:border-gray-400 rounded-2xl text-xs font-bold font-mono transition-all uppercase cursor-pointer shadow-sm shrink-0"
                id="dashboard-back-home-btn"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Home</span>
              </button>
            </div>

            {/* TAB OUTCOMES */}
            <div className="transition-all duration-300">
              {activeTab === "focus" && (
                <FocusZone 
                  target={triageResponse.target}
                  assessment={triageResponse.assessment}
                  handoffMessage={triageResponse.handoffMessage}
                  onStepComplete={handleStepComplete}
                  onTargetFullyComplete={handleCompleteTarget}
                  onStuckResolve={handleStuckResolve}
                  isEmergencyMode={true}
                />
              )}

              {activeTab === "backlog" && (
                <BacklogView 
                  backlog={triageResponse.backlog} 
                  onPromoteTask={handlePromoteTask} 
                />
              )}

              {activeTab === "chat" && (
                <CompanionChat 
                  messages={chatMessages} 
                  onSendMessage={handleSendMessage} 
                  loading={loadingChat} 
                />
              )}
            </div>

          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="py-8 px-4 border-t border-gray-100 text-center text-[11px] text-gray-400 font-mono tracking-tight shrink-0 bg-[#FDFDFD]">
        <p>© {new Date().getFullYear()} Panicmode.ai — Powered by Gemini AI. Move forward, step-by-step.</p>
      </footer>

      {/* HOW IT WORKS MODAL */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-200 rounded-3xl max-w-lg w-full p-8 shadow-2xl relative animate-fade-in text-gray-800">
            <button 
              onClick={() => setShowHelpModal(false)}
              className="absolute top-6 right-6 p-1.5 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition-all"
              id="close-help-btn"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-xl font-serif italic font-bold text-black mb-4 flex items-center gap-2">
              ✦ The Panicmode.ai Protocol
            </h3>
            
            <div className="space-y-4 text-xs md:text-sm leading-relaxed text-gray-600">
              <p>
                When chaos floods your inbox or schedule, the natural biological reaction is paralysis. Panicmode.ai is engineered specifically to disrupt this paralysis cycle through automated triage.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center text-[10px] font-bold font-mono shrink-0">1</div>
                  <p><strong>The Brain Dump:</strong> Put all stress factors, tasks, chores, or fears into the rescue terminal. We do not judge.</p>
                </div>

                <div className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center text-[10px] font-bold font-mono shrink-0">2</div>
                  <p><strong>Proactive Safeguard:</strong> The system extracts the absolute highest priority action as a sole focus. All other items are immediately locked in the <strong>Backlog Guard</strong> to clear visual overstimulation.</p>
                </div>

                <div className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center text-[10px] font-bold font-mono shrink-0">3</div>
                  <p><strong>Zero Barrier Execution:</strong> We chop the target task down into simple, 2-minute steps. If you still feel stuck on any step, hit <strong>"I'm Stuck"</strong> to have the AI formulate a 30-second start.</p>
                </div>
              </div>

              <p className="text-[11px] font-mono text-gray-400 border-t border-gray-100 pt-3 mt-4">
                Let's maintain momentum, reduce friction, and beat overwhelm together.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
