"use client";

import { motion } from "framer-motion";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer-section";
import { 
    Zap, 
    Users, 
    Terminal, 
    Database,
    Youtube,
    Cpu,
    Layers,
    Lock
} from "lucide-react";
import { GithubIcon } from "@/components/icons/github-icon";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/auth/auth-modal";
import { useState } from "react";

const TIMELINE_EVENTS = [
    {
        title: "The Foundation (Rigor)",
        company: "Intel & Zoho",
        period: "Massive Systems",
        description: "Where I learned the architecture of millions. High-performance systems aren't just about code; they're about the discipline of scale and the rigor of deep architectural integrity.",
        icon: Cpu,
        color: "text-blue-500",
        bg: "bg-blue-500/10"
    },
    {
        title: "The Gravity (Legacy)",
        company: "Enterprise Migrations",
        period: "50+ SSIS Workflows",
        description: "Transitioning massive technical debt into modern .NET 8 platforms. I lived in the weight of rigid migrations and Indian B2B marketplaces. This was the 'Gravity'—complex, taxing, and relentless.",
        icon: Layers,
        color: "text-red-500",
        bg: "bg-red-500/10"
    },
    {
        title: "The Multi-Hyphenate Reality",
        company: "Dev + Content Creator",
        period: "3 YouTube Channels",
        description: "Managing deep engineering while building three active communities. I realized that traditional tools optimize for 'management' when I needed 'execution'. I was losing my mind, so I built an exit.",
        icon: Youtube,
        color: "text-amber-500",
        bg: "bg-amber-500/10"
    },
    {
        title: "Anti-Gravity (The Escape)",
        company: "FocusOS",
        period: "Open Source Sanctuary",
        description: "The sanctuary I built to survive my own workload. Keyboard-first, borderless, and sliding. It's the engine I use to switch between 'Senior Engineer' and 'Creator' without losing my flow.",
        icon: Zap,
        color: "text-primary",
        bg: "bg-primary/10"
    }
];

const OATH_ITEMS = [
    {
        title: "Open Source (AGPLv3)",
        description: "The code is yours to audit. FocusOS is licensed under the GNU Affero General Public License v3 to ensure it remains a free and shared engine for everyone.",
        icon: GithubIcon
    },
    {
        title: "Own Your Data",
        description: "Fully self-hostable. We support Cloudflare R2 and Supabase because we believe your tools should never hold your progress hostage.",
        icon: Database
    },
    {
        title: "Zero Gravity Architecture",
        description: "No tracking. No 'engagement' traps. No corporate bloat. Just a clean execution environment that gets out of your way.",
        icon: Lock
    }
];

