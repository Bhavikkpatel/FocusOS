"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { GithubIcon } from "@/components/icons/github-icon";
import { AuthModal } from "@/components/auth/auth-modal";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function ConversionSection() {
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    return (
        <section id="pricing" className="py-32 px-6 relative overflow-hidden bg-gradient-to-b from-transparent to-[#0A0A0B]">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-primary/20 blur-[140px] rounded-full pointer-events-none opacity-50" />
            
            <div className="max-w-4xl mx-auto text-center space-y-10 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="space-y-6"
                >
                    <h2 className="text-5xl md:text-7xl font-bold text-white tracking-tighter leading-tight">
                        Your focus is a<br/><span className="text-primary italic">finite resource.</span><br/><span className="text-slate-400">Protect it.</span>
                    </h2>
                    <p className="text-xl text-slate-400 font-medium leading-relaxed max-w-2xl mx-auto">
                        Most people end their day reacting. Start ending it having <span className="text-white italic">executed</span>.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="space-y-6"
                >
                    <Button 
                        asChild
                        className="rounded-full bg-white text-black hover:bg-slate-200 px-10 h-24 shadow-2xl shadow-white/20 transition-all hover:scale-110 active:scale-95"
                    >
                        <a href="https://github.com/Bhavikkpatel/FocusOS" target="_blank">
                            <GithubIcon className="h-16 w-16" />
                        </a>
                    </Button>
                    <div className="flex items-center justify-center gap-6 text-xs text-slate-600 font-bold uppercase tracking-widest">
                        <span>Open Source</span>
                        <div className="h-1 w-1 rounded-full bg-slate-800" />
                        <span>Community Owned</span>
                        <div className="h-1 w-1 rounded-full bg-slate-800" />
                        <span>Self-Hostable</span>
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

export function Footer() {
    return (
        <footer className="py-10 px-6 border-t border-white/5 bg-[#0A0A0B]">
            <div className="max-w-7xl mx-auto flex flex-col items-center gap-10">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-12 md:gap-24">
                    <div className="space-y-4">
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Product</span>
                        <ul className="space-y-2">
                            <li><Link href="/features" className="text-slate-500 hover:text-white transition-colors">Features</Link></li>
                            <li><Link href="/docs" className="text-slate-500 hover:text-white transition-colors">Setup Guide</Link></li>
                            <li><Link href="/about" className="text-slate-500 hover:text-white transition-colors">Our Story</Link></li>
                        </ul>
                    </div>
                    <div className="space-y-4">
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Company</span>
                        <ul className="space-y-2">
                            <li><Link href="/about" className="text-sm text-slate-400 hover:text-white transition-colors">Philosophy</Link></li>
                            <li><a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-400 hover:text-white transition-colors">GitHub</a></li>
                        </ul>
                    </div>
                    <div className="space-y-4">
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Community</span>
                        <ul className="space-y-2">
                            <li><a href="https://github.com/Bhavikkpatel/FocusOS" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-400 hover:text-white transition-colors">Open Source</a></li>
                            <li><Link href="/about" className="text-sm text-slate-400 hover:text-white transition-colors">Our Story</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="flex flex-col items-center gap-6 text-center">
                    <div className="space-y-2">
                        <p className="text-xs text-white font-bold tracking-widest uppercase">
                            Bhavikk Patel
                        </p>
                        <p className="text-[10px] text-slate-500 font-medium max-w-xs leading-relaxed">
                            Software Engineer @ <strong className="text-slate-400">Intel</strong> | Ex-<strong className="text-slate-400">Zoho</strong>.  
                            Focused on high-performance execution environments and minimalist system design.
                        </p>
                    </div>
                    <div className="px-4 py-1.5 rounded-full bg-white/[0.02] border border-white/5">
                        <span className="text-[10px] font-mono text-primary font-bold tracking-widest">
                            SYSTEM_STATUS: ESCAPE_VELOCITY.
                        </span>
                    </div>
                    <p className="text-[10px] text-slate-800 font-mono tracking-widest">
                        © 2026 FocusOS. ANTI-GRAVITY ENGINE V1.0
                    </p>
                </div>
            </div>
        </footer>
    );
}

