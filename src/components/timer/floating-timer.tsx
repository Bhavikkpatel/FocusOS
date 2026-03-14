"use client";

import { useState } from "react";
import { useTimerStore } from "@/store/timer";
import { useTasks } from "@/hooks/use-tasks";
import { Play, Pause, X, Timer, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { TaskExpandedView } from "@/components/tasks/task-expanded-view";

export function FloatingTimer() {
    const {
        isRunning,
        isPaused,
        elapsed,
        total,
        currentTaskId,
        sessionType,
        pause,
        resume,
        reset,
        setFocusMode,
    } = useTimerStore();

    const [showTask, setShowTask] = useState(false);

    // Fetch tasks to get the task name
    const { data } = useTasks({ status: "ALL" });
    const allTasks = data?.pages.flatMap((page) => page.tasks) || [];
    const currentTask = currentTaskId
        ? allTasks.find((t) => t.id === currentTaskId)
        : null;

    const isActive = isRunning || isPaused;
    const remaining = Math.max(total - elapsed, 0);
    const mins = Math.floor(remaining / 60);
    const secs = remaining % 60;
    const progress = total > 0 ? ((total - remaining) / total) * 100 : 0;

    const isFocus = sessionType === "FOCUS";
    const label = isFocus ? "Focus" : sessionType === "SHORT_BREAK" ? "Short Break" : "Long Break";

    if (!isActive) return null;

    return (
        <>
            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                    className="fixed bottom-6 right-6 z-50"
                >
                    <div
                        className={cn(
                            "flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur-xl cursor-pointer",
                            isFocus
                                ? "bg-white/90 dark:bg-slate-900/90 border-blue-200 dark:border-blue-800"
                                : "bg-green-50/90 dark:bg-green-950/90 border-green-200 dark:border-green-800"
                        )}
                        onClick={() => currentTask && setShowTask(true)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                currentTask && setShowTask(true);
                            }
                        }}
                    >
                        {/* Progress ring */}
                        <div className="relative flex items-center justify-center">
                            <svg width="44" height="44" className="-rotate-90">
                                <circle
                                    cx="22" cy="22" r="18"
                                    fill="none"
                                    className="stroke-slate-200 dark:stroke-slate-700"
                                    strokeWidth="3"
                                />
                                <circle
                                    cx="22" cy="22" r="18"
                                    fill="none"
                                    className={cn(
                                        "transition-all duration-1000",
                                        isFocus ? "stroke-blue-500" : "stroke-green-500"
                                    )}
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    strokeDasharray={`${2 * Math.PI * 18}`}
                                    strokeDashoffset={`${2 * Math.PI * 18 * (1 - progress / 100)}`}
                                />
                            </svg>
                            <Timer className={cn(
                                "absolute h-4 w-4",
                                isFocus ? "text-blue-500" : "text-green-500"
                            )} />
                        </div>

                        {/* Info */}
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <span className="text-lg font-bold tabular-nums tracking-tight">
                                    {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
                                </span>
                                <span className={cn(
                                    "text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-full",
                                    isFocus
                                        ? "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400"
                                        : "bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400"
                                )}>
                                    {label}
                                </span>
                            </div>
                            {currentTask && (
                                <p className="text-xs text-muted-foreground truncate max-w-[160px]">
                                    {currentTask.title}
                                </p>
                            )}
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-1 ml-1">
                            <button
                                onClick={(e) => { e.stopPropagation(); isRunning ? pause() : resume(); }}
                                className={cn(
                                    "rounded-full p-1.5 transition-colors",
                                    isFocus
                                        ? "hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600"
                                        : "hover:bg-green-100 dark:hover:bg-green-900/30 text-green-600"
                                )}
                            >
                                {isRunning ? (
                                    <Pause className="h-4 w-4" />
                                ) : (
                                    <Play className="h-4 w-4" />
                                )}
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); setFocusMode(true); }}
                                className={cn(
                                    "rounded-full p-1.5 transition-colors",
                                    isFocus
                                        ? "hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600"
                                        : "hover:bg-green-100 dark:hover:bg-green-900/30 text-green-600"
                                )}
                                title="Enter Focus Mode"
                            >
                                <Maximize2 className="h-4 w-4" />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); reset(); }}
                                className="rounded-full p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 text-muted-foreground hover:text-red-600 transition-colors"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Task Expanded View */}
            <AnimatePresence>
                {showTask && currentTask && (
                    <TaskExpandedView
                        task={currentTask}
                        onClose={() => setShowTask(false)}
                    />
                )}
            </AnimatePresence>
        </>
    );
}
