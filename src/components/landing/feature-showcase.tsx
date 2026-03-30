"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { FileText, History as HistoryIcon, Zap } from "lucide-react";

const MODES = [
    { 
        id: "focus", 
        label: "Execute", 
        icon: Zap, 
        title: "Write at the speed of thought.",
        description: "Zero distractions. One task. A ghosting UI that fades when you reach the zone — leaving nothing between you and your work.",
        color: "text-primary dark:text-primary",
        bg: "bg-primary/10"
    },
    { 
        id: "details", 
        label: "Compose", 
        icon: FileText, 
        title: "Build context, not clutter.",
        description: "Deep dive into your context. Markdown notes, attachments, and metadata in a minimalist split-pane view that never overwhelms.",
        color: "text-blue-400",
        bg: "bg-blue-400/10"
    },
    { 
        id: "history", 
        label: "Reflect", 
        icon: HistoryIcon, 
        title: "Learn from your own momentum.",
        description: "Review your behavioral patterns. Session analytics, timeline history, and focus scores that reward the quality of your work.",
        color: "text-purple-400",
        bg: "bg-purple-400/10"
    }
];

export function FeatureShowcase() {
    const [activeMode, setActiveMode] = useState("focus");

    return (
        <section id="features" className="py-16 md:py-32 space-y-24 md:space-y-32 max-w-7xl mx-auto px-6">
            {/* Feature 1: Anti-Gravity Execution */}
            <div className="grid md:grid-cols-2 gap-16 items-center">
                <div className="space-y-8">
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <Zap className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
                        The UI that protects<br/><span className="text-slate-500">your focus.</span>
                    </h2>
                    <p className="text-xl text-slate-400 leading-relaxed font-medium">
                        When you&apos;re in deep work, the world should fade. **Ghost UI Protocol** detects your concentration and dissolves all unnecessary chrome — leaving only you and your task.
                    </p>
                </div>
                <div className="relative aspect-video rounded-3xl border border-white/5 bg-white/5 overflow-hidden shadow-2xl group">
                    {/* Illustrative Animation for Scratchpad */}
                    <div className="absolute inset-0 flex items-center justify-center p-8">
                        <div className="w-full max-w-sm space-y-4">
                            <motion.div 
                                className="h-12 bg-white/10 rounded-xl border border-white/10 flex items-center px-4 gap-3"
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                <span className="text-primary font-bold">!</span>
                                <span className="text-slate-400 text-sm font-mono">Buy coffee beans...</span>
                            </motion.div>
                            <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                            <div className="text-center">
                                <span className="text-[10px] text-slate-600 uppercase tracking-widest font-mono">Captured to Scratchpad</span>
                            </div>
                        </div>
                    </div>
                    <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-primary/20 blur-[100px] rounded-full" />
                </div>
            </div>

            {/* Feature 2: Contextual Workspace Tabs */}
            <div className="space-y-16">
                <div className="text-center space-y-6 max-w-3xl mx-auto">
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
                        A Workspace that <span className="text-primary">adapts to you.</span>
                    </h2>
                    <p className="text-xl text-slate-400 leading-relaxed font-medium">
                        FocusOS transforms based on your current phase of work. Composition, Execution, and Reflection.
                    </p>
                </div>

                <div className="space-y-12">
                    {/* Tab Switcher */}
                    <div className="hidden md:flex justify-center px-4">
                        <div className="flex p-1 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-xl overflow-x-auto no-scrollbar">
                            {MODES.map((mode) => (
                                <button
                                    key={mode.id}
                                    onClick={() => setActiveMode(mode.id)}
                                    className={cn(
                                        "flex items-center gap-1.5 md:gap-2 px-3 md:px-6 py-2 md:py-3 rounded-xl text-[10px] md:text-sm font-bold transition-all duration-300 relative whitespace-nowrap",
                                        activeMode === mode.id ? "text-white" : "text-slate-500 hover:text-slate-300"
                                    )}
                                >
                                    {activeMode === mode.id && (
                                        <motion.div 
                                            layoutId="activeTab" 
                                            className="absolute inset-0 bg-white/5 border border-white/10 rounded-xl shadow-lg shadow-white/5" 
                                        />
                                    )}
                                    <mode.icon className={cn("h-4 w-4 relative z-10", activeMode === mode.id && mode.color)} />
                                    <span className="relative z-10">{mode.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Mode Content Display (Desktop) */}
                    <div className="hidden md:block relative aspect-[21/9] w-full max-w-6xl mx-auto rounded-3xl border border-white/5 bg-white/5 overflow-hidden shadow-2xl group p-1">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeMode}
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                transition={{ duration: 0.4, ease: "easeOut" }}
                                className="absolute inset-0 flex flex-col md:flex-row"
                            >
                                <div className="w-full md:w-1/3 p-6 md:p-12 flex flex-col justify-center space-y-4 md:space-y-6 bg-gradient-to-b md:bg-gradient-to-r from-black/60 md:from-black/40 to-transparent z-20">
                                    <div className={cn("inline-flex h-10 md:h-12 w-10 md:w-12 rounded-xl md:rounded-2xl flex items-center justify-center", MODES.find(m => m.id === activeMode)?.bg)}>
                                        {MODES.find(m => m.id === activeMode)?.icon && (
                                            <div className={cn("h-5 w-5 md:h-6 md:w-6 font-bold", MODES.find(m => m.id === activeMode)?.color)}>
                                                {(() => {
                                                    const Icon = MODES.find(m => m.id === activeMode)?.icon;
                                                    return Icon ? <Icon /> : null;
                                                })()}
                                            </div>
                                        )}
                                    </div>
                                    <h3 className="text-xl md:text-3xl font-bold text-white tracking-tight">
                                        {MODES.find(m => m.id === activeMode)?.title}
                                    </h3>
                                    <p className="text-sm md:text-lg text-slate-400 font-medium leading-relaxed max-w-[85%] md:max-w-none">
                                        {MODES.find(m => m.id === activeMode)?.description}
                                    </p>
                                </div>
                                <div className="flex-1 relative flex items-center justify-center p-12">
                                    {/* Illustrative Mockup based on Mode */}
                                    <div className="w-full h-full rounded-2xl bg-black/40 border border-white/5 flex items-center justify-center overflow-hidden">
                                        <ModeMockup modeId={activeMode} />
                                    </div>
                                    <div className={cn("absolute -bottom-20 -right-20 w-80 h-80 blur-[120px] rounded-full opacity-30", MODES.find(m => m.id === activeMode)?.bg)} />
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Mobile Sequential Cards view */}
                    <div className="md:hidden flex flex-col gap-6 w-full max-w-lg mx-auto">
                        {MODES.map((mode) => (
                            <div key={mode.id} className="relative w-full rounded-[2rem] border border-white/5 bg-white/5 overflow-hidden shadow-2xl p-8 flex flex-col gap-6 group">
                                <div className={cn("absolute -top-10 -right-10 w-40 h-40 blur-[80px] rounded-full opacity-20", mode.bg)} />
                                <div className={cn("inline-flex h-14 w-14 rounded-2xl items-center justify-center relative z-10", mode.bg)}>
                                    {mode.icon && <mode.icon className={cn("h-7 w-7 font-bold", mode.color)} />}
                                </div>
                                <div className="space-y-4 relative z-10">
                                    <h3 className="text-2xl font-bold text-white tracking-tight leading-snug">
                                        {mode.title}
                                    </h3>
                                    <p className="text-slate-400 font-medium leading-relaxed text-[15px]">
                                        {mode.description}
                                    </p>
                                </div>
                                <div className="mt-2 aspect-square w-full rounded-2xl bg-black/40 border border-white/5 overflow-hidden relative shadow-inner flex items-center justify-center">
                                    <ModeMockup modeId={mode.id} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

function ModeMockup({ modeId }: { modeId: string }) {
    if (modeId === "focus") return (
        <div className="w-full h-full bg-[#0A0A0B] flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="z-10 text-center space-y-5"
            >
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[9px] font-bold uppercase tracking-widest shadow-lg shadow-primary/5">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                    Anti-Gravity Focus
                </div>
                <div className="text-3xl font-bold text-white tracking-tight">Implement Authentication</div>
                <div className="text-7xl font-mono font-bold text-white/90 tabular-nums tracking-tighter">45:00</div>
            </motion.div>
            
            {/* Faded out surrounding UI (Ghosting) */}
            <motion.div 
                initial={{ opacity: 1 }}
                whileInView={{ opacity: 0.1 }}
                viewport={{ once: true }}
                transition={{ delay: 1.5, duration: 2 }}
                className="absolute top-8 left-8 text-slate-500 text-xs font-medium space-y-3"
            >
                <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full border border-slate-600" />
                    <span>Setup DB connection</span>
                </div>
                <div className="flex items-center gap-2 opacity-50">
                    <div className="h-2 w-2 rounded-full border border-slate-600" />
                    <span>Configure OAuth API</span>
                </div>
            </motion.div>
        </div>
    );

    if (modeId === "details") return (
        <div className="w-full h-full bg-[#111] p-8 font-sans flex flex-col items-start relative overflow-hidden">
            <div className="w-full max-w-sm ml-6 md:ml-12 space-y-4 pt-4">
                <div className="text-2xl font-bold text-white tracking-tight opacity-90">Design System Setup</div>
                <div className="text-slate-500">Initialize core variables...</div>
                
                {/* Active line with slash command and tooltip */}
                <div className="relative border-l-2 border-primary/50 pl-4 py-1 -ml-[18px]">
                    {/* Floating Context */}
                    <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                        className="absolute -left-[5.5rem] top-1/2 -translate-y-1/2 flex items-center gap-1.5"
                    >
                        <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[9px] font-bold uppercase tracking-wider">Hard</span>
                    </motion.div>
                    
                    <div className="flex items-center gap-2 text-white/90">
                        <span className="text-primary font-mono font-bold truncate">git commit -m "feat..."</span>
                        <div className="hidden md:block w-0.5 h-4 bg-primary animate-[pulse_1s_ease-in-out_infinite]" />
                    </div>

                    {/* Slash Command Menu */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        whileInView={{ opacity: 1, scale: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.8, duration: 0.3 }}
                        className="absolute left-6 top-full mt-2 w-48 md:w-52 bg-[#1A1A1C] border border-white/10 rounded-xl shadow-2xl overflow-hidden p-1.5 z-10"
                    >
                        <div className="px-2 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">Commands</div>
                        <div className="p-1.5 rounded-lg bg-white/10 flex items-center gap-3">
                            <div className="h-7 w-7 rounded-md flex items-center justify-center bg-primary/20 text-primary font-mono text-[10px] font-bold border border-primary/20">T</div>
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-white leading-none">Todo</span>
                                <span className="text-[10px] text-slate-500 font-mono mt-1">Create actionable item</span>
                            </div>
                        </div>
                        <div className="p-1.5 rounded-lg hover:bg-white/5 flex items-center gap-3 mt-0.5">
                            <div className="h-7 w-7 rounded-md flex items-center justify-center bg-blue-500/20 text-blue-400 font-mono text-[10px] font-bold border border-blue-500/20">H</div>
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-slate-300 leading-none">Heading</span>
                                <span className="text-[10px] text-slate-500 font-mono mt-1">Section title</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );

    if (modeId === "history") return (
        <div className="w-full h-full bg-[#111] p-6 md:p-8 flex flex-col gap-8 relative overflow-hidden font-sans">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div className="space-y-1">
                    <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold font-mono">Focus Score</div>
                    <div className="flex items-baseline gap-1">
                        <div className="text-3xl md:text-5xl font-bold text-white tracking-tight">92</div>
                        <span className="text-base md:text-xl text-slate-500 font-bold">%</span>
                    </div>
                </div>
                <div className="text-right space-y-1">
                    <div className="text-[10px] text-purple-400/80 uppercase tracking-widest font-bold font-mono">Deep Session</div>
                    <div className="text-xl md:text-3xl font-bold text-purple-400 font-mono tracking-tight">4h 12m</div>
                </div>
            </div>

            {/* Chart Mockup */}
            <div className="flex-1 flex gap-2 md:gap-3 items-end justify-between pt-6 border-t border-white/10 h-full">
                {[40, 70, 45, 90, 65, 85, 100].map((height, i) => (
                    <div key={i} className="flex-1 h-full flex flex-col justify-end items-center gap-2 md:gap-3">
                        <motion.div 
                            initial={{ height: 0 }}
                            whileInView={{ height: `${height}%` }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1, duration: 0.6, type: "spring", bounce: 0.4 }}
                            className={cn(
                                "w-full max-w-6 md:max-w-8 rounded-t-sm backdrop-blur-md",
                                i === 6 ? "bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)]" : "bg-white/10 hover:bg-white/20 transition-colors"
                            )}
                        />
                        <div className="text-[9px] text-slate-600 font-mono font-bold">{["M","T","W","T","F","S","S"][i]}</div>
                    </div>
                ))}
            </div>
        </div>
    );

    return null;
}
