"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CalendarClock, X } from "lucide-react";
import { useCreateCalendarEvent } from "@/hooks/use-calendar";
import { useProjects } from "@/hooks/use-projects";
import { useTimerStore } from "@/store/timer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const schema = z.object({
    title: z.string().min(1, "Title is required"),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
    projectId: z.string().optional(),
    estimatedPomodoros: z.number().int().min(1).max(20),
    durationMinutes: z.number().min(5).max(480),
});

type FormValues = z.infer<typeof schema>;

interface CalendarSlotModalProps {
    slotStart: Date;
    slotEnd?: Date;
    onClose: () => void;
}

export function CalendarSlotModal({ slotStart, slotEnd, onClose }: CalendarSlotModalProps) {
    const { mutate: createEvent, isPending } = useCreateCalendarEvent();
    const { data: projects = [] } = useProjects();
    const { currentPreset } = useTimerStore();

    const shortBreakDuration = (currentPreset?.shortBreakDuration || 300) / 60; // default 5m
    const longBreakDuration = (currentPreset?.longBreakDuration || 900) / 60; // default 15m
    const sessionsUntilLongBreak = currentPreset?.sessionsUntilLongBreak || 4;

    // Pre-compute duration from drag selection (clamped to slider range)
    const initialDuration = slotEnd
        ? Math.min(Math.max(Math.round((slotEnd.getTime() - slotStart.getTime()) / 60000 / 5) * 5, 15), 240)
        : 50;

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            priority: "MEDIUM",
            estimatedPomodoros: Math.max(1, Math.round(initialDuration / 25)),
            durationMinutes: initialDuration,
        },
    });

    const durationMinutes = watch("durationMinutes");
    const estimatedPomodoros = watch("estimatedPomodoros");

    const totalBreaks = Math.max(0, estimatedPomodoros - 1);
    const numLongBreaks = totalBreaks > 0 ? Math.floor(totalBreaks / sessionsUntilLongBreak) : 0;
    const numShortBreaks = totalBreaks - numLongBreaks;
    const totalBreakDuration = (numShortBreaks * shortBreakDuration) + (numLongBreaks * longBreakDuration);

    const totalFocusTime = Math.max(0, durationMinutes - totalBreakDuration);
    const focusDurationEach = Math.floor(totalFocusTime / (estimatedPomodoros || 1));

    const onSubmit = (values: FormValues) => {
        const start = slotStart;
        const end = new Date(start.getTime() + values.durationMinutes * 60000);

        createEvent(
            {
                title: values.title,
                start: start.toISOString(),
                end: end.toISOString(),
                createTask: true,
                taskPriority: values.priority,
                taskProjectId: values.projectId || null,
                taskEstimatedPomodoros: values.estimatedPomodoros,
                taskPomodoroDuration: focusDurationEach,
            },
            { onSuccess: onClose }
        );
    };

    const formatSlotTime = (d: Date) =>
        d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) +
        " · " +
        d.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });

    return (
        <>
            <div className="fixed inset-0 z-[9998] bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] w-full max-w-md">
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                            <CalendarClock className="h-5 w-5 text-primary" />
                            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                                Schedule Task
                            </h2>
                        </div>
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                        {/* Slot info */}
                        <p className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-lg">
                            📅 {formatSlotTime(slotStart)}
                        </p>

                        {/* Title */}
                        <div className="space-y-1.5">
                            <Label htmlFor="cal-title" className="text-xs font-medium">Task Title</Label>
                            <Input
                                id="cal-title"
                                placeholder="What will you work on?"
                                autoFocus
                                {...register("title")}
                                className="text-sm"
                            />
                            {errors.title && (
                                <p className="text-xs text-red-500">{errors.title.message}</p>
                            )}
                        </div>

                        {/* Project */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium">Project</Label>
                            <Select onValueChange={(v) => setValue("projectId", v)}>
                                <SelectTrigger className="text-sm">
                                    <SelectValue placeholder="No project" />
                                </SelectTrigger>
                                <SelectContent className="z-[10000]">
                                    {projects.map((p) => (
                                        <SelectItem key={p.id} value={p.id}>
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-2.5 h-2.5 rounded-full"
                                                    style={{ backgroundColor: p.color }}
                                                />
                                                {p.name}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Priority */}
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium">Priority</Label>
                                <Select
                                    defaultValue="MEDIUM"
                                    onValueChange={(v) =>
                                        setValue("priority", v as FormValues["priority"])
                                    }
                                >
                                    <SelectTrigger className="text-sm">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="z-[10000]">
                                        <SelectItem value="LOW">Low</SelectItem>
                                        <SelectItem value="MEDIUM">Medium</SelectItem>
                                        <SelectItem value="HIGH">High</SelectItem>
                                        <SelectItem value="URGENT">Urgent</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Duration */}
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium">
                                    Duration: {durationMinutes}m
                                </Label>
                                <input
                                    type="range"
                                    min={15}
                                    max={240}
                                    step={5}
                                    className="w-full h-2 accent-primary mt-2"
                                    {...register("durationMinutes", { valueAsNumber: true })}
                                />
                            </div>
                        </div>

                        {/* Pomodoros */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium">
                                    Pomodoros 🍅
                                </Label>
                                <Input
                                    type="number"
                                    min={1}
                                    max={20}
                                    className="text-sm"
                                    {...register("estimatedPomodoros", { valueAsNumber: true })}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-slate-400">
                                    Focus each
                                </Label>
                                <div className="h-9 px-3 flex items-center text-sm font-medium bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400">
                                    {focusDurationEach}m
                                </div>
                            </div>
                        </div>

                        {totalBreaks > 0 && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-dashed border-slate-200 dark:border-slate-700">
                                    <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Estimated Break Time</span>
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{totalBreakDuration}m Total</span>
                                </div>
                                {numLongBreaks > 0 && (
                                    <div className="flex items-center gap-4 px-3 text-[10px] font-medium text-slate-400">
                                        <span className="flex items-center gap-1">
                                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                                            {numShortBreaks} Short Break{numShortBreaks !== 1 ? 's' : ''}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <span className="w-1 h-1 rounded-full bg-primary/40" />
                                            {numLongBreaks} Long Break{numLongBreaks !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}


                        {/* Footer */}
                        <div className="flex gap-3 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1"
                                onClick={onClose}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" className="flex-1" disabled={isPending}>
                                {isPending ? "Creating..." : "Schedule Task"}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
