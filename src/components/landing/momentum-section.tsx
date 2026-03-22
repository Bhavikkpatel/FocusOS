"use client";

import { motion } from "framer-motion";

export function MomentumSection() {
    return (
        <section className="py-32 relative overflow-hidden bg-black/20">
            {/* Ambient background ring decoration */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-white/5 opacity-10 animate-[spin_20s_linear_infinite]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-white/[0.02] opacity-5 animate-[spin_30s_linear_infinite_reverse]" />

            <div className="max-w-4xl mx-auto px-6 text-center space-y-12 relative z-10">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="space-y-6"
                >
                    <span className="font-mono text-xs uppercase tracking-[0.4em] text-primary font-bold">
                        BEHAVIORAL_INSIGHTS
                    </span>
                    <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tight leading-tight">
                        Close your laptop<br /> <span className="text-slate-500">with energy to spare.</span>
                    </h2>
                    <p className="text-xl text-slate-400 font-medium leading-relaxed max-w-2xl mx-auto">
                        Traditional apps leave you feeling guilty about what you didn&apos;t do. FocusOS measures the quality of what you did — then tells you you&apos;re winning.
                    </p>
                </motion.div>

                {/* Scorecard Visual Mockup */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="relative max-w-lg mx-auto p-1 border border-white/5 rounded-[40px] bg-white/[0.02] backdrop-blur-3xl shadow-2xl"
                >
                    <div className="relative p-12 rounded-[38px] bg-black/40 border border-white/5 flex flex-col items-center gap-8">
                        {/* Progress Ring */}
                        <div className="relative h-48 w-48 flex items-center justify-center">
                            <svg className="h-full w-full -rotate-90">
                                <circle
                                    cx="96"
                                    cy="96"
                                    r="88"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="12"
                                    className="text-white/[0.03]"
                                />
                                <motion.circle
                                    cx="96"
                                    cy="96"
                                    r="88"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="12"
                                    strokeDasharray="552.92"
                                    initial={{ strokeDashoffset: 552.92 }}
                                    whileInView={{ strokeDashoffset: 552.92 * 0.15 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 2, ease: "easeOut", delay: 0.5 }}
                                    className="text-primary"
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-5xl font-mono font-bold text-white tabular-nums tracking-tight">85</span>
                                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mt-1 font-bold">Score</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-12 w-full pt-8 border-t border-white/5">
                            <div className="text-center space-y-2">
                                <span className="block text-2xl font-bold text-white">4.2h</span>
                                <span className="block text-[10px] text-slate-600 uppercase tracking-widest font-mono font-bold">Deep Work</span>
                            </div>
                            <div className="text-center space-y-2">
                                <span className="block text-2xl font-bold text-white">12</span>
                                <span className="block text-[10px] text-slate-600 uppercase tracking-widest font-mono font-bold">Sessions</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-emerald-400/10 border border-emerald-400/20">
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest font-bold">You&apos;re running above capacity</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
