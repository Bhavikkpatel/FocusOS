/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable jsx-a11y/no-autofocus */
"use client";

import { useState, useMemo } from "react";
import {
    DndContext,
    DragOverlay,
    DragStartEvent,
    DragEndEvent,
    DragOverEvent,
    closestCorners,
    useSensors,
    useSensor,
    PointerSensor,
    KeyboardSensor,
    TouchSensor,
    useDroppable,
} from "@dnd-kit/core";
import { useRef } from "react";
import {
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useUpdateTask, useCreateTask } from "@/hooks/use-tasks";
import { useCreateColumn, useUpdateColumn, useDeleteColumn } from "@/hooks/use-columns";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, MoreHorizontal, Pencil, Trash2, Circle, Loader2, Eye, CheckCircle2, PauseCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { KanbanCard } from "@/components/tasks/kanban-card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

// ─── Types ─────────────────────────────────────
interface ColumnWithTasks {
    id: string;
    name: string;
    sortOrder: number;
    tasks: any[];
}

interface ProjectData {
    id: string;
    name: string;
    color: string;
    columns: ColumnWithTasks[];
}

// Column configuration constants for styling
const COLUMN_STYLES: Record<string, any> = {
    TODO: {
        icon: Circle,
        color: "border-t-slate-400",
        bg: "bg-[hsl(var(--column-todo))]",
        badge: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
    },
    IN_PROGRESS: {
        icon: Loader2,
        color: "border-t-blue-500",
        bg: "bg-[hsl(var(--column-inprogress))]",
        badge: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    },
    READY_FOR_REVIEW: {
        icon: Eye,
        color: "border-t-amber-500",
        bg: "bg-[hsl(var(--column-review))]",
        badge: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
    },
    COMPLETED: {
        icon: CheckCircle2,
        color: "border-t-green-500",
        bg: "bg-[hsl(var(--column-completed))]",
        badge: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
    },
    ON_HOLD: {
        icon: PauseCircle,
        color: "border-t-purple-500",
        bg: "bg-[hsl(var(--column-onhold))]",
        badge: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-blue-400",
    },
};

const DEFAULT_STYLE = {
    icon: Circle,
    color: "border-t-slate-300",
    bg: "bg-slate-50/50 dark:bg-slate-900/30",
    badge: "bg-slate-100 text-slate-500",
};

const getStatusFromColumnName = (name: string) => {
    const normalized = name.toLowerCase().trim();
    if (normalized === "to do") return "TODO";
    if (normalized === "in progress") return "IN_PROGRESS";
    if (normalized === "review") return "READY_FOR_REVIEW";
    if (normalized === "done") return "COMPLETED";
    if (normalized === "on hold") return "ON_HOLD";
    return undefined;
};

// ─── Sortable Task Card ────────────────────────
function SortableTaskCard({
    task,
    onSelect,
}: {
    task: any;
    onSelect: (task: any) => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: task.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(isDragging && "opacity-40")}
            {...attributes}
            {...listeners}
        >
            <KanbanCard task={task} onSelect={onSelect} />
        </div>
    );
}

