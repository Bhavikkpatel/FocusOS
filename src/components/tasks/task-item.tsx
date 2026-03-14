/* eslint-disable react/no-unescaped-entities */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { format } from "date-fns";
import { motion } from "framer-motion";
import {
    MoreVertical,
    Play,
    Check,
    Trash2,

    Pencil,
    CalendarIcon,
    AlertCircle,
    Repeat,
} from "lucide-react";
import { Task } from "@prisma/client";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useState, useRef, useEffect } from "react";
import { TagBadge } from "./tags/tag-badge";
import { DifficultyBadge } from "./difficulty-badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
    ContextMenuSeparator,
    ContextMenuShortcut,
    ContextMenuSub,
    ContextMenuSubContent,
    ContextMenuSubTrigger,
    ContextMenuRadioGroup,
    ContextMenuRadioItem,
} from "@/components/ui/context-menu";
import { useUpdateTask, useDeleteTask, TaskWithSessions } from "@/hooks/use-tasks";
import { useTimerStore } from "@/store/timer";

interface TaskItemProps {
    task: TaskWithSessions;
    onEdit: (task: Task) => void;
    onSelect: (task: TaskWithSessions) => void;
}

const priorityConfig = {
    LOW: { color: "bg-slate-500", light: "bg-slate-100", text: "text-slate-600", accent: "border-l-slate-400 dark:border-l-slate-600" },
    MEDIUM: { color: "bg-blue-500", light: "bg-blue-100", text: "text-blue-600", accent: "border-l-blue-400 dark:border-l-blue-600" },
    HIGH: { color: "bg-orange-500", light: "bg-orange-100", text: "text-orange-600", accent: "border-l-orange-400 dark:border-l-orange-600" },
    URGENT: { color: "bg-red-500", light: "bg-red-100", text: "text-red-600", accent: "border-l-red-500 dark:border-l-red-500" },
};

