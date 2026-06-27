import { CheckCircle2, Circle, Clock, ShieldCheck, PlayCircle } from "lucide-react";
import { BacklogTask } from "../types";

interface BacklogViewProps {
  backlog: BacklogTask[];
  onPromoteTask?: (taskId: string) => void;
}

export default function BacklogView({ backlog, onPromoteTask }: BacklogViewProps) {
  const pendingTasks = backlog.filter((t) => t.status !== "completed");
  const completedTasks = backlog.filter((t) => t.status === "completed");

  const totalMinutesRemaining = pendingTasks.reduce(
    (acc, cur) => acc + cur.estimatedMinutes,
    0
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6 bg-[#FDFDFD]">
      
      {/* Backlog Summary Card */}
      <div className="bg-gray-50 border border-gray-200 rounded-3xl p-5 flex items-center justify-between shadow-sm relative overflow-hidden">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 bg-white border border-gray-200 text-gray-800 rounded-2xl shadow-sm">
            <Clock className="w-5 h-5 text-black animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 font-display">Backlog Guard</h3>
            <p className="text-[11px] text-gray-500 font-medium">These tasks are locked away temporarily to protect your current focus.</p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] font-mono uppercase text-gray-400 block font-semibold">Pending Total</span>
          <span className="text-lg font-bold text-black font-mono">{totalMinutesRemaining} mins</span>
        </div>
      </div>

      {/* Pending Backlog list */}
      <div className="space-y-3">
        <h4 className="text-xs font-mono uppercase tracking-wider text-gray-500 font-bold flex items-center">
          <span>Queued Tasks ({pendingTasks.length})</span>
          <span className="ml-2 w-1.5 h-1.5 bg-black rounded-full animate-ping" />
        </h4>

        {pendingTasks.length === 0 ? (
          <div className="bg-gray-50/50 border border-gray-200 rounded-2xl p-8 text-center text-gray-500 border-dashed">
            <ShieldCheck className="w-8 h-8 text-gray-400 mb-1 mx-auto" />
            <p className="text-xs font-semibold text-gray-800">Your Backlog is Empty</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Nothing on hold. Keep focus on completing your primary active target.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {pendingTasks.map((task) => (
              <div
                key={task.id}
                className="bg-white border border-gray-200 hover:border-gray-400 rounded-2xl p-4 flex items-center justify-between transition-all group shadow-sm"
              >
                <div className="flex items-start space-x-3 flex-1 min-w-0 mr-4">
                  <Circle className="w-5 h-5 text-gray-300 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <h5 className="text-sm font-bold text-gray-900 group-hover:text-black transition-colors truncate">
                      {task.title}
                    </h5>
                    <p className="text-[11px] text-gray-500 truncate mt-0.5 font-mono">
                      Original: &ldquo;{task.originalTask}&rdquo;
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  <div className="text-right">
                    <span className="text-[10px] font-mono font-bold text-gray-700 block">
                      {task.estimatedMinutes} mins
                    </span>
                    <span 
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase ${
                        task.urgency === "High"
                          ? "bg-red-50 border border-red-200 text-red-700"
                          : task.urgency === "Medium"
                          ? "bg-amber-50 border border-amber-200 text-amber-700"
                          : "bg-gray-100 border border-gray-200 text-gray-600"
                      }`}
                    >
                      {task.urgency}
                    </span>
                  </div>

                  {onPromoteTask && (
                    <button
                      onClick={() => onPromoteTask(task.id)}
                      className="p-2 bg-gray-50 border border-gray-200 hover:bg-black hover:border-black hover:text-white rounded-xl text-gray-600 transition-all cursor-pointer"
                      title="Promote to Active Target"
                      id={`promote-btn-${task.id}`}
                    >
                      <PlayCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completed Backlog list */}
      {completedTasks.length > 0 && (
        <div className="space-y-3 pt-4">
          <h4 className="text-xs font-mono uppercase tracking-wider text-gray-400 font-bold">
            Completed in Triage ({completedTasks.length})
          </h4>

          <div className="space-y-2.5">
            {completedTasks.map((task) => (
              <div
                key={task.id}
                className="bg-gray-50/50 border border-gray-100 rounded-2xl p-4 flex items-center justify-between opacity-60 select-none"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <CheckCircle2 className="w-5 h-5 text-gray-400 shrink-0" />
                  <div className="min-w-0">
                    <h5 className="text-sm font-semibold text-gray-500 line-through truncate">
                      {task.title}
                    </h5>
                    <p className="text-[10px] text-gray-400 truncate mt-0.5 font-mono">
                      Original: &ldquo;{task.originalTask}&rdquo;
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] font-mono text-gray-400 font-semibold uppercase">Done</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