// ─── Kanban Column ─────────────────────────────
function KanbanColumn({
    column,
    projectId,
    onSelectTask,
}: {
    column: ColumnWithTasks;
    projectId: string;
    onSelectTask: (task: any) => void;
}) {
    const [newTitle, setNewTitle] = useState("");
    const [isEditingName, setIsEditingName] = useState(false);
    const [editName, setEditName] = useState(column.name);
    const inputRef = useRef<HTMLInputElement>(null);
    const createTask = useCreateTask();
    const updateColumn = useUpdateColumn();
    const deleteColumn = useDeleteColumn();
    const queryClient = useQueryClient();

    const { setNodeRef, isOver } = useDroppable({
        id: column.id,
    });

    const handleAddTask = () => {
        if (!newTitle.trim()) return;
        createTask.mutate(
            {
                title: newTitle.trim(),
                projectId,
                columnId: column.id,
                status: getStatusFromColumnName(column.name) as any || "TODO",
            },
            {
                onSuccess: () => {
                    setNewTitle("");
                    queryClient.invalidateQueries({ queryKey: ["project", projectId] });
                },
            }
        );
    };

    const handleRename = () => {
        if (editName.trim() && editName.trim() !== column.name) {
            updateColumn.mutate({
                projectId,
                colId: column.id,
                name: editName.trim(),
            });
        }
        setIsEditingName(false);
    };

    const handleDelete = () => {
        if (column.tasks.length > 0) {
            alert("Move or delete all tasks before removing this column.");
            return;
        }
        deleteColumn.mutate({ projectId, colId: column.id });
    };

    const taskIds = column.tasks.map((t: any) => t.id);
    const status = getStatusFromColumnName(column.name);
    const style = status ? COLUMN_STYLES[status] : DEFAULT_STYLE;
    const Icon = style.icon;

    return (
        <div className={cn(
            "flex flex-col rounded-xl border border-t-4 min-w-[280px] w-[280px] shrink-0 snap-start",
            style.color,
            style.bg,
            isOver && "ring-2 ring-primary/30 bg-primary/5"
        )}>
            {/* Column Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b">
                <div className="flex items-center gap-2">
                    {isEditingName ? (
                        <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onBlur={handleRename}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") handleRename();
                                if (e.key === "Escape") setIsEditingName(false);
                            }}
                            className="h-7 w-32 text-sm font-semibold p-1"
                            autoFocus
                        />
                    ) : (
                        <div className="flex items-center gap-2 group/header">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                            <h3
                                className="text-sm font-semibold cursor-pointer hover:text-foreground"
                                onClick={() => setIsEditingName(true)}
                            >
                                {column.name}
                            </h3>
                        </div>
                    )}
                    <span className={cn(
                        "text-[10px] font-mono px-2 py-0.5 rounded-full",
                        style.badge
                    )}>
                        {column.tasks.length}
                    </span>
                </div>
                <div className="flex items-center gap-0.5">
                    <button
                        onClick={() => inputRef.current?.focus()}
                        className="p-1 text-muted-foreground hover:text-foreground rounded transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                    </button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="p-1 text-muted-foreground hover:text-foreground rounded transition-colors">
                                <MoreHorizontal className="h-4 w-4" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setIsEditingName(true)}>
                                <Pencil className="mr-2 h-3.5 w-3.5" /> Rename
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={handleDelete}
                                className="text-red-600"
                            >
                                <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Tasks */}
            <div
                ref={setNodeRef}
                className="flex-1 p-2 space-y-2 overflow-y-auto max-h-[calc(100vh-260px)] min-h-[100px]"
            >
                <SortableContext
                    items={taskIds}
                    strategy={verticalListSortingStrategy}
                >
                    {column.tasks.map((task: any) => (
                        <SortableTaskCard
                            key={task.id}
                            task={task}
                            onSelect={onSelectTask}
                        />
                    ))}
                </SortableContext>

                {/* Persistent Quick Add Task */}
                <div className="mt-2 p-1.5 rounded-lg border border-dashed border-transparent hover:border-slate-200 dark:hover:border-slate-800 transition-all group/add">
                    <div className="flex items-center gap-2 px-1">
                        <div className="flex-1 relative">
                            <Input
                                ref={inputRef}
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                placeholder="Add task..."
                                className="h-7 text-xs bg-transparent border-none shadow-none focus-visible:ring-0 p-0 placeholder:text-muted-foreground/40"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") handleAddTask();
                                    if (e.key === "Escape") setNewTitle("");
                                }}
                                disabled={createTask.isPending}
                            />
                            {createTask.isPending && (
                                <div className="absolute right-0 top-1">
                                    <Loader2 className="h-3 w-3 animate-spin text-muted-foreground/50" />
                                </div>
                            )}
                        </div>
                        {newTitle && !createTask.isPending && (
                            <button
                                onClick={handleAddTask}
                                className="text-[10px] font-bold text-primary hover:text-primary/80 shrink-0"
                            >
                                <Plus className="h-3 w-3" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Main Kanban Board ─────────────────────────
export function ProjectKanban({
    project,
    selectedTaskId,
    onSelectTask
}: {
    project: ProjectData;
    selectedTaskId: string | null;
    onSelectTask: (id: string | null) => void;
}) {
    const { mutate: updateTask } = useUpdateTask();
    const createColumn = useCreateColumn();
    const queryClient = useQueryClient();
    const [activeTask, setActiveTask] = useState<any>(null);
    const [newColumnName, setNewColumnName] = useState("");

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor),
        useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
    );

    // Build a flat list of all tasks
    const allTasks = useMemo(
        () => project.columns.flatMap((c) => c.tasks),
        [project.columns]
    );

    const handleDragStart = (event: DragStartEvent) => {
        const task = allTasks.find((t) => t.id === event.active.id);
        setActiveTask(task || null);
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        // Find the columns
        const activeColumn = project.columns.find((col) =>
            col.tasks.some((t: any) => t.id === activeId)
        );
        const overColumn = project.columns.find((col) =>
            col.id === overId || col.tasks.some((t: any) => t.id === overId)
        );

        if (!activeColumn || !overColumn || activeColumn === overColumn) {
            return;
        }

        // We don't necessarily need to update the state here IF we want to wait for the drop
        // But for a "stickier" feel, we could optimistically move it in the local state or signal dnd-kit
        // For now, let's keep it simple and ensure DragEnd handles the final move.
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveTask(null);

        if (!over) return;

        const taskId = active.id as string;
        const task = allTasks.find((t) => t.id === taskId);
        if (!task) return;

        // Determine target column and status
        let targetColumnId: string | null = null;
        let newStatus: any = undefined;

        // Check if dropped on a column directly
        const targetColumn = project.columns.find((c) => c.id === over.id);
        if (targetColumn) {
            targetColumnId = targetColumn.id;
            newStatus = getStatusFromColumnName(targetColumn.name);
        } else {
            // Dropped on another task — find its column
            const overTask = allTasks.find((t) => t.id === over.id);
            if (overTask) {
                targetColumnId = overTask.columnId;
                const col = project.columns.find(c => c.id === overTask.columnId);
                if (col) {
                    newStatus = getStatusFromColumnName(col.name);
                }
            }
        }

        if (targetColumnId && (targetColumnId !== task.columnId || newStatus !== task.status)) {
            // Prevent completion if there are unfinished subtasks
            if (newStatus === "COMPLETED" && task.subtasks && task.subtasks.length > 0) {
                const hasUnfinishedSubtasks = task.subtasks.some((st: any) => !st.isCompleted);
                if (hasUnfinishedSubtasks) {
                    toast.error("Finish all subtasks before moving to Done");
                    return;
                }
            }

            updateTask(
                {
                    id: taskId,
                    columnId: targetColumnId,
                    status: newStatus
                },
                {
                    onSuccess: () => {
                        queryClient.invalidateQueries({
                            queryKey: ["project", project.id],
                        });
                    },
                }
            );
        }
    };

    const handleAddColumn = () => {
        if (!newColumnName.trim()) return;
        createColumn.mutate(
            { projectId: project.id, name: newColumnName.trim() },
            {
                onSuccess: () => {
                    setNewColumnName("");
                    queryClient.invalidateQueries({
                        queryKey: ["project", project.id],
                    });
                },
            }
        );
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
                <div className="flex h-full gap-6 overflow-x-auto pb-6 px-2 snap-x snap-mandatory hide-scrollbar">
                    {project.columns.map((column) => (
                        <KanbanColumn
                            key={column.id}
                            column={column}
                            projectId={project.id}
                            onSelectTask={(t) => onSelectTask(t.id)}
                        />
                    ))}

                    {/* Persistent Add Column */}
                    <div className="w-72 min-w-[288px] flex-shrink-0 snap-start">
                        <div className="p-3 bg-card rounded-xl border border-dashed border-border group/addcol hover:border-primary/30 transition-all">
                            <div className="flex items-center gap-2 mb-2">
                                <Plus className="h-4 w-4 text-muted-foreground group-focus-within/addcol:text-primary" />
                                <h3 className="text-sm font-semibold text-muted-foreground group-focus-within/addcol:text-foreground">New Column</h3>
                            </div>
                            <div className="relative">
                                <Input
                                    value={newColumnName}
                                    onChange={(e) =>
                                        setNewColumnName(e.target.value)
                                    }
                                    placeholder="Column name..."
                                    className="h-8 text-sm bg-transparent border-none shadow-none focus-visible:ring-0 p-0 placeholder:text-muted-foreground/30"
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") handleAddColumn();
                                    }}
                                    disabled={createColumn.isPending}
                                />
                                {createColumn.isPending && (
                                    <div className="absolute right-0 top-2">
                                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground/50" />
                                    </div>
                                )}
                            </div>
                            {newColumnName && !createColumn.isPending && (
                                <button 
                                    onClick={handleAddColumn}
                                    className="mt-2 w-full py-1 text-xs font-bold text-primary hover:bg-primary/10 rounded transition-colors"
                                >
                                    Add Column
                                </button>
                            )}
                        </div>
                    </div>
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
