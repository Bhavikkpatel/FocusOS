"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CalendarIcon, ExternalLink, Timer, Trash2, X } from "lucide-react";
import type { CalendarEvent } from "@/hooks/use-calendar";
import { useDeleteCalendarEvent } from "@/hooks/use-calendar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface CalendarEventPopoverProps {
    event: CalendarEvent;
    position: { x: number; y: number };
    onClose: () => void;
    onStartFocus?: (taskId: string, calendarEventId?: string | null) => void;
}

const PRIORITY_COLORS: Record<string, string> = {
    LOW: "bg-slate-100 text-slate-600",
    MEDIUM: "bg-blue-100 text-blue-700",
    HIGH: "bg-orange-100 text-orange-700",
    URGENT: "bg-red-100 text-red-700",
};

export function CalendarEventPopover({
    event,
    position,
    onClose,
    onStartFocus,
}: CalendarEventPopoverProps) {
    const router = useRouter();
    const { mutate: deleteEvent, isPending } = useDeleteCalendarEvent();

    const task = event.task;
    const projectColor = task?.projectRef?.color || event.color || "#6366f1";

    const startDate = new Date(event.start);
    const endDate = new Date(event.end);
    const durationMs = endDate.getTime() - startDate.getTime();
    const durationMins = Math.round(durationMs / 60000);

    const formatTime = (d: Date) =>
        d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // Keep popover on-screen
    const style: React.CSSProperties = {
        position: "fixed",
        left: Math.min(position.x, window.innerWidth - 320),
        top: Math.min(position.y, window.innerHeight - 360),
        zIndex: 9999,
    };

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-[9998]" onClick={onClose} />

            <div
                style={style}
                className="w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl overflow-hidden"
            >
                {/* Color header bar */}
                <div
                    className="h-1.5 w-full"
                    style={{ backgroundColor: projectColor }}
                />

                <div className="p-4 space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-slate-900 dark:text-white text-sm leading-snug truncate">
                                {event.title}
                            </h3>
                            {task?.projectRef && (
                                <p className="text-xs text-slate-500 mt-0.5">
                                    📁 {task.projectRef.name}
                                </p>
                            )}
                        </div>
                        <button
                            onClick={onClose}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 shrink-0"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Time */}
                    <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                        <CalendarIcon className="h-3.5 w-3.5" />
                        <span>
                            {formatTime(startDate)} – {formatTime(endDate)}{" "}
                            ({durationMins}m)
                        </span>
                    </div>

                    {/* Task info */}
                    {task && (
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge
                                className={`text-[10px] font-semibold px-2 py-0.5 ${PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.MEDIUM}`}
                            >
                                {task.priority}
                            </Badge>
                            <span className="text-xs text-slate-500">
                                🍅 {task.completedPomodoros}/{task.estimatedPomodoros}
                            </span>
                        </div>
                    )}

                    {/* Notes */}
                    {event.notes && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                            {event.notes}
                        </p>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col gap-2 pt-1">
                        {task && onStartFocus && (
                            <Button
                                size="sm"
                                className="w-full gap-2 text-xs"
                                onClick={() => {
                                    onStartFocus(task.id, event.id);
                                    onClose();
                                }}
                            >
                                <Timer className="h-3.5 w-3.5" />
                                Start Focus Session
                            </Button>
                        )}

                        {task && (
                            <Button
                                size="sm"
                                variant="outline"
                                className="w-full gap-2 text-xs"
                                onClick={() => {
                                    router.push(`/tasks?task=${task.id}&event=${event.id}`);
                                    onClose();
                                }}
                            >
                                <ExternalLink className="h-3.5 w-3.5" />
                                Open Task
                            </Button>
                        )}

                        <Button
                            size="sm"
                            variant="ghost"
                            className="w-full gap-2 text-xs text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                            disabled={isPending}
                            onClick={() => {
                                deleteEvent(event.id);
                                onClose();
                            }}
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                            {event.taskId ? "Unschedule" : "Delete Event"}
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}
