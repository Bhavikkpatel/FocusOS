"use client";

import { useState, useMemo } from "react";
import { ProjectWithStats } from "@/hooks/use-projects";
import { TaskItem } from "@/components/tasks/task-item";
import { motion } from "framer-motion";
import { TaskDialog } from "@/components/tasks/task-dialog";
import { Task } from "@prisma/client";
import { PlusSquare, ArrowDownUp, Plus } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-state";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateTask } from "@/hooks/use-tasks";
import { useQueryClient } from "@tanstack/react-query";
import { useLayoutStore } from "@/store/layout";

export function ProjectListView({ 
    project, 
    onSelectTask 
}: { 
    project: ProjectWithStats;
    onSelectTask: (id: string | null) => void;
}) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState<Task | undefined>(undefined);
    const [sortBy, setSortBy] = useState<"createdAt" | "priority" | "dueDate">("createdAt");
    const [quickTitle, setQuickTitle] = useState("");
    const { projectFilters, setCommandCaptureOpen } = useLayoutStore();
    const createTask = useCreateTask();
    const queryClient = useQueryClient();

    const handleQuickCreate = () => {
        if (!quickTitle.trim()) return;
        createTask.mutate({
            title: quickTitle.trim(),
            projectId: project.id,
            status: "TODO",
        }, {
            onSuccess: () => {
                setQuickTitle("");
                queryClient.invalidateQueries({ queryKey: ["project", project.id] });
            }
        });
    };

    const handleEdit = (task: Task) => {
        setTaskToEdit(task);
        setIsDialogOpen(true);
    };

    const handleCreate = () => {
        setCommandCaptureOpen(true, "create");
    };

    // Flatten all tasks from project columns
    // We already have project.columns because of include in the API
    const allTasks = project.columns?.flatMap((col) => col.tasks || []) || [];
    const activeTasks = allTasks.filter(t => t.status !== "COMPLETED" && t.status !== "ARCHIVED");
    const completedTasks = allTasks.filter(t => t.status === "COMPLETED");

    // Unified filtering function
    const applyFilters = (tasks: typeof allTasks) => {
        return tasks.filter((t: any) => {
            if (projectFilters.tag !== "ALL") {
                if (!t.tags || !t.tags.find((tag: any) => tag.id === projectFilters.tag)) return false;
            }
            if (projectFilters.difficulty !== "ALL") {
                if (t.difficulty !== projectFilters.difficulty) return false;
            }
            if (projectFilters.status !== "ALL") {
                if (t.status !== projectFilters.status) return false;
            }
            if (projectFilters.hasTimer) {
                if (!t.pomodoroSessions || t.pomodoroSessions.length === 0) return false;
            }
            return true;
        });
    };

    const filteredActiveTasks = applyFilters(activeTasks);
    const filteredCompletedTasks = applyFilters(completedTasks);

    // Sorting logic
    const sortedActiveTasks = useMemo(() => {
        return [...filteredActiveTasks].sort((a, b) => {
            if (sortBy === "dueDate") {
                if (a.dueDate && b.dueDate) {
                    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
                }
                if (a.dueDate) return -1;
                if (b.dueDate) return 1;
            }
            if (sortBy === "priority") {
                const priorityWeight = { URGENT: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
                const weightA = priorityWeight[a.priority as keyof typeof priorityWeight] || 0;
                const weightB = priorityWeight[b.priority as keyof typeof priorityWeight] || 0;
                if (weightA !== weightB) return weightB - weightA;
            }
            // Fallback to createdAt
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
    }, [filteredActiveTasks, sortBy]);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="h-full overflow-y-auto w-full max-w-5xl mx-auto space-y-6 pb-20"
        >
            <div className="flex flex-wrap items-center justify-end gap-2 mb-4">
                <Select value={sortBy} onValueChange={(val: "createdAt" | "priority" | "dueDate") => setSortBy(val)}>
                    <SelectTrigger className="h-9 w-[130px] bg-white dark:bg-slate-800 text-xs font-medium border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-1.5">
                            <ArrowDownUp className="h-3.5 w-3.5 text-muted-foreground" />
                            <SelectValue placeholder="Sort by" />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="createdAt">Date Created</SelectItem>
                        <SelectItem value="priority">Priority</SelectItem>
                        <SelectItem value="dueDate">Due Date</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-4">
                {/* Rapid Quick Add Row */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex items-center gap-3 shadow-sm group transition-all">
                    <div className="h-6 w-6 rounded-full border-2 border-slate-100 dark:border-slate-800 flex items-center justify-center shrink-0">
                        <Plus className="h-3.5 w-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    </div>
                    <input
                        value={quickTitle}
                        onChange={(e) => setQuickTitle(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                handleQuickCreate();
                            }
                        }}
                        placeholder="Type a task and press Enter to save instantly..."
                        className="bg-transparent border-none shadow-none focus:outline-none p-0 h-auto text-sm flex-1 placeholder:text-muted-foreground/50"
                        disabled={createTask.isPending}
                    />
                    {createTask.isPending && (
                        <LoadingSpinner spinnerSize={16} />
                    )}
                </div>

                {sortedActiveTasks.length > 0 ? (
                    sortedActiveTasks.map((task) => (
                        <TaskItem
                            key={task.id}
                            task={task}
                            onEdit={handleEdit}
                            onSelect={(t) => onSelectTask(t.id)}
                        />
                    ))
                ) : !quickTitle && (
                    <div
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                handleCreate();
                            }
                        }}
                        className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-8 flex flex-col items-center justify-center text-center opacity-75 hover:opacity-100 transition-opacity cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 group"
                        onClick={handleCreate}
                    >
                        <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-full mb-3 group-hover:scale-110 transition-transform">
                            <PlusSquare className="h-6 w-6 text-slate-400" />
                        </div>
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Add a task</h3>
                        <p className="text-xs text-slate-500 mt-1">First task for this project</p>
                    </div>
                )}

                {/* Completed Tasks Section */}
                {filteredCompletedTasks.length > 0 && (
                    <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Completed</h3>
                        <div className="space-y-4 opacity-60">
                            {filteredCompletedTasks.map((task) => (
                                <TaskItem
                                    key={task.id}
                                    task={task}
                                    onEdit={handleEdit}
                                    onSelect={(t) => onSelectTask(t.id)}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <TaskDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                taskToEdit={taskToEdit}
                defaultProject={project.id}
            />
        </motion.div>
    );
}
