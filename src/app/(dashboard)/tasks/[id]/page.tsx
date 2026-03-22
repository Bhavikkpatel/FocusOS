"use client";

import { useTask } from "@/hooks/use-tasks";
import { TaskExpandedView } from "@/components/tasks/task-expanded-view";
import { TaskListSkeleton } from "@/components/tasks/task-skeleton";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useLayoutStore } from "@/store/layout";
import { useEffect } from "react";

export default function TaskDetailPage() {
    const params = useParams();
    const router = useRouter();
    const taskId = params?.id as string;
    const searchParams = useSearchParams();
    const calendarEventId = searchParams.get("event");
    const { setNoPadding } = useLayoutStore();

    useEffect(() => {
        setNoPadding(true);
        return () => setNoPadding(false);
    }, [setNoPadding]);

    const { data: task, isLoading, error } = useTask(taskId);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <TaskListSkeleton />
            </div>
        );
    }

    if (error || !task) {
        return (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Task not found</h2>
                <button 
                    onClick={() => router.push("/tasks")}
                    className="text-primary hover:underline font-semibold"
                >
                    Go back to tasks
                </button>
            </div>
        );
    }

    const handleClose = () => {
        router.back();
    };


    return (
        <TaskExpandedView 
            task={task} 
            onClose={handleClose}
            calendarEventId={calendarEventId}
        />
    );
}
