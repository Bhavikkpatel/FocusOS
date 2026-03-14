"use client";

import * as React from "react";
import { Clock, CalendarDays, CheckCircle2 } from "lucide-react";
import type { CalendarEvent } from "@/hooks/use-calendar";

interface CalendarHeaderStatsProps {
    events: CalendarEvent[];
}

export function CalendarHeaderStats({ events }: CalendarHeaderStatsProps) {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const todayEvents = events.filter((e) => {
        const start = new Date(e.start);
        return start >= todayStart && start <= todayEnd;
    });

    const totalMinutes = todayEvents.reduce((acc, e) => {
        const start = new Date(e.start);
        const end = new Date(e.end);
        return acc + (end.getTime() - start.getTime()) / 60000;
    }, 0);

    const now = new Date();
    const remainingMinutes = todayEvents.reduce((acc, e) => {
        const start = new Date(e.start);
        if (start > now) {
            const end = new Date(e.end);
            return acc + (end.getTime() - start.getTime()) / 60000;
        }
        return acc;
    }, 0);

    const completedCount = todayEvents.filter(
        (e) => e.task?.status === "COMPLETED"
    ).length;

    const formatHours = (mins: number) => {
        if (mins < 60) return `${Math.round(mins)}m`;
        return `${(mins / 60).toFixed(1)}h`;
    };

    return (
        <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm font-semibold">
                <CalendarDays className="h-4 w-4" />
                <span>{todayEvents.length} scheduled today</span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-semibold">
                <Clock className="h-4 w-4" />
                <span>{formatHours(totalMinutes)} planned</span>
            </div>

            {remainingMinutes > 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-lg text-sm font-semibold">
                    <Clock className="h-4 w-4" />
                    <span>{formatHours(remainingMinutes)} remaining</span>
                </div>
            )}

            {completedCount > 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg text-sm font-semibold">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{completedCount} done</span>
                </div>
            )}
        </div>
    );
}
