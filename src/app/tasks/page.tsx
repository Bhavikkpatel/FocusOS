import { Suspense } from "react";
import { Metadata } from "next";
import { TaskList } from "@/components/tasks/task-list";
import { TaskListSkeleton } from "@/components/tasks/task-skeleton";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

export const metadata: Metadata = {
    title: "Tasks - FocusOS",
    description: "Manage your tasks and projects",
};

export default function TasksPage() {
    return (
        <DashboardLayout>
            <Suspense fallback={<TaskListSkeleton />}>
                <TaskList />
            </Suspense>
        </DashboardLayout>
    );
}
