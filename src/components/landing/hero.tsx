"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AuthModal } from "@/components/auth/auth-modal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Hero() {
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isGhostMode, setIsGhostMode] = useState(false);
    const [hoverTimer, setHoverTimer] = useState<NodeJS.Timeout | null>(null);

    const handleMouseEnter = () => {
        const timer = setTimeout(() => {
            setIsGhostMode(true);
        }, 3000);
        setHoverTimer(timer);
    };

    const handleMouseLeave = () => {
        if (hoverTimer) clearTimeout(hoverTimer);
        setIsGhostMode(false);
    };

    return (
        <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 px-6 overflow-hidden bg-[#0A0A0B]">
            {/* Ambient Background Lights */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
            
            <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="space-y-4"
                >
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white">
                        Enter <span className="text-primary italic">FlowState</span>
                    </h1>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed">
                        A modern productivity system designed for deep work, task management, and focus-driven execution.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                >
                    <Button 
                        onClick={() => setIsAuthModalOpen(true)}
                        className="rounded-full bg-white text-black hover:bg-slate-200 px-10 h-14 text-lg font-bold shadow-2xl shadow-white/10 transition-all hover:scale-105"
                    >
                        Enter Flow State — It's Free
                    </Button>
                </motion.div>

                {/* Zenith UI Mockup */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    className="relative mt-20 group"
                >
                    <div className="relative mx-auto max-w-5xl rounded-2xl border border-white/5 bg-white/5 p-4 backdrop-blur-3xl shadow-2xl transition-all duration-700">
                        <div className="aspect-[16/9] w-full rounded-xl overflow-hidden bg-black/40 border border-white/5 relative">
                            {/* Mockup Content */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
                                <AnimatePresence>
                                    {!isGhostMode && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 1 }}
                                            className="absolute top-8 left-8 flex items-center gap-4"
                                        >
                                            <div className="h-2 w-2 rounded-full bg-red-400 animate-pulse" />
                                            <span className="text-xs font-mono text-slate-500 tracking-widest uppercase">Recording Session</span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="space-y-6">
                                    <motion.h2 
                                        className={cn(
                                            "text-4xl font-bold transition-all duration-1000",
                                            isGhostMode ? "scale-125 opacity-100" : "opacity-90"
                                        )}
                                    >
                                        Rebuilding the landing page engine
                                    </motion.h2>
                                    <div className="font-mono text-6xl md:text-8xl font-bold text-primary tabular-nums">
                                        24:59
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {!isGhostMode && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            transition={{ duration: 0.7 }}
                                            className="mt-12 flex items-center gap-4 text-slate-500 font-medium"
                                        >
                                            <span className="px-3 py-1 rounded-full border border-white/10 text-[10px] uppercase tracking-wider">Deep Work</span>
                                            <span className="px-3 py-1 rounded-full border border-white/10 text-[10px] uppercase tracking-wider">Urgent</span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Ghost UI Indicator */}
                            <div className="absolute bottom-6 right-6 font-mono text-[10px] text-slate-700 uppercase tracking-widest pointer-events-none">
                                {isGhostMode ? "Ghost UI Active" : "Hover to trigger Ghost Mode"}
                            </div>
                        </div>
                    </div>
                    
                    {/* Shadow Decoration */}
                    <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[90%] h-20 bg-primary/20 blur-[100px] pointer-events-none" />
                </motion.div>
            </div>

            <AuthModal 
                isOpen={isAuthModalOpen} 
                onClose={() => setIsAuthModalOpen(false)} 
            />
        </section>
    );
}
