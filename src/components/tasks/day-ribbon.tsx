"use client";

import * as React from "react";
import { useCalendarEvents, useCreateCalendarEvent, type CalendarEvent } from "@/hooks/use-calendar";
import { format, startOfDay, endOfDay, addHours, isWithinInterval } from "date-fns";
import { cn } from "@/lib/utils";
import { Plus, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface DayRibbonProps {
    taskId: string;
    taskTitle: string;
}

export function DayRibbon({ taskId, taskTitle }: DayRibbonProps) {
    const today = new Date();
    const { data: events = [] } = useCalendarEvents({
        start: startOfDay(today).toISOString(),
        end: endOfDay(today).toISOString(),
    });

    const createEvent = useCreateCalendarEvent();

    // Generate 24 slots (one for each hour)
    const hours = Array.from({ length: 24 }, (_, i) => i);

    const handleSlotClick = (hour: number) => {
        const start = addHours(startOfDay(today), hour);
        const end = addHours(start, 1);
        
        createEvent.mutate({
            title: taskTitle,
            start: start.toISOString(),
            end: end.toISOString(),
            taskId,
        });
    };

    return (
        <div className="w-full space-y-4 p-6 bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Daily Availability Ribbon</span>
                </div>
                <Badge variant="outline" className="text-[9px] h-4 font-mono">
                    {format(today, "EEEE, MMM d")}
                </Badge>
            </div>

            <div className="relative w-full overflow-x-auto custom-scrollbar pb-2">
                <div className="flex gap-1 min-w-max h-16 group/ribbon relative">
                {hours.map((hour) => {
                    const slotStart = addHours(startOfDay(today), hour);
                    
                    const isBusy = events.some((event: CalendarEvent) => {
                        const eventStart = new Date(event.start);
                        const eventEnd = new Date(event.end);
                        return (
                            isWithinInterval(slotStart, { start: eventStart, end: eventEnd }) ||
                            isWithinInterval(addHours(slotStart, 0.5), { start: eventStart, end: eventEnd })
                        );
                    });

                    const isCurrentHour = hour === today.getHours();

                    return (
                        <div key={hour} className="flex-1 flex flex-col gap-1.5 h-full min-w-[20px]">
                            <button
                                onClick={() => !isBusy && handleSlotClick(hour)}
                                disabled={isBusy}
                                className={cn(
                                    "flex-1 rounded-lg transition-all relative overflow-hidden",
                                    isBusy 
                                        ? "bg-slate-200 dark:bg-slate-800 cursor-not-allowed opacity-50" 
                                        : "bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-primary/50 hover:bg-primary/5 cursor-pointer",
                                    isCurrentHour && !isBusy && "ring-2 ring-primary ring-offset-2 dark:ring-offset-slate-900"
                                )}
                                title={isBusy ? "Busy" : `Schedule at ${hour}:00`}
                            >
                                {!isBusy && (
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                        <Plus className="h-4 w-4 text-primary" />
                                    </div>
                                )}
                                {isBusy && (
                                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-slate-300/10 to-transparent dark:via-white/5 animate-pulse" />
                                )}
                            </button>
                            <span className={cn(
                                "text-[8px] font-bold text-center",
                                hour % 3 === 0 ? "text-slate-400" : "text-transparent"
                            )}>
                                {hour > 12 ? `${hour-12}p` : hour === 12 ? "12p" : hour === 0 ? "12a" : `${hour}a`}
                            </span>
                        </div>
                    );
                })}

                {/* Current Time Indicator */}
                <div 
                    className="absolute top-0 bottom-6 w-0.5 bg-red-500 z-10"
                    style={{ left: `${(today.getHours() + today.getMinutes() / 60) * (100 / 24)}%` }}
                >
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900 shadow-sm" />
                </div>
            </div>
        </div>

            <div className="flex items-center gap-4 text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-2">
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800" />
                    <span>Free</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-slate-200 dark:bg-slate-800 opacity-50" />
                    <span>Busy</span>
                </div>
                <div className="ml-auto text-primary">
                    Click a free slot to allocate 1 hour
                </div>
            </div>
        </div>
    );
}
