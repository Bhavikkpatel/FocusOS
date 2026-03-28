"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Check, Trash2, ArrowRight, 
    MessageSquare, Calendar, Zap, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCreateTask } from "@/hooks/use-tasks";
import { format } from "date-fns";
import { toast } from "sonner";
import { useTimerStore } from "@/store/timer";
import { useEffect } from "react";

interface Distraction {
    id: string;      // session-index
    sessionId: string;
    text: string;
    createdAt: string;
    context: {
        taskTitle: string;
        taskId: string | null;
        projectId: string | null;
    };
}

export function CapturedThoughts() {
    const queryClient = useQueryClient();
    const createTask = useCreateTask();

    const { data: distractions = [], isLoading, refetch } = useQuery<Distraction[]>({
        queryKey: ["distractions"],
        queryFn: async () => {
            const res = await fetch("/api/deep-work/distractions");
            if (!res.ok) throw new Error("Failed to fetch distractions");
            return res.json();
        }
    });

    const hasNewDistraction = useTimerStore(state => state.hasNewDistraction);
    const resetDistractionSync = useTimerStore(state => state.resetDistractionSync);

    useEffect(() => {
        if (hasNewDistraction) {
            console.log("[CapturedThoughts] New distraction detected in store, refetching...");
            refetch();
            resetDistractionSync();
        }
    }, [hasNewDistraction, refetch, resetDistractionSync]);

    const removeMutation = useMutation({
        mutationFn: async ({ sessionId, updatedDistractions }: { sessionId: string, updatedDistractions: any[] }) => {
            const res = await fetch(`/api/deep-work/${sessionId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ distractions: updatedDistractions })
            });
            if (!res.ok) throw new Error("Failed to update distractions");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["distractions"] });
        }
    });

    const handleConvert = async (distraction: Distraction) => {
        try {
            await createTask.mutateAsync({
                title: distraction.text,
                project: !distraction.context.projectId ? "Inbox" : undefined,
                projectId: distraction.context.projectId,
                priority: "MEDIUM",
                status: "TODO",
                dueDate: new Date()
            });
            
            // Remove from distractions list
            handleDismiss(distraction);
            toast.success("Thought converted to task");
        } catch (error) {
            toast.error("Failed to convert thought");
        }
    };

    const handleDismiss = (distraction: Distraction) => {
        // Find all distractions for this session, remove this one
        const sessionDistractions = distractions
            .filter(d => d.sessionId === distraction.sessionId)
            .filter(d => d.id !== distraction.id)
            .map(d => ({ text: d.text, createdAt: d.createdAt }));

        removeMutation.mutate({ 
            sessionId: distraction.sessionId, 
            updatedDistractions: sessionDistractions 
        });
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-white/5 border border-dashed rounded-[2.5rem]">
                <Loader2 className="h-8 w-8 animate-spin text-primary opacity-50" />
                <span className="text-[10px] font-black uppercase tracking-widest mt-4 opacity-50">Fetching captured thoughts...</span>
            </div>
        );
    }

    if (distractions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-white/5 border border-dashed rounded-[2.5rem] text-center">
                <div className="h-16 w-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
                    <Check className="h-8 w-8 text-emerald-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Clear Mind</h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                    All your captured thoughts have been processed. Great work staying focused!
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-amber-500/10 rounded-xl">
                        <MessageSquare className="h-5 w-5 text-amber-500" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black tracking-tight">Captured Thoughts</h3>
                        <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Processing Inbox</p>
                    </div>
                </div>
                <Badge variant="secondary" className="px-3 py-1 rounded-full font-mono text-[10px] bg-slate-100 dark:bg-slate-800">
                    {distractions.length} ITEMS
                </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence mode="popLayout">
                    {distractions.map((thought) => (
                        <motion.div
                            key={thought.id}
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="group relative flex flex-col p-6 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 hover:border-primary/20 transition-all duration-300 rounded-[2rem] shadow-sm overflow-hidden"
                        >
                            {/* Thought Text */}
                            <div 
                                className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-6 leading-relaxed font-jetbrains min-h-[3em] italic"
                            >
                                "{thought.text}"
                            </div>

                            {/* Context Footer */}
                            <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800/50">
                                <div className="flex flex-col gap-1.5 overflow-hidden">
                                    <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-slate-400">
                                        <Calendar className="h-3 w-3" />
                                        {format(new Date(thought.createdAt), "MMM d, h:mm a")}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-primary truncate">
                                        <Zap className="h-3 w-3" />
                                        {thought.context.taskTitle}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDismiss(thought)}
                                        className="h-10 w-10 rounded-full text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                                        title="Dismiss"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleConvert(thought)}
                                        className="h-10 w-10 rounded-full text-primary hover:bg-primary/10"
                                        title="Convert to Task"
                                    >
                                        <ArrowRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Subtle background decoration */}
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-primary/5 transition-colors" />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
