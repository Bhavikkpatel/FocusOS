"use client";

import { motion } from "framer-motion";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer-section";
import { 
    Layout, 
    BarChart3, 
    Calendar, 
    Target, 
    CheckCircle2,
    Clock,
    Circle,
    Globe,
    Users,
    Terminal
} from "lucide-react";
import { GithubIcon } from "@/components/icons/github-icon";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/auth/auth-modal";
import { useState } from "react";

const FEATURE_GROUPS = [
    {
        title: "Deep Work & Focus",
        icon: Target,
        features: [
            { name: "Zenith Focus Mode", description: "Immersive full-screen environment for absolute concentration.", status: "completed" },
            { name: "Ghost UI", description: "Interface elements dissolve during deep focus to reduce distractions.", status: "completed" },
            { name: "Distraction Scratchpad", description: "Capture intrusive thoughts instantly using '!' or '?' keys without leaving flow.", status: "in-progress" },
            { name: "Built-in Pomodoro", description: "Integrated timer tied directly to your tasks and analytics.", status: "completed" },
            { name: "Contextual Tabs", description: "Switch between Execute, Compose, and Reflect modes based on your current need.", status: "completed" }
        ]
    },
    {
        title: "Task & Project Logic",
        icon: Layout,
        features: [
            { name: "Adaptive Task System", description: "Organize tasks within projects using Kanban or List views.", status: "completed" },
            { name: "Pomodoro Estimation", description: "Predict how many sessions a task will take and track actual velocity.", status: "completed" },
            { name: "Auto-Drift Timeline", description: "Schedule that automatically adjusts when sessions overrun or under-run.", status: "in-progress" },
            { name: "Subtask Focus Rows", description: "Break down complex tasks into atomic, focusable subtasks.", status: "completed" },
            { name: "Tagging & Categories", description: "Flexible classification by energy level, priority, or project type.", status: "completed" }
        ]
    },
    {
        title: "Insights & Analytics",
        icon: BarChart3,
        features: [
            { name: "Momentum Scorecard", description: "Daily quality metrics that focus on your execution, not just completion.", status: "completed" },
            { name: "Focus Analytics", description: "Track session duration, estimation accuracy, and deep work patterns.", status: "completed" },
            { name: "Energy Check-ins", description: "Identify which hours are your 'Prime Time' vs 'Shallow Work' phases.", status: "planned" },
            { name: "Timeline History", description: "A visual log of exactly how your day unfolded across different focus blocks.", status: "completed" }
        ]
    },
    {
        title: "Planning & Workflow",
        icon: Calendar,
        features: [
            { name: "Full Calendar System", description: "Drag-and-drop task scheduling with live time indicators.", status: "completed" },
            { name: "Unallocated Sidebar", description: "Keep your unassigned tasks visible and ready to be slotted into your day.", status: "completed" },
            { name: "Focus Music", description: "Ambient background study music integrated directly into the workspace.", status: "in-progress" },
            { name: "2-Second Capture", description: "Command-style interface for capturing tasks at the speed of thought.", status: "completed" },
            { name: "Secure Storage", description: "Cloudflare R2 integration for attachments, PDFs, and deep dive context.", status: "completed" }
        ]
    }
];

