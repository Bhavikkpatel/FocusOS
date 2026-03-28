// Licensed under the Business Source License 1.1. See LICENSE file for details.
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useTimerStore } from "@/store/timer";
import { useTasks, TaskWithSessions } from "@/hooks/use-tasks";
import { useSubtasks, useUpdateSubtask } from "@/hooks/use-subtasks";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { 
    Minimize2, StickyNote, CheckCircle, 
    ListChecks, Zap, ZapOff, ChevronLeft, ChevronRight 
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { useUpdateTask } from "@/hooks/use-tasks";
import { toast } from "sonner";
import { ReflectionFlow } from "./reflection-flow";

export function FocusMode() {
    const {
        isFocusModeOpen,
        setFocusMode,
        elapsed,
        total,
        currentTaskId,
        isRunning,
        pause,
        resume,
        sessionType,
        isVictory,
        updateTimerState,
        isZenithMode,
        toggleZenithMode,
        isPaused,
        start,
        addInterruption,
        activeSubtaskId
    } = useTimerStore();

    const { data } = useTasks({});
    const updateTask = useUpdateTask();

    // Find current task
    const allTasks = data?.pages.flatMap((page) => page.tasks) || [];
    const currentTask = allTasks.find(t => t.id === currentTaskId) as TaskWithSessions | undefined;

    // Subtasks
    const { data: subtasks = [] } = useSubtasks(currentTaskId || "");
    const updateSubtask = useUpdateSubtask();

    const handleToggleSubtask = (subtaskId: string, currentState: boolean) => {
        if (!currentTask) return;
        updateSubtask.mutate({
            taskId: currentTask.id,
            subtaskId,
            isCompleted: !currentState,
        });

        if (!currentState && currentTask.status !== "COMPLETED") {
            const otherSubtasks = subtasks.filter(s => s.id !== subtaskId);
            const allOthersCompleted = otherSubtasks.length === 0 || otherSubtasks.every(s => s.isCompleted);

            if (allOthersCompleted) {
                toast.success("All subtasks completed!", {
                    description: "Would you like to mark the entire task as done?",
                    duration: 6000,
                    action: {
                        label: "Mark Done",
                        onClick: () => {
                            updateTask.mutate({ id: currentTask.id, status: "COMPLETED" });
                        }
                    },
                });
            }
        }
    };

    const [notes, setNotes] = useState(currentTask?.notes || "");

    useEffect(() => {
        if (currentTask?.notes) {
            setNotes(currentTask.notes);
        }
    }, [currentTask?.id, currentTask?.notes]);

    // Auto-save notes
    useEffect(() => {
        if (!currentTaskId) return;
        const timer = setTimeout(() => {
            if (notes !== (currentTask?.notes || "")) {
                updateTask.mutate({ id: currentTaskId, notes });
            }
        }, 1000);
        return () => clearTimeout(timer);
    }, [notes, currentTaskId, currentTask?.notes, updateTask]);

    // Handle Victory Transition
    useEffect(() => {
        if (isVictory) {
            // We no longer auto-close focus mode, we show MomentumSummary
            // updateTimerState({ isCompletionDialogOpen: true });
        }
    }, [isVictory]);

    const formatTime = (seconds: number) => {
        const remaining = Math.max(0, total - seconds);
        const mins = Math.floor(remaining / 60);
        const secs = remaining % 60;
        return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    };

    const progress = (elapsed / total) * 100;

    // Ghost UI: Inactivity Tracking
    const [isInactive, setIsInactive] = useState(false);
    useEffect(() => {
        if (!isFocusModeOpen) return;
        
        let timeout: NodeJS.Timeout;
        const resetInactivity = () => {
            setIsInactive(false);
            clearTimeout(timeout);
            timeout = setTimeout(() => setIsInactive(true), 5000);
        };

        window.addEventListener("mousemove", resetInactivity);
        window.addEventListener("keydown", resetInactivity);
        window.addEventListener("mousedown", resetInactivity);
        window.addEventListener("touchstart", resetInactivity);
        
        resetInactivity();

        return () => {
            window.removeEventListener("mousemove", resetInactivity);
            window.removeEventListener("keydown", resetInactivity);
            window.removeEventListener("mousedown", resetInactivity);
            window.removeEventListener("touchstart", resetInactivity);
            clearTimeout(timeout);
        };
    }, [isFocusModeOpen]);

    // Timer Integration: Auto-start/pause
    useEffect(() => {
        if (isFocusModeOpen) {
            // Auto-start if a task is active and not already running
            if (currentTaskId && !isRunning && !isPaused) {
                // Determine duration (priority: preset > task duration > 25m)
                const duration = currentTask?.pomodoroDuration || 25;
                start(duration, "FOCUS", currentTaskId);
            }
        } else {
            // Auto-pause when exiting
            if (isRunning) {
                pause();
            }
        }
    }, [isFocusModeOpen, currentTask?.pomodoroDuration, currentTaskId, isPaused, isRunning, pause, start]); // Sync with open state and task changes

    const handleSwitchTask = (direction: 'next' | 'prev') => {
        if (!allTasks.length) return;
        const index = allTasks.findIndex(t => t.id === currentTaskId);
        let nextIndex = direction === 'next' ? index + 1 : index - 1;
        if (nextIndex >= allTasks.length) nextIndex = 0;
        if (nextIndex < 0) nextIndex = allTasks.length - 1;
        
        const nextTask = allTasks[nextIndex];
        if (nextTask) {
            updateTimerState({ currentTaskId: nextTask.id });
        }
    };

    // Distraction Scratchpad Logic
    const [scratchpadValue, setScratchpadValue] = useState("");

    const handleScratchpadSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && scratchpadValue.trim()) {
            const isDistraction = scratchpadValue.startsWith("!") || scratchpadValue.startsWith("?");
            
            if (isDistraction) {
                addInterruption(scratchpadValue.slice(1).trim());
                toast.success("Captured for review", {
                    description: "Focused restored.",
                    duration: 2000,
                });
            } else {
                // Regular note for current task if not a distraction? 
                // Acceptance criteria says: "Inputs starting with ! or ? are treated as distractions"
                // It doesn't explicitly say what to do with others, but "dump unrelated thoughts" implies capturing.
                // I'll stick to distractions for now as per AC.
                toast.info("Start with ! or ? to log a distraction");
                return;
            }
            setScratchpadValue("");
        }
    };

    if (!isFocusModeOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={cn(
                    "fixed inset-0 z-[100] flex flex-col transition-colors duration-1000",
                    isZenithMode ? "bg-black/95 backdrop-blur-3xl" : "bg-background/95 backdrop-blur-xl"
                )}
            >
                {/* Zenith Mode Toggle & Exit */}
                <div className={cn(
                    "absolute top-6 right-6 flex items-center gap-3 z-[110] transition-opacity duration-1000",
                    isZenithMode && isInactive ? "opacity-20" : "opacity-100"
                )}>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleZenithMode}
                        className={cn(
                            "rounded-full transition-all",
                            isZenithMode ? "text-slate-500 hover:text-white hover:bg-white/10" : "text-muted-foreground hover:bg-muted"
                        )}
                        title={isZenithMode ? "Standard Mode" : "Zenith Mode"}
                    >
                        {isZenithMode ? <ZapOff className="h-5 w-5" /> : <Zap className="h-5 w-5 fill-primary/20 text-primary" />}
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setFocusMode(false)}
                        className={cn(
                            "rounded-full transition-all",
                            isZenithMode ? "text-slate-500 hover:text-white hover:bg-white/10" : "text-muted-foreground hover:bg-muted"
                        )}
                    >
                        <Minimize2 className="h-5 w-5" />
                    </Button>
                </div>

                {!isZenithMode ? (
                    <>
                        {/* Standard Layout */}
                        {/* Header */}
                        <div className="flex items-center justify-between p-6">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 text-primary font-bold tracking-tighter text-xl">
                                    <CheckCircle className="h-6 w-6 fill-current" />
                                    <span>FocusOS</span>
                                </div>
                                <div className="h-4 w-[1px] bg-border mx-2" />
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold truncate max-w-[200px] sm:max-w-[400px]">
                                        {currentTask?.title || "Deep Work Session"}
                                    </span>
                                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
                                        {currentTask?.project || "General"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="flex flex-1 flex-col items-center justify-center p-6 w-full max-w-[1400px] mx-auto">
                            <div className="flex flex-col xl:flex-row items-center justify-center gap-12 xl:gap-24 w-full">

                                {/* Subtasks Area (Left) */}
                                <div className="w-full xl:w-[400px] flex flex-col space-y-3 order-2 xl:order-1">
                                    <div className="flex items-center gap-2 text-muted-foreground font-semibold px-2">
                                        <ListChecks className="h-4 w-4" />
                                        <span className="text-sm">Subtasks</span>
                                        <span className="ml-auto text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                                            {subtasks.filter(s => s.isCompleted).length} / {subtasks.length}
                                        </span>
                                    </div>
                                    <div className="flex-1 bg-card/50 backdrop-blur-sm border-2 border-border/50 rounded-xl p-4 overflow-y-auto min-h-[300px] shadow-sm">
                                        {subtasks.length === 0 ? (
                                            <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-60">
                                                <ListChecks className="h-8 w-8 mb-2" />
                                                <span className="text-sm font-medium">No subtasks for this session</span>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                {subtasks.map((st) => (
                                                    <div
                                                        key={st.id}
                                                        className={cn(
                                                            "flex items-start gap-3 p-3 rounded-lg border bg-white dark:bg-slate-900 transition-colors",
                                                            st.isCompleted && "bg-slate-50/50 dark:bg-slate-900/50 border-transparent opacity-60"
                                                        )}
                                                    >
                                                        <Checkbox
                                                            checked={st.isCompleted}
                                                            onCheckedChange={() => handleToggleSubtask(st.id, st.isCompleted)}
                                                            className="mt-0.5 h-5 w-5 rounded-md border-2 border-slate-300 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                                                        />
                                                        <div className="flex-1 min-w-0">
                                                            <span className={cn(
                                                                "text-sm font-semibold block",
                                                                st.isCompleted ? "line-through text-slate-500" : "text-slate-700 dark:text-slate-200"
                                                            )}>
                                                                {st.title}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Center Column: Timer & Controls */}
                                <div className="flex flex-col items-center space-y-12 order-1 xl:order-2 shrink-0">
                                    <div className="relative flex items-center justify-center">
                                        <svg className="w-56 h-56 sm:w-80 sm:h-80 -rotate-90">
                                            <circle cx="50%" cy="50%" r="48%" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/20" />
                                            <motion.circle cx="50%" cy="50%" r="48%" fill="none" stroke="currentColor" strokeWidth="8" strokeDasharray="100 100" strokeLinecap="round" className="text-primary" initial={{ pathLength: 0 }} animate={{ pathLength: progress / 100 }} transition={{ duration: 0.5 }} />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="text-5xl sm:text-7xl font-black tracking-tighter tabular-nums">{formatTime(elapsed)}</span>
                                            <span className="text-[10px] sm:text-xs uppercase tracking-[0.2em] font-bold text-muted-foreground mt-2">{sessionType === "FOCUS" ? "Focusing" : "Resting"}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <Button size="lg" variant={isRunning ? "outline" : "default"} className="h-14 sm:h-16 px-6 sm:px-8 rounded-2xl text-base sm:text-lg font-bold shadow-xl transition-all hover:scale-105 active:scale-95" onClick={() => isRunning ? pause() : resume()}>{isRunning ? "Pause Session" : "Resume Focus"}</Button>
                                    </div>
                                </div>

                                {/* Notes Area (Right) */}
                                <div className="w-full xl:w-[400px] flex flex-col space-y-3 order-3 xl:order-3">
                                    <div className="flex items-center gap-2 text-muted-foreground font-semibold px-2">
                                        <StickyNote className="h-4 w-4" />
                                        <span className="text-sm">Session Notes</span>
                                    </div>
                                    <div className="relative group flex-1 flex flex-col min-h-[300px]">
                                        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-2xl blur opacity-25 group-focus-within:opacity-100 transition duration-1000 group-focus-within:duration-200"></div>
                                        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Write down what you're working on, ideas, or blocks..." className="relative flex-1 w-full bg-card/50 backdrop-blur-sm border-2 border-border/50 focus:border-primary/50 rounded-xl p-6 text-base sm:text-lg leading-relaxed resize-none focus-visible:ring-0 transition-all shadow-sm" />
                                    </div>
                                    <div className="text-[10px] text-right text-muted-foreground uppercase tracking-widest font-bold px-2">{notes !== (currentTask?.notes || "") ? "Saving thoughts..." : "All thoughts synced"}</div>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    /* Zenith Mode Layout */
                    <div className="flex-1 flex flex-col items-center justify-center relative px-6 pb-20">
                        <div className="w-full max-w-4xl flex flex-col items-center text-center space-y-8">
                            <div className="space-y-4 group">
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex flex-col items-center gap-4"
                                >
                                    <div className="flex items-center gap-4 opacity-40 group-hover:opacity-100 transition-opacity duration-500 mb-4 mt-20">
                                        <span className="text-sm uppercase tracking-[0.4em] font-black text-primary/80">
                                            {currentTask?.project || "General"}
                                        </span>
                                        <div className="h-1.5 w-1.5 rounded-full bg-white/10" />
                                        <span className={cn(
                                            "text-xs uppercase tracking-[0.2em] font-black px-3 py-1 rounded-full border border-white/5 bg-white/5",
                                            currentTask?.priority === "HIGH" ? "text-rose-400/90" : "text-slate-400/90"
                                        )}>
                                            {currentTask?.priority} Priority
                                        </span>
                                    </div>
                                    {(() => {
                                        const title = currentTask?.title || "Deep Work Session";
                                        const titleLength = title.length;
                                        let sizeClass = "text-4xl sm:text-6xl lg:text-7xl";
                                        
                                        if (titleLength > 100) {
                                            sizeClass = "text-2xl sm:text-4xl lg:text-5xl";
                                        } else if (titleLength > 60) {
                                            sizeClass = "text-3xl sm:text-5xl lg:text-6xl";
                                        }

                                        return (
                                            <h1 
                                                className={cn(
                                                    sizeClass,
                                                    "font-bold tracking-tight text-white max-w-4xl animate-in fade-in slide-in-from-bottom-6 duration-1000 leading-[1.1] text-center"
                                                )}
                                                style={{ fontFamily: "Inter, sans-serif" }}
                                            >
                                                {title}
                                            </h1>
                                        );
                                    })()}
                                </motion.div>
                            </div>

                            {activeSubtaskId && currentTask && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className={cn(
                                        "flex flex-col items-center gap-2 transition-opacity duration-1000",
                                        isInactive ? "opacity-20" : "opacity-100"
                                    )}
                                >
                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-primary/60 mb-2">
                                        <div className="h-px w-8 bg-primary/20" />
                                        <span>Mission Objective</span>
                                        <div className="h-px w-8 bg-primary/20" />
                                    </div>
                                    <span className="text-2xl sm:text-3xl font-bold text-white/90 max-w-2xl line-clamp-2">
                                        {subtasks.find(s => s.id === activeSubtaskId)?.title || "Current Phase"}
                                    </span>
                                </motion.div>
                            )}

                            <div className={cn(
                                "flex flex-col items-center transition-opacity duration-1000",
                                isInactive ? "opacity-20" : "opacity-100"
                            )}>
                                <span 
                                    className="text-[8rem] sm:text-[10rem] font-black tracking-tighter tabular-nums leading-none text-white/90"
                                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                                >
                                    {formatTime(elapsed)}
                                </span>
                                <div className="flex items-center gap-2 text-primary font-bold tracking-[0.5em] uppercase text-sm mt-[-1rem]">
                                    <span className={cn("inline-block w-2 h-2 rounded-full", isRunning ? "bg-primary animate-pulse" : "bg-slate-600")} />
                                    {sessionType === "FOCUS" ? "Zenith Focus" : "Rest Mode"}
                                </div>
                            </div>

                            <div className={cn(
                                "flex items-center gap-12 pt-8 transition-opacity duration-1000",
                                isInactive ? "opacity-20" : "opacity-100"
                            )}>
                                <button onClick={() => handleSwitchTask('prev')} className="text-slate-600 hover:text-white transition-colors p-2">
                                    <ChevronLeft className="h-8 w-8" />
                                </button>
                                <Button
                                    size="lg"
                                    onClick={() => isRunning ? pause() : resume()}
                                    className={cn(
                                        "h-20 w-20 rounded-full shadow-2xl transition-all hover:scale-105 active:scale-95",
                                        isRunning ? "bg-white text-black hover:bg-slate-200" : "bg-primary text-white hover:bg-primary/90"
                                    )}
                                >
                                    {isRunning ? (
                                        <div className="flex gap-1.5 items-center">
                                            <div className="w-2 h-6 bg-current rounded-full" />
                                            <div className="w-2 h-6 bg-current rounded-full" />
                                        </div>
                                    ) : (
                                        <div className="ml-1 w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-current border-b-[10px] border-b-transparent" />
                                    )}
                                </Button>
                                <button onClick={() => handleSwitchTask('next')} className="text-slate-600 hover:text-white transition-colors p-2">
                                    <ChevronRight className="h-8 w-8" />
                                </button>
                            </div>

                            {/* Distraction Scratchpad */}
                            <div className={cn(
                                "w-full max-w-md transition-[opacity,transform] duration-500 mt-20 mb-12",
                                isInactive ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
                            )}>
                                <div className="relative group">
                                    <div className="absolute -inset-0.5 bg-primary/20 rounded-lg blur opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
                                    <input
                                        type="text"
                                        value={scratchpadValue}
                                        onChange={(e) => setScratchpadValue(e.target.value)}
                                        onKeyDown={handleScratchpadSubmit}
                                        placeholder="Type ! or ? to dump a distraction..."
                                        className="relative w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 transition-all text-center"
                                        style={{ fontFamily: "'JetBrains Mono', monospace" }}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="absolute bottom-0 left-0 h-1 bg-primary/20 transition-[width] duration-1000" style={{ width: `${progress}%` }} />
                    </div>
                )}
                
                <AnimatePresence>
                    {isVictory && (
                        <ReflectionFlow onClose={({ action }) => {
                            if (action === "CONTINUE") {
                                // Start break to maintain momentum
                                const breakDuration = currentTask? (currentTask.pomodoroDuration ? Math.min(5, Math.floor(currentTask.pomodoroDuration / 5)) : 5) : 5;
                                start(breakDuration, "SHORT_BREAK", currentTaskId || undefined);
                                updateTimerState({ 
                                    isVictory: false, 
                                    sessionDistractions: [] 
                                });
                            } else {
                                setFocusMode(false);
                                updateTimerState({ 
                                    isVictory: false, 
                                    isCompletionDialogOpen: true,
                                    sessionDistractions: [] 
                                });
                            }
                        }} />
                    )}
                </AnimatePresence>
            </motion.div>
        </AnimatePresence>
    );
}
