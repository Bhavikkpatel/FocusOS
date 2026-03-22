"use client";

import { motion } from "framer-motion";

export function ProblemSection() {
    return (
        <section id="philosophy" className="py-32 bg-[#111112] border-y border-white/5 relative overflow-hidden">
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
                        <span className="font-mono text-sm tracking-[0.3em] text-red-500 uppercase">
                            ERR_DISTRACTION_DETECTED
                        </span>

                        <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                            Your tools are the ones <span className="text-slate-500">drowning you.</span>
                        </h2>

                        <div className="space-y-6 text-xl text-slate-400 leading-relaxed font-medium">
                            <p>
                                Every badge, banner, and buried notification is a micro-interruption your brain can never fully recover from. Traditional apps optimize for <span className="text-white italic underline decoration-primary decoration-2 underline-offset-4">organized chaos</span>. You need a tool that optimizes for execution.
                            </p>
                            <p>
                                FocusOS was built as a fortress, not a file cabinet. It holds back the noise so the work can breathe.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
