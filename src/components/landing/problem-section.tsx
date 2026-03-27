"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Github, Info } from "lucide-react";
import { useState } from "react";

export function ProblemSection() {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <section id="philosophy" className="py-20 md:py-32 bg-[#111112] border-y border-white/5 relative overflow-hidden">
            {/* Grid Pattern Decoration */}
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none" 
                 style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "32px 32px" }} 
            />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="max-w-3xl">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="space-y-8"
                    >
                        <div className="flex items-center gap-3">
                            <span className="font-mono text-sm tracking-[0.3em] text-red-500 uppercase">
                                ERR_DISTRACTION_DETECTED
                            </span>
                            <div className="h-px w-8 bg-white/10" />
                            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-600 uppercase tracking-widest">
                                <Github className="h-3 w-3" /> Community Built
                            </div>
                        </div>

                        <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                            Your tools are the ones <span className="text-slate-500">drowning you.</span>
                        </h2>

                        <div className="space-y-6 text-xl text-slate-400 leading-relaxed font-medium">
                            <p>
                                Every badge, banner, and buried notification is a micro-interruption your brain can never fully recover from. Traditional apps optimize for {" "}
                                <span 
                                    className="relative inline-flex items-center justify-center"
                                    onMouseEnter={() => setIsHovered(true)}
                                    onMouseLeave={() => setIsHovered(false)}
                                >
                                    <span className="text-white italic underline decoration-primary decoration-2 underline-offset-4 cursor-help transition-colors hover:text-primary whitespace-nowrap">
                                        organized chaos
                                    </span>
                                    
                                    <AnimatePresence>
                                        {isHovered && (
                                            <motion.div 
                                                initial={{ opacity: 0, y: 5, scale: 0.95, x: "-50%" }}
                                                animate={{ opacity: 1, y: 0, scale: 1, x: "-50%" }}
                                                exit={{ opacity: 0, y: 5, scale: 0.95, x: "-50%" }}
                                                transition={{ duration: 0.2, ease: "easeOut" }}
                                                className="absolute bottom-full left-1/2 mb-3 w-72 p-4 bg-[#1A1A1C] border border-white/10 rounded-2xl shadow-2xl z-50 backdrop-blur-xl pointer-events-none origin-bottom"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="h-6 w-6 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                                        <Info className="h-3.5 w-3.5 text-primary" />
                                                    </div>
                                                    <div className="text-sm border-0 leading-relaxed text-slate-300">
                                                        <span className="font-bold text-white block mb-0.5">Organized Chaos</span>
                                                        A digital environment that is visually structured but functionally overwhelming, prioritizing metrics over actual deep work.
                                                    </div>
                                                </div>
                                                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-0.5 w-3 h-3 bg-[#1A1A1C] border-r border-b border-white/10 rotate-45" />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </span>.
                                You need a tool that optimizes for execution.
                            </p>
                            <p>
                                FocusOS was built as an open-source fortress, not a commercial file cabinet. It&apos;s a community-driven sanctuary that holds back the noise so your work can finally breathe.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
