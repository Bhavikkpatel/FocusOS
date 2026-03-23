"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Flame, PlusSquare, LayoutGrid, List, ArrowDownUp, ChevronDown, ChevronRight, Folder } from "lucide-react";
import { Task } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useTasks, TaskWithSessions } from "@/hooks/use-tasks";
import { useTags } from "@/hooks/use-tags";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { TaskItem } from "./task-item";
import { TaskDialog } from "./task-dialog";
import { KanbanBoard } from "./kanban-board";
import { useLayoutStore } from "@/store/layout";

import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent } from "@/components/ui/tabs";


type ViewMode = "list" | "kanban";
type GroupBy = "none" | "project" | "status";

export function TaskList() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<string>("active");
    const [viewMode, setViewMode] = useState<ViewMode>("list");
    const [sortBy, setSortBy] = useState<"createdAt" | "priority" | "dueDate">("createdAt");
    const [groupBy, setGroupBy] = useState<GroupBy>("none");
    const [tagFilter, setTagFilter] = useState<string>("ALL");
    const [difficultyFilter, setDifficultyFilter] = useState<string>("ALL");
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
    const [isFiltersVisible, setIsFiltersVisible] = useState(false);
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
        const savedTab = localStorage.getItem("focusos_tasks_tab");
        if (savedTab) {
            setActiveTab(savedTab);
        }
    }, []); // Only run once on mount

    const handleTabChange = (val: string) => {
        setActiveTab(val);
        localStorage.setItem("focusos_tasks_tab", val);
    };

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
        status: activeTab === "active" ? "ALL" : (activeTab === "completed" ? "COMPLETED" : "ARCHIVED")
    });

    const { data: tags = [] } = useTags();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState<Task | undefined>(undefined);

    const handleEdit = (task: Task) => {
        setTaskToEdit(task);
        setIsDialogOpen(true);
    };

    const { setCommandCaptureOpen } = useLayoutStore();
    const handleCreate = () => {
        setCommandCaptureOpen(true, "create");
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
        const tasks = activeTab === "active" ? filteredActiveTasks : (activeTab === "completed" ? filteredCompletedTasks : filteredArchivedTasks);
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
    }, [activeTab, filteredActiveTasks, filteredCompletedTasks, filteredArchivedTasks, sortBy]);

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

    const tabs = [
        { id: "active", label: "Active", count: activeTasks.length },
        { id: "completed", label: "Completed", count: completedTasks.length },
        { id: "archived", label: "Archived", count: archivedTasks.length },
    ];

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-1">
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                        <List className="h-8 w-8 text-primary" />
                        Tasks
                    </h2>
                    <p className="text-muted-foreground font-medium">
                        {activeTab === "active" ? `You have ${activeTasks.length} tasks to focus on.` : 
                         activeTab === "completed" ? `Great job! You've finished ${completedTasks.length} tasks.` : 
                         `Viewing ${archivedTasks.length} archived items.`}
                    </p>
                </div>
                <Button 
                    onClick={handleCreate}
                    className="bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20 rounded-xl px-6"
                >
                    <PlusSquare className="mr-2 h-5 w-5" />
                    New Task
                </Button>
            </div>

            <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-1">
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#161618] p-1 rounded-2xl border border-slate-200 dark:border-white/5">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => handleTabChange(tab.id)}
                                className={cn(
                                    "relative px-4 sm:px-6 py-2 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-[0.1em] sm:tracking-[0.2em] transition-all duration-300",
                                    activeTab === tab.id 
                                        ? "text-white dark:text-black" 
                                        : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                                )}
                            >
                                {activeTab === tab.id && (
                                    <motion.div
                                        layoutId="activeTaskTab"
                                        className="absolute inset-0 bg-primary rounded-xl"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <span className="relative z-10 flex items-center gap-2">
                                    {tab.label}
                                    <span className={cn(
                                        "px-1.5 py-0.5 rounded-full text-[9px] font-black transition-colors",
                                        activeTab === tab.id 
                                            ? "bg-white/20 dark:bg-black/20" 
                                            : "bg-slate-200 dark:bg-slate-800"
                                    )}>
                                        {tab.count}
                                    </span>
                                </span>
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700/50">
                            <button
                                onClick={() => handleViewModeChange("list")}
                                className={cn(
                                    "p-1.5 rounded-lg transition-all",
                                    viewMode === "list" ? "bg-white dark:bg-slate-900 shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
                                )}
                                title="List View"
                            >
                                <List className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => handleViewModeChange("kanban")}
                                className={cn(
                                    "p-1.5 rounded-lg transition-all",
                                    viewMode === "kanban" ? "bg-white dark:bg-slate-900 shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
                                )}
                                title="Board View"
                            >
                                <LayoutGrid className="h-4 w-4" />
                            </button>
                        </div>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setIsFiltersVisible(!isFiltersVisible)}
                            className={cn(
                                "h-9 rounded-xl border-slate-200 dark:border-slate-700 font-bold text-xs uppercase tracking-widest",
                                (tagFilter !== "ALL" || difficultyFilter !== "ALL" || groupBy !== "none") && "border-primary text-primary"
                            )}
                        >
                            <ArrowDownUp className="mr-2 h-3.5 w-3.5" />
                            Filters
                        </Button>
                    </div>
                </div>

                <AnimatePresence>
                    {isFiltersVisible && (
                        <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                                <div className="space-y-1.5">
                                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Tags</div>
                                    <Select value={tagFilter} onValueChange={setTagFilter}>
                                        <SelectTrigger className="h-10 bg-white dark:bg-slate-800 text-xs font-bold border-slate-200 dark:border-slate-700 rounded-xl shadow-sm">
                                            <SelectValue placeholder="All Tags" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            <SelectItem value="ALL">All Tags</SelectItem>
                                            {tags.map((t) => (
                                                <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Difficulty</div>
                                    <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                                        <SelectTrigger className="h-10 bg-white dark:bg-slate-800 text-xs font-bold border-slate-200 dark:border-slate-700 rounded-xl shadow-sm">
                                            <SelectValue placeholder="All Difficulties" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            <SelectItem value="ALL">All Difficulties</SelectItem>
                                            <SelectItem value="EASY">Easy</SelectItem>
                                            <SelectItem value="MEDIUM">Medium</SelectItem>
                                            <SelectItem value="HARD">Hard</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Group By</div>
                                    <Select value={groupBy} onValueChange={handleGroupChange}>
                                        <SelectTrigger className="h-10 bg-white dark:bg-slate-800 text-xs font-bold border-slate-200 dark:border-slate-700 rounded-xl shadow-sm">
                                            <SelectValue placeholder="Group" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            <SelectItem value="none">None</SelectItem>
                                            <SelectItem value="project">Project</SelectItem>
                                            <SelectItem value="status">Status</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Sort By</div>
                                    <Select value={sortBy} onValueChange={handleSortChange}>
                                        <SelectTrigger className="h-10 bg-white dark:bg-slate-800 text-xs font-bold border-slate-200 dark:border-slate-700 rounded-xl shadow-sm">
                                            <SelectValue placeholder="Sort" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            <SelectItem value="createdAt">Created Date</SelectItem>
                                            <SelectItem value="priority">Priority</SelectItem>
                                            <SelectItem value="dueDate">Due Date</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <TabsContent value="active" className="mt-0 outline-none">
                    {viewMode === "kanban" ? (
                        <KanbanBoard tasks={kanbanTasks} onSelectTask={handleSelectTask} />
                    ) : (
                        <TaskListView 
                            groupBy={groupBy} 
                            sortedTasks={sortedTasks} 
                            groupedTasks={groupedTasks}
                            expandedGroups={expandedGroups}
                            toggleGroup={toggleGroup}
                            handleEdit={handleEdit}
                            handleSelectTask={handleSelectTask}
                            handleCreate={handleCreate}
                            hasNextPage={hasNextPage}
                            isFetchingNextPage={isFetchingNextPage}
                            fetchNextPage={fetchNextPage}
                        />
                    )}
                </TabsContent>

                <TabsContent value="completed" className="mt-0 outline-none">
                    <TaskListView 
                        groupBy={groupBy} 
                        sortedTasks={sortedTasks} 
                        groupedTasks={groupedTasks}
                        expandedGroups={expandedGroups}
                        toggleGroup={toggleGroup}
                        handleEdit={handleEdit}
                        handleSelectTask={handleSelectTask}
                        handleCreate={handleCreate}
                        hasNextPage={hasNextPage}
                        isFetchingNextPage={isFetchingNextPage}
                        fetchNextPage={fetchNextPage}
                        isCompletedView
                    />
                </TabsContent>

                <TabsContent value="archived" className="mt-0 outline-none">
                    <TaskListView 
                        groupBy={groupBy} 
                        sortedTasks={sortedTasks} 
                        groupedTasks={groupedTasks}
                        expandedGroups={expandedGroups}
                        toggleGroup={toggleGroup}
                        handleEdit={handleEdit}
                        handleSelectTask={handleSelectTask}
                        handleCreate={handleCreate}
                        hasNextPage={hasNextPage}
                        isFetchingNextPage={isFetchingNextPage}
                        fetchNextPage={fetchNextPage}
                    />
                </TabsContent>
            </Tabs>

            <TaskDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                taskToEdit={taskToEdit}
            />
        </div>
    );
}

interface TaskListViewProps {
    groupBy: GroupBy;
    sortedTasks: TaskWithSessions[];
    groupedTasks: { id: string; label: string; tasks: TaskWithSessions[] }[] | null;
    expandedGroups: Record<string, boolean>;
    toggleGroup: (id: string) => void;
    handleEdit: (task: Task) => void;
    handleSelectTask: (id: string | null) => void;
    handleCreate: () => void;
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
    fetchNextPage: () => void;
    isCompletedView?: boolean;
}

function TaskListView({
    groupBy,
    sortedTasks,
    groupedTasks,
    expandedGroups,
    toggleGroup,
    handleEdit,
    handleSelectTask,
    handleCreate,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    isCompletedView = false
}: TaskListViewProps) {
    return (
        <div className="space-y-4">
            {groupBy === "none" ? (
                <div className={cn("space-y-3", isCompletedView && "opacity-75")}>
                    {sortedTasks.map((task) => (
                        <TaskItem
                            key={task.id}
                            task={task}
                            onEdit={handleEdit}
                            onSelect={(t) => handleSelectTask(t.id)}
                        />
                    ))}
                </div>
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
                                            <div className={cn("space-y-3 pt-1", isCompletedView && "opacity-75")}>
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

            {sortedTasks.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center bg-slate-50/50 dark:bg-slate-900/20 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                    <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-full mb-4">
                        <Flame className="h-8 w-8 text-slate-400" />
                    </div>
                    <h3 className="font-bold text-lg">No tasks found</h3>
                    <p className="text-muted-foreground text-sm max-w-[240px] mt-1 italic">
                        {isCompletedView ? "You haven't completed any tasks with these filters yet." : "Time to add some goals and start your focus session!"}
                    </p>
                    {!isCompletedView && (
                        <Button onClick={handleCreate} variant="outline" className="mt-6 rounded-xl font-bold border-2">
                            <PlusSquare className="mr-2 h-4 w-4" />
                            Create Task
                        </Button>
                    )}
                </div>
            )}

            {hasNextPage && (
                <div className="flex justify-center py-4">
                    <Button
                        variant="outline"
                        onClick={() => fetchNextPage()}
                        disabled={isFetchingNextPage}
                        className="rounded-xl font-bold hover:bg-primary hover:text-white transition-all"
                    >
                        {isFetchingNextPage ? "Loading more..." : "Load More"}
                    </Button>
                </div>
            )}

            {!isCompletedView && sortedTasks.length > 0 && (
                <div
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            handleCreate();
                        }
                    }}
                    className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center text-center opacity-70 hover:opacity-100 transition-all cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 group mt-4"
                    onClick={handleCreate}
                >
                    <div className="bg-slate-100 dark:bg-slate-800 p-2.5 rounded-full mb-3 group-hover:scale-110 transition-transform">
                        <PlusSquare className="h-5 w-5 text-slate-400" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Add another task</h3>
                </div>
            )}
        </div>
    );
}
