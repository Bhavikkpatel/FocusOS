"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
    CheckCircle2, Clock, AlertCircle, ArrowRight, 
    Zap, Trash2, Check
} from "lucide-react";
import { useTimerStore } from "@/store/timer";
import { useTasks, useCreateTask, useRateSession } from "@/hooks/use-tasks";
import { cn } from "@/lib/utils";
import { VictoryAnimation } from "./victory-animation";

interface ReflectionFlowProps {
    onClose: (result: { action: "CONTINUE" | "END" }) => void;
}

export function ReflectionFlow({ onClose }: ReflectionFlowProps) {
    const [step, setStep] = useState<"SUMMARY" | "ENERGY" | "DISTRACTIONS">("SUMMARY");
    const [action, setAction] = useState<"CONTINUE" | "END">("END");
    const { 
        elapsed, 
        sessionsCompleted, 
        sessionDistractions,
        sessionToRate,
        currentTaskId
    } = useTimerStore();

    const { data: tasksData } = useTasks({});
    const allTasks = tasksData?.pages.flatMap(page => page.tasks) || [];
    const currentTask = allTasks.find((t: any) => t.id === currentTaskId);

    const nextStep = () => {
        if (step === "SUMMARY") {
            // If continuing, skip energy/distractions and just go
            if (action === "CONTINUE") onClose({ action });
            else setStep("ENERGY");
        }
        else if (step === "ENERGY") {
            if (sessionDistractions.length > 0) setStep("DISTRACTIONS");
            else onClose({ action });
        } else {
            onClose({ action });
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-2xl p-6 pointer-events-auto overflow-hidden">
            <AnimatePresence mode="wait">
                {step === "SUMMARY" && (
                    <SummaryStep 
                        key="summary"
                        elapsed={elapsed} 
                        sessionsCompleted={sessionsCompleted} 
                        taskTitle={currentTask?.title || "Deep Work"}
                        onContinue={() => { setAction("CONTINUE"); nextStep(); }}
                        onEnd={() => { setAction("END"); nextStep(); }}
                    />
                )}
                {step === "ENERGY" && (
                    <EnergyStep 
                        key="energy"
                        sessionId={sessionToRate || ""}
                        onNext={nextStep} 
                    />
                )}
                {step === "DISTRACTIONS" && (
                    <DistractionsStep 
                        key="distractions"
                        distractions={sessionDistractions}
                        onClose={onClose}
                        action={action}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

function SummaryStep({ elapsed, sessionsCompleted, taskTitle, onContinue, onEnd }: any) {
    const { deepWorkSessionId } = useTimerStore();
    const [isEnding, setIsEnding] = useState(false);
    const [sessionSummary, setSessionSummary] = useState<{ totalTime: number; sessionCount: number; interruptions: number } | null>(null);

    useEffect(() => {
        if (deepWorkSessionId) {
            fetch(`/api/deep-work/${deepWorkSessionId}`)
                .then(res => res.json())
                .then(data => {
                    setSessionSummary({
                        totalTime: data.totalDuration,
                        sessionCount: data.sessionCount,
                        interruptions: data.interruptions
                    });
                })
                .catch(err => console.error("Error fetching session summary:", err));
        }
    }, [deepWorkSessionId]);

    const formatDuration = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        if (hours > 0) return `${hours}h ${mins}m`;
        return `${mins}m`;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center text-center space-y-8 max-w-md w-full relative"
        >
            <div className="absolute inset-x-0 top-0 bottom-0 pointer-events-none overflow-hidden -z-10">
                <VictoryAnimation />
            </div>

            <div className="relative">
                <div className="absolute -inset-4 bg-primary/20 rounded-full blur-xl animate-pulse" />
                <CheckCircle2 className="h-20 w-20 text-primary relative" />
            </div>

            <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tight text-white line-clamp-2 px-4" style={{ fontFamily: "Inter, sans-serif" }}>
                    {taskTitle}
                </h2>
                <div className="flex items-center justify-center gap-2 text-slate-400 text-sm" style={{ fontFamily: "Inter, sans-serif" }}>
                    <span>{deepWorkSessionId ? "Deep Work Block" : "Session Complete"}</span>
                    <span className="h-1 w-1 rounded-full bg-slate-700" />
                    <span>{sessionSummary?.sessionCount || sessionsCompleted} today</span>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-3 w-full">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center gap-2 w-full">
                    <Clock className="h-5 w-5 text-blue-400" />
                    <span className="text-6xl font-black text-white" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                        {formatDuration(sessionSummary?.totalTime || elapsed)}
                    </span>
                    <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500">
                        {deepWorkSessionId ? "Total Deep Work Time" : "Focused Time"}
                    </span>
                </div>
                
                {deepWorkSessionId && sessionSummary && (
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col items-center">
                            <Zap className="h-4 w-4 text-amber-400 mb-1" />
                            <span className="text-xl font-bold text-white tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                                {sessionSummary.sessionCount}
                            </span>
                            <span className="text-[8px] uppercase tracking-widest text-slate-500 font-bold">Cycles</span>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col items-center">
                            <AlertCircle className="h-4 w-4 text-rose-400 mb-1" />
                            <span className="text-xl font-bold text-white tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                                {sessionSummary.interruptions}
                            </span>
                            <span className="text-[8px] uppercase tracking-widest text-slate-500 font-bold">Interruptions</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-3 w-full">
                <Button 
                    onClick={onContinue} 
                    className="w-full h-14 rounded-xl font-bold text-lg group"
                >
                    Continue Deep Work
                    <Zap className="ml-2 h-5 w-5 group-hover:scale-110 transition-transform text-yellow-400 fill-yellow-400" />
                </Button>
                
                <Button 
                    variant="ghost"
                    onClick={() => { setIsEnding(true); onEnd(); }} 
                    disabled={isEnding}
                    className="w-full h-12 rounded-xl font-bold text-slate-400 hover:text-white"
                >
                    {isEnding ? "Saving..." : "End Session & Reflect"}
                </Button>
            </div>
        </motion.div>
    );
}

function EnergyStep({ sessionId, onNext }: { sessionId: string; onNext: () => void }) {
    const rateSession = useRateSession();
    const levels = [
        { label: "Low", value: 1, color: "text-rose-400" },
        { label: "Med", value: 3, color: "text-amber-400" },
        { label: "High", value: 5, color: "text-emerald-400" },
    ];

    const handleRate = async (val: number) => {
        const { deepWorkSessionId, updateTimerState } = useTimerStore.getState();
        
        if (deepWorkSessionId) {
            await fetch(`/api/deep-work/${deepWorkSessionId}/complete`, { 
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ energy: val })
            });
            updateTimerState({ deepWorkSessionId: null });
        } else if (sessionId) {
            rateSession.mutate({ id: sessionId, rating: val });
        }
        onNext();
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center text-center space-y-10 max-w-md w-full"
        >
            <div className="space-y-4">
                <Zap className="h-12 w-12 text-primary mx-auto" />
                <h2 className="text-4xl font-bold text-white" style={{ fontFamily: "Inter, sans-serif" }}>Energy Check-in</h2>
                <p className="text-slate-400">How do you feel after this session?</p>
            </div>

            <div className="grid grid-cols-3 gap-4 w-full">
                {levels.map((level) => (
                    <button
                        key={level.value}
                        onClick={() => handleRate(level.value)}
                        className="group flex flex-col items-center gap-4 bg-white/5 border border-white/10 hover:border-white/30 hover:bg-white/10 rounded-3xl p-6 transition-all"
                    >
                        <div className={cn("text-3xl font-black tabular-nums transition-transform group-hover:scale-110", level.color)} style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                            {level.value}
                        </div>
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-500">{level.label}</span>
                    </button>
                ))}
            </div>

            <button onClick={onNext} className="text-slate-500 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest">
                Skip Check-in
            </button>
        </motion.div>
    );
}

function DistractionsStep({ distractions, onClose, action }: { distractions: string[]; onClose: (result: { action: "CONTINUE" | "END" }) => void; action: "CONTINUE" | "END" }) {
    const { deepWorkSessionId } = useTimerStore();
    const [items, setItems] = useState<{ id: string; text: string }[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const createTask = useCreateTask();

    useEffect(() => {
        if (deepWorkSessionId) {
            fetch(`/api/deep-work/${deepWorkSessionId}`)
                .then(res => res.json())
                .then(data => {
                    const sessionDistractions = (data.distractions || []) as { text: string; createdAt: string }[];
                    setItems(sessionDistractions.map((d, i) => ({ id: `dw-${i}`, text: d.text })));
                    setIsLoading(false);
                })
                .catch(err => {
                    console.error("Error fetching distractions:", err);
                    setItems(distractions.map((text, i) => ({ id: `local-${i}`, text })));
                    setIsLoading(false);
                });
        } else {
            setItems(distractions.map((text, i) => ({ id: `local-${i}`, text })));
            setIsLoading(false);
        }
    }, [deepWorkSessionId, distractions]);

    const syncDistractions = async (updatedItems: { id: string; text: string }[]) => {
        if (deepWorkSessionId) {
            const distractionsToSync = updatedItems.map(i => ({ text: i.text, createdAt: new Date().toISOString() }));
            await fetch(`/api/deep-work/${deepWorkSessionId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ distractions: distractionsToSync })
            }).catch(err => console.error("Error syncing distractions:", err));
        }
    };

    const handleConvert = (id: string, text: string) => {
        createTask.mutate({
            title: text,
            project: "Inbox",
            priority: "LOW",
            status: "TODO"
        });
        const newItems = items.filter(i => i.id !== id);
        setItems(newItems);
        syncDistractions(newItems);
    };

    const handleDelete = (id: string) => {
        const newItems = items.filter(i => i.id !== id);
        setItems(newItems);
        syncDistractions(newItems);
    };

    const handleUpdate = (id: string, text: string) => {
        const newItems = items.map(i => i.id === id ? { ...i, text } : i);
        setItems(newItems);
        // We don't necessarily need to sync on every keystroke, but maybe on blur?
        // Let's keep it simple and sync on action for now.
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col space-y-8 max-w-2xl w-full"
        >
            <div className="text-center space-y-2">
                <AlertCircle className="h-10 w-10 text-amber-500 mx-auto" />
                <h2 className="text-3xl font-bold text-white">Distraction Review</h2>
                <p className="text-slate-400">Process the thoughts you captured during focus.</p>
            </div>

            <div className="max-h-[400px] overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                {isLoading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
                    </div>
                ) : items.length === 0 ? (
                    <div className="text-center py-12 bg-white/5 rounded-3xl border border-dashed border-white/10">
                        <Check className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Inbox Cleared</p>
                    </div>
                ) : (
                    items.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-4 group">
                            <input 
                                value={item.text}
                                onChange={(e) => handleUpdate(item.id, e.target.value)}
                                className="flex-1 bg-transparent text-white border-none focus:ring-0 text-sm font-mono"
                                style={{ fontFamily: "'JetBrains Mono', monospace" }}
                            />
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    onClick={() => handleConvert(item.id, item.text)}
                                    className="h-8 w-8 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10"
                                >
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                                <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    onClick={() => handleDelete(item.id)}
                                    className="h-8 w-8 text-rose-400 hover:text-rose-300 hover:bg-rose-400/10"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <Button 
                onClick={() => onClose({ action })} 
                className="w-full h-14 rounded-2xl font-bold text-lg"
            >
                Finish Review
            </Button>
        </motion.div>
    );
}
