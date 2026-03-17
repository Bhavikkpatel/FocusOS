"use client";

import { useDashboard } from "@/hooks/use-dashboard";
import { ProductivitySummary } from "@/components/dashboard/productivity-summary";
import { WeeklyFocusChart } from "@/components/dashboard/weekly-focus-chart";
import { ProjectDistributionChart } from "@/components/dashboard/project-distribution-chart";
import { UpcomingTasks } from "@/components/dashboard/upcoming-tasks";
import { ActiveProjects } from "@/components/dashboard/active-projects";
import { Skeleton } from "@/components/ui/skeleton";
import { LayoutDashboard } from "lucide-react";

import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default function DashboardPage() {
    const { data, isLoading, error } = useDashboard();

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="space-y-8 animate-in fade-in duration-500">
                    <div className="flex items-center gap-3 mb-8">
                        <Skeleton className="h-10 w-10 rounded-xl" />
                        <Skeleton className="h-10 w-48" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Skeleton className="h-32 rounded-2xl" />
                        <Skeleton className="h-32 rounded-2xl" />
                        <Skeleton className="h-32 rounded-2xl" />
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <Skeleton className="h-[400px] rounded-3xl" />
                        <Skeleton className="h-[400px] rounded-3xl" />
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (error || !data) {
        return (
            <DashboardLayout>
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
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-8 pb-16 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight flex items-center gap-3">
                            <LayoutDashboard className="h-8 w-8 text-primary" />
                            <span>Productivity Dashboard</span>
                        </h1>
                        <p className="text-muted-foreground font-medium mt-1">
                            Welcome back! Here's how your deep work is trending.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700/50">
                        <div className="px-4 py-1.5 bg-white dark:bg-slate-900 rounded-lg shadow-sm text-xs font-bold uppercase tracking-widest text-primary">
                            Overview
                        </div>
                        <div className="px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-muted-foreground opacity-50">
                            Insights
                        </div>
                    </div>
                </div>

                {/* Top Cards: Summary Stats */}
                <ProductivitySummary summary={data.summary} />

                {/* Main Grid: Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    <div className="lg:col-span-3 space-y-8">
                        <WeeklyFocusChart data={data.weeklyFocusData} />
                        <ActiveProjects projects={data.activeProjects} />
                    </div>
                    <div className="lg:col-span-2 space-y-8">
                        <ProjectDistributionChart data={data.projectDistributionData} />
                        <UpcomingTasks tasks={data.upcomingTasks} />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
