"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Zap, Plus, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTimerStore } from "@/store/timer";
import { TaskWithSessions, useCreateTask } from "@/hooks/use-tasks";

interface HeroTaskProps {
    task: TaskWithSessions | null;
}

export function HeroTask({ task }: HeroTaskProps) {
    const { start, setFocusMode, setZenithMode } = useTimerStore();
    const [quickAddTitle, setQuickAddTitle] = useState("");
    const createTask = useCreateTask();

    const handleStartFocus = () => {
        if (!task) return;
        setZenithMode(true);
        setFocusMode(true);
        start(task.pomodoroDuration || 25, "FOCUS", task.id);
    };

    const handleQuickAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (!quickAddTitle.trim()) return;
        createTask.mutate({
            title: quickAddTitle.trim(),
            priority: "HIGH",
            status: "TODO"
        });
        setQuickAddTitle("");
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative group overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm"
        >

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="flex-1 space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-xl">
                            <Zap className="h-5 w-5 text-primary" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-[0.3em] text-primary/60">Next Mission</span>
                    </div>

                    {task ? (
                        <div className="space-y-4">
                            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.2]">
                                {task.title}
                            </h2>
                            <div className="flex items-center gap-4">
                                {task.projectRef && (
                                    <div className="flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5">
                                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: task.projectRef.color }} />
                                        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400">{task.projectRef.name}</span>
                                    </div>
                                )}
                                <span className="text-[10px] font-jetbrains text-slate-400 dark:text-slate-500 uppercase tracking-widest">EST. {task.estimatedPomodoros || 1} POMODOROS</span>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold text-slate-500">No tasks scheduled. Ready to launch?</h2>
                            <form onSubmit={handleQuickAdd} className="relative max-w-md">
                                <input
                                    type="text"
                                    placeholder="Type a task and hit Enter..."
                                    value={quickAddTitle}
                                    onChange={(e) => setQuickAddTitle(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-white/5 border-2 border-slate-100 dark:border-white/5 focus:border-primary/20 rounded-2xl py-4 pl-6 pr-16 text-lg font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-700 transition-all outline-none"
                                />
                                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-xl bg-primary text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all">
                                    <Plus className="h-5 w-5" />
                                </button>
                            </form>
                        </div>
                    )}
                </div>

                {task && (
                    <div className="flex flex-col items-center gap-3">
                        <Button
                            size="icon"
                            onClick={handleStartFocus}
                            className="h-12 w-12 rounded-full bg-primary text-black hover:bg-primary/90 transition-all duration-300 group/btn"
                        >
                            <Play className="h-5 w-5 fill-current transition-transform group-hover/btn:scale-110" />
                        </Button>
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary">Focus</span>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
