"use client";

import { useState, useRef } from "react";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import { AuthModal } from "@/components/auth/auth-modal";
import { Button } from "@/components/ui/button";
import { GithubIcon } from "@/components/icons/github-icon";
import { Brain, Sparkles, Shield, Eye } from "lucide-react";

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

    // SCROLL ANIMATION TIMELINE (0.0 to 1.0 over 300vh)
    // 0.0  → 0.1: Chaos icons drift & dissolve (the "cleansing")
    // 0.1  → 0.2: Ghost UI slide-out (sidebar, header, tabs, checklist vanish) - FAST
    // 0.3  → 0.4: "Ghost UI Active" text appears
    // 0.5  → 0.7: Overlay message fades in
    // 0.9  → 1.0: Message fades out (into next section)

    const mockupScale = useTransform(scrollYProgress, [0, 0.1, 1], [0.95, 1.02, 1.02]);
    const uiOpacity = useTransform(scrollYProgress, [0.1, 0.2, 1], [1, 0, 0]);

    const slideLeft = useTransform(scrollYProgress, [0.1, 0.2, 1], [0, -500, -500]);
    const slideRight = useTransform(scrollYProgress, [0.1, 0.2, 1], [0, 500, 500]);
    const slideUp = useTransform(scrollYProgress, [0.1, 0.2, 1], [0, -500, -500]);
    const slideDown = useTransform(scrollYProgress, [0.1, 0.2, 1], [0, 500, 500]);

    const titleScale = useTransform(scrollYProgress, [0.1, 0.2, 1], [1, 1.3, 1.3]);
    const titleY = useTransform(scrollYProgress, [0.1, 0.2, 1], [0, 0, 0]); // Keep it centered

    const ghostTextOpacity = useTransform(scrollYProgress, [0.3, 0.4, 1], [0, 1, 1]);
    
    const messageOpacity = useTransform(scrollYProgress, [0.5, 0.7, 0.9, 1.0], [0, 1, 1, 0]);
    const messageY = useTransform(scrollYProgress, [0.5, 0.7, 0.9, 1.0], [30, 0, 0, -30]);
    const messageScale = useTransform(scrollYProgress, [0.65, 0.75], [0.95, 1]);

    const bgColor = useTransform(scrollYProgress, [0, 0.15, 0.9, 1], ["#121214", "#0A0A0B", "#0A0A0B", "#000000"]);
    
    // Aggregate opacity for the entire sticky content to fade out at the very end
    const finalFadeOpacity = useTransform(scrollYProgress, [0.9, 1], [1, 0]);

    return (
        <section className="relative bg-[#0A0A0B]">
            {/* Hero Copy Section */}
            <div className="relative min-h-[100dvh] flex flex-col items-center justify-center px-4 z-10 w-full max-w-7xl mx-auto text-center space-y-12 overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[800px] h-[600px] bg-primary/10 blur-[130px] rounded-full pointer-events-none" />
                
                {/* Background Large Text Decor */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
                    <span className="text-[26vw] font-black text-white/[0.015] whitespace-nowrap tracking-[0.15em] uppercase opacity-50">
                        Open Source
                    </span>
                </div>

                {/* Floating OSS Bubbles */}
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5, duration: 1 }}
                    className="absolute top-[18%] left-[5%] hidden lg:flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md"
                >
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <Brain className="h-4 w-4 text-primary" />
                    </div>
                    <div className="text-left">
                        <div className="text-[10px] font-bold text-white uppercase tracking-widest">Public Mind</div>
                        <div className="text-[9px] text-slate-500 font-mono">Open Source Architecture</div>
                    </div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7, duration: 1 }}
                    className="absolute top-[25%] right-[5%] hidden lg:flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md"
                >
                    <div className="h-8 w-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                        <Eye className="h-4 w-4 text-amber-500" />
                    </div>
                    <div className="text-left">
                        <div className="text-[10px] font-bold text-white uppercase tracking-widest">Transparent</div>
                        <div className="text-[9px] text-slate-500 font-mono">Zero Hidden Trackers</div>
                    </div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9, duration: 1 }}
                    className="absolute bottom-[28%] left-[5%] hidden xl:flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md"
                >
                    <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <Shield className="h-4 w-4 text-blue-500" />
                    </div>
                    <div className="text-left">
                        <div className="text-[10px] font-bold text-white uppercase tracking-widest">Privacy First</div>
                        <div className="text-[9px] text-slate-500 font-mono">Self-Hostable</div>
                    </div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.1, duration: 1 }}
                    className="absolute bottom-[32%] right-[5%] hidden xl:flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md"
                >
                    <div className="h-8 w-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                        <Sparkles className="h-4 w-4 text-purple-500" />
                    </div>
                    <div className="text-left">
                        <div className="text-[10px] font-bold text-white uppercase tracking-widest">Minimalist</div>
                        <div className="text-[9px] text-slate-500 font-mono">Zero Visual Noise</div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="space-y-8 relative z-10 flex flex-col items-center"
                >
                    <a 
                        href="https://github.com/Bhavikkpatel/FocusOS" 
                        target="_blank"
                        className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-primary uppercase tracking-[0.3em] mb-4 shadow-2xl hover:bg-white/10 transition-colors group"
                    >
                         <GithubIcon className="h-3 w-3 group-hover:scale-110 transition-transform" /> Anti-Gravity Engine
                    </a>

                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white leading-[0.85]">
                        Silence the noise.<br /><span className="text-primary italic font-light">Enter Anti-Gravity.</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed mt-6">
                        FocusOS is a high-tier execution environment for builders. <br/>
                        <span className="text-slate-500 font-mono text-sm uppercase tracking-widest">Designed for Deep Work. Zero Visual Noise. Sub-Millisecond Focus.</span>
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    className="pt-6 pb-16 relative z-10"
                >
                    <Button 
                        asChild
                        className="rounded-full bg-white text-black hover:bg-slate-200 px-10 h-24 font-black shadow-2xl shadow-white/20 transition-all hover:scale-110 active:scale-95"
                    >
                        <a href="https://github.com/Bhavikkpatel/FocusOS" target="_blank">
                            <GithubIcon className="h-16 w-16" />
                        </a>
                    </Button>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 1 }}
                    className="absolute bottom-12 left-0 right-0 flex flex-col items-center justify-center animate-bounce gap-2 text-slate-500"
                >
                    <span className="text-[9px] font-bold uppercase tracking-[0.3em] leading-none">Scroll to Ignite Engine</span>
                    <div className="h-4 w-px bg-slate-800" />
                </motion.div>
            </div>

            {/* Scroll-Jacked Sticky Container — 400vh */}
            <div ref={containerRef} className="relative h-[300vh] mt-24">
                <motion.div
                    style={{ backgroundColor: bgColor, opacity: finalFadeOpacity }}
                    className="sticky top-0 h-[100dvh] w-full flex flex-col items-center justify-center overflow-hidden px-6 box-border"
                >
                    {/* ── Phase 1: Chaos Icons (dissolve as user scrolls) ── */}
                    <ChaosIcon scrollYProgress={scrollYProgress} label="12 unread" icon="✉" color="text-red-400" xFrom="20%" xTo="130%" top="15%" fadeEnd={0.1} />
                    <ChaosIcon scrollYProgress={scrollYProgress} label="@mentioned you" icon="#" color="text-blue-400" xFrom="-10%" xTo="115%" top="65%" fadeEnd={0.1} />
                    <ChaosIcon scrollYProgress={scrollYProgress} label="× 3 conflicts" icon="⚠" color="text-amber-400" xFrom="75%" xTo="-20%" top="30%" fadeEnd={0.1} />
                    <ChaosIcon scrollYProgress={scrollYProgress} label="JIRA-419 overdue" icon="!" color="text-rose-500" xFrom="50%" xTo="140%" top="72%" fadeEnd={0.1} />
                    <ChaosIcon scrollYProgress={scrollYProgress} label="Meeting in 5 min" icon="⏰" color="text-purple-400" xFrom="-5%" xTo="120%" top="48%" fadeEnd={0.1} />
                    <ChaosIcon scrollYProgress={scrollYProgress} label="Slack: 47 DMs" icon="⚡" color="text-yellow-400" xFrom="35%" xTo="-25%" top="82%" fadeEnd={0.1} />

                    {/* ── The Anti-Gravity Engine Mockup ── */}
                    <div className="relative w-full max-w-6xl mx-auto z-30 scale-100 sm:origin-center origin-center pt-10 sm:pt-0">
                        <motion.div
                            style={{ scale: mockupScale }}
                            className="relative mx-auto rounded-[2.5rem] md:rounded-3xl border border-white/5 bg-white/5 p-2 md:p-6 backdrop-blur-3xl shadow-[0_0_80px_rgba(0,0,0,0.8)] transition-all"
                        >
                            <div className="aspect-[9/16] sm:aspect-[16/9] w-full rounded-[2rem] md:rounded-2xl overflow-hidden bg-[#0F111A] border border-white/5 relative shadow-inner flex">
                                
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
                                        className="absolute top-4 left-4 md:top-6 md:left-8 flex items-center gap-4 origin-top-left z-20 pointer-events-none"
                                    >
                                        <div className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-red-400 animate-pulse" />
                                    </motion.div>

                                    {/* 2. Top Header → slides up */}
                                    <motion.div 
                                        style={{ opacity: uiOpacity, y: slideUp }}
                                        className="h-12 md:h-16 border-b border-white/5 flex items-center justify-between px-4 md:px-8 z-10 pl-10 md:pl-16 overflow-hidden"
                                    >
                                        <div className="flex items-center gap-2 md:gap-4">
                                            <span className="text-white font-bold text-sm md:text-base leading-none">Tasks</span>
                                            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold hidden md:block">Today is Mar 22</span>
                                        </div>
                                        <div className="flex items-center gap-2 md:gap-4">
                                            <div className="px-2 md:px-3 py-1 md:py-1.5 rounded-full border border-white/10 text-[8px] md:text-[10px] font-bold text-white flex gap-1.5 md:gap-2 items-center bg-white/5">
                                                <div className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-amber-500" /> High Energy
                                            </div>
                                            <div className="h-6 w-6 md:h-8 md:w-8 rounded-full bg-white/10 hidden sm:block" />
                                        </div>
                                    </motion.div>

                                    {/* 3. Context bar → slides right */}
                                    <motion.div 
                                        style={{ opacity: uiOpacity, x: slideRight }}
                                        className="px-4 md:px-8 py-3 md:py-5 flex items-center justify-between z-10 gap-2 relative"
                                    >
                                        <div className="text-white font-bold text-xl truncate w-[30%] hidden md:block invisible">
                                            new event creation...
                                        </div>
                                        <div className="bg-black/40 border border-white/5 rounded-full flex items-center p-0.5 md:p-1 px-1 absolute left-1/2 -translate-x-1/2 transition-all">
                                            <div className="px-3 md:px-6 py-1 md:py-1.5 rounded-full bg-primary text-white text-[7px] md:text-[10px] font-bold tracking-[0.2em] uppercase whitespace-nowrap">Focus</div>
                                            <div className="px-2 md:px-5 py-1 md:py-1.5 text-slate-400 text-[7px] md:text-[10px] font-bold tracking-[0.2em] uppercase whitespace-nowrap">Details</div>
                                            <div className="px-2 md:px-5 py-1 md:py-1.5 text-slate-400 text-[7px] md:text-[10px] font-bold tracking-[0.2em] uppercase whitespace-nowrap hidden sm:block">History</div>
                                        </div>
                                        <div className="w-auto md:w-[30%] flex justify-end ml-auto">
                                            <div className="px-2 md:px-4 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[7px] md:text-xs font-bold text-white tracking-widest uppercase whitespace-nowrap">In Progress</div>
                                        </div>
                                    </motion.div>

                                    {/* 4. Center Stage — always visible, pulls to center */}
                                    <div className="flex-1 flex flex-col items-center justify-center relative z-20 overflow-hidden">
                                        <motion.div style={{ scale: titleScale, y: titleY }} className="flex flex-col items-center text-center w-full max-w-2xl px-4 md:px-6">
                                            <h2 className="text-sm md:text-3xl font-bold text-white leading-tight mb-4 md:mb-8 line-clamp-2 px-4">
                                                revisiting open-source roadmap, community first approach
                                            </h2>
                                            
                                            <div className="font-extrabold text-[4.5rem] md:text-[8.5rem] flex justify-center text-white tabular-nums tracking-tighter leading-none mb-10">
                                                24:53
                                            </div>

                                            <motion.div 
                                                style={{ opacity: uiOpacity }}
                                                className="flex items-center justify-center gap-6"
                                            >
                                                <div className="h-16 w-16 rounded-full border-2 border-white/10 flex items-center justify-center gap-1.5 hover:bg-white/5 transition-colors cursor-pointer group">
                                                    <div className="w-2 h-6 bg-white/60 rounded-full group-hover:bg-white transition-colors" />
                                                    <div className="w-2 h-6 bg-white/60 rounded-full group-hover:bg-white transition-colors" />
                                                </div>
                                            </motion.div>
                                        </motion.div>
                                    </div>

                                    {/* 5. Mission Checklist → slides down */}
                                    <motion.div 
                                        style={{ opacity: uiOpacity, y: slideDown }}
                                        className="absolute bottom-6 md:bottom-6 left-0 right-0 z-10 space-y-2.5 px-6 md:px-12"
                                    >
                                        <div className="flex justify-between items-center max-w-lg mx-auto md:px-1 mb-2 md:mb-0">
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
                                        className="absolute bottom-6 right-6 md:bottom-8 md:right-10 font-mono text-[9px] md:text-[10px] text-slate-600 uppercase tracking-widest font-bold pointer-events-none z-30"
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
