"use client";

import * as React from "react";
import { format, isToday, isSameDay } from "date-fns";
import { CalendarEvent } from "@/hooks/use-calendar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Play, Clock, Target, CheckCircle2, Circle } from "lucide-react";
import { useTimerStore } from "@/store/timer";

interface CalendarDayScheduleProps {
    date: Date;
    events: CalendarEvent[];
    onClose: () => void;
}

export function CalendarDaySchedule({ date, events, onClose }: CalendarDayScheduleProps) {
    const { start, currentPreset } = useTimerStore();
    
    const dayEvents = React.useMemo(() => {
        return events.filter((e: CalendarEvent) => isSameDay(new Date(e.start), date))
            .sort((a: CalendarEvent, b: CalendarEvent) => new Date(a.start).getTime() - new Date(b.start).getTime());
    }, [events, date]);

    const handleFocus = (event: CalendarEvent) => {
        if (!event.task) return;
        
        // Use task's pomodoro duration if available, otherwise fallback to preset or 25m
        const duration = event.task.pomodoroDuration || (currentPreset?.focusDuration ? currentPreset.focusDuration / 60 : 25);
        
        start(duration, "FOCUS", event.task.id, event.task.estimatedPomodoros);
        onClose();
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-900">
            <div className="space-y-1 mb-6">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                    {format(date, "EEEE")}
                </p>
                <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                    {format(date, "MMMM d, yyyy")}
                </h2>
                {isToday(date) && (
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-none font-bold px-2 py-0.5 mt-2">
                        TODAY
                    </Badge>
                )}
            </div>

            <ScrollArea className="flex-1 pr-4 -mr-4">
                <div className="space-y-4">
                    {dayEvents.length > 0 ? (
                        dayEvents.map((event: CalendarEvent) => (
                            <div 
                                key={event.id}
                                className="group relative p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-all duration-300"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <div 
                                                className="w-2 h-2 rounded-full shrink-0" 
                                                style={{ backgroundColor: event.task?.projectRef?.color || event.color || "#6366f1" }} 
                                            />
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">
                                                {event.task?.projectRef?.name || "No Project"}
                                            </span>
                                        </div>
                                        <h4 className="font-bold text-slate-900 dark:text-white leading-tight mb-2">
                                            {event.title}
                                        </h4>
                                        <div className="flex items-center gap-3 text-[11px] font-medium text-slate-500 whitespace-nowrap">
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {format(new Date(event.start), "h:mm a")} - {format(new Date(event.end), "h:mm a")}
                                            </div>
                                            {event.task && (
                                                <div className="flex items-center gap-1">
                                                    <Target className="h-3 w-3" />
                                                    {event.task.completedPomodoros}/{event.task.estimatedPomodoros}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {event.task && event.task.status !== "COMPLETED" && (
                                        <Button
                                            size="icon"
                                            className="h-10 w-10 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black hover:scale-105 transition-transform"
                                            onClick={() => handleFocus(event)}
                                        >
                                            <Play className="h-4 w-4 fill-current" />
                                        </Button>
                                    )}
                                    
                                    {event.task?.status === "COMPLETED" && (
                                        <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-green-50 dark:bg-green-900/20 text-green-600">
                                            <CheckCircle2 className="h-5 w-5" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center space-y-3 opacity-40">
                            <Circle className="h-12 w-12 stroke-[1px]" />
                            <div className="space-y-1">
                                <p className="font-bold text-sm">Quiet Day</p>
                                <p className="text-xs">No tasks or sessions scheduled for this date.</p>
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>

            {isToday(date) && (
                <div className="pt-6 mt-auto">
                    <Button 
                        className="w-full h-12 rounded-2xl font-black tracking-tighter text-lg bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"
                    >
                        + SCHEDULE NEW TASK
                    </Button>
                </div>
            )}
        </div>
    );
}
