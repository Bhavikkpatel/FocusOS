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
    Pencil,
    CalendarIcon,
    Repeat,
    Archive,
    Trash2,
} from "lucide-react";
import { Task } from "@prisma/client";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useState, useRef, useEffect } from "react";
import { TagBadge } from "./tags/tag-badge";
import { TagSelector } from "./tags/tag-selector";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
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
    const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);




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

    const handleArchive = () => {
        updateTask.mutate({ id: task.id, status: "ARCHIVED" });
        setIsArchiveDialogOpen(false);
        toast.success("Task archived");
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
                                "relative flex items-center gap-3 sm:gap-4 rounded-xl border bg-card px-4 py-2.5 transition-all cursor-pointer border-l-[4px]",
                                isActive ? "border-primary bg-primary/5 ring-1 ring-primary/20 m-[1px]" : cn(config.accent),
                                isCompleted && "opacity-60 grayscale"
                            )}
                            onClick={() => onSelect(task)}
                        >


                            {/* Left Section: Checkbox + Content */}
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <motion.div
                                            className="shrink-0"
                                            onClick={(e: React.MouseEvent) => e.stopPropagation()}
                                            whileTap={{ scale: 0.9 }}
                                            animate={isCompleted ? { scale: [1, 1.2, 1] } : {}}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <div className="flex items-center justify-center h-5 w-5 rounded-md border-2 border-slate-300 dark:border-slate-700 hover:border-primary/50 transition-colors cursor-pointer data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500">
                                                {isCompleted ? <Check className="h-3 w-3 text-white" /> : null}
                                            </div>
                                        </motion.div>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start">
                                        <DropdownMenuItem onClick={(e) => {
                                            e.stopPropagation();
                                            handleToggleComplete({ stopPropagation: () => { } } as any);
                                        }}>
                                            <Check className="mr-2 h-4 w-4 text-green-500" /> 
                                            {isCompleted ? "Mark as Active" : "Mark as Done"}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={(e) => {
                                            e.stopPropagation();
                                            setIsArchiveDialogOpen(true);
                                        }}>
                                            <Archive className="mr-2 h-4 w-4 text-amber-500" /> Move to Archive
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem 
                                            className="text-red-600 dark:text-red-400"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteTask.mutate(task.id);
                                            }}
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" /> Delete Task
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                <div className="flex flex-col min-w-0 flex-1">
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
                                                        "text-[13px] font-bold leading-tight tracking-tight hover:text-primary/80 truncate",
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
                                                    <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] font-bold px-1.5 py-0 animate-pulse flex items-center gap-1 shadow-none shrink-0 h-4.5">
                                                        <span className="h-1 w-1 rounded-full bg-primary" />
                                                        ACTIVE
                                                    </Badge>
                                                )}
                                                {(task.priority !== "LOW") && (
                                                    <Badge className={cn("rounded-md font-bold text-[9px] uppercase shadow-none tracking-wider px-1.5 py-0 h-4.5", config.color)}>
                                                        {task.priority}
                                                    </Badge>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Meta Row: Due date, Project, Pomos, Tags */}
                                    <div className="flex items-center gap-3 mt-0.5 min-w-0">
                                        <div className="flex items-center gap-2.5 text-[10px] text-muted-foreground/70 flex-wrap flex-1">
                                            {task.dueDate && (
                                                <div className={cn(
                                                    "flex items-center gap-1 shrink-0",
                                                    new Date(task.dueDate) < new Date() && !isCompleted && "text-red-500 font-medium"
                                                )}>
                                                    <CalendarIcon className="h-2.5 w-2.5" />
                                                    <span>{format(new Date(task.dueDate), "MMM d")}</span>
                                                </div>
                                            )}
                                            {task.projectRef && task.projectRef.name && (
                                                <div className="flex items-center gap-1 shrink-0">
                                                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: task.projectRef.color || "#3B82F6" }} />
                                                    <span className="truncate max-w-[80px]">{task.projectRef.name}</span>
                                                </div>
                                            )}

                                            {/* Pomodoro Progress mini */}
                                            {task.estimatedPomodoros > 0 && (
                                                <div className="flex items-center gap-1.5 shrink-0">
                                                    <span className="text-[9px] font-medium">{task.completedPomodoros}/{task.estimatedPomodoros}</span>
                                                    <div className="h-1 w-10 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden shrink-0">
                                                        <div
                                                            className={cn(
                                                                "h-full transition-all duration-500",
                                                                task.completedPomodoros >= task.estimatedPomodoros ? "bg-green-500" : "bg-primary"
                                                            )}
                                                            style={{ width: `${Math.min(100, (task.completedPomodoros / task.estimatedPomodoros) * 100)}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {/* Tags Badge List */}
                                            {task.tags && task.tags.length > 0 && (
                                                <div className="flex items-center gap-1 flex-wrap">
                                                    {task.tags.map((tag: any) => (
                                                        typeof tag === 'object' ? <TagBadge key={tag.id} tag={tag} className="border-none shadow-none text-[8px] py-0 h-3.5 bg-slate-100 dark:bg-slate-800" /> : null
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Section: Actions */}
                            <div className="flex items-center gap-2 sm:gap-3 shrink-0 self-center">
                                {/* Square Tag Selector */}
                                <TagSelector
                                    selectedTags={task.tags || []}
                                    onTagsChange={(tagIds) => updateTask.mutate({ id: task.id, tags: tagIds })}
                                    align="end"
                                    variant="square-icon"
                                    className="opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity"
                                />

                                {/* Status Badge */}
                                <div
                                    className={cn(
                                        "flex cursor-pointer items-center justify-center gap-1.5 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider transition-colors hover:opacity-80 border border-transparent shrink-0",
                                        statusConfig[task.status]?.style || statusConfig.TODO.style
                                    )}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleToggle();
                                    }}
                                >
                                    <span>{statusConfig[task.status]?.label || task.status}</span>
                                    {isCompleted && <Check className="h-2.5 w-2.5" />}
                                </div>

                                {/* Focus Button */}
                                <Button
                                    variant={isActive ? "default" : "secondary"}
                                    size="sm"
                                    className={cn(
                                        "h-7 px-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider gap-1.5 transition-all shadow-none shrink-0",
                                        isActive ? "bg-primary text-white" : "bg-slate-100/80 text-slate-600 hover:bg-primary/10 hover:text-primary dark:bg-slate-800 dark:text-slate-400 sm:opacity-0 sm:group-hover:opacity-100"
                                    )}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleStartFocus();
                                    }}
                                >
                                    {isActive ? (
                                        <>
                                            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                                            <span>STOP</span>
                                        </>
                                    ) : (
                                        <>
                                            <Play className="h-3 w-3 fill-current" />
                                            <span>FOCUS</span>
                                        </>
                                    )}
                                </Button>

                                {/* Dropdown Menu */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground/60 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0">
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
                                                setIsArchiveDialogOpen(true);
                                            }}
                                            className="text-amber-600 dark:text-amber-500"
                                        >
                                            <Archive className="mr-2 h-4 w-4" /> Archive
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
                        onClick={() => setIsArchiveDialogOpen(true)}
                        className="text-amber-600 focus:text-amber-600 focus:bg-amber-50 dark:focus:bg-amber-950"
                    >
                        Archive Task
                        <ContextMenuShortcut>
                            <Archive className="h-4 w-4" />
                        </ContextMenuShortcut>
                    </ContextMenuItem>
                </ContextMenuContent>
            </ContextMenu >

            <AlertDialog open={isArchiveDialogOpen} onOpenChange={setIsArchiveDialogOpen}>
                <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Archive Task?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will move "<strong>{task.title}</strong>" to your archives. 
                            You can restore it anytime from the Archived tab.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={(e) => {
                            e.stopPropagation();
                            handleArchive();
                        }} className="bg-amber-600 hover:bg-amber-700 text-white">
                            Archive
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
