"use client";

import * as React from "react";
import { format, isToday, addMinutes, differenceInMinutes, isSameDay } from "date-fns";
import {
    Clock, Calendar as CalendarIcon, Plus, Search,
    Trash2, Pencil, X, Check, Activity, Timer
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { CalendarEvent, useUpdateCalendarEvent, useDeleteCalendarEvent, useCreateCalendarEvent } from "@/hooks/use-calendar";
import { useTasks } from "@/hooks/use-tasks";
import { Badge } from "@/components/ui/badge";
import { useTimerStore } from "@/store/timer";
import { useTheme } from "next-themes";

interface CalendarDayScheduleProps {
    date: Date;
    events: CalendarEvent[];
    onClose: () => void;
}

export function CalendarDaySchedule({ date, events, onClose }: CalendarDayScheduleProps) {
    const [searchQuery, setSearchQuery] = React.useState("");
    const [isSearching, setIsSearching] = React.useState(false);
    const [editingEventId, setEditingEventId] = React.useState<string | null>(null);
    const [editTitle, setEditTitle] = React.useState("");
    const [editStart, setEditStart] = React.useState("");
    const [editEnd, setEditEnd] = React.useState("");

    const { start, currentPreset } = useTimerStore();
    const { data: tasksData } = useTasks();
    const { theme } = useTheme();
    const isDark = theme === "dark";

    const updateEvent = useUpdateCalendarEvent();
    const deleteEvent = useDeleteCalendarEvent();
    const createEvent = useCreateCalendarEvent();

    const tasks = React.useMemo(() => {
        return tasksData?.pages.flatMap(page => page.tasks) || [];
    }, [tasksData]);

    const dayEvents = React.useMemo(() => {
        return events
            .filter(e => isSameDay(new Date(e.start), date))
            .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
    }, [events, date]);

    const filteredTasks = React.useMemo(() => {
        if (!searchQuery) return [];
        return tasks.filter((t: any) =>
            t.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !dayEvents.some(e => e.taskId === t.id)
        ).slice(0, 5);
    }, [tasks, searchQuery, dayEvents]);

    const handleFocus = (event: CalendarEvent) => {
        if (!event.task) return;
        const duration = event.task.pomodoroDuration || (currentPreset?.focusDuration ? currentPreset.focusDuration / 60 : 25);
        start(duration, "FOCUS", event.task.id, event.task.estimatedPomodoros);
        onClose();
    };

    const handleScheduleTask = (task: any) => {
        const start = new Date(date);
        start.setHours(9, 0, 0, 0);

        if (dayEvents.length > 0) {
            const lastEvent = dayEvents[dayEvents.length - 1];
            const lastEnd = new Date(lastEvent.end);
            start.setHours(lastEnd.getHours(), lastEnd.getMinutes(), 0, 0);
        }

        const duration = (task.estimatedPomodoros || 1) * (task.pomodoroDuration || 25);
        const end = addMinutes(start, duration);

        createEvent.mutate({
            title: task.title,
            start: start.toISOString(),
            end: end.toISOString(),
            taskId: task.id
        });
        setSearchQuery("");
        setIsSearching(false);
    };

    const handleUpdateEvent = (eventId: string) => {
        if (!editTitle.trim()) return;

        const newStart = new Date(date);
        const [sH, sM] = editStart.split(':').map(Number);
        newStart.setHours(sH, sM, 0, 0);

        const newEnd = new Date(date);
        const [eH, eM] = editEnd.split(':').map(Number);
        newEnd.setHours(eH, eM, 0, 0);

        updateEvent.mutate({
            id: eventId,
            title: editTitle,
            start: newStart.toISOString(),
            end: newEnd.toISOString()
        });
        setEditingEventId(null);
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-[#0f172a] text-slate-900 dark:text-slate-200">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-blue-500/10 rounded-xl">
                            <CalendarIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                                {format(date, "EEEE")}
                            </h2>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                                {format(date, "MMMM do, yyyy")}
                            </p>
                        </div>
                    </div>
                    {isToday(date) && (
                        <Badge className="bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border-none px-3 py-1 text-[10px] font-black uppercase tracking-widest">
                            Today
                        </Badge>
                    )}
                </div>
            </div>

            {/* Timeline */}
            <ScrollArea className="flex-1 px-4 py-4">
                {dayEvents.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center py-20 text-center space-y-4">
                        <div className="p-4 bg-slate-100 dark:bg-slate-800/30 rounded-full">
                            <Activity className="h-8 w-8 text-slate-400 dark:text-slate-600" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-bold text-slate-500 dark:text-slate-400">No events scheduled</p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-medium">Schedule your first task below</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {dayEvents.map((event) => {
                            const isEditing = editingEventId === event.id;
                            const duration = differenceInMinutes(new Date(event.end), new Date(event.start));
                            const projectColor = event.task?.projectRef?.color || (isDark ? "#3b82f6" : "#2563eb");

                            return (
                                <div key={event.id} className="group relative">
                                    {/* Event Card (Full Width) */}
                                    <div
                                        className={cn(
                                            "p-5 rounded-2xl border-l-[6px] border transition-all duration-300",
                                            "bg-slate-50 dark:bg-slate-800/20 border-slate-100 dark:border-slate-800/50 hover:border-blue-200 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-slate-800/40 shadow-sm",
                                            isEditing && "ring-2 ring-blue-500/50 border-blue-500/50 bg-white dark:bg-slate-800/60 shadow-xl"
                                        )}
                                        style={{
                                            borderLeftColor: projectColor,
                                            backgroundColor: isDark
                                                ? (event.task?.projectRef ? `${projectColor}15` : undefined)
                                                : (event.task?.projectRef ? `${projectColor}08` : undefined)
                                        }}
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0 space-y-2">
                                                {isEditing ? (
                                                    <div className="space-y-3">
                                                        <div className="flex items-center gap-2">
                                                            <Input
                                                                value={editTitle}
                                                                onChange={(e) => setEditTitle(e.target.value)}
                                                                className="h-9 bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-sm font-bold focus:ring-blue-500/30 text-slate-900 dark:text-white"
                                                                autoFocus
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter') handleUpdateEvent(event.id);
                                                                    if (e.key === 'Escape') setEditingEventId(null);
                                                                }}
                                                            />
                                                            <div className="flex items-center gap-1 shrink-0">
                                                                <Button
                                                                    size="icon"
                                                                    variant="ghost"
                                                                    className="h-8 w-8 text-green-600 dark:text-green-400 hover:text-green-500 hover:bg-green-500/10"
                                                                    onClick={() => handleUpdateEvent(event.id)}
                                                                >
                                                                    <Check className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    size="icon"
                                                                    variant="ghost"
                                                                    className="h-8 w-8 text-red-600 dark:text-red-400 hover:text-red-500 hover:bg-red-500/10"
                                                                    onClick={() => setEditingEventId(null)}
                                                                >
                                                                    <X className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Input
                                                                type="time"
                                                                value={editStart}
                                                                onChange={(e) => setEditStart(e.target.value)}
                                                                className="h-8 bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-[10px] uppercase font-black w-24 text-center text-slate-900 dark:text-white"
                                                            />
                                                            <span className="text-slate-400 dark:text-slate-600 font-bold">—</span>
                                                            <Input
                                                                type="time"
                                                                value={editEnd}
                                                                onChange={(e) => setEditEnd(e.target.value)}
                                                                className="h-8 bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-[10px] uppercase font-black w-24 text-center text-slate-900 dark:text-white"
                                                            />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <h3 className="text-base font-bold text-slate-900 dark:text-white break-words leading-relaxed group-hover:text-blue-600 dark:group-hover:text-blue-200 transition-colors">
                                                        {event.title}
                                                    </h3>
                                                )}
                                                {!isEditing && (
                                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                                                        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-200/50 dark:bg-slate-800/40 px-2 py-1 rounded-lg">
                                                            <Clock className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                                                            <span>{format(new Date(event.start), "h:mm a")} — {format(new Date(event.end), "h:mm a")}</span>
                                                            <span className="text-slate-400 dark:text-slate-500 ml-1">({duration}m)</span>
                                                        </div>
                                                        {event.task?.projectRef && (
                                                            <div className="flex items-center gap-2">
                                                                <div className="h-2 w-2 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.2)]" style={{ backgroundColor: event.task.projectRef.color }} />
                                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                                                    {event.task.projectRef.name}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                                                {!isEditing && (
                                                    <>
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="h-9 w-9 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-500/10 rounded-xl"
                                                            onClick={() => {
                                                                setEditingEventId(event.id);
                                                                setEditTitle(event.title);
                                                                setEditStart(format(new Date(event.start), "HH:mm"));
                                                                setEditEnd(format(new Date(event.end), "HH:mm"));
                                                            }}
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        {event.task && (
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                className="h-9 w-9 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-500/10 rounded-xl"
                                                                onClick={() => handleFocus(event)}
                                                            >
                                                                <Timer className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="h-9 w-9 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 rounded-xl"
                                                            onClick={() => deleteEvent.mutate(event.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </ScrollArea>

            {/* Footer with Inline Scheduling */}
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0f172a] space-y-4">
                <div className="relative">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <Search className={cn(
                            "h-4 w-4 transition-colors",
                            isSearching ? "text-blue-500 dark:text-blue-400" : "text-slate-400 dark:text-slate-500"
                        )} />
                    </div>
                    <Input
                        placeholder="Search or schedule a task..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setIsSearching(true);
                        }}
                        onFocus={() => setIsSearching(true)}
                        className="pl-10 h-11 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-sm focus:ring-2 focus:ring-blue-500/20 rounded-xl text-slate-900 dark:text-white"
                    />

                    {isSearching && searchQuery && (
                        <div className="absolute bottom-full left-0 right-0 mb-3 bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300 z-20">
                            {filteredTasks.length === 0 ? (
                                <div className="p-4 text-center">
                                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">No matching tasks</p>
                                </div>
                            ) : (
                                <div className="p-2 space-y-1">
                                    {filteredTasks.map(task => (
                                        <button
                                            key={task.id}
                                            onClick={() => handleScheduleTask(task)}
                                            className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-blue-500/10 text-left transition-colors group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: task.projectRef?.color || '#64748b' }} />
                                                <span className="text-sm font-bold text-slate-700 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">{task.title}</span>
                                            </div>
                                            <Plus className="h-4 w-4 text-slate-400 dark:text-slate-600 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <Button
                    className="w-full h-11 bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-500 text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-xl shadow-lg shadow-blue-900/20 group transition-all"
                    onClick={() => setIsSearching(!isSearching)}
                >
                    <div className="flex items-center gap-2">
                        {isSearching ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                        {isSearching ? "Cancel Scheduling" : "Schedule New Task"}
                    </div>
                </Button>
            </div>
        </div>
    );
}