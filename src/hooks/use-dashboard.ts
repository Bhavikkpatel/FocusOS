"use client";

import { useQuery } from "@tanstack/react-query";
import { TaskWithSessions } from "./use-tasks";

export interface DashboardData {
    summary: {
        totalFocusTimeToday: number;
        sessionsCompletedToday: number;
        tasksCompletedToday: number;
        dailyFocusGoal: number;
    };
    heroTask: TaskWithSessions | null;
    weeklyFocusData: {
        name: string;
        minutes: number;
    }[];
    projectDistributionData: {
        name: string;
        value: number;
        color: string;
    }[];
    upcomingTasks: {
        overdue: TaskWithSessions[];
        today: TaskWithSessions[];
        tomorrow: TaskWithSessions[];
    };
    activeProjects: {
        id: string;
        name: string;
        color: string;
        progress: number;
        tasksRemaining: number;
        focusMinutes: number;
        oldestTaskId: string | null;
        oldestTaskDuration: number;
    }[];
}

import { useLayoutStore } from "@/store/layout";

export function useDashboard() {
    const lowEnergyMode = useLayoutStore((state) => state.lowEnergyMode);

    return useQuery<DashboardData>({
        queryKey: ["dashboard", lowEnergyMode],
        queryFn: async () => {
            const res = await fetch(`/api/dashboard?energy=${lowEnergyMode ? "low" : "high"}`);
            if (!res.ok) throw new Error("Failed to fetch dashboard data");
            return res.json();
        },
        refetchInterval: 60 * 1000, // Refetch every minute to keep stats fresh
    });
}
