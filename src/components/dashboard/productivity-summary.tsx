"use client";

import { Clock, Flame, Trophy } from "lucide-react";
import { motion } from "framer-motion";

interface ProductivitySummaryProps {
    summary: {
        totalFocusTimeToday: number;
        sessionsCompletedToday: number;
        tasksCompletedToday: number;
    };
}

export function ProductivitySummary({ summary }: ProductivitySummaryProps) {
    const stats = [
        {
            label: "Focus Time Today",
            value: `${summary.totalFocusTimeToday}m`,
            icon: Clock,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            description: "Deep work sessions"
        },
        {
            label: "Sessions Completed",
            value: summary.sessionsCompletedToday,
            icon: Flame,
            color: "text-orange-500",
            bg: "bg-orange-500/10",
            description: "Total pomodoros"
        },
        {
            label: "Tasks Finished",
            value: summary.tasksCompletedToday,
            icon: Trophy,
            color: "text-green-500",
            bg: "bg-green-500/10",
            description: "Goal achievements"
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat, index) => (
                <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                >
                    <div className="p-6 relative overflow-hidden group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-all duration-300 rounded-2xl shadow-sm hover:shadow-md">
                        <div className="flex items-start justify-between">
                            <div className="space-y-2">
                                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mr-1">
                                    {stat.label}
                                </p>
                                <h3 className="text-4xl font-black tracking-tighter flex items-baseline gap-1 font-jetbrains text-slate-900 dark:text-white">
                                    {stat.value}
                                </h3>
                                <p className="text-xs font-medium text-muted-foreground/60 italic lowercase">
                                    — {stat.description}
                                </p>
                            </div>
                            <div className={`${stat.bg} ${stat.color} p-3 rounded-2xl group-hover:scale-110 transition-transform duration-500`}>
                                <stat.icon className="h-6 w-6" />
                            </div>
                        </div>
                        {/* Decorative background element */}
                        <div className={`absolute -right-4 -bottom-4 w-24 h-24 ${stat.bg} rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
