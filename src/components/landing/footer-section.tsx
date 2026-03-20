"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { AuthModal } from "@/components/auth/auth-modal";
import { Button } from "@/components/ui/button";

export function ConversionSection() {
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    return (
        <section className="py-48 px-6 relative overflow-hidden bg-gradient-to-b from-transparent to-[#0A0A0B]">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-primary/20 blur-[140px] rounded-full pointer-events-none opacity-50" />
            
            <div className="max-w-4xl mx-auto text-center space-y-12 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="space-y-6"
                >
                    <h2 className="text-5xl md:text-7xl font-bold text-white tracking-tighter leading-tight">
                        Ready to join the <br /> <span className="text-primary italic">Top 1%?</span>
                    </h2>
                    <p className="text-xl text-slate-400 font-medium leading-relaxed max-w-2xl mx-auto">
                        Deep work is the superpower of the 21st century. Protect your attention and execute at a high level with FocusOS.
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
                        onClick={() => setIsAuthModalOpen(true)}
                        className="rounded-full bg-white text-black hover:bg-slate-200 px-12 h-20 text-2xl font-bold shadow-2xl shadow-white/20 transition-all hover:scale-110 active:scale-95"
                    >
                        Deploy FocusOS Today
                    </Button>
                    <div className="flex items-center justify-center gap-6 text-xs text-slate-600 font-bold uppercase tracking-widest">
                        <span>No credit card required</span>
                        <div className="h-1 w-1 rounded-full bg-slate-800" />
                        <span>Instant Deployment</span>
                        <div className="h-1 w-1 rounded-full bg-slate-800" />
                        <span>Pure Flow</span>
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
        <footer className="py-12 px-6 border-t border-white/5 bg-[#0A0A0B]">
            <div className="max-w-7xl mx-auto flex flex-col items-center gap-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-24">
                    <div className="space-y-4">
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Product</span>
                        <ul className="space-y-2">
                            <li><a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Features</a></li>
                            <li><a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Zenith Mode</a></li>
                        </ul>
                    </div>
                    <div className="space-y-4">
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Company</span>
                        <ul className="space-y-2">
                            <li><a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Philosophy</a></li>
                            <li><a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">GitHub</a></li>
                        </ul>
                    </div>
                    <div className="space-y-4">
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Legal</span>
                        <ul className="space-y-2">
                            <li><a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Privacy</a></li>
                            <li><a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Terms</a></li>
                        </ul>
                    </div>
                    <div className="space-y-4">
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Support</span>
                        <ul className="space-y-2">
                            <li><a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Contact</a></li>
                            <li><a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Docs</a></li>
                        </ul>
                    </div>
                </div>

                <div className="flex flex-col items-center gap-4 text-center">
                    <p className="text-xs text-slate-700 font-medium">
                        © 2026 FocusOS. Designed for thinkers and executors.
                    </p>
                    <div className="px-4 py-1.5 rounded-full bg-white/[0.02] border border-white/5">
                        <span className="text-[10px] font-mono text-primary font-bold tracking-widest">
                            SYSTEM_STATUS: FLOWING.
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