export function TaskItem({ task, onEdit, onSelect }: TaskItemProps) {
    const updateTask = useUpdateTask();
    const deleteTask = useDeleteTask();
    const { start, currentPreset, currentTaskId, isRunning, pause, reset } = useTimerStore();
    const isActive = currentTaskId === task.id && isRunning;
    const isCompleted = task.status === "COMPLETED";

    // Status display config
    const statusConfig: Record<string, { label: string; style: string }> = {
        TODO: { label: "To Do", style: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400" },
        IN_PROGRESS: { label: "In Progress", style: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
        READY_FOR_REVIEW: { label: "Review", style: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
        COMPLETED: { label: "Done", style: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
        ON_HOLD: { label: "On Hold", style: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
    };

    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [title, setTitle] = useState(task.title);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);



    // Focus time calculations (Story 1-2)
    const focusSessions = task.pomodoroSessions?.filter((s: any) => s.type === "FOCUS") || [];
    const totalFocusSeconds = focusSessions.reduce((acc: number, s: any) => acc + s.duration, 0);
    const totalFocusMins = Math.floor(totalFocusSeconds / 60);

    useEffect(() => {
        if (isEditingTitle && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditingTitle]);

    const statusCycle = ["TODO", "IN_PROGRESS", "READY_FOR_REVIEW", "COMPLETED"] as const;
    const handleToggle = () => {
        const currentIndex = statusCycle.indexOf(task.status as any);
        const nextStatus = currentIndex >= 0
            ? statusCycle[(currentIndex + 1) % statusCycle.length]
            : "IN_PROGRESS";
        updateTask.mutate({ id: task.id, status: nextStatus });
    };

    const handleDelete = () => {
        deleteTask.mutate(task.id);
        setIsDeleteDialogOpen(false);
    };

    const handleTitleSubmit = () => {
        setIsEditingTitle(false);
        if (title.trim() && title !== task.title) {
            updateTask.mutate({
                id: task.id,
                title: title.trim(),
            });
        } else {
            setTitle(task.title);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleTitleSubmit();
        } else if (e.key === "Escape") {
            setIsEditingTitle(false);
            setTitle(task.title);
        }
    };

    const config = priorityConfig[task.priority] || priorityConfig.LOW;

    const handleStartFocus = () => {
        if (isActive) {
            pause();
        } else {
            const duration = task.pomodoroDuration || (currentPreset?.focusDuration ? currentPreset.focusDuration / 60 : 25);
            start(duration, "FOCUS", task.id);
            if (task.status === "TODO") {
                updateTask.mutate({ id: task.id, status: "IN_PROGRESS" });
            }
        }
    };

    const handleToggleComplete = (e: React.MouseEvent | React.KeyboardEvent) => {
        e.stopPropagation();

        const isArchived = task.status === "ARCHIVED";
        const newStatus = (isCompleted || isArchived) ? "TODO" : "COMPLETED";

        // Story 1: Stop timer if running and marking complete
        if (!isCompleted && !isArchived && isActive) {
            pause();
            reset();
        }

        // Prevent completion if there are unfinished subtasks
        if (newStatus === "COMPLETED" && task.subtasks && task.subtasks.length > 0) {
            const hasUnfinishedSubtasks = task.subtasks.some((st: any) => !st.isCompleted);
            if (hasUnfinishedSubtasks) {
                toast.error("Finish all subtasks before completing the task");
                return;
            }
        }

        updateTask.mutate({
            id: task.id,
            status: newStatus as any
        }, {
            onSuccess: () => {
                if (newStatus === "COMPLETED") {
                    // Story 5: Undo toast
                    toast.success("Task completed", {
                        action: {
                            label: "Undo",
                            onClick: () => updateTask.mutate({ id: task.id, status: "TODO" })
                        }
                    });
                } else if (isArchived) {
                    toast.success("Task restored");
                }
            }
        });
    };

    return (
        <>
            <ContextMenu>
                <ContextMenuTrigger asChild>
                    <div className="group relative">
                        {/* Background Card (Stacked Effect) */}


                        {/* Main Card */}
                        <div
                            className={cn(
                                "relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 rounded-xl border bg-card px-4 py-3 transition-all cursor-pointer border-l-[4px]",
                                isActive ? "border-primary bg-primary/5 ring-1 ring-primary/20 m-[1px]" : cn(config.accent),
                                isCompleted && "opacity-60 grayscale"
                            )}
                            onClick={() => onSelect(task)}
                        >


                            {/* Left Section: Checkbox + Content */}
                            <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                                <motion.div
                                    className="mt-1 sm:mt-0 shrink-0"
                                    onClick={(e: React.MouseEvent) => e.stopPropagation()}
                                    whileTap={{ scale: 0.9 }}
                                    animate={isCompleted ? { scale: [1, 1.2, 1] } : {}}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Checkbox
                                        checked={isCompleted}
                                        onCheckedChange={() => handleToggleComplete({ stopPropagation: () => { } } as any)}
                                        className="h-5 w-5 rounded-md border-2 border-slate-300 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                                    />
                                </motion.div>

                                <div className="flex flex-col min-w-0 flex-1 gap-1">
                                    {/* Title & Badges Row */}
                                    <div className="flex items-center gap-2 flex-wrap">
                                        {isEditingTitle ? (
                                            <div onClick={(e) => e.stopPropagation()} className="max-w-[200px]">
                                                <Input
                                                    ref={inputRef}
                                                    value={title}
                                                    onChange={(e) => setTitle(e.target.value)}
                                                    onBlur={handleTitleSubmit}
                                                    onKeyDown={handleKeyDown}
                                                    className="h-7 px-2 text-sm font-bold"
                                                />
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 min-w-0">
                                                <h3
                                                    className={cn(
                                                        "text-sm font-bold leading-tight tracking-tight hover:text-primary/80 truncate",
                                                        isCompleted && "line-through"
                                                    )}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setIsEditingTitle(true);
                                                    }}
                                                    title="Click to edit title"
                                                >
                                                    {task.title}
                                                </h3>
                                                {task.isRecurring && (
                                                    <Repeat className="h-3.5 w-3.5 text-primary/70 shrink-0" />
                                                )}
                                                {isActive && (
                                                    <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-bold px-2 py-0 animate-pulse flex items-center gap-1.5 shadow-none shrink-0 h-5">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                                                        ACTIVE
                                                    </Badge>
                                                )}
                                            </div>
                                        )}

                                        {/* Badges inline */}
                                        {task.project && (
                                            <Badge variant="outline" className="rounded-md font-normal text-[10px] px-1.5 py-0 h-4">
                                                {task.project}
                                            </Badge>
                                        )}
                                        {(task as any).category && (
                                            <Badge variant="secondary" className="rounded-md font-normal bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-none shadow-sm text-[10px] px-1.5 py-0 h-4">
                                                {(task as any).category.name}
                                            </Badge>
                                        )}
                                        <DifficultyBadge difficulty={(task as any).difficulty} className="rounded-md border shadow-none text-[10px] px-1.5 py-0 h-4 [&>div]:scale-75" />
                                        {(task.priority !== "LOW") && (
                                            <Badge className={cn("rounded-md font-medium text-[9px] uppercase shadow-none tracking-wider px-1.5 py-0 h-4", config.color, "hover:bg-opacity-90")}>
                                                {task.priority}
                                            </Badge>
                                        )}
                                    </div>

                                    {/* Description */}
                                    {task.description && (
                                        <p className="line-clamp-1 text-xs text-muted-foreground mt-0.5">
                                            {task.description}
                                        </p>
                                    )}

                                    {/* Meta Row */}
                                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground flex-wrap mt-0.5">
                                        {task.dueDate && (
                                            <div className={cn(
                                                "flex items-center gap-1 shrink-0",
                                                new Date(task.dueDate) < new Date() && !isCompleted && "text-red-500 font-medium"
                                            )}>
                                                <CalendarIcon className="h-3 w-3" />
                                                <span>{format(new Date(task.dueDate), "MMM d")}</span>
                                            </div>
                                        )}
                                        {task.projectRef && task.projectRef.name && (
                                            <div className="flex items-center gap-1.5 shrink-0">
                                                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: task.projectRef.color || "#3B82F6" }} />
                                                <span className="truncate max-w-[80px] font-medium">{task.projectRef.name}</span>
                                            </div>
                                        )}

                                        {totalFocusMins > 0 && (
                                            <div className="flex items-center gap-1 shrink-0 text-primary/80" title="Total focus time">
                                                <Play className="h-2.5 w-2.5 fill-current" />
                                                <span>{totalFocusMins}m</span>
                                            </div>
                                        )}

                                        {/* Pomodoro Progress mini */}
                                        {task.estimatedPomodoros > 0 && (
                                            <div className="flex items-center gap-1.5 shrink-0 lg:ml-2">
                                                <span className="text-[10px] font-medium text-slate-500">{task.completedPomodoros}/{task.estimatedPomodoros}</span>
                                                <div className="h-1.5 w-12 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden shrink-0 hidden sm:block">
                                                    <div
                                                        className={cn(
                                                            "h-full transition-all duration-500",
                                                            task.completedPomodoros >= task.estimatedPomodoros ? "bg-green-500" : "bg-primary"
                                                        )}
                                                        style={{ width: `${Math.min(100, (task.completedPomodoros / task.estimatedPomodoros) * 100)}%` }}
                                                    />
                                                </div>
                                                {task.completedPomodoros > task.estimatedPomodoros && (
                                                    <span title={`+${task.completedPomodoros - task.estimatedPomodoros} over`}>
                                                        <AlertCircle className="h-3 w-3 text-orange-500" />
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Tags */}
                                    {task.tags && task.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {task.tags.map((tag: any) => (
                                                typeof tag === 'object' ? <TagBadge key={tag.id} tag={tag} className="border-none shadow-sm bg-slate-50 dark:bg-slate-800 text-[9px] py-0 h-4" /> : null
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right Section: Actions */}
                            <div className="flex items-center gap-2 sm:gap-3 shrink-0 self-end sm:self-center mt-2 sm:mt-0">
                                {/* Status Badge */}
                                <div
                                    className={cn(
                                        "flex cursor-pointer items-center justify-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-colors hover:opacity-80 border border-transparent",
                                        statusConfig[task.status]?.style || statusConfig.TODO.style
                                    )}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleToggle();
                                    }}
                                >
                                    <span>{statusConfig[task.status]?.label || task.status}</span>
                                    {isCompleted && <Check className="h-3 w-3" />}
                                </div>

                                {/* Focus Button */}
                                <Button
                                    variant={isActive ? "default" : "secondary"}
                                    size="sm"
                                    className={cn(
                                        "h-7 w-7 sm:w-auto sm:px-3 rounded-full sm:rounded-md text-[10px] font-bold uppercase tracking-wider gap-1.5 transition-all shadow-none shrink-0",
                                        isActive ? "bg-primary text-white" : "bg-slate-100 text-slate-600 hover:bg-primary/10 hover:text-primary dark:bg-slate-800 dark:text-slate-400 sm:opacity-0 sm:group-hover:opacity-100"
                                    )}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleStartFocus();
                                    }}
                                >
                                    {isActive ? (
                                        <>
                                            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                                            <span className="hidden sm:inline">STOP</span>
                                        </>
                                    ) : (
                                        <>
                                            <Play className="h-3 w-3 fill-current sm:m-0 m-auto" />
                                            <span className="hidden sm:inline">FOCUS</span>
                                        </>
                                    )}
                                </Button>

                                {/* Dropdown Menu */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={(e) => {
                                            e.stopPropagation();
                                            onEdit(task);
                                        }}>
                                            <Pencil className="mr-2 h-4 w-4" /> Edit Details
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setIsDeleteDialogOpen(true);
                                            }}
                                            className="text-red-600"
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    </div>
                </ContextMenuTrigger>
                <ContextMenuContent className="w-64">
                    <ContextMenuItem onClick={() => onSelect(task)}>
                        View Details
                    </ContextMenuItem>
                    <ContextMenuItem onClick={() => onEdit(task)}>
                        Edit Title
                    </ContextMenuItem>
                    <ContextMenuSeparator />
                    <ContextMenuItem onClick={handleStartFocus}>
                        <Play className="mr-2 h-4 w-4" /> Start Focus
                    </ContextMenuItem>
                    <ContextMenuSeparator />

                    <ContextMenuSub>
                        <ContextMenuSubTrigger>Set Priority</ContextMenuSubTrigger>
                        <ContextMenuSubContent className="w-48">
                            <ContextMenuRadioGroup value={task.priority} onValueChange={(val) => updateTask.mutate({ id: task.id, priority: val as any })}>
                                <ContextMenuRadioItem value="LOW">Low</ContextMenuRadioItem>
                                <ContextMenuRadioItem value="MEDIUM">Medium</ContextMenuRadioItem>
                                <ContextMenuRadioItem value="HIGH">High</ContextMenuRadioItem>
                                <ContextMenuRadioItem value="URGENT">Urgent</ContextMenuRadioItem>
                            </ContextMenuRadioGroup>
                        </ContextMenuSubContent>
                    </ContextMenuSub>

                    <ContextMenuSub>
                        <ContextMenuSubTrigger>Change Status</ContextMenuSubTrigger>
                        <ContextMenuSubContent className="w-48">
                            <ContextMenuRadioGroup value={task.status} onValueChange={(val) => updateTask.mutate({ id: task.id, status: val as any })}>
                                <ContextMenuRadioItem value="TODO">To Do</ContextMenuRadioItem>
                                <ContextMenuRadioItem value="IN_PROGRESS">In Progress</ContextMenuRadioItem>
                                <ContextMenuRadioItem value="READY_FOR_REVIEW">Review</ContextMenuRadioItem>
                                <ContextMenuRadioItem value="COMPLETED">Done</ContextMenuRadioItem>
                                <ContextMenuRadioItem value="ON_HOLD">On Hold</ContextMenuRadioItem>
                            </ContextMenuRadioGroup>
                        </ContextMenuSubContent>
                    </ContextMenuSub>

                    <ContextMenuSeparator />
                    <ContextMenuItem
                        onClick={() => setIsDeleteDialogOpen(true)}
                        className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950"
                    >
                        Delete Task
                        <ContextMenuShortcut>
                            <Trash2 className="h-4 w-4" />
                        </ContextMenuShortcut>
                    </ContextMenuItem>
                </ContextMenuContent>
            </ContextMenu >

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the task
                            "{task.title}" and remove it from our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={(e) => {
                            e.stopPropagation();
                            handleDelete();
                        }} className="bg-red-600 hover:bg-red-700">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
