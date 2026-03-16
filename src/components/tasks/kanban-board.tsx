/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo, useEffect } from "react";
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragEndEvent,
    DragOverEvent,
} from "@dnd-kit/core";
import {
    SortableContext,
    verticalListSortingStrategy,
    arrayMove,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { TaskWithSessions, useUpdateTask } from "@/hooks/use-tasks";
import { KanbanCard } from "./kanban-card";
import { cn } from "@/lib/utils";
import {
    Circle,
    Loader2,
    Eye,
    CheckCircle2,
    PauseCircle,
} from "lucide-react";

// Column configuration
const COLUMNS = [
    {
        id: "TODO",
        label: "To Do",
        icon: Circle,
        color: "border-t-slate-400",
        bg: "bg-[hsl(var(--column-todo))]",
        badge: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
    },
    {
        id: "IN_PROGRESS",
        label: "In Progress",
        icon: Loader2,
        color: "border-t-blue-500",
        bg: "bg-[hsl(var(--column-inprogress))]",
        badge: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    },
    {
        id: "READY_FOR_REVIEW",
        label: "Review",
        icon: Eye,
        color: "border-t-amber-500",
        bg: "bg-[hsl(var(--column-review))]",
        badge: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
    },
    {
        id: "COMPLETED",
        label: "Done",
        icon: CheckCircle2,
        color: "border-t-green-500",
        bg: "bg-[hsl(var(--column-completed))]",
        badge: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
    },
    {
        id: "ON_HOLD",
        label: "On Hold",
        icon: PauseCircle,
        color: "border-t-purple-500",
        bg: "bg-[hsl(var(--column-onhold))]",
        badge: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
    },
] as const;

// Droppable column wrapper
function KanbanColumn({
    column,
    tasks,
    onSelect,
}: {
    column: typeof COLUMNS[number];
    tasks: TaskWithSessions[];
    onSelect: (task: TaskWithSessions) => void;
}) {
    const { setNodeRef, isOver } = useDroppable({ id: column.id });
    const Icon = column.icon;

    return (
        <div
            className={cn(
                "flex flex-col rounded-xl border border-t-4 min-w-[280px] w-[280px] shrink-0",
                column.color,
                column.bg,
                isOver && "ring-2 ring-primary/30 bg-primary/5"
            )}
        >
            {/* Column Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b">
                <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold text-sm">{column.label}</span>
                </div>
                <span className={cn(
                    "text-xs font-mono px-2 py-0.5 rounded-full",
                    column.badge
                )}>
                    {tasks.length}
                </span>
            </div>

            {/* Cards Container */}
            <div
                ref={setNodeRef}
                className="flex-1 p-2 space-y-2 overflow-y-auto max-h-[calc(100vh-260px)] min-h-[100px]"
            >
                <SortableContext
                    items={tasks.map(t => t.id)}
                    strategy={verticalListSortingStrategy}
                >
                    {tasks.map((task) => (
                        <KanbanCard
                            key={task.id}
                            task={task}
                            onSelect={onSelect}
                        />
                    ))}
                </SortableContext>

                {tasks.length === 0 && (
                    <div className="flex items-center justify-center h-20 text-xs text-muted-foreground/50 border-2 border-dashed rounded-lg">
                        Drop tasks here
                    </div>
                )}
            </div>
        </div>
    );
}

interface KanbanBoardProps {
    tasks: TaskWithSessions[];
    onSelectTask: (id: string | null) => void;
}

export function KanbanBoard({ 
    tasks,
    onSelectTask
}: KanbanBoardProps) {
    const { mutate: updateTask } = useUpdateTask();
    const [localTasks, setLocalTasks] = useState<TaskWithSessions[]>(tasks);
    const [activeTask, setActiveTask] = useState<TaskWithSessions | null>(null);

    // Sync local state when tasks update
    useEffect(() => {
        setLocalTasks(tasks);
    }, [tasks]);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor)
    );

    // Group tasks by status using local state
    const tasksByStatus = useMemo(() => {
        const grouped: Record<string, TaskWithSessions[]> = {};
        for (const col of COLUMNS) {
            grouped[col.id] = [];
        }
        for (const task of localTasks) {
            if (grouped[task.status]) {
                grouped[task.status].push(task);
            }
        }
        return grouped;
    }, [localTasks]);

    const handleDragStart = (event: DragStartEvent) => {
        const task = localTasks.find(t => t.id === event.active.id);
        setActiveTask(task || null);
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        const activeTaskItem = localTasks.find(t => t.id === activeId);
        if (!activeTaskItem) return;

        // Find which status column we're over
        let overStatus: string | null = null;
        const isOverColumn = COLUMNS.some(c => c.id === overId);
        
        if (isOverColumn) {
            overStatus = overId;
        } else {
            const overTaskItem = localTasks.find(t => t.id === overId);
            if (overTaskItem) {
                overStatus = overTaskItem.status;
            }
        }

        if (!overStatus || overStatus === activeTaskItem.status) return;

        setLocalTasks(prev => {
            const activeIndex = prev.findIndex(t => t.id === activeId);
            const updatedTask = { ...prev[activeIndex], status: overStatus as any };
            
            // Move item to new status in local state
            const newTasks = [...prev];
            newTasks[activeIndex] = updatedTask;
            
            // If dropping over a task, we could also handle reordering here, 
            // but status change is the primary goal for now.
            return newTasks;
        });
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveTask(null);

        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        const taskInLocal = localTasks.find(t => t.id === activeId);
        const originalTask = tasks.find(t => t.id === activeId);

        if (!taskInLocal || !originalTask) return;

        // Finalize reorder within same status if dropped over another task
        if (taskInLocal.status === originalTask.status) {
            const overTask = localTasks.find(t => t.id === overId);
            if (overTask && overTask.status === taskInLocal.status) {
                const oldIndex = localTasks.findIndex(t => t.id === activeId);
                const newIndex = localTasks.findIndex(t => t.id === overId);
                if (oldIndex !== newIndex) {
                    setLocalTasks(prev => arrayMove(prev, oldIndex, newIndex));
                }
            }
        }

        // Finalize mutation
        if (taskInLocal.status !== originalTask.status) {
            updateTask(
                { id: activeId, status: taskInLocal.status as any },
                {
                    onError: () => {
                        // Revert on error
                        setLocalTasks(tasks);
                    }
                }
            );
        }
    };

    return (
        <>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                <div className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2">
                    {COLUMNS.map((column) => (
                        <KanbanColumn
                            key={column.id}
                            column={column}
                            tasks={tasksByStatus[column.id] || []}
                            onSelect={(t) => onSelectTask(t.id)}
                        />
                    ))}
                </div>

                <DragOverlay>
                    {activeTask ? (
                        <div className="rotate-3 opacity-90">
                            <KanbanCard
                                task={activeTask}
                                onSelect={() => { }}
                            />
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>
        </>
    );
}
