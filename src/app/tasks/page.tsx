import { Suspense } from "react";
import { Metadata } from "next";
import { TaskList } from "@/components/tasks/task-list";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

export const metadata: Metadata = {
    title: "Tasks - FocusOS",
    description: "Manage your tasks and projects",
};

export default function TasksPage() {
    return (
        <DashboardLayout>
            <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading tasks...</div>}>
                <TaskList />
            </Suspense>
        </DashboardLayout>
    );
}
