"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Target } from "lucide-react";

interface DailyProgressRingProps {
    current: number; // minutes
    goal: number; // minutes
}

export function DailyProgressRing({ current, goal }: DailyProgressRingProps) {
    const percentage = Math.min(Math.round((current / (goal || 240)) * 100), 100);
    const isGoalAchieved = current >= (goal || 240);
    const radius = 80;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className="relative flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 h-full shadow-sm overflow-hidden group">
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-primary/10 p-2 rounded-xl text-primary shrink-0">
                    <Target className="h-5 w-5" />
                </div>
                <div>
                    <h3 className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">Daily Momentum</h3>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.2em]">Activity Ring</p>
                </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center">
            {/* Completion Glow */}
            {isGoalAchieved && (
                <div className="absolute inset-0 bg-primary/5 rounded-full blur-[80px] animate-pulse pointer-events-none" />
            )}

            <div className="relative h-64 w-64">
                <svg className="h-full w-full -rotate-90">
                    {/* Background Ring */}
                    <circle
                        cx="128"
                        cy="128"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="transparent"
                        className="text-slate-100 dark:text-white/5"
                    />
                    {/* Progress Ring */}
                    <motion.circle
                        cx="128"
                        cy="128"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="transparent"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className={cn(
                            "text-slate-200 dark:text-white/20 transition-all duration-1000",
                            isGoalAchieved && "text-primary"
                        )}
                        style={{ filter: isGoalAchieved ? "drop-shadow(0 0 8px rgba(255,255,255,0.3))" : "none" }}
                        strokeLinecap="round"
                    />
                </svg>

                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-4xl font-black text-slate-900 dark:text-white font-jetbrains">
                            {percentage}%
                        </span>
                    </div>
                </div>

            </div>

            <div className="mt-8 flex items-center justify-around w-full font-jetbrains text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500">
                <div className="flex flex-col items-center">
                    <span className="text-slate-900 dark:text-white font-bold text-base">{current}M</span>
                    <span>ACTUAL</span>
                </div>
                <div className="h-8 w-px bg-slate-100 dark:bg-white/5" />
                <div className="flex flex-col items-center">
                    <span className="text-slate-900 dark:text-white font-bold text-base">{goal || 240}M</span>
                    <span>TARGET</span>
                </div>
            </div>
        </div>
    );
}
