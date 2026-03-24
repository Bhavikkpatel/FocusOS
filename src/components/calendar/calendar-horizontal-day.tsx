"use client";

import * as React from "react";
import { format, isSameDay } from "date-fns";
import { CalendarEvent } from "@/hooks/use-calendar";
import { cn } from "@/lib/utils";
import { Clock, Play, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CalendarHorizontalDayProps {
    date: Date;
    events: CalendarEvent[];
    onEventClick: (event: CalendarEvent, element: HTMLElement) => void;
    onStartFocus?: (taskId: string, eventId: string) => void;
}

export function CalendarHorizontalDay({ 
    date, 
    events, 
    onEventClick,
    onStartFocus 
}: CalendarHorizontalDayProps) {
    const [now, setNow] = React.useState(new Date());

    React.useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 60000);
        return () => clearInterval(interval);
    }, []);

    const dayEvents = React.useMemo(() => {
        return events.filter(e => isSameDay(new Date(e.start), date))
            .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
    }, [events, date]);

    // Group events into rows to prevent overlap
    const eventRows = React.useMemo(() => {
        const rows: CalendarEvent[][] = [];
        dayEvents.forEach(event => {
            let placed = false;
            for (const row of rows) {
                const lastEvent = row[row.length - 1];
                if (new Date(event.start) >= new Date(lastEvent.end)) {
                    row.push(event);
                    placed = true;
                    break;
                }
            }
            if (!placed) {
                rows.push([event]);
            }
        });
        return rows;
    }, [dayEvents]);

    const hourWidth = 120; // px per hour
    const totalWidth = hourWidth * 24;

    const getTimePosition = (d: Date) => {
        const hours = d.getHours() + d.getMinutes() / 60;
        return hours * hourWidth;
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-white dark:bg-slate-950 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative">
            <div className="h-12 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center px-6 shrink-0">
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {format(date, "EEEE, MMMM d")}
                </span>
            </div>

            <div className="flex-1 overflow-auto relative custom-scrollbar">
                <div 
                    className="h-full relative py-12"
                    style={{ width: `${totalWidth}px` }}
                >
                    {/* Time Grid Lines */}
                    <div className="absolute inset-0 flex pointer-events-none">
                        {Array.from({ length: 24 }).map((_, i) => (
                            <div 
                                key={i} 
                                className="h-full border-l border-slate-100 dark:border-slate-800/50 relative"
                                style={{ width: `${hourWidth}px` }}
                            >
                                <span className="absolute top-2 left-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    {i === 0 ? "12 AM" : i < 12 ? `${i} AM` : i === 12 ? "12 PM" : `${i-12} PM`}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Current Time Indicator */}
                    {isSameDay(now, date) && (
                        <div 
                            className="absolute top-0 bottom-0 w-px bg-red-500 z-20 pointer-events-none"
                            style={{ left: `${getTimePosition(now)}px` }}
                        >
                            <div className="absolute -top-1 -left-1 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                            <div className="absolute top-2 left-2 bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm">
                                {format(now, "h:mm a")}
                            </div>
                        </div>
                    )}

                    {/* Events Matrix */}
                    <div className="relative z-10 space-y-4 px-2">
                        {eventRows.map((row, rowIndex) => (
                            <div key={rowIndex} className="relative h-24">
                                {row.map(event => {
                                    const start = new Date(event.start);
                                    const end = new Date(event.end);
                                    const left = getTimePosition(start);
                                    const width = Math.max(getTimePosition(end) - left, 60);
                                    const color = event.task?.projectRef?.color || event.color || "#6366f1";
                                    const isCompleted = event.task?.status === "COMPLETED";

                                    return (
                                        <div 
                                            key={event.id}
                                            className="absolute top-0 h-full group transition-all"
                                            style={{ left: `${left}px`, width: `${width}px` }}
                                            onClick={(e) => onEventClick(event, e.currentTarget)}
                                        >
                                            <div className={cn(
                                                "h-full rounded-2xl border-l-[4px] p-4 flex flex-col justify-between cursor-pointer transition-all",
                                                isCompleted 
                                                    ? "bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 opacity-60 grayscale" 
                                                    : "bg-white dark:bg-slate-900 border-opacity-100 shadow-sm hover:shadow-lg hover:-translate-y-1 active:scale-95"
                                            )} style={{ 
                                                borderLeftColor: isCompleted ? undefined : color,
                                                backgroundColor: isCompleted ? undefined : `${color}08` 
                                            }}>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1.5">
                                                        <div 
                                                            className="w-2 h-2 rounded-full shrink-0" 
                                                            style={{ backgroundColor: color }} 
                                                        />
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">
                                                            {event.task?.projectRef?.name || "No Project"}
                                                        </span>
                                                    </div>
                                                    <h4 className="font-bold text-xs text-slate-900 dark:text-white leading-tight truncate">
                                                        {event.title}
                                                    </h4>
                                                </div>

                                                <div className="flex items-center justify-between mt-2">
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="h-3 w-3 text-slate-400" />
                                                        <span className="text-[10px] font-bold text-slate-500">
                                                            {format(start, "h:mm a")}
                                                        </span>
                                                    </div>
                                                    {event.task && !isCompleted && onStartFocus && (
                                                        <Button
                                                            size="icon"
                                                            className="h-8 w-8 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onStartFocus(event.task!.id, event.id);
                                                            }}
                                                        >
                                                            <Play className="h-3 w-3 fill-current" />
                                                        </Button>
                                                    )}
                                                    {isCompleted && (
                                                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ))}

                        {dayEvents.length === 0 && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center space-y-4 opacity-20 pointer-events-none">
                                <Clock className="h-16 w-16 stroke-[1px]" />
                                <div className="space-y-1">
                                    <h3 className="text-xl font-black">Open Schedule</h3>
                                    <p className="text-sm">No events planned for this day yet.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
