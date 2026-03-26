"use client";

import { motion } from "framer-motion";
import { Zap, Coffee, Github } from "lucide-react";
import { cn } from "@/lib/utils";

// Epics 4-6 Feature Card Mockups

function TimelineMockup() {
    return (
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-64 md:w-80 h-32 pr-8 opacity-90 group-hover:opacity-100 transition-opacity">
            <div className="flex flex-col gap-2 relative h-full justify-center">
                {/* Current Task overrunning */}
                <motion.div 
                    initial={{ width: "60%" }}
                    animate={{ width: "85%" }}
                    transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                    className="h-10 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center px-4"
                >
                    <div className="w-full flex items-center justify-between">
                        <span className="text-[11px] text-blue-300 font-bold truncate">Deep Work Phase</span>
                        <div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
                    </div>
                </motion.div>
                {/* Subsequent Task Sliding */}
                <motion.div 
                    initial={{ x: 0 }}
                    animate={{ x: 40 }}
                    transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                    className="h-10 rounded-lg bg-white/5 border border-white/10 flex items-center px-4 w-[75%]"
                >
                    <span className="text-[11px] text-slate-400 font-medium font-sans">Code Review</span>
                </motion.div>
                <div className="absolute top-1/2 -translate-y-1/2 -left-12 bottom-0 w-px border-l border-dashed border-white/20" />
            </div>
        </div>
    );
}

function EnergyMockup() {
    return (
        <div className="mt-8 space-y-4 opacity-90 transition-opacity">
            <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-500 tracking-wider"><Zap className="h-3 w-3"/> PRIME TIME</div>
                <div className="h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center px-3">
                    <span className="text-xs font-bold text-amber-500/90 truncate">System Architecture</span>
                </div>
            </div>
            <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 tracking-wider"><Coffee className="h-3 w-3"/> SHALLOW WORK</div>
                <div className="flex gap-2">
                    <div className="flex-1 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center px-3">
                        <span className="text-xs text-slate-400 font-medium truncate">Emails</span>
                    </div>
                    <div className="flex-1 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center px-3">
                        <span className="text-xs text-slate-400 font-medium truncate">Slack</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function LiquidMockup() {
    return (
        <div className="mt-8 flex flex-col items-center justify-center gap-4 h-full pb-8">
            <div className="flex items-end justify-center w-full h-[64px]">
                <motion.div 
                    initial={{ height: 64, borderColor: "rgba(255,255,255,0.1)", backgroundColor: "rgba(168, 85, 247, 0.1)" }}
                    animate={{ height: 44, borderColor: "rgba(245, 158, 11, 0.5)", backgroundColor: "rgba(245, 158, 11, 0.05)" }} // Amber warning
                    transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut", delay: 1 }}
                    className="w-full border-2 rounded-xl flex items-center justify-center relative overflow-hidden"
                >
                    <span className="text-[11px] text-white/80 font-bold relative z-10 transition-colors">Database Migration</span>
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 2, duration: 1, repeat: Infinity, repeatType: "reverse" }}
                        className="absolute inset-0 bg-amber-500/10"
                    />
                </motion.div>
            </div>
            
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.2, duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
                className="text-[10px] font-mono text-amber-500 uppercase tracking-widest font-bold"
            >
                Capacity Overflow Warning
            </motion.div>
        </div>
    );
}

function PredictiveMockup() {
    return (
        <div className="absolute right-0 md:right-8 top-1/2 -translate-y-1/2 w-56 md:w-64 bg-[#1A1A1C] border border-white/10 rounded-2xl p-5 shadow-2xl flex flex-col justify-between gap-6 mr-4 opacity-90 group-hover:opacity-100 transition-opacity">
            <div className="space-y-2">
                <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold font-mono">Actual Velocity</div>
                <div className="flex items-center text-xl font-bold font-mono tracking-tight text-white">
                    <span className="line-through text-slate-500 decoration-slate-600 decoration-2 mr-3">1 Pom</span>
                    <motion.span 
                        initial={{ opacity: 0, x: -10 }} 
                        animate={{ opacity: 1, x: 0 }} 
                        transition={{ duration: 1, repeat: Infinity, repeatType: "reverse", repeatDelay: 2 }}
                        className="text-emerald-400"
                    >
                        3 Poms
                    </motion.span>
                </div>
            </div>
            
            <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-mono text-slate-400 uppercase font-bold">
                    <span>Learning Progress</span>
                    <span className="text-emerald-400">84%</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                        initial={{ width: "20%" }}
                        animate={{ width: "84%" }}
                        transition={{ duration: 2, ease: "easeOut", repeat: Infinity, repeatDelay: 3 }}
                        className="h-full bg-emerald-500"
                    />
                </div>
            </div>
        </div>
    );
}

