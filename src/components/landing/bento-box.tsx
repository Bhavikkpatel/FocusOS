"use client";

import { motion } from "framer-motion";
import { Music, Calendar, Zap, Layout, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const FEATURES = [
    {
        title: "Focus Music",
        description: "Built-in low-fi and ambient channels that auto-play when focus starts.",
        icon: Music,
        className: "md:col-span-2 md:row-span-1",
        color: "text-pink-400",
        bg: "bg-pink-400/5",
        border: "border-pink-400/20"
    },
    {
        title: "Calendar Planning",
        description: "Schedule your deep work blocks directly in a Google-style calendar interface.",
        icon: Calendar,
        className: "md:col-span-1 md:row-span-2",
        color: "text-blue-400",
        bg: "bg-blue-400/5",
        border: "border-blue-400/20"
    },
    {
        title: "Energy-Based Selection",
        description: "Plan your day by task difficulty and your current energy levels.",
        icon: Zap,
        className: "md:col-span-1 md:row-span-1",
        color: "text-amber-400",
        bg: "bg-amber-400/5",
        border: "border-amber-400/20"
    },
    {
        title: "2-Second Capture",
        description: "A command-bar first interface designed to keep you in focus while creating.",
        icon: Layout,
        className: "md:col-span-2 md:row-span-1",
        color: "text-emerald-400",
        bg: "bg-emerald-400/5",
        border: "border-emerald-400/20"
    }
];

export function BentoBox() {
    return (
        <section className="py-32 max-w-7xl mx-auto px-6 space-y-16">
            <div className="space-y-6 max-w-3xl">
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
                    Everything you need to <span className="text-slate-500 text-3xl md:text-4xl block mt-2 font-medium italic">protect your cognitive resources.</span>
                </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[240px]">
                {FEATURES.map((feature, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: i * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                        className={cn(
                            "group relative rounded-3xl border border-white/5 bg-white/[0.02] p-8 overflow-hidden transition-all duration-300 backdrop-blur-3xl",
                            feature.className
                        )}
                    >
                        {/* Interactive Border Effect */}
                        <div className={cn(
                            "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 border-2 rounded-3xl pointer-events-none",
                            feature.border
                        )} />

                        <div className="flex flex-col h-full justify-between relative z-10">
                            <div className="space-y-4">
                                <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center bg-white/5 group-hover:scale-110 transition-transform duration-500", feature.color)}>
                                    <feature.icon className="h-5 w-5" />
                                </div>
                                <h3 className="text-xl font-bold text-white tracking-tight">{feature.title}</h3>
                                <p className="text-slate-400 text-sm leading-relaxed font-medium max-w-[280px]">
                                    {feature.description}
                                </p>
                            </div>
                            
                            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-slate-600 group-hover:text-white transition-colors">
                                Explore <ArrowRight className="h-3 w-3" />
                            </div>
                        </div>

                        {/* Background Decoration */}
                        <div className={cn(
                            "absolute -bottom-10 -right-10 w-32 h-32 blur-[60px] rounded-full transition-opacity duration-500",
                            feature.bg
                        )} />
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
