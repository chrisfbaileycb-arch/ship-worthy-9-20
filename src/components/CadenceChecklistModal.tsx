import React, { useState } from "react";
import { AppRegistryItem, CadenceMilestone, CadenceScheduleDetailed } from "../types";
import { buildDefaultCadence } from "../utils/governance";
import {
  CalendarCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Sparkles,
} from "lucide-react";

interface CadenceChecklistModalProps {
  app: AppRegistryItem;
  onClose: () => void;
  onUpdateCadence: (updatedApp: AppRegistryItem) => void;
}

export const CadenceChecklistModal: React.FC<CadenceChecklistModalProps> = ({
  app,
  onClose,
  onUpdateCadence,
}) => {
  const [schedule, setSchedule] = useState<CadenceScheduleDetailed>(() => {
    return app.cadenceScheduleDetailed || buildDefaultCadence(app.launchDate);
  });

  const [expandedStage, setExpandedStage] = useState<string>("day30");

  const toggleTask = (stageKey: "day30" | "day60" | "day90" | "day180", taskId: string) => {
    setSchedule((prev) => {
      const milestone = prev[stageKey];
      const updatedTasks = milestone.tasks.map((t) =>
        t.id === taskId ? { ...t, done: !t.done } : t
      );
      const allDone = updatedTasks.every((t) => t.done);

      const nextSchedule: CadenceScheduleDetailed = {
        ...prev,
        [stageKey]: {
          ...milestone,
          tasks: updatedTasks,
          completed: allDone,
          completedDate: allDone ? new Date().toISOString().split("T")[0] : undefined,
          status: allDone ? "CLEAR" : milestone.status === "CLEAR" && !allDone ? "DUE_SOON" : milestone.status,
        },
      };

      // Save to parent app
      const updatedApp: AppRegistryItem = {
        ...app,
        cadenceScheduleDetailed: nextSchedule,
        cadenceStatus: {
          day30Completed: nextSchedule.day30.completed,
          day90Completed: nextSchedule.day90.completed,
          day180Completed: nextSchedule.day180.completed,
        },
      };
      onUpdateCadence(updatedApp);

      return nextSchedule;
    });
  };

  const markMilestoneCompleted = (stageKey: "day30" | "day60" | "day90" | "day180") => {
    setSchedule((prev) => {
      const milestone = prev[stageKey];
      const updatedTasks = milestone.tasks.map((t) => ({ ...t, done: true }));
      const nextSchedule: CadenceScheduleDetailed = {
        ...prev,
        [stageKey]: {
          ...milestone,
          completed: true,
          completedDate: new Date().toISOString().split("T")[0],
          status: "CLEAR",
          tasks: updatedTasks,
        },
      };

      const updatedApp: AppRegistryItem = {
        ...app,
        cadenceScheduleDetailed: nextSchedule,
        cadenceStatus: {
          day30Completed: nextSchedule.day30.completed,
          day90Completed: nextSchedule.day90.completed,
          day180Completed: nextSchedule.day180.completed,
        },
      };
      onUpdateCadence(updatedApp);

      return nextSchedule;
    });
  };

  const stages: Array<{ key: "day30" | "day60" | "day90" | "day180"; data: CadenceMilestone }> = [
    { key: "day30", data: schedule.day30 },
    { key: "day60", data: schedule.day60 },
    { key: "day90", data: schedule.day90 },
    { key: "day180", data: schedule.day180 },
  ];

  return (
    <div
      id="cadence-checklist-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto"
    >
      <div
        id="cadence-checklist-modal"
        className="w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 text-slate-100 my-8 max-h-[90vh] flex flex-col"
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
                <CalendarCheck className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight">
                30 / 60 / 90 / 180-Day Operational Cadence Engine
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Project: <span className="text-slate-200 font-semibold">{app.name}</span> • Launched:{" "}
              <span className="font-mono text-emerald-400">{app.launchDate}</span> ({app.daysSinceLaunch} days active)
            </p>
          </div>
          <button
            id="close-cadence-modal-btn"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Milestone Pips Bar */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 shrink-0">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
            Milestone Review Progress Pips
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {stages.map(({ key, data }) => {
              const pipBg =
                data.status === "CLEAR"
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                  : data.status === "DUE_SOON"
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                  : "bg-rose-500/10 border-rose-500/30 text-rose-300";

              const pipDot =
                data.status === "CLEAR"
                  ? "bg-emerald-400"
                  : data.status === "DUE_SOON"
                  ? "bg-amber-400 animate-pulse"
                  : "bg-rose-400 animate-bounce";

              return (
                <div
                  key={key}
                  onClick={() => setExpandedStage(key)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${pipBg} ${
                    expandedStage === key ? "ring-2 ring-indigo-500/50" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase">{key.toUpperCase()}</span>
                    <span className={`w-2 h-2 rounded-full ${pipDot}`}></span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Due: <span className="font-mono text-slate-300">{data.dueDate}</span>
                  </div>
                  <div className="text-[10px] font-semibold mt-0.5">
                    {data.completed ? (
                      <span className="text-emerald-400">✓ Completed</span>
                    ) : (
                      <span>{data.status === "DUE_SOON" ? "Due Soon" : data.status === "OVERDUE" ? "Overdue" : "Scheduled"}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Expandable Checklist Sections */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {stages.map(({ key, data }) => {
            const isExpanded = expandedStage === key;
            const completedCount = data.tasks.filter((t) => t.done).length;

            return (
              <div
                key={key}
                className="rounded-xl border border-slate-800 bg-slate-950/80 overflow-hidden"
              >
                <div
                  onClick={() => setExpandedStage(isExpanded ? "" : key)}
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-900/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        data.status === "CLEAR"
                          ? "bg-emerald-400"
                          : data.status === "DUE_SOON"
                          ? "bg-amber-400"
                          : "bg-rose-400"
                      }`}
                    ></div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                        <span>{data.title}</span>
                        {data.completed && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            Verified
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">{data.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <span className="font-mono text-slate-400">
                      {completedCount}/{data.tasks.length} Done
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-4 pt-0 border-t border-slate-900 space-y-3 bg-slate-950">
                    <div className="space-y-2 mt-3">
                      {data.tasks.map((task) => (
                        <div
                          key={task.id}
                          onClick={() => toggleTask(key, task.id)}
                          className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={task.done}
                            onChange={() => {}} // Handled by container click
                            className="mt-1 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500/20 bg-slate-950 cursor-pointer"
                          />
                          <div className="flex-1 text-xs">
                            <span
                              className={`leading-relaxed ${
                                task.done ? "line-through text-slate-500" : "text-slate-200"
                              }`}
                            >
                              {task.label}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-[11px] text-slate-500">
                        {data.completedDate ? `Completed on ${data.completedDate}` : `Target: Day ${data.daysTarget}`}
                      </span>
                      {!data.completed && (
                        <button
                          type="button"
                          onClick={() => markMilestoneCompleted(key)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Mark Milestone Completed</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800 shrink-0">
          <div className="text-xs text-slate-400">
            Cadence auto-updates based on {app.launchDate} deployment origin.
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};
