/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Timer, Pencil, Archive, CalendarIcon, AlertCircle, Repeat } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { useTimerStore } from "@/store/timer";
import { useUpdateTask } from "@/hooks/use-tasks";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { TagBadge } from "../tasks/tags/tag-badge";
import { TagSelector } from "../tasks/tags/tag-selector";
import { DifficultyBadge } from "../tasks/difficulty-badge";
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

const priorityStyles: Record<string, { label: string; color: string; bg: string; accent: string }> = {
    LOW: { label: "Low", color: "text-slate-500 border border-slate-200 dark:border-slate-700 bg-transparent", bg: "hover:bg-slate-50 dark:hover:bg-slate-800", accent: "border-l-slate-400 dark:border-l-slate-600" },
    MEDIUM: { label: "Medium", color: "text-blue-600 bg-blue-50 dark:bg-blue-900/30", bg: "hover:bg-blue-100 dark:hover:bg-blue-900/50", accent: "border-l-blue-400 dark:border-l-blue-600" },
    HIGH: { label: "High", color: "text-orange-600 bg-orange-50 dark:bg-orange-900/30 border border-orange-200 shadow-sm", bg: "hover:bg-orange-100 dark:hover:bg-orange-900/50", accent: "border-l-orange-400 dark:border-l-orange-600" },
    URGENT: { label: "Urgent", color: "text-red-600 bg-red-50 dark:bg-red-900/30 border border-red-200 shadow-sm", bg: "hover:bg-red-100 dark:hover:bg-red-900/50", accent: "border-l-red-500 dark:border-l-red-500" },
};

