"use client";

import * as React from "react";
import { format, isToday, isSameDay } from "date-fns";
import { CalendarEvent } from "@/hooks/use-calendar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Play, CheckCircle2, Circle } from "lucide-react";
import { useTimerStore } from "@/store/timer";
import { cn } from "@/lib/utils";

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

            <ScrollArea className="flex-1 w-full -mx-4">
                <div className="min-w-[1200px] h-full relative p-4 pt-12">
                    {/* Time Axis (Background) */}
                    <div className="absolute inset-0 flex">
                        {Array.from({ length: 24 }).map((_, i) => (
                            <div 
                                key={i} 
                                className="flex-1 border-l border-slate-100 dark:border-slate-800/50 relative"
                            >
                                <span className="absolute -top-8 left-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                    {i === 0 ? "12 AM" : i < 12 ? `${i} AM` : i === 12 ? "12 PM" : `${i-12} PM`}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Events Container */}
                    <div className="relative h-full flex flex-col gap-3">
                        {dayEvents.length > 0 ? (
                            dayEvents.map((event: CalendarEvent) => {
                                const start = new Date(event.start);
                                const end = new Date(event.end);
                                const startPos = (start.getHours() + start.getMinutes() / 60) / 24 * 100;
                                const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
                                const widthPos = (duration / 24) * 100;

                                return (
                                    <div 
                                        key={event.id}
                                        className="relative h-20 group transition-all duration-300"
                                        style={{ 
                                            marginLeft: `${startPos}%`,
                                            width: `${widthPos}%`,
                                            minWidth: '40px'
                                        }}
                                    >
                                        <div className={cn(
                                            "h-full p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between",
                                            event.task?.status === "COMPLETED" && "opacity-60 grayscale"
                                        )}>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-1.5 mb-0.5 truncate">
                                                    <div 
                                                        className="w-1.5 h-1.5 rounded-full shrink-0" 
                                                        style={{ backgroundColor: event.task?.projectRef?.color || event.color || "#6366f1" }} 
                                                    />
                                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider truncate">
                                                        {event.task?.projectRef?.name || "No Project"}
                                                    </span>
                                                </div>
                                                <h4 className="font-bold text-[11px] text-slate-900 dark:text-white leading-tight truncate">
                                                    {event.title}
                                                </h4>
                                            </div>

                                            <div className="flex items-center justify-between mt-1">
                                                <span className="text-[9px] font-bold text-slate-500">
                                                    {format(start, "h:mm")}
                                                </span>
                                                {event.task && event.task.status !== "COMPLETED" && (
                                                    <Button
                                                        size="icon"
                                                        className="h-6 w-6 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-black opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={() => handleFocus(event)}
                                                    >
                                                        <Play className="h-2.5 w-2.5 fill-current" />
                                                    </Button>
                                                )}
                                                {event.task?.status === "COMPLETED" && (
                                                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center space-y-3 opacity-40">
                                <Circle className="h-12 w-12 stroke-[1px]" />
                                <div className="space-y-1">
                                    <p className="font-bold text-sm">Quiet Day</p>
                                    <p className="text-xs">No tasks or sessions scheduled.</p>
                                </div>
                            </div>
                        )}
                    </div>
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
