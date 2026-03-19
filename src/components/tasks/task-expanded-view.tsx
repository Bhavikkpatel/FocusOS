"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import {
    Play, Pause, RotateCcw, Target, Timer, Clock, Activity,
    Pencil, Trash2, X, Archive, Plus, Maximize2,
    Star, AlertCircle, StickyNote, History as HistoryIcon, ListChecks, CheckCircle, ChevronRight, CalendarIcon, Minus, BarChart2, Repeat,
    Paperclip, Link as LinkIcon, FileText, Image as ImageIcon, File as FileIcon, ExternalLink, Loader2, Eye
} from "lucide-react";
import { AttachmentPreview } from "@/components/tasks/attachment-preview";
import { TaskWithSessions, useUpdateTask } from "@/hooks/use-tasks";
import { useSubtasks, useCreateSubtask, useUpdateSubtask, useDeleteSubtask } from "@/hooks/use-subtasks";
import { useAttachments, useUploadFile, useAddAttachment, useDeleteAttachment } from "@/hooks/use-attachments";
import { useTimerStore } from "@/store/timer";
import { SessionTimeline } from "@/components/tasks/session-timeline";
import { DifficultyBadge } from "./difficulty-badge";
import { TagBadge } from "./tags/tag-badge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TaskPriority } from "@prisma/client";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface TaskExpandedViewProps {
    task: TaskWithSessions;
    onClose: () => void;
    onEdit?: (task: TaskWithSessions) => void;
    onDelete?: (taskId: string) => void;
}

