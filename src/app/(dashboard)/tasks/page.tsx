import { Metadata } from "next";
import { TaskList } from "@/components/tasks/task-list";
import { List } from "lucide-react";

export const metadata: Metadata = {
    title: "Tasks - FocusOS",
    description: "Manage your tasks and projects",
};

export default function TasksPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-1">
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                        <List className="h-8 w-8 text-primary" />
                        Tasks
                    </h2>
                    <p className="text-muted-foreground font-medium">
                        Manage your tasks and focus sessions.
                    </p>
                </div>
            </div>

            <TaskList />
        </div>
    );
}