const FEATURES = [
    {
        id: "timeline",
        tag: "Auto-Drift",
        title: "A schedule that forgives you.",
        description: "When a task overruns its slot, everything else shifts automatically. No guilt, no manual rescheduling.",
        className: "md:col-span-2 md:row-span-1 min-h-[220px]",
        color: "text-blue-400",
        bg: "bg-blue-400/5",
        border: "border-blue-400/20",
        Mockup: TimelineMockup
    },
    {
        id: "energy",
        tag: "Energy Batching",
        title: "See the truth of your time.",
        description: "FocusOS organizes your day by your battery level, separating deep and shallow work.",
        className: "md:col-span-1 min-h-[260px]",
        color: "text-amber-400",
        bg: "bg-amber-400/5",
        border: "border-amber-400/20",
        Mockup: EnergyMockup
    },
    {
        id: "liquid",
        tag: "Liquid Blocks",
        title: "Tasks that bend to reality.",
        description: "Tasks morph into calendar blocks dynamically, visually warning you of capacity overruns before they happen.",
        className: "md:col-span-1 min-h-[260px]",
        color: "text-purple-400",
        bg: "bg-purple-400/5",
        border: "border-purple-400/20",
        Mockup: LiquidMockup
    },
    {
        id: "predictive",
        tag: "Velocity Learning",
        title: "A system that gets smarter every sprint.",
        description: "The system learns your actual velocity, auto-correcting your future estimates over time.",
        className: "md:col-span-2 md:row-span-1 min-h-[220px]",
        color: "text-emerald-400",
        bg: "bg-emerald-400/5",
        border: "border-emerald-400/20",
        Mockup: PredictiveMockup
    }
];

export function BentoBox() {
    return (
        <section className="py-32 max-w-7xl mx-auto px-6">
            <div className="space-y-6 max-w-3xl mb-12">
                <div className="flex items-center gap-3 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-slate-500 uppercase tracking-widest w-fit">
                    <Github className="h-3 w-3" /> Fully Auditable Source
                </div>
                <div className="space-y-2">
                    <span className="font-mono text-xs uppercase tracking-[0.4em] text-primary font-bold">Adaptive System</span>
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
                        Adaptive logic for <span className="text-slate-500 text-3xl md:text-4xl block mt-2 font-medium italic">how you actually work.</span>
                    </h2>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-max">
                {FEATURES.map((feature, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: i * 0.1 }}
                        whileHover={{ scale: 1.01 }}
                        className={cn(
                            "group relative rounded-3xl border border-white/5 bg-white/[0.02] p-8 overflow-hidden transition-all duration-300 backdrop-blur-3xl flex flex-col",
                            feature.className
                        )}
                    >
                        {/* Interactive Border Effect */}
                        <div className={cn(
                            "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 border-2 rounded-3xl pointer-events-none z-20",
                            feature.border
                        )} />

                        <div className="relative z-10 flex flex-col h-full">
                            <div className="space-y-2 max-w-[280px]">
                                <span className={cn("text-[10px] font-mono font-bold tracking-[0.2em] uppercase", feature.color)}>{feature.tag}</span>
                                <h3 className="text-xl font-bold text-white tracking-tight leading-snug">{feature.title}</h3>
                                <p className="text-slate-400 text-sm leading-relaxed font-medium">
                                    {feature.description}
                                </p>
                            </div>
                            
                            <div className="flex-1 mt-6">
                                <feature.Mockup />
                            </div>
                        </div>

                        {/* Background Decoration */}
                        <div className={cn(
                            "absolute -bottom-10 -right-10 w-48 h-48 blur-[80px] rounded-full transition-opacity duration-500 pointer-events-none overflow-hidden",
                            feature.bg
                        )} />
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
