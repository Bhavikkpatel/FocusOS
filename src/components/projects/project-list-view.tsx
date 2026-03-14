"use client";

import { useState, useMemo } from "react";
import { ProjectWithStats } from "@/hooks/use-projects";
import { TaskItem } from "@/components/tasks/task-item";
import { TaskExpandedView } from "@/components/tasks/task-expanded-view";
import { AnimatePresence, motion } from "framer-motion";
import { useTags } from "@/hooks/use-tags";
import { TaskDialog } from "@/components/tasks/task-dialog";
import { Task } from "@prisma/client";
import { PlusSquare, ArrowDownUp } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function ProjectListView({ project }: { project: ProjectWithStats }) {
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState<Task | undefined>(undefined);
    const [sortBy, setSortBy] = useState<"createdAt" | "priority" | "dueDate">("createdAt");
    const [tagFilter, setTagFilter] = useState<string>("ALL");
    const [difficultyFilter, setDifficultyFilter] = useState<string>("ALL");
    const { data: tags = [] } = useTags();

    const handleEdit = (task: Task) => {
        setTaskToEdit(task);
        setIsDialogOpen(true);
    };

    const handleCreate = () => {
        setTaskToEdit(undefined);
        setIsDialogOpen(true);
    };

    // Flatten all tasks from project columns
    // We already have project.columns because of include in the API
    const allTasks = project.columns?.flatMap((col) => col.tasks || []) || [];
    const activeTasks = allTasks.filter(t => t.status !== "COMPLETED" && t.status !== "ARCHIVED");
    const completedTasks = allTasks.filter(t => t.status === "COMPLETED");

    // Unified filtering function
    const applyFilters = (tasks: typeof allTasks) => {
        return tasks.filter((t: any) => {
            if (tagFilter !== "ALL") {
                if (!t.tags || !t.tags.find((tag: any) => tag.id === tagFilter)) return false;
            }
            if (difficultyFilter !== "ALL") {
                if (t.difficulty !== difficultyFilter) return false;
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

    // Live selected task
    const liveSelectedTask = selectedTaskId ? allTasks.find((t) => t.id === selectedTaskId) || null : null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="h-full overflow-y-auto w-full max-w-5xl mx-auto space-y-6 pb-20"
        >
            <div className="flex flex-wrap items-center justify-end gap-2 mb-4">
                <Select value={tagFilter} onValueChange={setTagFilter}>
                    <SelectTrigger className="h-9 w-[130px] bg-white dark:bg-slate-800 text-xs font-medium border-slate-200 dark:border-slate-700">
                        <SelectValue placeholder="All Tags" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">All Tags</SelectItem>
                        {tags.map((t) => (
                            <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                    <SelectTrigger className="h-9 w-[130px] bg-white dark:bg-slate-800 text-xs font-medium border-slate-200 dark:border-slate-700">
                        <SelectValue placeholder="All Difficulties" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">All Difficulties</SelectItem>
                        <SelectItem value="EASY">Easy</SelectItem>
                        <SelectItem value="MEDIUM">Medium</SelectItem>
                        <SelectItem value="HARD">Hard</SelectItem>
                    </SelectContent>
                </Select>

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
                {sortedActiveTasks.length > 0 ? (
                    sortedActiveTasks.map((task) => (
                        <TaskItem
                            key={task.id}
                            task={task}
                            onEdit={handleEdit}
                            onSelect={(t) => setSelectedTaskId(t.id)}
                        />
                    ))
                ) : (
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
                                    onSelect={(t) => setSelectedTaskId(t.id)}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {liveSelectedTask && (
                    <TaskExpandedView
                        task={liveSelectedTask}
                        onClose={() => setSelectedTaskId(null)}
                    />
                )}
            </AnimatePresence>

            <TaskDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                taskToEdit={taskToEdit}
                defaultProject={project.id}
            />
        </motion.div>
    );
}
