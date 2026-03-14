"use client";

import { useMemo } from "react";
import { useTasks } from "@/hooks/use-tasks";
import { BarChart, Folder, Clock, Activity } from "lucide-react";

export function AnalyticsDashboard() {
    const { data, isLoading } = useTasks({ status: "ALL" });

    // Calculate Category groupings
    const categoryStats = useMemo(() => {
        if (!data) return [];

        const allTasks = data.pages.flatMap(p => p.tasks);

        const map = new Map<string, { name: string; focusTimeMinutes: number; sessionCount: number; taskCount: number }>();

        allTasks.forEach(task => {
            const catId = task.category?.id || "uncategorized";
            const catName = task.category?.name || "Uncategorized";

            if (!map.has(catId)) {
                map.set(catId, { name: catName, focusTimeMinutes: 0, sessionCount: 0, taskCount: 0 });
            }

            const stats = map.get(catId)!;
            stats.taskCount += 1;

            if (task.pomodoroSessions && task.pomodoroSessions.length > 0) {
                stats.sessionCount += task.pomodoroSessions.length;

                const taskTime = task.pomodoroSessions.reduce((acc: number, session: any) => acc + (session.duration || 0), 0);
                stats.focusTimeMinutes += Math.round(taskTime / 60);
            }
        });

        return Array.from(map.values()).sort((a, b) => b.focusTimeMinutes - a.focusTimeMinutes);
    }, [data]);

    if (isLoading) {
        return <div className="p-8 text-center text-muted-foreground">Loading analytics...</div>;
    }

    const maxFocusTime = Math.max(1, ...categoryStats.map(c => c.focusTimeMinutes));

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-20">
            <div className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Analytics</h1>
                <p className="text-slate-500">Track your focus time and productivity trends by category.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center gap-3 text-blue-500 mb-4">
                        <Clock className="h-5 w-5" />
                        <h3 className="font-semibold text-slate-900 dark:text-white">Total Focus Time</h3>
                    </div>
                    <div className="text-4xl font-black text-slate-900 dark:text-white">
                        {Math.floor(categoryStats.reduce((a, b) => a + b.focusTimeMinutes, 0) / 60)}h {categoryStats.reduce((a, b) => a + b.focusTimeMinutes, 0) % 60}m
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center gap-3 text-green-500 mb-4">
                        <Activity className="h-5 w-5" />
                        <h3 className="font-semibold text-slate-900 dark:text-white">Total Sessions</h3>
                    </div>
                    <div className="text-4xl font-black text-slate-900 dark:text-white">
                        {categoryStats.reduce((a, b) => a + b.sessionCount, 0)}
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center gap-3 text-amber-500 mb-4">
                        <Folder className="h-5 w-5" />
                        <h3 className="font-semibold text-slate-900 dark:text-white">Categories</h3>
                    </div>
                    <div className="text-4xl font-black text-slate-900 dark:text-white">
                        {categoryStats.filter(c => c.name !== "Uncategorized").length}
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 text-primary mb-8">
                    <BarChart className="h-5 w-5" />
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Focus Time by Category</h2>
                </div>

                <div className="space-y-6">
                    {categoryStats.map(stat => (
                        <div key={stat.name} className="space-y-2">
                            <div className="flex items-center justify-between text-sm font-semibold">
                                <span className="text-slate-900 dark:text-slate-100">{stat.name}</span>
                                <span className="text-slate-500">{Math.floor(stat.focusTimeMinutes / 60)}h {stat.focusTimeMinutes % 60}m</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex-1 h-3 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700/50">
                                    <div
                                        className="h-full bg-primary rounded-full transition-all duration-1000"
                                        style={{ width: `${Math.max(2, (stat.focusTimeMinutes / maxFocusTime) * 100)}%` }}
                                    />
                                </div>
                                <div className="w-20 text-right text-xs text-muted-foreground font-medium">
                                    {stat.sessionCount} sessions
                                </div>
                            </div>
                        </div>
                    ))}

                    {categoryStats.length === 0 && (
                        <div className="text-center py-12 text-slate-500">
                            No data available yet. Start tracking time to see your analytics!
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