export default function AboutPage() {
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    return (
        <main className="min-h-screen bg-[#0A0A0B] text-white selection:bg-primary/30 font-sans">
            <Navbar />

            {/* Narrative Hero */}
            <section className="relative pt-40 pb-20 px-6 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[600px] bg-primary/10 blur-[160px] rounded-full pointer-events-none opacity-50" />
                
                <div className="max-w-4xl mx-auto relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="space-y-8"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-primary uppercase tracking-[0.3em]">
                            About the Builder
                        </div>
                        
                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9]">
                            Gravity is <br />
                            <span className="text-slate-500 italic block">a choice.</span>
                        </h1>
                        
                        <div className="space-y-6 text-xl md:text-2xl text-slate-400 font-medium leading-relaxed max-w-3xl">
                            <p>
                                I don&apos;t build apps. I build <span className="text-white">execution environments.</span> After years of architecting massive systems at 
                                <span className="text-blue-400"> Intel</span> and <span className="text-amber-400"> Zoho</span>, I realized the biggest threat to great work wasn&apos;t the 
                                complexity of the code—it was the gravity of the tools we use.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Legacy to Light Timeline */}
            <section className="py-32 px-6 relative">
                <div className="max-w-5xl mx-auto">
                    <div className="space-y-32 relative">
                        {/* Vertical line decor */}
                        <div className="absolute left-[23px] md:left-1/2 top-10 bottom-10 w-px bg-gradient-to-b from-primary/50 via-white/5 to-transparent hidden md:block" />

                        {TIMELINE_EVENTS.map((event, index) => (
                            <motion.div 
                                key={index}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 0.8, delay: index * 0.1 }}
                                className={`relative flex flex-col md:flex-row gap-8 md:gap-20 items-start ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}
                            >
                                {/* Center Icon */}
                                <div className="absolute left-0 md:left-1/2 md:-translate-x-1/2 w-12 h-12 rounded-2xl bg-[#1A1A1C] border border-white/10 flex items-center justify-center z-20 shadow-2xl">
                                    <event.icon className={`h-6 w-6 ${event.color}`} />
                                </div>

                                {/* Content Side */}
                                <div className={`flex-1 pt-2 ${index % 2 === 0 ? 'md:pl-0' : 'md:pl-16'}`}>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4">
                                            <span className={`text-xs font-mono font-bold uppercase tracking-widest ${event.color}`}>
                                                {event.period}
                                            </span>
                                            <div className="h-px w-8 bg-white/5" />
                                            <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">{event.company}</span>
                                        </div>
                                        <h3 className="text-3xl font-bold tracking-tight">{event.title}</h3>
                                        <p className="text-slate-400 text-lg leading-relaxed font-normal italic">
                                            &quot;{event.description}&quot;
                                        </p>
                                    </div>
                                </div>

                                {/* Spacer Side */}
                                <div className="flex-1 hidden md:block" />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* The Builder's Oath */}
            <section className="py-32 px-6 bg-[#111112] border-y border-white/5 relative overflow-hidden">
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                     style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "32px 32px" }} 
                />

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="max-w-3xl mb-20 space-y-6">
                        <span className="font-mono text-sm tracking-[0.3em] text-primary uppercase">The Builder&apos;s Oath</span>
                        <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                            A commitment to <br />
                            <span className="text-slate-500 italic font-light">radical transparency.</span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {OATH_ITEMS.map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="group p-8 rounded-3xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all hover:border-white/10"
                            >
                                <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center mb-8 group-hover:bg-primary/20 transition-colors">
                                    <item.icon className="h-6 w-6 text-slate-400 group-hover:text-primary transition-colors" />
                                </div>
                                <h4 className="text-xl font-bold mb-4">{item.title}</h4>
                                <p className="text-slate-400 leading-relaxed text-sm">
                                    {item.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Registry of Builders */}
            <section className="py-40 px-6 relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[400px] bg-primary/10 blur-[130px] rounded-full pointer-events-none" />

                <div className="max-w-4xl mx-auto text-center space-y-12 relative z-10">
                    <div className="space-y-6">
                        <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight">
                            Build the <span className="text-primary italic">Anti-Gravity.</span>
                        </h2>
                        <p className="text-xl md:text-2xl text-slate-400 font-medium leading-relaxed max-w-2xl mx-auto">
                            FocusOS started as a personal sanctuary, but it&apos;s becoming a shared engine.
                            Join the registry of builders who value deep work over shallow management.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        <Button 
                            asChild
                            className="w-full sm:w-auto rounded-full bg-white text-black hover:bg-slate-200 px-12 h-36 shadow-2xl transition-all hover:scale-105 active:scale-95"
                        >
                            <a href="https://github.com/Bhavikkpatel/FocusOS" target="_blank">
                                <GithubIcon className="h-24 w-24" />
                            </a>
                        </Button>
                    </div>

                    <div className="pt-20">
                        <div className="flex items-center justify-center gap-8 opacity-40 hover:opacity-100 transition-opacity">
                            <div className="flex items-center gap-2 text-xs font-mono tracking-widest">
                                <Users className="h-4 w-4" /> 50+ CONTRIBUTIONS
                            </div>
                            <div className="w-1 h-1 rounded-full bg-slate-800" />
                            <div className="flex items-center gap-2 text-xs font-mono tracking-widest uppercase">
                                <Terminal className="h-4 w-4" /> AGPLv3 LICENSED
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
        </main>
    );
}
