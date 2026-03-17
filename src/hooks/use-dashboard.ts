"use client";

import { useQuery } from "@tanstack/react-query";
import { TaskWithSessions } from "./use-tasks";

export interface DashboardData {
    summary: {
        totalFocusTimeToday: number;
        sessionsCompletedToday: number;
        tasksCompletedToday: number;
    };
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
    }[];
}

export function useDashboard() {
    return useQuery<DashboardData>({
        queryKey: ["dashboard"],
        queryFn: async () => {
            const res = await fetch("/api/dashboard");
            if (!res.ok) throw new Error("Failed to fetch dashboard data");
            return res.json();
        },
        refetchInterval: 60 * 1000, // Refetch every minute to keep stats fresh
    });
}
