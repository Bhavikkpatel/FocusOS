import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface CalendarEventTask {
    id: string;
    title: string;
    status: string;
    priority: string;
    estimatedPomodoros: number;
    completedPomodoros: number;
    pomodoroDuration: number;
    projectId: string | null;
    projectRef: {
        id: string;
        name: string;
        color: string;
    } | null;
}

export interface CalendarEvent {
    id: string;
    title: string;
    start: string;
    end: string;
    allDay: boolean;
    color: string | null;
    notes: string | null;
    taskId: string | null;
    task: CalendarEventTask | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreateCalendarEventInput {
    title: string;
    start: string;
    end: string;
    allDay?: boolean;
    color?: string;
    notes?: string;
    taskId?: string | null;
    createTask?: boolean;
    taskPriority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    taskProjectId?: string | null;
    taskEstimatedPomodoros?: number;
    taskPomodoroDuration?: number;
}

export interface UpdateCalendarEventInput {
    id: string;
    title?: string;
    start?: string;
    end?: string;
    allDay?: boolean;
    color?: string | null;
    notes?: string | null;
    taskId?: string | null;
}

export const calendarKeys = {
    all: ["calendar"] as const,
    events: (range?: { start: string; end: string }) =>
        [...calendarKeys.all, "events", range] as const,
};

export function useCalendarEvents(range?: { start: string; end: string }) {
    return useQuery({
        queryKey: calendarKeys.events(range),
        queryFn: async () => {
            const params = new URLSearchParams();
            if (range) {
                params.set("start", range.start);
                params.set("end", range.end);
            }
            const res = await fetch(`/api/calendar?${params.toString()}`);
            if (!res.ok) throw new Error("Failed to fetch calendar events");
            return res.json() as Promise<CalendarEvent[]>;
        },
    });
}

export function useCreateCalendarEvent() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: CreateCalendarEventInput) => {
            const res = await fetch("/api/calendar", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("Failed to create calendar event");
            return res.json() as Promise<CalendarEvent>;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: calendarKeys.all });
            toast.success("Event created");
        },
        onError: (err: Error) => {
            toast.error(err.message);
        },
    });
}

export function useUpdateCalendarEvent() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...data }: UpdateCalendarEventInput) => {
            const res = await fetch(`/api/calendar/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("Failed to update calendar event");
            return res.json() as Promise<CalendarEvent>;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: calendarKeys.all });
        },
        onError: (err: Error) => {
            toast.error(err.message);
        },
    });
}

export function useDeleteCalendarEvent() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/calendar/${id}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("Failed to delete calendar event");
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: calendarKeys.all });
            toast.success("Event removed");
        },
        onError: (err: Error) => {
            toast.error(err.message);
        },
    });
}
