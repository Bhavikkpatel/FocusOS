"use client";

import { useState, useRef } from "react";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import { AuthModal } from "@/components/auth/auth-modal";
import { Button } from "@/components/ui/button";

// Individual chaos element — each gets its own component so hooks are called at top-level
function ChaosIcon({
    scrollYProgress,
    label,
    icon,
    color,
    xFrom,
    xTo,
    top,
    fadeEnd,
}: {
    scrollYProgress: MotionValue<number>;
    label: string;
    icon: string;
    color: string;
    xFrom: string;
    xTo: string;
    top: string;
    fadeEnd: number;
}) {
    const x = useTransform(scrollYProgress, [0, fadeEnd], [xFrom, xTo]);
    const opacity = useTransform(scrollYProgress, [0, fadeEnd], [0.45, 0]);
    return (
        <motion.div
            style={{ x, opacity, top }}
            className="absolute z-10 pointer-events-none"
        >
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm text-xs font-bold font-mono ${color}`}>
                <span>{icon}</span>
                <span>{label}</span>
            </div>
        </motion.div>
    );
}

export function Hero() {
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    // SCROLL ANIMATION TIMELINE (0.0 to 1.0 over 400vh)
    // 0.0  → 0.12: Chaos icons drift & dissolve (the "cleansing")
    // 0.15 → 0.40: Ghost UI slide-out (sidebar, header, tabs, checklist vanish)
    // 0.45 → 0.55: "Ghost UI Active" text appears
    // 0.65 → 0.75: Overlay message fades in
    // 0.90 → 0.98: Message fades out

    const mockupScale = useTransform(scrollYProgress, [0, 0.15, 1], [0.95, 1.02, 1.02]);
    const uiOpacity = useTransform(scrollYProgress, [0.15, 0.4], [1, 0]);

    const slideLeft = useTransform(scrollYProgress, [0.15, 0.4], [0, -80]);
    const slideRight = useTransform(scrollYProgress, [0.15, 0.4], [0, 80]);
    const slideUp = useTransform(scrollYProgress, [0.15, 0.4], [0, -80]);
    const slideDown = useTransform(scrollYProgress, [0.15, 0.4], [0, 80]);

    const titleScale = useTransform(scrollYProgress, [0.15, 0.4], [1, 1.1]);
    const titleY = useTransform(scrollYProgress, [0.15, 0.4], [0, -60]);

    const ghostTextOpacity = useTransform(scrollYProgress, [0.45, 0.55], [0, 1]);
    
    const messageOpacity = useTransform(scrollYProgress, [0.65, 0.75, 0.9, 0.98], [0, 1, 1, 0]);
    const messageY = useTransform(scrollYProgress, [0.65, 0.75, 0.9, 0.98], [30, 0, 0, -30]);
    const messageScale = useTransform(scrollYProgress, [0.65, 0.75], [0.95, 1]);

    const bgColor = useTransform(scrollYProgress, [0, 0.15], ["#121214", "#0A0A0B"]);

    return (
        <section className="relative bg-[#0A0A0B]">
            {/* Hero Copy */}
            <div className="relative pt-40 px-6 z-10 w-full max-w-5xl mx-auto text-center space-y-12">
                <div className="absolute top-[30%] left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[400px] bg-primary/10 blur-[130px] rounded-full pointer-events-none" />
                
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="space-y-6"
                >
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-tight">
                        Silence the noise.<br /><span className="text-primary italic">Reclaim your flow.</span>
                    </h1>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed">
                        FocusOS isn&apos;t a to-do list. It&apos;s a sanctuary. We stripped the UI-gravity of traditional tools so you can finally do your best work.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    className="pt-6"
                >
                    <Button 
                        onClick={() => setIsAuthModalOpen(true)}
                        className="rounded-full bg-white text-black hover:bg-slate-200 px-10 h-14 text-lg font-bold shadow-2xl shadow-white/10 transition-all hover:scale-105"
                    >
                        Enter Flow State — It&apos;s Free
                    </Button>
                </motion.div>
            </div>

            {/* Scroll-Jacked Sticky Container — 400vh */}
            <div ref={containerRef} className="relative h-[400vh] mt-24">
                <motion.div
                    style={{ backgroundColor: bgColor }}
                    className="sticky top-0 h-screen w-full flex flex-col items-center justify-center overflow-hidden px-6 box-border"
                >
                    {/* ── Phase 1: Chaos Icons (dissolve as user scrolls) ── */}
                    <ChaosIcon scrollYProgress={scrollYProgress} label="12 unread" icon="✉" color="text-red-400" xFrom="20%" xTo="130%" top="15%" fadeEnd={0.12} />
                    <ChaosIcon scrollYProgress={scrollYProgress} label="@mentioned you" icon="#" color="text-blue-400" xFrom="-10%" xTo="115%" top="65%" fadeEnd={0.12} />
                    <ChaosIcon scrollYProgress={scrollYProgress} label="× 3 conflicts" icon="⚠" color="text-amber-400" xFrom="75%" xTo="-20%" top="30%" fadeEnd={0.12} />
                    <ChaosIcon scrollYProgress={scrollYProgress} label="JIRA-419 overdue" icon="!" color="text-rose-500" xFrom="50%" xTo="140%" top="72%" fadeEnd={0.12} />
                    <ChaosIcon scrollYProgress={scrollYProgress} label="Meeting in 5 min" icon="⏰" color="text-purple-400" xFrom="-5%" xTo="120%" top="48%" fadeEnd={0.12} />
                    <ChaosIcon scrollYProgress={scrollYProgress} label="Slack: 47 DMs" icon="⚡" color="text-yellow-400" xFrom="35%" xTo="-25%" top="82%" fadeEnd={0.12} />

                    {/* ── The Zenith UI Mockup ── */}
                    <div className="relative w-full max-w-6xl mx-auto z-30">
                        <motion.div
                            style={{ scale: mockupScale }}
                            className="relative mx-auto rounded-3xl border border-white/5 bg-white/5 p-4 md:p-6 backdrop-blur-3xl shadow-[0_0_80px_rgba(0,0,0,0.8)]"
                        >
                            <div className="aspect-[16/9] w-full rounded-2xl overflow-hidden bg-[#0F111A] border border-white/5 relative shadow-inner flex">
                                
                                {/* 1. Left Sidebar → slides left */}
                                <motion.div 
                                    style={{ opacity: uiOpacity, x: slideLeft }}
                                    className="w-16 md:w-20 border-r border-white/5 bg-[#161821] flex flex-col items-center py-6 gap-8 z-10 hidden sm:flex"
                                >
                                    <div className="h-8 w-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                                        <div className="h-4 w-4 bg-white/30 rounded-sm" />
                                    </div>
                                    <div className="flex flex-col gap-6 opacity-40">
                                        <div className="h-6 w-6 rounded bg-white/50" />
                                        <div className="h-6 w-6 rounded bg-white/50" />
                                        <div className="h-6 w-6 rounded bg-white/50" />
                                        <div className="h-6 w-6 rounded bg-white/50" />
                                    </div>
                                </motion.div>

                                {/* Main Area */}
                                <div className="flex-1 flex flex-col relative w-full overflow-hidden">
                                    
                                    {/* Recording dot */}
                                    <motion.div
                                        style={{ opacity: uiOpacity, x: slideLeft }}
                                        className="absolute top-6 left-8 flex items-center gap-4 origin-top-left z-20 pointer-events-none"
                                    >
                                        <div className="h-2 w-2 rounded-full bg-red-400 animate-pulse" />
                                    </motion.div>

                                    {/* 2. Top Header → slides up */}
                                    <motion.div 
                                        style={{ opacity: uiOpacity, y: slideUp }}
                                        className="h-16 border-b border-white/5 flex items-center justify-between px-8 z-10 pl-16 overflow-hidden"
                                    >
                                        <div className="flex items-center gap-4">
                                            <span className="text-white font-bold text-base leading-none">Tasks</span>
                                            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold hidden md:block">Today is Mar 22</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="px-3 py-1.5 rounded-full border border-white/10 text-[10px] font-bold text-white flex gap-2 items-center bg-white/5">
                                                <div className="h-2 w-2 rounded-full bg-amber-500" /> High Energy
                                            </div>
                                            <div className="h-8 w-8 rounded-full bg-white/10" />
                                        </div>
                                    </motion.div>

                                    {/* 3. Context bar → slides right */}
                                    <motion.div 
                                        style={{ opacity: uiOpacity, x: slideRight }}
                                        className="px-8 py-5 flex items-center justify-between z-10"
                                    >
                                        <div className="text-white font-bold text-xl truncate max-w-[30%]">
                                            new event creation, should be able...
                                        </div>
                                        <div className="bg-black/40 border border-white/5 rounded-full flex items-center p-1">
                                            <div className="px-6 py-1.5 rounded-full bg-primary text-white text-[10px] font-bold tracking-[0.2em] uppercase">Focus</div>
                                            <div className="px-5 py-1.5 text-slate-400 text-[10px] font-bold tracking-[0.2em] uppercase">Details</div>
                                            <div className="px-5 py-1.5 text-slate-400 text-[10px] font-bold tracking-[0.2em] uppercase">History</div>
                                        </div>
                                        <div className="w-[30%] flex justify-end">
                                            <div className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs font-bold text-white tracking-widest uppercase">In Progress</div>
                                        </div>
                                    </motion.div>

                                    {/* 4. Center Stage — always visible, pulls to center */}
                                    <div className="flex-1 flex flex-col items-center justify-center relative z-20">
                                        <motion.div style={{ scale: titleScale, y: titleY }} className="flex flex-col items-center text-center w-full max-w-2xl px-6">
                                            <h2 className="text-xl md:text-2xl font-bold text-white leading-snug">
                                                new event creation, should be able to select existing task
                                            </h2>
                                            <motion.div 
                                                style={{ opacity: uiOpacity }}
                                                className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold mt-3"
                                            >
                                                Currently Executing
                                            </motion.div>
                                            <div className="mt-4 font-extrabold text-[4.5rem] md:text-[6.5rem] flex justify-center text-white tabular-nums tracking-tighter leading-none mb-6">
                                                24:53
                                            </div>
                                        </motion.div>
                                    </div>

                                    {/* 5. Mission Checklist → slides down */}
                                    <motion.div 
                                        style={{ opacity: uiOpacity, y: slideDown }}
                                        className="absolute bottom-6 left-0 right-0 z-10 space-y-2.5 hidden md:block px-12"
                                    >
                                        <div className="flex justify-between items-center max-w-lg mx-auto px-1">
                                            <div className="text-[9px] text-slate-500 font-bold tracking-[0.15em] uppercase flex items-center gap-2">
                                                <div className="h-3.5 w-3.5 rounded-sm border border-slate-600 border-dashed" /> Mission Checklist
                                            </div>
                                            <div className="text-[9px] font-mono text-slate-500 bg-white/5 px-2 py-0.5 rounded font-bold">0/8</div>
                                        </div>
                                        <div className="max-w-lg mx-auto p-2.5 rounded-xl border border-dashed border-white/10 bg-white/[0.01] flex items-center gap-3 text-slate-500 text-xs">
                                            <span className="text-lg font-light opacity-40 leading-none">+</span> subtask
                                        </div>
                                    </motion.div>

                                    {/* Ghost UI Indicator */}
                                    <motion.div 
                                        style={{ opacity: ghostTextOpacity }}
                                        className="absolute bottom-8 right-10 font-mono text-[10px] text-slate-600 uppercase tracking-widest font-bold pointer-events-none z-30"
                                    >
                                        Ghost UI Active
                                    </motion.div>
                                </div>
                                
                                {/* Overlay: "You've entered the zone" */}
                                <motion.div 
                                    style={{ opacity: messageOpacity, y: messageY, scale: messageScale }}
                                    className="absolute inset-0 z-40 flex flex-col items-center justify-center pointer-events-none bg-black/60"
                                >
                                    <div className="flex flex-col items-center space-y-6 text-center max-w-2xl px-6">
                                        <h3 className="text-4xl md:text-6xl font-bold tracking-tight text-white leading-tight">
                                            You&apos;ve entered<br/>the zone.
                                        </h3>
                                        <p className="text-xl md:text-2xl text-slate-400 font-medium leading-relaxed max-w-lg mx-auto">
                                            Everything else dissolved.<br/><br/>
                                            <span className="text-white">Just you and the task.</span>
                                        </p>
                                    </div>
                                </motion.div>

                            </div>
                        </motion.div>
                        
                        <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-full max-w-4xl h-40 bg-primary/20 blur-[130px] pointer-events-none" />
                    </div>
                </motion.div>
            </div>

            <AuthModal 
                isOpen={isAuthModalOpen} 
                onClose={() => setIsAuthModalOpen(false)} 
            />
        </section>
    );
}