export function ProjectTaskCard({
    task,
    onSelect,
}: {
    task: any;
    onSelect: (task: any) => void;
}) {
    const { start, currentPreset, currentTaskId, isRunning, pause, reset } = useTimerStore();
    const updateTask = useUpdateTask();
    const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);

    const isActive = currentTaskId === task.id && isRunning;
    const isCompleted = task.status === "COMPLETED";

    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editTitle, setEditTitle] = useState(task.title);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setEditTitle(task.title);
    }, [task.title]);

    useEffect(() => {
        if (isEditingTitle && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditingTitle]);

    const handleSaveTitle = () => {
        if (editTitle.trim() && editTitle.trim() !== task.title) {
            updateTask.mutate({ id: task.id, title: editTitle.trim() });
        } else {
            setEditTitle(task.title);
        }
        setIsEditingTitle(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleSaveTitle();
        } else if (e.key === "Escape") {
            setEditTitle(task.title);
            setIsEditingTitle(false);
        }
    };

    const config = priorityStyles[task.priority] || priorityStyles.MEDIUM;

    // Focus time calculations (Story 1-2)
    const focusSessions = task.pomodoroSessions?.filter((s: any) => s.type === "FOCUS") || [];
    const totalFocusSeconds = focusSessions.reduce((acc: number, s: any) => acc + s.duration, 0);
    const totalFocusMins = Math.round(totalFocusSeconds / 60);

    const isArchived = task.status === "ARCHIVED";

    const handleToggleComplete = (e: React.MouseEvent | React.KeyboardEvent) => {
        e.stopPropagation();

        const newStatus = (isCompleted || isArchived) ? "TODO" : "COMPLETED";

        // Prevent completion if there are unfinished subtasks
        if (newStatus === "COMPLETED" && task.subtasks && task.subtasks.length > 0) {
            const hasUnfinishedSubtasks = task.subtasks.some((st: any) => !st.isCompleted);
            if (hasUnfinishedSubtasks) {
                toast.error("Finish all subtasks before completing the task");
                return;
            }
        }

        // Story 1: Stop timer if running and marking complete
        if (!isCompleted && !isArchived && isActive) {
            pause();
            reset();
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

    const handleArchive = () => {
        updateTask.mutate({ id: task.id, status: "ARCHIVED" });
        setArchiveDialogOpen(false);
        toast.success("Task archived");
    };

    const handleStartFocus = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isActive) {
            pause();
        } else if (!isCompleted) {
            const duration = currentPreset?.focusDuration
                ? currentPreset.focusDuration / 60
                : 25;
            start(duration, "FOCUS", task.id);
            if (task.status === "TODO") {
                updateTask.mutate({ id: task.id, status: "IN_PROGRESS" });
            }
        }
    };

    return (
        <>
            <ContextMenu>
                <ContextMenuTrigger asChild>
                        <div
                            onClick={() => {
                                if (!isEditingTitle) onSelect(task);
                            }}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if ((e.key === 'Enter' || e.key === ' ') && !isEditingTitle) {
                                    onSelect(task);
                                }
                            }}
                            className={cn(
                                "p-3 bg-white dark:bg-slate-800 rounded-lg border transition-all cursor-pointer group border-l-[4px] relative",
                                isActive ? "border-primary bg-primary/5 ring-1 ring-primary/20" : config.accent,
                                isCompleted && "opacity-60"
                            )}
                            style={!isActive ? { borderLeftColor: task.project?.color || (task.projectColor) } : {}}
                        >
                        <motion.div
                            className="absolute left-3 top-3 z-10"
                            onClick={(e: React.MouseEvent) => e.stopPropagation()}
                            whileTap={{ scale: 0.9 }}
                            animate={isCompleted ? { scale: [1, 1.2, 1] } : {}}
                            transition={{ duration: 0.3 }}
                        >
                            <Checkbox
                                checked={isCompleted}
                                onCheckedChange={() => handleToggleComplete({ stopPropagation: () => { } } as any)}
                                className="h-4 w-4 rounded border-2 border-slate-300 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                            />
                        </motion.div>


                        {/* Title */}
                        {isEditingTitle ? (
                            <div
                                role="presentation"
                                onClick={(e) => e.stopPropagation()}
                                onKeyDown={(e) => e.stopPropagation()}
                            >
                                <Input
                                    ref={inputRef}
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    onBlur={handleSaveTitle}
                                    onKeyDown={handleKeyDown}
                                    className="h-7 text-sm font-medium px-2 py-0 mb-2 focus-visible:ring-1"
                                />
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 min-w-0">
                                <div
                                    className={cn(
                                        "text-sm font-medium text-slate-900 dark:text-white mb-2 leading-snug cursor-text pl-6",
                                        isCompleted && "line-through text-muted-foreground opacity-60"
                                    )}
                                >
                                    {task.title}
                                </div>
                                {task.isRecurring && (
                                    <Repeat className="h-3.5 w-3.5 text-primary/70 shrink-0 mb-2" />
                                )}
                                {isActive && (
                                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 shrink-0 mb-2">
                                        <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                                        <span className="text-[9px] font-bold text-primary">ACTIVE</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Tags */}
                        {task.tags && task.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                                {task.tags.map((tag: any) => (
                                    typeof tag === 'object' ? <TagBadge key={tag.id} tag={tag} className="border-none shadow-sm text-[10px] py-0 h-4" /> : null
                                ))}
                            </div>
                        )}

                        {/* Progress Bar */}
                        {task.estimatedPomodoros > 0 && (
                            <div className="mb-4 space-y-1">
                                <div className="flex justify-between items-center text-[10px] font-medium text-slate-500">
                                    <div className="flex items-center gap-1">
                                        <Timer className="h-3 w-3" />
                                        <span>{task.completedPomodoros} / {task.estimatedPomodoros} sessions</span>
                                        {totalFocusMins > 0 && (
                                            <span className="ml-1 opacity-60">({totalFocusMins}m)</span>
                                        )}
                                    </div>
                                    {task.completedPomodoros > task.estimatedPomodoros && (
                                        <div className="flex items-center gap-0.5 text-orange-600 font-bold">
                                            <AlertCircle className="h-3 w-3" />
                                            <span>+{task.completedPomodoros - task.estimatedPomodoros} over</span>
                                        </div>
                                    )}
                                </div>
                                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
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

                        {/* Meta row */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                                {/* Priority */}
                                <div className="flex items-center gap-1.5">
                                    <span
                                        className={cn(
                                            "text-[10px] font-semibold px-1.5 py-0.5 rounded-full border border-transparent tracking-wide text-xs",
                                            config.color,
                                            task.priority === "URGENT" && "shadow-sm border-red-200 dark:border-red-900",
                                            task.priority === "HIGH" && "shadow-sm border-orange-200 dark:border-orange-900"
                                        )}
                                    >
                                        {config.label}
                                    </span>
                                    <DifficultyBadge difficulty={(task as any).difficulty} className="rounded-full shadow-none border" />
                                </div>

                                {/* Due date */}
                                {task.dueDate && (
                                    <span className={cn(
                                        "flex items-center gap-0.5 text-[10px] text-muted-foreground",
                                        new Date(task.dueDate) < new Date() && !isCompleted && "text-red-500 font-medium"
                                    )}>
                                        <CalendarIcon className="h-3 w-3" />
                                        {format(new Date(task.dueDate), "MMM d")}
                                    </span>
                                )}


                                    <TagSelector
                                        selectedTags={task.tags || []}
                                        onTagsChange={(tagIds) => updateTask.mutate({ id: task.id, tags: tagIds })}
                                        align="start"
                                    />
                                </div>
                                {/* Tags and Category Row (Above Action button or below Title) */}
                            {/* Actually we can put category next to due date */}
                            {task.category && (
                                <span className="text-[10px] text-muted-foreground ml-1.5 truncate max-w-[80px]">
                                    {task.category.name}
                                </span>
                            )}

                            {/* Action Button: FOCUS */}
                            <button
                                onClick={handleStartFocus}
                                className={cn(
                                    "flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold tracking-tight transition-all",
                                    isActive
                                        ? "bg-primary text-white"
                                        : "bg-slate-100 text-slate-600 hover:bg-primary/10 hover:text-primary dark:bg-slate-700/50 dark:text-slate-400 group-hover:opacity-100",
                                    isCompleted && "opacity-40 pointer-events-none grayscale"
                                )}
                                disabled={isCompleted}
                                title={isCompleted ? "Task is completed" : (isActive ? "Stop Focus" : "Start Focus")}
                            >
                                {isActive ? (
                                    <>
                                        <span className="h-2 w-2 rounded-sm bg-white" />
                                        STOP
                                    </>
                                ) : (
                                    <>
                                        <Play className="h-3 w-3 fill-current" />
                                        FOCUS
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </ContextMenuTrigger>
                <ContextMenuContent className="w-64" onCloseAutoFocus={(e) => e.preventDefault()}>
                    <ContextMenuItem onClick={() => onSelect(task)}>
                        View Details
                    </ContextMenuItem>
                    <ContextMenuItem onClick={() => setIsEditingTitle(true)}>
                        <Pencil className="mr-2 h-4 w-4" /> Rename Task
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
                        onClick={(e) => {
                            e.stopPropagation();
                        }}
                        onSelect={(e) => {
                            e.preventDefault();
                            setArchiveDialogOpen(true);
                        }}
                        className="text-amber-600 focus:text-amber-600 focus:bg-amber-50 dark:focus:bg-amber-950"
                    >
                        Archive Task
                        <ContextMenuShortcut>
                            <Archive className="h-4 w-4" />
                        </ContextMenuShortcut>
                    </ContextMenuItem>
                </ContextMenuContent>
            </ContextMenu >

            <AlertDialog open={archiveDialogOpen} onOpenChange={setArchiveDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Archive Task?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will move "<strong>{task.title}</strong>" to your archives. 
                            You can restore it anytime from the Archived tab.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleArchive}
                            className="bg-amber-600 hover:bg-amber-700 text-white"
                        >
                            Archive Task
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
