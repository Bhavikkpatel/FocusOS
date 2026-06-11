"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Calendar, Clock, GripVertical, Repeat, Paperclip, CheckSquare, MoreVertical, Pencil, Archive, Trash2 } from "lucide-react";
import { TaskWithSessions, useUpdateTask, useDeleteTask } from "@/hooks/use-tasks";
import { cn } from "@/lib/utils";
import { useTimerStore } from "@/store/timer";
import { TagBadge } from "./tags/tag-badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const priorityConfig = {
    LOW: { color: "bg-slate-400", ring: "ring-slate-200" },
    MEDIUM: { color: "bg-blue-500", ring: "ring-blue-200" },
    HIGH: { color: "bg-orange-500", ring: "ring-orange-200" },
    URGENT: { color: "bg-red-500", ring: "ring-red-200" },
};

interface KanbanCardProps {
    task: TaskWithSessions;
    onSelect: (task: TaskWithSessions) => void;
    onEdit?: (task: TaskWithSessions) => void;
}

import React from "react";

export const KanbanCard = React.memo(({ task, onSelect, onEdit }: KanbanCardProps) => {
    const updateTask = useUpdateTask();
    const deleteTask = useDeleteTask();
    const { currentTaskId, isRunning } = useTimerStore();
    
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: task?.id || 'temp', data: { task } });

    const router = useRouter();
    
    if (!task) return null;

    const prefetchTask = () => {
        router.prefetch(`/tasks/${task.id}`);
    };

    const isActive = currentTaskId === task.id && isRunning;

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const config = priorityConfig[task.priority as keyof typeof priorityConfig] || priorityConfig.MEDIUM;

    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "COMPLETED";

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "group rounded-lg border bg-white dark:bg-slate-900 p-3 transition-all cursor-pointer relative",
                isDragging && "opacity-50 ring-2 ring-primary/30 rotate-2",
                isActive && "ring-2 ring-primary border-primary bg-primary/5 shadow-md"
            )}
            onClick={() => onSelect(task)}
            onMouseEnter={prefetchTask}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    onSelect(task);
                }
            }}
            {...attributes}
            {...listeners}
        >


            {/* Drag Handle + Priority */}
            <div className="flex items-start gap-2 mb-2">
                <div
                    className="mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing text-muted-foreground"
                >
                    <GripVertical className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 min-w-0 flex items-center gap-2">
                    <h4 className={cn(
                        "text-sm font-medium leading-snug line-clamp-2",
                        task.status === "COMPLETED" && "line-through text-muted-foreground"
                    )}>
                        {task.title}
                    </h4>
                    {isActive && (
                        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20 shrink-0">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                            <span className="text-[9px] font-bold text-primary">ACTIVE</span>
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                    {onEdit && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                            }}>
                                <button 
                                    className="h-6 w-6 text-muted-foreground/60 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity focus-visible:opacity-100 outline-none"
                                    onPointerDown={(e) => e.stopPropagation()}
                                    onMouseDown={(e) => e.stopPropagation()}
                                >
                                    <MoreVertical className="h-3.5 w-3.5" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                <DropdownMenuItem onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit(task);
                                }}>
                                    <Pencil className="mr-2 h-4 w-4" /> Edit Details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        updateTask.mutate({ id: task.id, status: "ARCHIVED" });
                                    }}
                                    className="text-amber-600 dark:text-amber-500"
                                >
                                    <Archive className="mr-2 h-4 w-4" /> Archive
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (confirm("Are you sure you want to delete this task?")) {
                                            deleteTask.mutate(task.id);
                                        }
                                    }}
                                    className="text-red-600 dark:text-red-400"
                                >
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete Task
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                    <div className={cn("w-2 h-2 rounded-full shrink-0", config.color)} />
                </div>
            </div>

            {/* Footer meta */}
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-3">
                {task.dueDate && (
                    <div className={cn(
                        "flex items-center gap-1",
                        isOverdue && "text-red-500 font-medium"
                    )}>
                        <Calendar className="h-3 w-3" />
                        <span>{format(new Date(task.dueDate), "MMM d")}</span>
                    </div>
                )}
                {/* Counts - Ghost Metrics */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 shrink-0">
                        <Clock className="h-3 w-3" />
                        <span>{task.completedPomodoros}/{task.estimatedPomodoros ?? 0}</span>
                    </div>

                    {task._count && task._count.subtasks > 0 && (
                        <div className="flex items-center gap-1 shrink-0 text-muted-foreground/80">
                            <CheckSquare className="h-3 w-3" />
                            <span>{task._count.subtasks}</span>
                        </div>
                    )}

                    {task._count && task._count.attachments > 0 && (
                        <div className="flex items-center gap-1 shrink-0 text-muted-foreground/80">
                            <Paperclip className="h-3 w-3" />
                            <span>{task._count.attachments}</span>
                        </div>
                    )}
                </div>

                {/* Tags moved to footer */}
                {task.tags && task.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 ml-auto overflow-hidden">
                        {task.tags.map((tag: any) => (
                            <TagBadge 
                                key={typeof tag === 'object' ? tag.id : tag} 
                                tag={typeof tag === 'object' ? tag : { name: tag, color: null } as any} 
                                className="border-none shadow-sm text-[10px] py-0 h-4" 
                            />
                        ))}
                    </div>
                )}

                {task.isRecurring && (
                    <div className="flex items-center gap-1 text-primary/80 shrink-0">
                        <Repeat className="h-3.3 w-3.2" />
                    </div>
                )}
            </div>
        </div>
    );
});

KanbanCard.displayName = "KanbanCard";
