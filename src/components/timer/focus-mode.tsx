"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useTimerStore } from "@/store/timer";
import { useTasks, TaskWithSessions } from "@/hooks/use-tasks";
import { useSubtasks, useUpdateSubtask } from "@/hooks/use-subtasks";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Minimize2, StickyNote, CheckCircle, Clock, ListChecks } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { useUpdateTask } from "@/hooks/use-tasks";
import { toast } from "sonner";

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
        sessionType
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

    const formatTime = (seconds: number) => {
        const remaining = Math.max(0, total - seconds);
        const mins = Math.floor(remaining / 60);
        const secs = remaining % 60;
        return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    };

    const progress = (elapsed / total) * 100;

    if (!isFocusModeOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex flex-col bg-background/95 backdrop-blur-xl"
            >
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
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setFocusMode(false)}
                        className="rounded-full hover:bg-muted"
                    >
                        <Minimize2 className="h-5 w-5" />
                    </Button>
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
                            {/* Timer Circle/Display */}
                            <div className="relative flex items-center justify-center">
                                <svg className="w-56 h-56 sm:w-80 sm:h-80 -rotate-90">
                                    <circle
                                        cx="50%"
                                        cy="50%"
                                        r="48%"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="8"
                                        className="text-muted/20"
                                    />
                                    <motion.circle
                                        cx="50%"
                                        cy="50%"
                                        r="48%"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="8"
                                        strokeDasharray="100 100"
                                        strokeLinecap="round"
                                        className="text-primary"
                                        initial={{ pathLength: 0 }}
                                        animate={{ pathLength: progress / 100 }}
                                        transition={{ duration: 0.5 }}
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-5xl sm:text-7xl font-black tracking-tighter tabular-nums">
                                        {formatTime(elapsed)}
                                    </span>
                                    <span className="text-[10px] sm:text-xs uppercase tracking-[0.2em] font-bold text-muted-foreground mt-2">
                                        {sessionType === "FOCUS" ? "Focusing" : "Resting"}
                                    </span>
                                </div>
                            </div>

                            {/* Controls */}
                            <div className="flex items-center gap-6">
                                <Button
                                    size="lg"
                                    variant={isRunning ? "outline" : "default"}
                                    className="h-14 sm:h-16 px-6 sm:px-8 rounded-2xl text-base sm:text-lg font-bold shadow-xl transition-all hover:scale-105 active:scale-95"
                                    onClick={() => isRunning ? pause() : resume()}
                                >
                                    {isRunning ? "Pause Session" : "Resume Focus"}
                                </Button>
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
                                <Textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Write down what you're working on, ideas, or blocks..."
                                    className="relative flex-1 w-full bg-card/50 backdrop-blur-sm border-2 border-border/50 focus:border-primary/50 rounded-xl p-6 text-base sm:text-lg leading-relaxed resize-none focus-visible:ring-0 transition-all shadow-sm"
                                />
                            </div>
                            <div className="text-[10px] text-right text-muted-foreground uppercase tracking-widest font-bold px-2">
                                {notes !== (currentTask?.notes || "") ? "Saving thoughts..." : "All thoughts synced"}
                            </div>
                        </div>

                    </div>
                </div>

                {/* Footer Decor */}
                <div className="p-8 flex justify-center opacity-30">
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span className="text-xs font-bold uppercase tracking-widest">
                                {sessionType === "FOCUS" ? "Work hard" : "Relax well"}
                            </span>
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
