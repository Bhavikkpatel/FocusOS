"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { FileText, History as HistoryIcon, Zap } from "lucide-react";

const MODES = [
    { 
        id: "focus", 
        label: "Focus", 
        icon: Zap, 
        title: "Execution Mode",
        description: "Zero distractions. Hero task, focus rows, and a ghosting UI that fades when you're in the zone.",
        color: "text-primary dark:text-primary",
        bg: "bg-primary/10"
    },
    { 
        id: "details", 
        label: "Details", 
        icon: FileText, 
        title: "Composition Mode",
        description: "Deep dive into your context. Markdown notes, attachments, and metadata in a minimalist split-pane view.",
        color: "text-blue-400",
        bg: "bg-blue-400/10"
    },
    { 
        id: "history", 
        label: "History", 
        icon: HistoryIcon, 
        title: "Reflection Mode",
        description: "Review your momentum. Session analytics, timeline history, and behavioral focus scores.",
        color: "text-purple-400",
        bg: "bg-purple-400/10"
    }
];

export function FeatureShowcase() {
    const [activeMode, setActiveMode] = useState("focus");

    return (
        <section className="py-32 space-y-32 max-w-7xl mx-auto px-6">
            {/* Feature 1: Zenith Focus Engine */}
            <div className="grid md:grid-cols-2 gap-16 items-center">
                <div className="space-y-8">
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <Zap className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
                        Zenith Focus Engine. <span className="text-slate-500">Capture without breaking flow.</span>
                    </h2>
                    <p className="text-xl text-slate-400 leading-relaxed font-medium">
                        FocusOS allows you to capture distracting thoughts with a single keystroke using the Scratchpad. Type <code className="text-primary font-bold">!</code> or <code className="text-primary font-bold">?</code> to store ideas for later review without stopping your timer.
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
                    <div className="flex justify-center">
                        <div className="flex p-1.5 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-xl">
                            {MODES.map((mode) => (
                                <button
                                    key={mode.id}
                                    onClick={() => setActiveMode(mode.id)}
                                    className={cn(
                                        "flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 relative",
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

                    {/* Mode Content Display */}
                    <div className="relative aspect-[21/9] w-full max-w-6xl mx-auto rounded-3xl border border-white/5 bg-white/5 overflow-hidden shadow-2xl group p-1">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeMode}
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                transition={{ duration: 0.4, ease: "easeOut" }}
                                className="absolute inset-0 flex flex-col md:flex-row"
                            >
                                <div className="md:w-1/3 p-12 flex flex-col justify-center space-y-6 bg-gradient-to-r from-black/40 to-transparent">
                                    <div className={cn("inline-flex h-12 w-12 rounded-2xl flex items-center justify-center", MODES.find(m => m.id === activeMode)?.bg)}>
                                        {MODES.find(m => m.id === activeMode)?.icon && (
                                            <div className={cn("h-6 w-6 font-bold", MODES.find(m => m.id === activeMode)?.color)}>
                                                {(() => {
                                                    const Icon = MODES.find(m => m.id === activeMode)?.icon;
                                                    return Icon ? <Icon /> : null;
                                                })()}
                                            </div>
                                        )}
                                    </div>
                                    <h3 className="text-3xl font-bold text-white tracking-tight">
                                        {MODES.find(m => m.id === activeMode)?.title}
                                    </h3>
                                    <p className="text-lg text-slate-400 font-medium leading-relaxed">
                                        {MODES.find(m => m.id === activeMode)?.description}
                                    </p>
                                </div>
                                <div className="flex-1 relative flex items-center justify-center p-12">
                                    {/* Illustrative Mockup based on Mode */}
                                    <div className="w-full h-full rounded-2xl bg-black/40 border border-white/5 flex items-center justify-center overflow-hidden">
                                        <span className="font-mono text-[10px] text-slate-800 uppercase tracking-widest">
                                            {activeMode === "focus" && "Zenith Focus Prototype"}
                                            {activeMode === "details" && "Context Composition View"}
                                            {activeMode === "history" && "Momentum Analytics Panel"}
                                        </span>
                                    </div>
                                    <div className={cn("absolute -bottom-20 -right-20 w-80 h-80 blur-[120px] rounded-full opacity-30", MODES.find(m => m.id === activeMode)?.bg)} />
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </section>
    );
}
