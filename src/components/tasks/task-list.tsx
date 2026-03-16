"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { CheckCircle, Flame, PlusSquare, LayoutGrid, List, ArrowDownUp, ChevronDown, ChevronRight, Folder, Kanban, Archive } from "lucide-react";
import { Task } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useTasks, TaskWithSessions } from "@/hooks/use-tasks";
import { useTags } from "@/hooks/use-tags";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { TaskItem } from "./task-item";
import { TaskDialog } from "./task-dialog";
import { KanbanBoard } from "./kanban-board";

import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

type ViewMode = "list" | "kanban";
type GroupBy = "none" | "project" | "status";

export function TaskList() {
    const router = useRouter();
    const [filter, setFilter] = useState<"ALL" | "COMPLETED" | "ARCHIVED">("ALL");
    const [viewMode, setViewMode] = useState<ViewMode>("list");
    const [sortBy, setSortBy] = useState<"createdAt" | "priority" | "dueDate">("createdAt");
    const [groupBy, setGroupBy] = useState<GroupBy>("none");
    const [tagFilter, setTagFilter] = useState<string>("ALL");
    const [difficultyFilter, setDifficultyFilter] = useState<string>("ALL");
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
    // Track whether preferences have been loaded from localStorage
    const prefsLoaded = useRef(false);

    useEffect(() => {
        if (prefsLoaded.current) return;
        prefsLoaded.current = true;
        const savedView = localStorage.getItem("focusos_tasks_view");
        if (savedView === "list" || savedView === "kanban") {
            setViewMode(savedView as ViewMode);
        }
        const savedSort = localStorage.getItem("focusos_tasks_sort");
        if (savedSort === "createdAt" || savedSort === "priority" || savedSort === "dueDate") {
            setSortBy(savedSort as "createdAt" | "priority" | "dueDate");
        }
        const savedGroup = localStorage.getItem("focusos_tasks_group");
        if (savedGroup === "none" || savedGroup === "project" || savedGroup === "status") {
            setGroupBy(savedGroup as GroupBy);
        }
    }, []); // Only run once on mount

    const handleViewModeChange = (mode: ViewMode) => {
        setViewMode(mode);
        localStorage.setItem("focusos_tasks_view", mode);
    };

    const handleSortChange = (val: "createdAt" | "priority" | "dueDate") => {
        setSortBy(val);
        localStorage.setItem("focusos_tasks_sort", val);
    };

    const handleGroupChange = (val: GroupBy) => {
        setGroupBy(val);
        localStorage.setItem("focusos_tasks_group", val);
        // Reset expanded groups when group by changes
        setExpandedGroups({});
    };

    const toggleGroup = (groupId: string) => {
        setExpandedGroups(prev => ({
            ...prev,
            [groupId]: !prev[groupId]
        }));
    };

    const {
        data,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = useTasks({
        status: filter === "ALL" ? "ALL" : filter
    });

    const { data: tags = [] } = useTags();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState<Task | undefined>(undefined);

    const handleEdit = (task: Task) => {
        setTaskToEdit(task);
        setIsDialogOpen(true);
    };

    const handleCreate = () => {
        setTaskToEdit(undefined);
        setIsDialogOpen(true);
    };

    const handleSelectTask = (id: string | null) => {
        if (id) {
            router.push(`/tasks/${id}`);
        }
    };

    const allTasks = data?.pages.flatMap((page) => page.tasks) || [];
    const activeTasks = allTasks.filter(t => t.status !== "COMPLETED" && t.status !== "ARCHIVED");
    const completedTasks = allTasks.filter(t => t.status === "COMPLETED");
    const archivedTasks = allTasks.filter(t => t.status === "ARCHIVED");
    const highPriorityCount = activeTasks.filter(t => t.priority === "HIGH" || t.priority === "URGENT").length;


    // For kanban: show all non-archived tasks (including completed)
    const rawKanbanTasks = allTasks.filter(t => t.status !== "ARCHIVED");

    // Unified filtering function
    const applyFilters = (tasks: TaskWithSessions[]) => {
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
    const filteredArchivedTasks = applyFilters(archivedTasks);
    const kanbanTasks = applyFilters(rawKanbanTasks);

    // Sorting logic
    const sortedTasks = useMemo(() => {
        const tasks = filter === "ALL" ? filteredActiveTasks : (filter === "COMPLETED" ? filteredCompletedTasks : filteredArchivedTasks);
        return [...tasks].sort((a, b) => {
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
            // Fallback to createdAt or if sortBy === 'createdAt'
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
    }, [filter, filteredActiveTasks, filteredCompletedTasks, filteredArchivedTasks, sortBy]);

    // Grouping Logic
    const groupedTasks = useMemo(() => {
        if (groupBy === "none") return null;

        const groups: Record<string, { label: string; tasks: TaskWithSessions[] }> = {};

        sortedTasks.forEach(task => {
            let groupId = "unknown";
            let label = "Unknown";

            if (groupBy === "project") {
                groupId = task.projectId || "daily";
                label = task.projectRef?.name || "Daily";
            } else if (groupBy === "status") {
                groupId = task.status;
                label = task.status.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (l: string) => l.toUpperCase());
            }

            if (!groups[groupId]) {
                groups[groupId] = { label, tasks: [] };
            }
            groups[groupId].tasks.push(task);
        });

        return Object.entries(groups).map(([id, group]) => ({
            id,
            ...group
        }));
    }, [sortedTasks, groupBy]);

    if (error) {
        return <div className="p-8 text-center text-red-500">Error loading tasks</div>;
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="space-y-6">
                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                        <div className="space-y-1">
                            <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Tasks</h2>
                            <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base">
                                Stay focused and organized. You have {activeTasks.length} tasks pending.
                            </p>
                        </div>

                        {/* Quick Stats */}
                        <div className="flex flex-wrap items-center gap-3">
                            <div
                                tabIndex={0}
                                role="button"
                                className={cn(
                                    "flex-1 min-w-[120px] px-3 py-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-3 cursor-pointer transition-all hover:border-primary/30",
                                    filter === "COMPLETED" ? "ring-2 ring-primary bg-primary/5 border-primary/30" : "hover:bg-slate-50 dark:hover:bg-slate-800/80"
                                )}
                                onClick={() => setFilter(filter === "COMPLETED" ? "ALL" : "COMPLETED")}
                            >
                                <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center shrink-0">
                                    <CheckCircle className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider leading-none mb-1">Done</p>
                                    <p className="text-lg font-black text-slate-900 dark:text-white leading-none">
                                        {completedTasks.length}
                                    </p>
                                </div>
                            </div>

                            <div
                                tabIndex={0}
                                role="button"
                                className={cn(
                                    "flex-1 min-w-[120px] px-3 py-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-3 cursor-pointer transition-all hover:border-amber-500/30",
                                    filter === "ARCHIVED" ? "ring-2 ring-amber-500 bg-amber-500/5 border-amber-500/30" : "hover:bg-slate-50 dark:hover:bg-slate-800/80"
                                )}
                                onClick={() => setFilter(filter === "ARCHIVED" ? "ALL" : "ARCHIVED")}
                            >
                                <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                                    <Archive className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider leading-none mb-1">Archived</p>
                                    <p className="text-lg font-black text-slate-900 dark:text-white leading-none">
                                        {archivedTasks.length}
                                    </p>
                                </div>
                            </div>

                            <div className="flex-1 min-w-[120px] px-3 py-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
                                    <Flame className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider leading-none mb-1">Urgent</p>
                                    <p className="text-lg font-black text-slate-900 dark:text-white leading-none">
                                        {highPriorityCount}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filters Row */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-2 border-t border-slate-100 dark:border-slate-800/50">
                        <div className="flex flex-wrap items-center gap-2">
                            <Select value={tagFilter} onValueChange={setTagFilter}>
                                <SelectTrigger className="h-9 w-[120px] bg-white dark:bg-slate-800 text-xs font-bold border-slate-200 dark:border-slate-700 rounded-lg shadow-sm">
                                    <SelectValue placeholder="All Tags" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="ALL">All Tags</SelectItem>
                                    {tags.map((t) => (
                                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                                <SelectTrigger className="h-9 w-[120px] bg-white dark:bg-slate-800 text-xs font-bold border-slate-200 dark:border-slate-700 rounded-lg shadow-sm">
                                    <SelectValue placeholder="Difficulty" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="ALL">Difficulty</SelectItem>
                                    <SelectItem value="EASY">Easy</SelectItem>
                                    <SelectItem value="MEDIUM">Medium</SelectItem>
                                    <SelectItem value="HARD">Hard</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={groupBy} onValueChange={handleGroupChange}>
                                <SelectTrigger className="h-9 w-[120px] bg-white dark:bg-slate-800 text-xs font-bold border-slate-200 dark:border-slate-700 rounded-lg shadow-sm">
                                    <div className="flex items-center gap-1.5">
                                        <Kanban className="h-3.5 w-3.5 text-muted-foreground" />
                                        <SelectValue placeholder="Group" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="none">Group: None</SelectItem>
                                    <SelectItem value="project">Group: Project</SelectItem>
                                    <SelectItem value="status">Group: Status</SelectItem>
                                </SelectContent>
                            </Select>

                            {viewMode === "list" && (
                                <Select value={sortBy} onValueChange={handleSortChange}>
                                    <SelectTrigger className="h-9 w-[120px] bg-white dark:bg-slate-800 text-xs font-bold border-slate-200 dark:border-slate-700 rounded-lg shadow-sm">
                                        <div className="flex items-center gap-1.5">
                                            <ArrowDownUp className="h-3.5 w-3.5 text-muted-foreground" />
                                            <SelectValue placeholder="Sort" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        <SelectItem value="createdAt">Sort: Created</SelectItem>
                                        <SelectItem value="priority">Sort: Priority</SelectItem>
                                        <SelectItem value="dueDate">Sort: Due Date</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        </div>

                        <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 p-1 shadow-sm backdrop-blur-sm">
                            <button
                                onClick={() => handleViewModeChange("list")}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                                    viewMode === "list"
                                        ? "bg-primary text-primary-foreground shadow-md scale-105"
                                        : "text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-700/50"
                                )}
                            >
                                <List className="h-3.5 w-3.5" />
                                List
                            </button>
                            <button
                                onClick={() => handleViewModeChange("kanban")}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                                    viewMode === "kanban"
                                        ? "bg-primary text-primary-foreground shadow-md scale-105"
                                        : "text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-700/50"
                                )}
                            >
                                <LayoutGrid className="h-3.5 w-3.5" />
                                Board
                            </button>
                        </div>
                </div>
            </div>

            {/* View Content */}
            {viewMode === "kanban" ? (
                <KanbanBoard
                    tasks={kanbanTasks}
                    onSelectTask={handleSelectTask}
                />
            ) : (
                <>
                    {/* Task List Container */}
                    <div className="space-y-4">
                        {groupBy === "none" ? (
                            sortedTasks.map((task) => (
                                <TaskItem
                                    key={task.id}
                                    task={task}
                                    onEdit={handleEdit}
                                    onSelect={(t) => handleSelectTask(t.id)}
                                />
                            ))
                        ) : (
                            <div className="space-y-6">
                                {groupedTasks?.map((group) => {
                                    const isExpanded = expandedGroups[group.id] !== false;
                                    return (
                                        <div key={group.id} className="space-y-3">
                                            <button
                                                onClick={() => toggleGroup(group.id)}
                                                className="flex items-center gap-2 group w-full text-left"
                                            >
                                                <div className="flex items-center justify-center w-5 h-5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors">
                                                    {isExpanded ? (
                                                        <ChevronDown className="h-3 w-3" />
                                                    ) : (
                                                        <ChevronRight className="h-3 w-3" />
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {groupBy === "project" && <Folder className="h-3.5 w-3.5 text-primary/70" />}
                                                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                                        {group.label}
                                                    </h3>
                                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                                                        {group.tasks.length}
                                                    </span>
                                                </div>
                                                <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800 ml-2" />
                                            </button>

                                            <AnimatePresence initial={false}>
                                                {isExpanded && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: "auto", opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={{ duration: 0.2, ease: "easeInOut" }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="space-y-3 pt-1">
                                                            {group.tasks.map((task) => (
                                                                <TaskItem
                                                                    key={task.id}
                                                                    task={task}
                                                                    onEdit={handleEdit}
                                                                    onSelect={(t) => handleSelectTask(t.id)}
                                                                />
                                                            ))}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {hasNextPage && (
                            <div className="flex justify-center py-4">
                                <Button
                                    variant="outline"
                                    onClick={() => fetchNextPage()}
                                    disabled={isFetchingNextPage}
                                >
                                    {isFetchingNextPage ? "Loading more..." : "Load More"}
                                </Button>
                            </div>
                        )}

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
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Create new task</h3>
                            <p className="text-xs text-slate-500 mt-1">Add another item to your list</p>
                        </div>

                        {/* Completed Tasks Section */}
                        {completedTasks.length > 0 && filter === "ALL" && (
                            <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800">
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Completed</h3>
                                <div className="space-y-4 opacity-60">
                                    {completedTasks.map((task) => (
                                        <TaskItem
                                            key={task.id}
                                            task={task}
                                            onEdit={handleEdit}
                                            onSelect={(t) => handleSelectTask(t.id)}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}
            <TaskDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                taskToEdit={taskToEdit}
            />
        </div>
    );
}