export default function FeaturesPage() {
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    return (
        <main className="min-h-screen bg-[#0A0A0B] text-white selection:bg-primary/30">
            <Navbar />

            {/* Hero Section */}
            <section className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[600px] bg-primary/10 blur-[160px] rounded-full pointer-events-none" />
                
                {/* Background Large Text Decor */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
                    <span className="text-[20vw] font-black text-white/[0.02] whitespace-nowrap tracking-tighter uppercase">
                        Open Source
                    </span>
                </div>

                <div className="max-w-5xl mx-auto text-center space-y-10 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="flex flex-col items-center"
                    >
                        <a 
                            href="https://github.com/Bhavikkpatel/FocusOS" 
                            target="_blank"
                            className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-primary uppercase tracking-[0.3em] mb-10 shadow-2xl hover:bg-white/10 transition-colors group"
                        >
                             <GithubIcon className="h-3 w-3 group-hover:scale-110 transition-transform" /> Community Powered
                        </a>

                        <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9]">
                            Radically Transparent <br />
                            <span className="text-slate-500 italic font-light">Focus Architecture.</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto mt-10 font-medium leading-relaxed">
                            FocusOS is built in the open. We believe the tools that protect your mind should be as transparent as the thoughts they help you capture.
                        </p>

                        <div className="flex flex-wrap items-center justify-center gap-6 mt-12">
                            <a 
                                href="https://github.com/Bhavikkpatel/FocusOS" 
                                target="_blank"
                                className="flex items-center gap-2 text-xs font-mono text-slate-500 hover:text-white transition-colors"
                            >
                                <Users className="h-4 w-4" /> Contributions Welcome
                            </a>
                            <div className="w-1 h-1 rounded-full bg-slate-800" />
                            <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                                <Globe className="h-4 w-4" /> Global Community
                            </div>
                            <div className="w-1 h-1 rounded-full bg-slate-800" />
                            <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                                <Terminal className="h-4 w-4" /> AGPLv3 LICENSED
                            </div>
                        </div>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 1 }}
                    className="absolute bottom-12 left-0 right-0 flex flex-col items-center justify-center animate-bounce gap-2 text-slate-500"
                >
                    <span className="text-[9px] font-bold uppercase tracking-[0.3em] leading-none">Scroll to Explore Features</span>
                    <div className="h-4 w-px bg-slate-800" />
                </motion.div>
            </section>

            {/* Feature Grid */}
            <section className="py-24 px-6 relative">
                <div className="max-w-7xl mx-auto space-y-32">
                    {FEATURE_GROUPS.map((group, groupIndex) => (
                        <div key={groupIndex} className="space-y-12">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-8">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                                        <group.icon className="h-6 w-6 text-primary" />
                                    </div>
                                    <h2 className="text-3xl font-bold tracking-tight">{group.title}</h2>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-bold text-slate-500 uppercase tracking-widest w-fit">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Community Validated & Open Source
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {group.features.map((feature, featureIndex) => (
                                    <motion.div
                                        key={featureIndex}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.5, delay: featureIndex * 0.1 }}
                                        className="group p-8 rounded-3xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all hover:border-white/10"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            {feature.status === 'completed' && (
                                                <CheckCircle2 className="h-6 w-6 text-[#10B981] drop-shadow-[0_0_8px_rgba(16,185,129,0.3)] transition-colors" />
                                            )}
                                            {feature.status === 'in-progress' && (
                                                <div className="flex items-center gap-2">
                                                    <motion.div
                                                        animate={{ rotate: 360 }}
                                                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                                    >
                                                        <Clock className="h-6 w-6 text-[#F59E0B] drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]" />
                                                    </motion.div>
                                                    <span className="text-[10px] font-bold text-[#F59E0B] uppercase tracking-widest">In Progress</span>
                                                </div>
                                            )}
                                            {feature.status === 'planned' && (
                                                <div className="flex items-center gap-2">
                                                    <Circle className="h-6 w-6 text-[#3B82F6] drop-shadow-[0_0_8px_rgba(59,130,246,0.3)]" />
                                                    <span className="text-[10px] font-bold text-[#3B82F6] uppercase tracking-widest">Planned</span>
                                                </div>
                                            )}
                                        </div>
                                        <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">{feature.name}</h3>
                                        <p className="text-slate-400 text-sm leading-relaxed font-medium">
                                            {feature.description}
                                        </p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Bottom CTA */}
            <section className="py-40 px-6 relative overflow-hidden">
                {/* Background Glow */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[500px] bg-primary/5 blur-[160px] rounded-full pointer-events-none" />

                <div className="max-w-4xl mx-auto text-center space-y-12 relative z-10">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[9px] font-bold text-primary uppercase tracking-widest mb-4">
                            Join the movement
                        </div>
                        <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight">
                            Freedom for <span className="text-primary italic">your mind.</span>
                        </h2>
                        <p className="text-xl md:text-2xl text-slate-400 font-medium leading-relaxed max-w-2xl mx-auto">
                            FocusOS is open source and community-owned. 
                            Download, self-host, or contribute to the sanctuary.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
                        <Button 
                            asChild
                            className="w-full sm:w-auto rounded-full bg-white text-black hover:bg-slate-200 px-12 h-36 shadow-2xl shadow-white/20 transition-all hover:scale-105"
                        >
                            <a href="https://github.com/Bhavikkpatel/FocusOS" target="_blank">
                                <GithubIcon className="h-24 w-24" />
                            </a>
                        </Button>
                    </div>
                </div>
            </section>

            <Footer />
            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
        </main>
    );
}
