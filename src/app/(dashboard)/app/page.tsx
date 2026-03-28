"use client";

import { useState } from "react";
import { useDashboard } from "@/hooks/use-dashboard";
import { useQuery } from "@tanstack/react-query";
import { HeroTask } from "@/components/dashboard/hero-task";
import { ActiveProjects } from "@/components/dashboard/active-projects";
import { UpcomingTasks } from "@/components/dashboard/upcoming-tasks";
import { WeeklyFocusChart } from "@/components/dashboard/weekly-focus-chart";
import { ProjectDistributionChart } from "@/components/dashboard/project-distribution-chart";
import { ProductivitySummary } from "@/components/dashboard/productivity-summary";
import { DailyProgressRing } from "@/components/dashboard/daily-progress-ring";
import { LoadingBox } from "@/components/ui/loading-state";
import { LayoutDashboard, Rocket, BarChart3 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { CapturedThoughts } from "@/components/dashboard/captured-thoughts";

export default function DashboardPage() {
    const { data, isLoading, error } = useDashboard();
    const [activeTab, setActiveTab] = useState<"OVERVIEW" | "INSIGHTS">("OVERVIEW");
    const { data: distractions = [] } = useQuery({
        queryKey: ["distractions"],
        queryFn: async () => {
            const res = await fetch("/api/deep-work/distractions");
            if (!res.ok) return [];
            return res.json();
        }
    });

    const tabs = [
        { id: "OVERVIEW", label: "Launchpad", icon: Rocket, badge: distractions.length > 0 ? distractions.length : null },
        { id: "INSIGHTS", label: "Insights", icon: BarChart3 },
    ];

    if (error) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-full mb-4">
                    <LayoutDashboard className="h-12 w-12 text-red-500" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Failed to load dashboard</h2>
                <p className="text-muted-foreground mb-6">There was an error fetching your productivity data.</p>
                <button 
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 bg-primary text-white rounded-xl font-bold hover:opacity-90 transition-opacity"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-16 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header with Tabs */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight flex items-center gap-3">
                        <span>Project Dashboard</span>
                    </h1>
                    <p className="text-muted-foreground font-medium mt-1">
                        {activeTab === "OVERVIEW" ? "Your high-velocity launchpad." : "Deep dive into your productivity trends."}
                    </p>
                </div>

                <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#161618] p-1 rounded-2xl border border-slate-200 dark:border-white/5">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as "OVERVIEW" | "INSIGHTS")}
                            className={cn(
                                "relative px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-[0.2em] transition-all duration-300",
                                activeTab === tab.id 
                                    ? "text-white dark:text-black" 
                                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                            )}
                        >
                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-primary rounded-xl"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <span className="relative z-10 flex items-center gap-2">
                                <tab.icon className="h-3.5 w-3.5" />
                                {tab.label}
                                {tab.badge && (
                                    <span className={cn(
                                        "px-1.5 py-0.5 rounded-full text-[8px] font-black tabular-nums transition-colors",
                                        activeTab === tab.id 
                                            ? "bg-white/20 text-white dark:bg-black/20 dark:text-black" 
                                            : "bg-primary text-white"
                                    )}>
                                        {tab.badge}
                                    </span>
                                )}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center min-h-[400px]">
                    <LoadingBox text="ORCHESTRATING LAUNCHPAD..." className="border-none bg-transparent" />
                </div>
            ) : data && (
                <AnimatePresence mode="wait">
                    {activeTab === "OVERVIEW" ? (
                        <motion.div
                            key="overview"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.2 }}
                        >
                             <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                                {/* Left Column: Execution Zone (approx 65%) */}
                                <div className="lg:col-span-8 space-y-6">
                                    {/* Captured Thoughts Review Section (High Visibility) */}
                                    <section className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
                                        <CapturedThoughts />
                                    </section>

                                    <HeroTask task={data.heroTask} />
                                    <ActiveProjects projects={data.activeProjects} />
                                </div>

                                {/* Right Column: Context Zone (approx 35%) */}
                                <div className="lg:col-span-4 space-y-6">
                                    <DailyProgressRing 
                                        current={data.summary.totalFocusTimeToday} 
                                        goal={data.summary.dailyFocusGoal} 
                                    />
                                    <UpcomingTasks tasks={data.upcomingTasks} />
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="insights"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-12"
                        >
                            <ProductivitySummary summary={data.summary} />
                            
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <WeeklyFocusChart data={data.weeklyFocusData} />
                                <ProjectDistributionChart data={data.projectDistributionData} />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            )}
        </div>
    );
}