export function TaskExpandedView({ task, onClose, onEdit, onDelete }: TaskExpandedViewProps) {
    const { mutate: updateTask } = useUpdateTask();
    const [notes, setNotes] = useState(task.notes || "");
    const [showCompletionDialog, setShowCompletionDialog] = useState(false);

    // Sync notes when switching tasks without closing the view
    useEffect(() => {
        setNotes(task.notes || "");
    }, [task.id, task.notes]);

    const {
        isRunning,
        isPaused,
        elapsed,
        total,
        currentTaskId,
        currentPreset,
        start,
        pause,
        resume,
        reset,
        setFocusMode,
    } = useTimerStore();

    const isActive = currentTaskId === task.id && isRunning;

    const handleTimerToggle = () => {
        if (currentTaskId === task.id && (isRunning || isPaused)) {
            if (isRunning) pause();
            else resume();
        } else {
            const duration = task.pomodoroDuration || (currentPreset?.focusDuration ? currentPreset.focusDuration / 60 : 25);
            start(duration, "FOCUS", task.id, task.estimatedPomodoros);
            if (task.status === "TODO") {
                updateTask({ id: task.id, status: "IN_PROGRESS" });
            }
        }
    };

    // Subtask state
    const { data: subtasks = [] } = useSubtasks(task.id);
    const createSubtask = useCreateSubtask();
    const updateSubtask = useUpdateSubtask();
    const deleteSubtask = useDeleteSubtask();
    const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
    const [editingSubtaskId, setEditingSubtaskId] = useState<string | null>(null);
    const [editingTitle, setEditingTitle] = useState("");

    // Attachments state
    const { data: attachments = [] } = useAttachments(task.id);
    const uploadFile = useUploadFile(task.id);
    const addLink = useAddAttachment(task.id);
    const deleteAttachment = useDeleteAttachment(task.id);

    // Preview state
    const [previewAttachment, setPreviewAttachment] = useState<any>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
    const [linkName, setLinkName] = useState("");
    const [linkUrl, setLinkUrl] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [expandedSubtaskId, setExpandedSubtaskId] = useState<string | null>(null);
    const [subtaskNotes, setSubtaskNotes] = useState("");
    const subtaskInputRef = useRef<HTMLInputElement>(null);
    const editInputRef = useRef<HTMLInputElement>(null);

    // --- Analytics Calculations ---
    const focusSessions = task.pomodoroSessions?.filter(s => s.type === "FOCUS") || [];
    const totalFocusTime = focusSessions.reduce((acc, s) => acc + s.duration, 0);
    const totalSessions = focusSessions.length;
    const avgSessionLength = totalSessions > 0 ? Math.round(totalFocusTime / totalSessions) : 0;

    // Average Rating Calculation (Story 7)
    const ratedSessions = focusSessions.filter(s => s.rating !== null && s.rating !== undefined);
    const avgRating = ratedSessions.length > 0
        ? (ratedSessions.reduce((acc, curr) => acc + (curr.rating || 0), 0) / ratedSessions.length)
        : null;

    // Distraction Tracking (Story 9)
    const totalInterruptions = focusSessions.reduce((acc, s) => acc + (s.interruptions || 0), 0);

    const formatDuration = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        if (h > 0) return `${h}h ${m}m`;
        return `${m}m`;
    };

    const formatAvgDuration = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        if (m > 0) return `${m}m ${s}s`;
        return `${s}s`;
    };

    // --- Estimation Accuracy ---
    const accuracy = task.estimatedPomodoros > 0 && totalSessions > 0
        ? Math.round((task.estimatedPomodoros / totalSessions) * 100)
        : null;
    const isOverEstimate = totalSessions > task.estimatedPomodoros && task.estimatedPomodoros > 0;

    // Subtask progress
    const completedSubtasks = subtasks.filter((s) => s.isCompleted).length;
    const totalSubtasks = subtasks.length;
    const progressPercent = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

    const toggleSubtaskNotes = (subtaskId: string, currentNotes: string) => {
        if (expandedSubtaskId === subtaskId) {
            setExpandedSubtaskId(null);
        } else {
            setExpandedSubtaskId(subtaskId);
            setSubtaskNotes(currentNotes);
        }
    };

    // Auto-save subtask notes debounce
    useEffect(() => {
        if (!expandedSubtaskId) return;
        const current = subtasks.find(s => s.id === expandedSubtaskId);
        if (!current || subtaskNotes === (current.notes || "")) return;

        const timer = setTimeout(() => {
            updateSubtask.mutate({
                taskId: task.id,
                subtaskId: expandedSubtaskId,
                notes: subtaskNotes || null,
            });
        }, 800);

        return () => clearTimeout(timer);
    }, [subtaskNotes, expandedSubtaskId, subtasks, task.id, updateSubtask]);

    // Auto-save notes debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            if (notes !== (task.notes || "")) {
                updateTask({ id: task.id, notes });
            }
        }, 1000);

        return () => clearTimeout(timer);
    }, [notes, task.id, task.notes, updateTask]);

    // Focus edit input when editing starts
    useEffect(() => {
        if (editingSubtaskId && editInputRef.current) {
            editInputRef.current.focus();
        }
    }, [editingSubtaskId]);

    const isTaskRunning = currentTaskId === task.id && (isRunning || isPaused);
    const displayTotal = isTaskRunning ? total : ((task.pomodoroDuration || 25) * 60);
    const remaining = isTaskRunning ? Math.max(0, displayTotal - elapsed) : displayTotal;

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    };

    const handleCreateSubtask = () => {
        const title = newSubtaskTitle.trim();
        if (!title) return;
        createSubtask.mutate({ taskId: task.id, title });
        setNewSubtaskTitle("");
        subtaskInputRef.current?.focus();
    };

    const handleSubtaskKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleCreateSubtask();
        }
    };

    const handleToggleSubtask = (subtaskId: string, currentState: boolean) => {
        updateSubtask.mutate({
            taskId: task.id,
            subtaskId,
            isCompleted: !currentState,
        });

        // Prompt to complete task if all subtasks are now done
        if (!currentState && task.status !== "COMPLETED") {
            const otherSubtasks = subtasks.filter(s => s.id !== subtaskId);
            const allOthersCompleted = otherSubtasks.length === 0 || otherSubtasks.every(s => s.isCompleted);

            if (allOthersCompleted) {
                setShowCompletionDialog(true);
            }
        }
    };

    const handleStartEditSubtask = (subtaskId: string, currentTitle: string) => {
        setEditingSubtaskId(subtaskId);
        setEditingTitle(currentTitle);
    };

    const handleSaveEditSubtask = () => {
        if (editingSubtaskId && editingTitle.trim()) {
            updateSubtask.mutate({
                taskId: task.id,
                subtaskId: editingSubtaskId,
                title: editingTitle.trim(),
            });
        }
        setEditingSubtaskId(null);
        setEditingTitle("");
    };

    const handleEditKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleSaveEditSubtask();
        } else if (e.key === "Escape") {
            setEditingSubtaskId(null);
            setEditingTitle("");
        }
    };

    const handleDeleteSubtask = (subtaskId: string) => {
        deleteSubtask.mutate({ taskId: task.id, subtaskId });
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ type: "spring", bounce: 0.1, duration: 0.3 }}
            className="flex-1 flex flex-col bg-white dark:bg-slate-900 shadow-sm border-l border-slate-200 dark:border-slate-800 h-full"
        >
            <motion.div
                className="flex h-full flex-col"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
            >
                {/* Header Top Bar */}
                <div className={cn(
                    "flex flex-col gap-4 border-b p-4 sm:p-6 transition-colors duration-300",
                    task.priority === "URGENT" && "bg-red-50/50 dark:bg-red-900/40",
                    task.priority === "HIGH" && "bg-orange-50/50 dark:bg-orange-900/40",
                    task.priority === "MEDIUM" && "bg-blue-50/50 dark:bg-blue-900/40",
                    (!task.priority || task.priority === "LOW") && "bg-white dark:bg-slate-900"
                )}>
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-3">
                            {/* Breadcrumbs / Metadata */}
                            <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                                <div className="flex items-center gap-1.5 opacity-80">
                                    <CheckCircle className="h-3 w-3 text-primary" />
                                    <span>FocusOS</span>
                                    {isActive && (
                                        <Badge className="ml-2 bg-primary text-white text-[9px] font-bold px-1.5 py-0 animate-pulse border-none">
                                            ACTIVE
                                        </Badge>
                                    )}
                                </div>
                                <ChevronRight className="h-3 w-3 opacity-40" />
                                <div className="flex items-center gap-1.5">
                                    <div
                                        className="w-2 h-2 rounded-full"
                                        style={{ backgroundColor: task.projectRef?.color || "#3B82F6" }}
                                    />
                                    <span className="text-slate-700 dark:text-slate-300">
                                        {task.projectRef?.name || "Daily"}
                                    </span>
                                </div>
                                {(task as any).category && (
                                    <>
                                        <ChevronRight className="h-3 w-3 opacity-40" />
                                        <span className="text-slate-700 dark:text-slate-300 truncate max-w-[100px]" title={task.category?.name}>
                                            {task.category?.name}
                                        </span>
                                    </>
                                )}
                                <ChevronRight className="h-3 w-3 opacity-40" />
                                <span className="font-medium opacity-70">
                                    Created {format(new Date(task.createdAt), "MMM d, yyyy")}
                                </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                <DifficultyBadge difficulty={task.difficulty} />

                                <Select
                                    value={task.priority}
                                    onValueChange={(val: TaskPriority) => updateTask({ id: task.id, priority: val })}
                                >
                                    <SelectTrigger className="h-7 w-28 text-xs font-semibold focus:ring-0 bg-white/50 dark:bg-slate-800/50">
                                        <SelectValue placeholder="Priority" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="LOW">Low</SelectItem>
                                        <SelectItem value="MEDIUM">Medium</SelectItem>
                                        <SelectItem value="HIGH">High</SelectItem>
                                        <SelectItem value="URGENT">Urgent</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className={cn(
                                                "h-7 text-xs font-semibold px-3 flex items-center gap-2 bg-white/50 dark:bg-slate-800/50",
                                                !task.dueDate && "text-muted-foreground border-dashed"
                                            )}
                                        >
                                            <CalendarIcon className="h-3.5 w-3.5" />
                                            {task.dueDate ? format(new Date(task.dueDate), "MMM d, yyyy") : <span>Set Due Date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={task.dueDate ? new Date(task.dueDate) : undefined}
                                            onSelect={(date) => updateTask({ id: task.id, dueDate: date || null })}
                                            disabled={(date) => {
                                                const today = new Date();
                                                today.setHours(0, 0, 0, 0);
                                                return date < today;
                                            }}
                                            initialFocus
                                        />
                                        {task.dueDate && (
                                            <div className="p-2 border-t bg-slate-50 dark:bg-slate-800 flex justify-end">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        updateTask({ id: task.id, dueDate: null });
                                                    }}
                                                    className="h-7 text-xs text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                >
                                                    Clear Date
                                                </Button>
                                            </div>
                                        )}
                                    </PopoverContent>
                                </Popover>

                                {/* Status Badge */}
                                {(() => {
                                    const statusMap: Record<string, { label: string; style: string }> = {
                                        TODO: { label: "To Do", style: "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300" },
                                        IN_PROGRESS: { label: "In Progress", style: "bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400" },
                                        READY_FOR_REVIEW: { label: "Review", style: "bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400" },
                                        COMPLETED: { label: "Done", style: "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400" },
                                        ON_HOLD: { label: "On Hold", style: "bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-400" },
                                    };
                                    const statusCycle = ["TODO", "IN_PROGRESS", "READY_FOR_REVIEW", "COMPLETED"] as const;
                                    const current = statusMap[task.status] || statusMap.TODO;
                                    const handleStatusClick = () => {
                                        const idx = statusCycle.indexOf(task.status as typeof statusCycle[number]);
                                        const next = idx >= 0 ? statusCycle[(idx + 1) % statusCycle.length] : "IN_PROGRESS";

                                        // Prevent completion if there are unfinished subtasks
                                        if (next === "COMPLETED" && subtasks.length > 0) {
                                            const hasUnfinishedSubtasks = subtasks.some((st) => !st.isCompleted);
                                            if (hasUnfinishedSubtasks) {
                                                toast.error("Finish all subtasks before completing the task");
                                                return;
                                            }
                                        }

                                        updateTask({ id: task.id, status: next });
                                    };
                                    return (
                                        <button
                                            onClick={handleStatusClick}
                                            className={cn("rounded-full px-3 py-1 text-xs font-semibold transition-colors cursor-pointer border shadow-sm", current.style)}
                                        >
                                            {current.label}
                                        </button>
                                    );
                                })()}

                                {/* Tags */}
                                {task.tags && task.tags.length > 0 && (
                                    <div className="flex flex-wrap items-center gap-1 ml-1 pl-3 border-l border-slate-200 dark:border-slate-800">
                                        {task.tags.map((tag: any) => (
                                            typeof tag === 'object' ? <TagBadge key={tag.id} tag={tag} /> : null
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {onEdit && (
                                <Button variant="ghost" size="icon" onClick={() => onEdit(task)} className="rounded-full text-muted-foreground hover:text-foreground">
                                    <Pencil className="h-4 w-4" />
                                </Button>
                            )}
                            {isTaskRunning && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setFocusMode(true)}
                                    className="rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                                    title="Enter Focus Mode"
                                >
                                    <Maximize2 className="h-4 w-4" />
                                </Button>
                            )}
                            <div className="flex items-center gap-2">
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-7 text-xs font-semibold px-3 flex items-center gap-2 bg-white/50 dark:bg-slate-800/50 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-amber-600 border-amber-200 dark:border-amber-900/50"
                                        >
                                            <Archive className="h-3.5 w-3.5" />
                                            <span>Archive</span>
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Archive this task?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This task will be moved to the archive. You can view archived tasks later or restore them if needed.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={() => {
                                                    updateTask({ id: task.id, status: "ARCHIVED" });
                                                    onClose();
                                                    toast.success("Task archived");
                                                }}
                                                className="bg-amber-600 hover:bg-amber-700 text-white"
                                            >
                                                Archive Task
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>

                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-7 text-xs font-semibold px-3 flex items-center gap-2 bg-white/50 dark:bg-slate-800/50 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 border-red-200 dark:border-red-900/50"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                            <span>Delete</span>
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Permanently delete this task?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone. This will permanently delete your task and remove its data from our servers.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={() => {
                                                    onDelete?.(task.id);
                                                    onClose();
                                                }}
                                                className="bg-red-600 hover:bg-red-700 text-white"
                                            >
                                                Delete Task
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>

                                <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                                    <X className="h-6 w-6" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Areas */}
                <div className="flex flex-1 overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] w-full overflow-hidden">

                        {/* Left Column: Details, Subtasks & Progress */}
                        <div className="flex flex-col border-r h-full overflow-y-auto custom-scrollbar bg-background/50">
                            <div className="p-8 pb-4">
                                <h2 className="text-4xl font-bold leading-tight tracking-tight text-slate-900 dark:text-white mb-4">
                                    {task.title}
                                </h2>
                                {task.description && (
                                    <div className="bg-muted/30 rounded-xl p-4 border border-dashed text-slate-700 dark:text-slate-300 leading-relaxed">
                                        {task.description}
                                    </div>
                                )}
                            </div>

                            {/* Subtasks & Notes Grid */}
                            <div className="px-8 py-4 grid grid-cols-1 xl:grid-cols-2 gap-6 items-stretch">
                                {/* Subtasks Section */}
                                <div className="rounded-2xl border bg-card shadow-sm overflow-hidden flex flex-col relative min-h-0">
                                    <div className="flex items-center justify-between border-b px-5 py-4 bg-muted/20">
                                        <div className="flex items-center gap-2">
                                            <ListChecks className="h-4 w-4 text-primary" />
                                            <span className="font-bold text-sm tracking-tight">Subtasks</span>
                                            {totalSubtasks > 0 && (
                                                <Badge variant="secondary" className="ml-1 text-[10px] font-mono font-bold px-1.5 h-4">
                                                    {completedSubtasks}/{totalSubtasks}
                                                </Badge>
                                            )}
                                        </div>
                                        {totalSubtasks > 0 && (
                                            <span className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase">{progressPercent}% DONE</span>
                                        )}
                                    </div>

                                    {totalSubtasks > 0 && (
                                        <div className="px-5 pt-4 pb-2 shrink-0">
                                            <Progress value={progressPercent} className="h-2" />
                                        </div>
                                    )}

                                    <div className="px-5 py-2 space-y-2">
                                        <AnimatePresence initial={false}>
                                            {subtasks.map((subtask) => (
                                                <motion.div
                                                    key={subtask.id}
                                                    initial={{ opacity: 0, scale: 0.98 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.98 }}
                                                    transition={{ duration: 0.15 }}
                                                    className="group flex flex-col gap-1 rounded-xl px-2 py-1.5 hover:bg-muted/50 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-800"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <Checkbox
                                                            checked={subtask.isCompleted}
                                                            onCheckedChange={() => handleToggleSubtask(subtask.id, subtask.isCompleted)}
                                                            className="h-5 w-5 rounded-md border-2 border-slate-300 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                                                        />
                                                        {editingSubtaskId === subtask.id ? (
                                                            <Input
                                                                ref={editInputRef}
                                                                value={editingTitle}
                                                                onChange={(e) => setEditingTitle(e.target.value)}
                                                                onBlur={handleSaveEditSubtask}
                                                                onKeyDown={handleEditKeyDown}
                                                                className="h-8 flex-1 text-sm px-2 font-medium"
                                                            />
                                                        ) : (
                                                            <span
                                                                role="button"
                                                                tabIndex={0}
                                                                onClick={() => handleStartEditSubtask(subtask.id, subtask.title)}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === "Enter" || e.key === " ") {
                                                                        handleStartEditSubtask(subtask.id, subtask.title);
                                                                    }
                                                                }}
                                                                className={cn(
                                                                    "flex-1 text-sm font-medium transition-colors cursor-text",
                                                                    subtask.isCompleted && "line-through text-muted-foreground opacity-60"
                                                                )}
                                                            >
                                                                {subtask.title}
                                                            </span>
                                                        )}
                                                        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className={cn(
                                                                    "h-7 w-7 rounded-full text-muted-foreground",
                                                                    expandedSubtaskId === subtask.id && "text-primary bg-primary/10"
                                                                )}
                                                                onClick={() => toggleSubtaskNotes(subtask.id, subtask.notes || "")}
                                                            >
                                                                <StickyNote className="h-3.5 w-3.5" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-7 w-7 rounded-full text-muted-foreground hover:text-destructive"
                                                                onClick={() => handleDeleteSubtask(subtask.id)}
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    <AnimatePresence>
                                                        {expandedSubtaskId === subtask.id && (
                                                            <motion.div
                                                                initial={{ opacity: 0, height: 0 }}
                                                                animate={{ opacity: 1, height: "auto" }}
                                                                exit={{ opacity: 0, height: 0 }}
                                                                className="ml-8 mt-1 pr-2"
                                                            >
                                                                <Textarea
                                                                    placeholder="Subtask details..."
                                                                    value={subtaskNotes}
                                                                    onChange={(e) => setSubtaskNotes(e.target.value)}
                                                                    className="min-h-[60px] resize-none text-xs bg-muted/20 border-slate-200 dark:border-slate-800 rounded-lg p-2 focus-visible:ring-1"
                                                                />
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>

                                        <div className="flex items-center gap-3 px-3 py-2 mt-2 shrink-0 bg-muted/10 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 focus-within:border-primary transition-colors">
                                            <Plus className="h-4 w-4 text-muted-foreground" />
                                            <input
                                                ref={subtaskInputRef}
                                                type="text"
                                                placeholder="Add a next step..."
                                                value={newSubtaskTitle}
                                                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                                                onKeyDown={handleSubtaskKeyDown}
                                                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50 font-medium"
                                            />
                                            {newSubtaskTitle.trim() && (
                                                <Button size="sm" className="h-7 px-3 text-xs font-bold rounded-lg" onClick={handleCreateSubtask}>ADD</Button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Internal Notes Container */}
                                <div className="rounded-2xl border bg-card shadow-sm p-4 sm:p-5 flex flex-col relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 dark:bg-amber-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none transition-opacity opacity-50 group-hover:opacity-100" />
                                    <div className="mb-4 flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                                            <StickyNote className="h-4 w-4 text-amber-500" />
                                            <span>Sticky Notes</span>
                                        </div>
                                        <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground text-right opacity-50 transition-opacity">
                                            {notes !== (task.notes || "") ? "•• Saving" : "✓ Persistent"}
                                        </div>
                                    </div>
                                    <Textarea
                                        placeholder="Jot down context, keys, or links..."
                                        className="flex-1 min-h-[200px] xl:min-h-[160px] resize-none border-2 border-slate-100/50 dark:border-slate-800/50 bg-amber-50/30 p-4 text-amber-900/90 font-medium text-sm leading-relaxed focus-visible:ring-amber-500/30 dark:bg-amber-900/10 dark:text-amber-100/90 rounded-xl shadow-inner placeholder:text-amber-900/30 dark:placeholder:text-amber-100/30 transition-all z-10 relative"
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Attachments Section */}
                            <div className="px-8 py-4">
                                <div className="rounded-2xl border bg-card shadow-sm overflow-hidden flex flex-col relative min-h-0">
                                    <div className="flex items-center justify-between border-b px-5 py-4 bg-muted/20">
                                        <div className="flex items-center gap-2">
                                            <Paperclip className="h-4 w-4 text-primary" />
                                            <span className="font-bold text-sm tracking-tight">Attachments</span>
                                            {attachments.length > 0 && (
                                                <Badge variant="secondary" className="ml-1 text-[10px] font-mono font-bold px-1.5 h-4">
                                                    {attachments.length}
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 text-[10px] font-bold uppercase tracking-wider px-2"
                                                onClick={() => setIsLinkDialogOpen(true)}
                                            >
                                                <LinkIcon className="h-3 w-3 mr-1.5" />
                                                Add Link
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 text-[10px] font-bold uppercase tracking-wider px-2"
                                                onClick={() => fileInputRef.current?.click()}
                                                disabled={uploadFile.isPending}
                                            >
                                                {uploadFile.isPending ? (
                                                    <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                                                ) : (
                                                    <Plus className="h-3 w-3 mr-1.5" />
                                                )}
                                                {uploadFile.isPending ? "Uploading..." : "Upload File"}
                                            </Button>
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                className="hidden"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        uploadFile.mutate(file);
                                                        e.target.value = '';
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div className="p-4 space-y-2">
                                        {attachments.length === 0 ? (
                                            <div className="py-8 flex flex-col items-center justify-center text-center opacity-40">
                                                <Paperclip className="h-8 w-8 mb-2" />
                                                <p className="text-xs font-semibold">No attachments yet</p>
                                                <p className="text-[10px]">Add files or links related to this task</p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                {attachments.map((attachment) => (
                                                    <div
                                                        key={attachment.id}
                                                        className="group flex items-center justify-between p-3 rounded-xl border bg-slate-50/50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-800 transition-all hover:shadow-sm"
                                                    >
                                                        <div className="flex items-center gap-3 overflow-hidden">
                                                            <div className="bg-white dark:bg-slate-800 p-2 rounded-lg border shadow-sm shrink-0">
                                                                {attachment.type === "LINK" ? (
                                                                    <LinkIcon className="h-4 w-4 text-blue-500" />
                                                                ) : attachment.mimeType?.startsWith("image/") ? (
                                                                    <ImageIcon className="h-4 w-4 text-purple-500" />
                                                                ) : attachment.mimeType === "application/pdf" ? (
                                                                    <FileText className="h-4 w-4 text-red-500" />
                                                                ) : (
                                                                    <FileIcon className="h-4 w-4 text-slate-500" />
                                                                )}
                                                            </div>
                                                            <div className="flex flex-col overflow-hidden">
                                                                <span className="text-xs font-bold truncate pr-2">
                                                                    {attachment.name}
                                                                </span>
                                                                <span className="text-[10px] text-muted-foreground font-medium">
                                                                    {attachment.type === "FILE"
                                                                        ? `${(attachment.size! / 1024 / 1024).toFixed(2)} MB`
                                                                        : (() => {
                                                                            try {
                                                                                return new URL(attachment.url).hostname;
                                                                            } catch (e) {
                                                                                return 'link';
                                                                            }
                                                                        })()}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity translate-x-1 group-hover:translate-x-0">
                                                            {attachment.type === "LINK" ? (
                                                                <a href={attachment.url} target="_blank" rel="noopener noreferrer">
                                                                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg">
                                                                        <ExternalLink className="h-3.5 w-3.5" />
                                                                    </Button>
                                                                </a>
                                                            ) : (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-7 w-7 rounded-lg"
                                                                    onClick={() => {
                                                                        setPreviewAttachment(attachment);
                                                                        setIsPreviewOpen(true);
                                                                    }}
                                                                >
                                                                    <Eye className="h-3.5 w-3.5" />
                                                                </Button>
                                                            )}
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-7 w-7 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                                onClick={() => deleteAttachment.mutate(attachment.id)}
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>


                            {/* Pomodoro Progress (Story 5 & 6) */}
                            <div className="px-8 py-6 mt-auto">
                                {task.estimatedPomodoros > 0 && (
                                    <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-6">
                                        <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
                                            <div className="flex flex-col gap-0.5">
                                                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-widest">
                                                    <Timer className="h-3.5 w-3.5" />
                                                    <span>Progression</span>
                                                </div>
                                                <div className="text-sm font-bold text-slate-900 dark:text-white">
                                                    {task.completedPomodoros} of {task.estimatedPomodoros} sessions
                                                </div>
                                            </div>
                                            {task.completedPomodoros > task.estimatedPomodoros && (
                                                <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50 dark:bg-orange-950/20 font-bold px-3 py-1">
                                                    <AlertCircle className="h-3 w-3 mr-1.5" />
                                                    EXCEEDED BY {task.completedPomodoros - task.estimatedPomodoros}
                                                </Badge>
                                            )}
                                        </div>

                                        <div className="space-y-3">
                                            <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner border border-slate-200 dark:border-slate-700">
                                                <motion.div
                                                    className={cn(
                                                        "h-full rounded-full transition-all duration-1000",
                                                        task.completedPomodoros >= task.estimatedPomodoros ? "bg-green-500" : "bg-primary"
                                                    )}
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${Math.min(100, (task.completedPomodoros / task.estimatedPomodoros) * 100)}%` }}
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 pt-2">
                                                <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-muted/20 border border-slate-200 dark:border-slate-800 transition-colors hover:bg-muted/30">
                                                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-3">Adjust Estimate</span>
                                                    <div className="flex items-center gap-5">
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            className="h-9 w-9 rounded-full border-2 border-slate-200 dark:border-slate-700 shadow-sm"
                                                            onClick={() => updateTask({ id: task.id, estimatedPomodoros: Math.max(1, task.estimatedPomodoros - 1) })}
                                                        >
                                                            <Minus className="h-4 w-4" />
                                                        </Button>
                                                        <span className="text-2xl font-black text-slate-900 dark:text-white w-8 text-center">{task.estimatedPomodoros}</span>
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            className="h-9 w-9 rounded-full border-2 border-slate-200 dark:border-slate-700 shadow-sm"
                                                            onClick={() => updateTask({ id: task.id, estimatedPomodoros: Math.min(20, task.estimatedPomodoros + 1) })}
                                                        >
                                                            <Plus className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-muted/20 border border-slate-200 dark:border-slate-800 hover:bg-muted/30 transition-colors">
                                                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-3">Auto-Complete</span>
                                                    <div className="flex items-center gap-3">
                                                        <Switch
                                                            checked={!!task.autoComplete}
                                                            onCheckedChange={(checked) => updateTask({ id: task.id, autoComplete: checked })}
                                                            className="scale-110"
                                                        />
                                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                                            {!!task.autoComplete ? "ON" : "OFF"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Column: Timer, Performance, Notes & History */}
                        <div className="flex flex-col bg-slate-50/50 dark:bg-slate-950/20 overflow-y-auto">

                            {/* Sticky Sidebar Container */}
                            <div className="p-8 space-y-8">
                                {/* Timer Card */}
                                <div className="flex flex-col items-center justify-center rounded-[2.5rem] border-4 border-white dark:border-slate-900 bg-white dark:bg-slate-900 p-10 text-center shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] 1xl:scale-105 transition-transform origin-top">
                                    <div className="mb-6 text-7xl font-black tracking-tighter tabular-nums text-slate-900 dark:text-white">
                                        {formatTime(remaining)}
                                    </div>
                                    <div className="flex gap-6">
                                        <Button
                                            size="lg"
                                            className={cn(
                                                "h-16 w-16 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.15)] transition-all hover:scale-110 active:scale-95",
                                                isTaskRunning && isRunning ? "bg-amber-500 hover:bg-amber-600 ring-4 ring-amber-100 dark:ring-amber-900/30" : "bg-primary ring-4 ring-primary/20"
                                            )}
                                            onClick={handleTimerToggle}
                                        >
                                            {isTaskRunning && isRunning ? (
                                                <Pause className="h-7 w-7 fill-current" />
                                            ) : (
                                                <Play className="h-7 w-7 fill-current ml-1" />
                                            )}
                                        </Button>
                                        {isTaskRunning && (
                                            <Button size="icon" variant="outline" className="h-16 w-16 rounded-full border-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" onClick={reset}>
                                                <RotateCcw className="h-6 w-6" />
                                            </Button>
                                        )}
                                    </div>
                                    <div className="mt-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
                                        {isTaskRunning
                                            ? (isRunning ? "Focus session active" : "Timer paused")
                                            : "Pledge your concentration"
                                        }
                                    </div>
                                </div>

                                {/* Recurrence Section */}
                                <div className="rounded-[2.5rem] border-4 border-white dark:border-slate-900 bg-white dark:bg-slate-900 overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.05)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.2)]">
                                    <div className="flex items-center justify-between px-8 py-5 border-b bg-slate-50/30 dark:bg-slate-800/20">
                                        <div className="flex items-center gap-2.5">
                                            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                                                <Repeat className="h-4 w-4" />
                                            </div>
                                            <span className="text-sm font-black tracking-tight uppercase">Recurrence</span>
                                        </div>
                                        <Switch
                                            checked={task.isRecurring}
                                            onCheckedChange={(checked) => updateTask({ id: task.id, isRecurring: checked })}
                                            className="data-[state=checked]:bg-primary"
                                        />
                                    </div>

                                    {task.isRecurring && (
                                        <div className="p-8 space-y-6 animate-in fade-in slide-in-from-top-4 duration-500 border-t-0">
                                            <div className="space-y-2.5">
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Frequency Pattern</label>
                                                <Select
                                                    value={task.recurrenceType || "DAILY"}
                                                    onValueChange={(val) => updateTask({ id: task.id, recurrenceType: val as any })}
                                                >
                                                    <SelectTrigger className="h-12 rounded-2xl bg-slate-100/50 dark:bg-slate-800/50 border-none focus:ring-2 ring-primary/20 font-bold text-sm">
                                                        <SelectValue placeholder="Select frequency" />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-2xl border-none shadow-xl">
                                                        <SelectItem value="DAILY" className="rounded-xl">Daily</SelectItem>
                                                        <SelectItem value="WEEKLY" className="rounded-xl">Weekly</SelectItem>
                                                        <SelectItem value="MONTHLY" className="rounded-xl">Monthly</SelectItem>
                                                        <SelectItem value="CUSTOM" className="rounded-xl">Every X Days</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {task.recurrenceType === "WEEKLY" && (
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Active Days</label>
                                                    <div className="flex flex-wrap gap-2">
                                                        {["S", "M", "T", "W", "T", "F", "S"].map((day, idx) => {
                                                            const isSelected = task.recurrenceDays?.split(",").includes(idx.toString());
                                                            return (
                                                                <Button
                                                                    key={`${day}-${idx}`}
                                                                    type="button"
                                                                    variant={isSelected ? "default" : "outline"}
                                                                    className={cn(
                                                                        "h-9 w-9 p-0 rounded-xl text-[10px] font-black transition-all",
                                                                        isSelected
                                                                            ? "bg-primary text-white shadow-lg shadow-primary/25 border-none"
                                                                            : "text-slate-500 border-2 border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
                                                                    )}
                                                                    onClick={() => {
                                                                        const current = task.recurrenceDays ? task.recurrenceDays.split(",") : [];
                                                                        const next = current.includes(idx.toString())
                                                                            ? current.filter(d => d !== idx.toString())
                                                                            : [...current, idx.toString()];
                                                                        updateTask({ id: task.id, recurrenceDays: next.sort().join(",") });
                                                                    }}
                                                                >
                                                                    {day}
                                                                </Button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}

                                            {(task.recurrenceType === "DAILY" || task.recurrenceType === "CUSTOM") && (
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                                                        Repeat Interval
                                                    </label>
                                                    <div className="flex items-center gap-4 bg-slate-100/50 dark:bg-slate-800/50 rounded-2xl h-12 px-2 border-2 border-transparent focus-within:border-primary/20 transition-all">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-9 w-9 rounded-xl hover:bg-white dark:hover:bg-slate-700 shadow-sm"
                                                            onClick={() => updateTask({ id: task.id, recurrenceInterval: Math.max(1, (task.recurrenceInterval || 1) - 1) })}
                                                        >
                                                            <Minus className="h-4 w-4" />
                                                        </Button>
                                                        <div className="flex-1 flex flex-col items-center">
                                                            <span className="text-sm font-black text-slate-900 dark:text-white">{task.recurrenceInterval || 1}</span>
                                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Days</span>
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-9 w-9 rounded-xl hover:bg-white dark:hover:bg-slate-700 shadow-sm"
                                                            onClick={() => updateTask({ id: task.id, recurrenceInterval: Math.min(365, (task.recurrenceInterval || 1) + 1) })}
                                                        >
                                                            <Plus className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Task Performance Dashboard */}
                                <section>
                                    <div className="flex items-center gap-2 mb-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-1">
                                        <BarChart2 className="h-4 w-4 text-primary" />
                                        <span>Focus Analytics</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="rounded-2xl border bg-card p-4 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex items-center gap-2 mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                                <Timer className="h-3 w-3" />
                                                Effort
                                            </div>
                                            <div className="text-xl font-black text-slate-900 dark:text-white">
                                                {formatDuration(totalFocusTime)}
                                            </div>
                                        </div>
                                        <div className="rounded-2xl border bg-card p-4 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex items-center gap-2 mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                                <Activity className="h-3 w-3" />
                                                Sessions
                                            </div>
                                            <div className="text-xl font-black text-slate-900 dark:text-white">
                                                {totalSessions}
                                            </div>
                                        </div>
                                        <div className="rounded-2xl border bg-card p-4 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex items-center gap-2 mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                                <Clock className="h-3 w-3" />
                                                Consistency
                                            </div>
                                            <div className="text-xl font-black text-slate-900 dark:text-white">
                                                {formatAvgDuration(avgSessionLength)}
                                            </div>
                                        </div>
                                        <div className="rounded-2xl border bg-card p-4 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex items-center gap-2 mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                                <Target className="h-3 w-3" />
                                                Est. Accuracy
                                            </div>
                                            <div
                                                className={cn(
                                                    "text-xl font-black",
                                                    isOverEstimate ? "text-orange-500" : "text-green-600 dark:text-green-400"
                                                )}
                                                title={`Accuracy = (Estimated: ${task.estimatedPomodoros} / Actual: ${totalSessions}) × 100`}
                                            >
                                                {accuracy !== null ? (
                                                    isOverEstimate ? "Exceeded" : `${accuracy}%`
                                                ) : "N/A"}
                                            </div>
                                        </div>
                                        <div className="rounded-2xl border bg-card p-4 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex items-center gap-2 mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                                <Star className="h-3 w-3 text-amber-500" />
                                                Quality Avg
                                            </div>
                                            <div className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-1">
                                                {avgRating !== null ? (
                                                    <>
                                                        {avgRating.toFixed(1)}
                                                        <span className="text-xs text-muted-foreground">/5</span>
                                                    </>
                                                ) : (
                                                    <span className="text-base text-muted-foreground font-medium">Unrated</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="rounded-2xl border bg-card p-4 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex items-center gap-2 mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                                <AlertCircle className="h-3 w-3 text-red-500" />
                                                Interruptions
                                            </div>
                                            <div className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-1">
                                                {totalInterruptions}
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <Separator className="bg-slate-200 dark:bg-slate-800" />

                                {/* Session Timeline (Story 10) */}
                                <section className="pb-8">
                                    <div className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-1">
                                        <HistoryIcon className="h-4 w-4" />
                                        <span>Session Timeline</span>
                                    </div>
                                    <SessionTimeline sessions={task.pomodoroSessions || []} />
                                </section>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            <AlertDialog open={showCompletionDialog} onOpenChange={setShowCompletionDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>All Subtasks Completed!</AlertDialogTitle>
                        <AlertDialogDescription>
                            Great job! You've finished all the subtasks for "<strong>{task.title}</strong>".
                            Would you like to mark the entire task as Done?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Keep Active</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                updateTask({ id: task.id, status: "COMPLETED" });
                                setShowCompletionDialog(false);
                            }}
                            className="bg-green-600 hover:bg-green-700 text-white"
                        >
                            Mark as Done
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Add Link Dialog */}
            <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add External Link</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Link Name</label>
                            <Input
                                placeholder="e.g. Design Specs, PR, Research"
                                value={linkName}
                                onChange={(e) => setLinkName(e.target.value)}
                                className="rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">URL</label>
                            <Input
                                placeholder="https://example.com"
                                value={linkUrl}
                                onChange={(e) => setLinkUrl(e.target.value)}
                                className="rounded-xl"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsLinkDialogOpen(false)} className="rounded-xl">Cancel</Button>
                        <Button
                            onClick={() => {
                                if (linkName && linkUrl) {
                                    addLink.mutate({ name: linkName, url: linkUrl, type: "LINK" });
                                    setIsLinkDialogOpen(false);
                                    setLinkName("");
                                    setLinkUrl("");
                                }
                            }}
                            disabled={!linkName || !linkUrl || addLink.isPending}
                            className="rounded-xl px-6"
                        >
                            {addLink.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Add Link
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AttachmentPreview
                isOpen={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
                attachment={previewAttachment}
            />
        </motion.div>
    );
}
