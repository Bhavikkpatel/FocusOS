"use client";

import { useTask, useDeleteTask } from "@/hooks/use-tasks";
import { TaskExpandedView } from "@/components/tasks/task-expanded-view";
import { TaskListSkeleton } from "@/components/tasks/task-skeleton";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useParams, useRouter } from "next/navigation";

export default function TaskDetailPage() {
    const params = useParams();
    const router = useRouter();
    const taskId = params?.id as string;
    const { data: task, isLoading, error } = useTask(taskId);
    const { mutate: deleteTask } = useDeleteTask();

    if (isLoading) {
        return (
            <DashboardLayout noPadding hideHeader>
                <div className="flex items-center justify-center h-full">
                    <TaskListSkeleton />
                </div>
            </DashboardLayout>
        );
    }

    if (error || !task) {
        return (
            <DashboardLayout noPadding hideHeader>
                <div className="flex flex-col items-center justify-center h-full space-y-4">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Task not found</h2>
                    <button 
                        onClick={() => router.push("/tasks")}
                        className="text-primary hover:underline font-semibold"
                    >
                        Go back to tasks
                    </button>
                </div>
            </DashboardLayout>
        );
    }

    const handleClose = () => {
        router.back();
    };

    const handleDelete = (id: string) => {
        deleteTask(id);
        router.push("/tasks");
    };

    return (
        <DashboardLayout noPadding hideHeader>
            <TaskExpandedView 
                task={task} 
                onClose={handleClose}
                onDelete={handleDelete}
            />
        </DashboardLayout>
    );
}
