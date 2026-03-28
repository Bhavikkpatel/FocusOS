"use client";

import { useMemo } from "react";
import { format, isToday, isYesterday } from "date-fns";
import { PomodoroSession, DeepWorkSession } from "@prisma/client";
import { History as HistoryIcon, Star, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SessionTimelineProps {
    sessions: (PomodoroSession & { deepWorkSession?: (DeepWorkSession & { distractions?: any }) | null })[];
}

export function SessionTimeline({ sessions }: SessionTimelineProps) {
    // Group sessions by date
    const groupedSessions = useMemo(() => {
        if (!sessions || sessions.length === 0) return null;

        const groups = sessions.reduce((acc, session) => {
            const date = new Date(session.completedAt);
            if (isNaN(date.getTime())) return acc;

            // Format as YYYY-MM-DD for grouping key
            const dateKey = format(date as Date, "yyyy-MM-dd");

            if (!acc[dateKey]) {
                acc[dateKey] = {
                    date,
                    sessions: [],
                };
            }
            acc[dateKey].sessions.push(session);
            return acc;
        }, {} as Record<string, { date: Date; sessions: any[] }>);

        // Convert to array and sort by date descending
        return Object.values(groups).sort((a, b) => b.date.getTime() - a.date.getTime());
    }, [sessions]);

    const formatDuration = (seconds: number) => {
        const m = Math.round(seconds / 60);
        return `${m}m`;
    };

    const getRelativeDateLabel = (date: Date) => {
        if (isToday(date)) return "Today";
        if (isYesterday(date)) return "Yesterday";
        return format(date as Date, "MMMM d, yyyy");
    };

    if (!groupedSessions) {
        return (
            <div className="flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 opacity-40">
                <HistoryIcon className="h-8 w-8 mb-2" />
                <span className="text-[10px] font-black uppercase tracking-widest text-center">No Activity Yet</span>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {groupedSessions.map((group, groupIndex) => (
                <div key={groupIndex} className="space-y-3">
                    <div className="sticky top-0 z-10 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur py-1 border-b border-slate-200/50 dark:border-slate-800/50">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                            {getRelativeDateLabel(group.date)}
                        </span>
                    </div>

                    <div className="space-y-2">
                        {group.sessions.map((session) => (
                            <div
                                key={session.id}
                                className="group relative flex flex-col gap-2 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 transition-colors hover:border-primary/30"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="secondary" className="font-mono text-[10px] font-bold bg-slate-100 dark:bg-slate-800">
                                            {formatDuration(session.duration)}
                                        </Badge>
                                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                            {session.type === "FOCUS" ? "Deep Focus" : "Rest Break"}
                                        </span>
                                    </div>
                                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                                        {format(new Date(session.completedAt) as Date, "h:mm a")}
                                    </span>
                                </div>

                                {/* Session Metadata Bar */}
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1 mt-1 border-t border-slate-100 dark:border-slate-800/50">
                                    {/* Completion Status */}
                                    <div className="flex items-center gap-1.5" title={session.wasInterrupted ? "Session ended early" : "Completed successfully"}>
                                        {session.wasInterrupted ? (
                                            <>
                                                <XCircle className="h-3.5 w-3.5 text-slate-400" />
                                                <span className="text-[10px] font-semibold text-slate-500">Incomplete</span>
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                                                <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-400">Completed</span>
                                            </>
                                        )}
                                    </div>

                                    {/* Rating */}
                                    {session.type === "FOCUS" && (
                                        <div className="flex items-center gap-1.5" title="Focus Quality Rating">
                                            <Star className={`h-3.5 w-3.5 ${session.rating ? "text-amber-500" : "text-slate-300 dark:text-slate-700"}`} />
                                            <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 tabular-nums">
                                                {session.rating ? `${session.rating}/5` : "Unrated"}
                                            </span>
                                        </div>
                                    )}

                                    {/* Interruptions */}
                                    {session.type === "FOCUS" && (session.interruptions ?? 0) > 0 && (
                                        <div className="flex items-center gap-1.5" title={`${session.interruptions} interruptions during session`}>
                                            <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                                            <span className="text-[10px] font-semibold text-red-600 dark:text-red-400 tabular-nums">
                                                {session.interruptions} {session.interruptions === 1 ? "distraction" : "distractions"}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Captured Thoughts (Distractions) */}
                                {session.deepWorkSession?.distractions && (session.deepWorkSession.distractions as any[]).length > 0 && (
                                    <div className="mt-2 pl-3 border-l-2 border-primary/20 space-y-1.5">
                                        {(session.deepWorkSession.distractions as any[]).map((d: any, i: number) => (
                                            <div key={i} className="text-[10px] text-muted-foreground flex items-start gap-2 italic leading-relaxed">
                                                <span className="text-primary mt-1 min-w-[4px]">•</span>
                                                <span className="line-clamp-2">{d.text}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
