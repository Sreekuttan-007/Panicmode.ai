import { useEffect, useState } from "react";
import { Flame, RefreshCw, HelpCircle, Activity, Home } from "lucide-react";

interface HeaderProps {
  streak: number;
  onResetAll?: () => void;
  showHelp?: () => void;
  isEmergencyMode?: boolean;
}

export default function Header({ streak, onResetAll, showHelp, isEmergencyMode = false }: HeaderProps) {
  const [timeStr, setTimeStr] = useState("");

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="flex justify-between items-center px-4 md:px-12 py-5 md:py-6 border-b border-gray-100 bg-[#FDFDFD] text-[#1A1A1B]">
      <div className="flex items-center gap-3">
        {/* Geometric Black Icon */}
        <div className="w-8 h-8 bg-black rounded flex items-center justify-center shadow-sm">
          <div className="w-3 h-3 border-2 border-white rotate-45 animate-pulse"></div>
        </div>
        <div>
          <span className="text-lg md:text-xl font-bold tracking-tight text-[#1A1A1B] font-display">
            Panicmode<span className="text-gray-400">.ai</span>
          </span>
          <span className="hidden sm:inline-block ml-2 text-[10px] font-mono bg-black text-white px-1.5 py-0.5 rounded uppercase tracking-wider">
            Autonomous Agent
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4 md:gap-6 text-xs md:text-sm font-medium">
        {/* Active Status */}
        <div className="flex items-center gap-2">
          <span className={`relative flex h-2 w-2`}>
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isEmergencyMode ? "bg-red-500" : "bg-green-500"}`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${isEmergencyMode ? "bg-red-500" : "bg-green-500"}`}></span>
          </span>
          <span className="text-gray-600 font-mono hidden sm:inline text-[11px] uppercase tracking-wide">
            {isEmergencyMode ? "EMERGENCY MODE" : "SYSTEM PRIMED"}
          </span>
        </div>

        {/* Live Clock */}
        <span className="text-gray-500 font-mono font-medium border-l border-gray-200 pl-4">
          {timeStr || "11:24 PM"}
        </span>

        {/* Streak Counter */}
        <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-3 py-1 rounded-full text-xs text-gray-700 font-mono font-semibold">
          <Flame className={`w-3.5 h-3.5 ${streak > 0 ? "text-orange-500 fill-orange-500" : "text-gray-400"}`} />
          <span>STREAK: {streak} DAYS</span>
        </div>

        {/* Reset Action */}
        {onResetAll && (
          <button
            onClick={() => {
              if (confirm("Reset current active rescue session and go back to the home screen? This will clear your current priorities and active steps.")) {
                onResetAll();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-400 text-gray-700 hover:text-black rounded-xl text-xs font-semibold font-mono transition-all cursor-pointer shadow-sm"
            title="Back to Home / New Triage"
            id="header-restart-btn"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">BACK TO HOME</span>
          </button>
        )}

        {/* Help */}
        {showHelp && (
          <button
            onClick={showHelp}
            className="p-1.5 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition-all"
            title="How Panicmode.ai works"
            id="header-help-btn"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </header>
  );
}

