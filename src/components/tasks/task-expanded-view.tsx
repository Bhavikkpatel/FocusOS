"use client";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import {
    Play, Pause, RotateCcw, Target, Activity,
    Trash2, X, Plus, Maximize2, Archive,
    StickyNote, History as HistoryIcon, ListChecks, CalendarIcon, Repeat,
    Paperclip, Link as LinkIcon, FileIcon, Loader2,
    Clock, AlertCircle
} from "lucide-react";
import { AttachmentPreview } from "@/components/tasks/attachment-preview";
import { TaskWithSessions, useUpdateTask } from "@/hooks/use-tasks";
import { useSubtasks, useCreateSubtask, useUpdateSubtask, useDeleteSubtask } from "@/hooks/use-subtasks";
import { useAttachments, useAddAttachment, useDeleteAttachment, useUploadFile } from "@/hooks/use-attachments";
import { useTimerStore } from "@/store/timer";
import { SessionTimeline } from "@/components/tasks/session-timeline";
import { DayRibbon } from "@/components/tasks/day-ribbon";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface TaskExpandedViewProps {
    task: TaskWithSessions;
    onClose: () => void;
    calendarEventId?: string | null;
    onEdit?: (task: TaskWithSessions) => void;
    onDelete?: (taskId: string) => void;
}

export function TaskExpandedView({ task, onClose, calendarEventId }: TaskExpandedViewProps) {
    const { mutate: updateTask } = useUpdateTask();
    const [notes, setNotes] = useState(task.notes || "");
    const [showArchiveDialog, setShowArchiveDialog] = useState(false);
    const [showCompletionDialog, setShowCompletionDialog] = useState(false);
    const [activeTab, setActiveTab] = useState<"FOCUS" | "DETAILS" | "HISTORY">("FOCUS");
    const [isInactive, setIsInactive] = useState(false);
    const inactivityTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
        activeSubtaskId,
        setActiveSubtask,
        autoStartFocusTab,
    } = useTimerStore();


    const handleTimerToggle = () => {
        if (currentTaskId === task.id && (isRunning || isPaused)) {
            if (isRunning) pause();
            else resume();
        } else {
            const duration = task.pomodoroDuration || (currentPreset?.focusDuration ? currentPreset.focusDuration / 60 : 25);
            start(duration, "FOCUS", task.id, task.estimatedPomodoros, calendarEventId);
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

    // Attachments state
    const { data: attachments = [] } = useAttachments(task.id);
    const addLink = useAddAttachment(task.id);
    const uploadFile = useUploadFile(task.id);
    const deleteAttachment = useDeleteAttachment(task.id);

    // Preview state
    const [previewAttachment] = useState<any>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
    const [linkName, setLinkName] = useState("");
    const [linkUrl, setLinkUrl] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);
    const subtaskInputRef = useRef<HTMLInputElement>(null);

    const totalSubtasks = subtasks.length;
    const completedSubtasks = subtasks.filter((s) => s.isCompleted).length;


    // Ghost UI Logic (Story 5)
    useEffect(() => {
        if (activeTab !== "FOCUS") {
            setIsInactive(false);
            return;
        }

        const resetInactivity = () => {
            setIsInactive(false);
            if (inactivityTimeoutRef.current) clearTimeout(inactivityTimeoutRef.current);
            inactivityTimeoutRef.current = setTimeout(() => setIsInactive(true), 5000);
        };

        const handleInteraction = () => resetInactivity();

        window.addEventListener("mousemove", handleInteraction);
        window.addEventListener("keydown", handleInteraction);
        resetInactivity();

        return () => {
            window.removeEventListener("mousemove", handleInteraction);
            window.removeEventListener("keydown", handleInteraction);
            if (inactivityTimeoutRef.current) clearTimeout(inactivityTimeoutRef.current);
        };
    }, [activeTab]);

    // Auto-start timer on Focus tab (Story 10)
    useEffect(() => {
        if (activeTab === "FOCUS" && autoStartFocusTab && !isRunning && !isPaused && currentTaskId !== task.id) {
            handleTimerToggle();
        }
    }, [activeTab, autoStartFocusTab, isRunning, isPaused, currentTaskId, task.id]);


    // Auto-save notes debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            if (notes !== (task.notes || "")) {
                updateTask({ id: task.id, notes });
            }
        }, 1000);

        return () => clearTimeout(timer);
    }, [notes, task.id, task.notes, updateTask]);


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
                className="flex h-full flex-col overflow-hidden relative"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
            >
                {/* 2px Progress Indicator */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-slate-100 dark:bg-slate-800 z-50">
                    <motion.div 
                        className="h-full bg-primary"
                        initial={{ width: 0 }}
                        animate={{ width: `${(completedSubtasks / Math.max(totalSubtasks, 1)) * 100}%` }}
                        transition={{ type: "spring", bounce: 0, duration: 1 }}
                    />
                </div>

                {/* Simplified Header */}
                <header className={cn(
                    "flex items-center justify-between px-4 sm:px-6 min-h-20 py-4 border-b sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-40 transition-all duration-500",
                    isInactive && activeTab === "FOCUS" && "opacity-0 pointer-events-none -translate-y-4"
                )}>
                    {/* Left Section: Title */}
                    <div className="flex-1 min-w-0 pr-4">
                        <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white line-clamp-2 leading-tight">
                            {task.title}
                        </h2>
                    </div>

                    {/* Center Section: Tabs (Story Update) */}
                    <div className="hidden lg:flex flex-1 justify-center">
                        <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#161618] p-1 rounded-2xl border border-slate-200 dark:border-white/5">
                            {[
                                { id: "FOCUS", label: "Focus", icon: Target },
                                { id: "DETAILS", label: "Details", icon: ListChecks },
                                { id: "HISTORY", label: "History", icon: HistoryIcon },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={cn(
                                        "relative px-4 sm:px-6 py-2 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-[0.1em] sm:tracking-[0.2em] transition-all duration-300 flex items-center gap-2",
                                        activeTab === tab.id 
                                            ? "text-white dark:text-black" 
                                            : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                                    )}
                                >
                                    {activeTab === tab.id && (
                                        <motion.div
                                            layoutId="activeTaskDetailTab"
                                            className="absolute inset-0 bg-primary rounded-xl"
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                    <span className="relative z-10 flex items-center gap-2">
                                        <tab.icon className="h-3.5 w-3.5" />
                                        {tab.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    {/* Right Section: Actions */}
                    <div className="flex-1 flex items-center justify-end gap-3 shrink-0">
                        <Select
                            value={task.status}
                            onValueChange={(val: any) => updateTask({ id: task.id, status: val })}
                        >
                            <SelectTrigger className={cn(
                                "h-10 px-4 rounded-xl font-bold text-xs uppercase tracking-widest border-2 transition-all",
                                task.status === "COMPLETED" 
                                    ? "bg-green-500 border-green-500 text-white hover:bg-green-600 focus:ring-green-500/20" 
                                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-primary/50"
                            )}>
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent align="end" className="rounded-xl border-2">
                                <SelectItem value="TODO">To Do</SelectItem>
                                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                <SelectItem value="READY_FOR_REVIEW">Review</SelectItem>
                                <SelectItem value="COMPLETED">Completed</SelectItem>
                                <SelectItem value="ON_HOLD">On Hold</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button
                            variant="outline"
                            size="icon"
                            className="h-10 w-10 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-amber-500/50 hover:bg-amber-50 dark:hover:bg-amber-950/20 text-muted-foreground hover:text-amber-600 transition-all"
                            onClick={() => setShowArchiveDialog(true)}
                            title="Archive Task"
                        >
                            <Archive className="h-5 w-5" />
                        </Button>

                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
                            onClick={onClose}
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>
                </header>


                {/* Mobile Tab Switcher */}
                <div className={cn(
                    "lg:hidden flex items-center px-4 sm:px-6 py-3 bg-white dark:bg-slate-900 border-b shrink-0 transition-all duration-500",
                    isInactive && activeTab === "FOCUS" && "opacity-0 pointer-events-none translate-y-4"
                )}>
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#161618] p-1 rounded-2xl border border-slate-200 dark:border-white/5 mx-auto">
                        {[
                            { id: "FOCUS", label: "Focus", icon: Target },
                            { id: "DETAILS", label: "Details", icon: ListChecks },
                            { id: "HISTORY", label: "History", icon: HistoryIcon },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={cn(
                                    "relative px-4 sm:px-6 py-2 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-[0.1em] sm:tracking-[0.2em] transition-all duration-300 flex items-center gap-2",
                                    activeTab === tab.id 
                                        ? "text-white dark:text-black" 
                                        : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                                )}
                            >
                                {activeTab === tab.id && (
                                    <motion.div
                                        layoutId="activeTaskDetailTabMobile"
                                        className="absolute inset-0 bg-primary rounded-xl"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <span className="relative z-10 flex items-center gap-2">
                                    <tab.icon className="h-3.5 w-3.5" />
                                    {tab.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content Areas */}
                <div className="flex-1 overflow-hidden relative">
                    <AnimatePresence mode="wait">
                        {activeTab === "FOCUS" && (
                            <motion.div
                                key="focus"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                                className="h-full w-full flex flex-col items-center justify-start p-8 overflow-y-auto custom-scrollbar"
                            >
                                <div className="max-w-3xl w-full flex flex-col items-center gap-12 py-12">
                                    {/* Task Title in Focus mode */}
                                    <div className="text-center space-y-2">
                                        <h2 className={cn(
                                            "font-black tracking-tight text-slate-900 dark:text-white line-clamp-4 leading-tight",
                                            task.title.length > 100 ? "text-xl" : task.title.length > 60 ? "text-2xl" : "text-3xl"
                                        )}>
                                            {task.title}
                                        </h2>
                                        <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-muted-foreground opacity-60">
                                            Currently Executing
                                        </p>
                                    </div>

                                    {/* Centered Timer (JetBrains Mono) */}
                                    <div className="flex flex-col items-center gap-8">
                                        <div className="text-[12rem] font-black tracking-tighter tabular-nums leading-none text-slate-900 dark:text-white font-jetbrains">
                                            {formatTime(remaining)}
                                        </div>

                                        <div className={cn(
                                            "flex items-center gap-8 transition-opacity duration-500",
                                            isInactive && "opacity-20"
                                        )}>
                                            <Button
                                                size="lg"
                                                className={cn(
                                                    "h-20 w-20 rounded-full shadow-2xl transition-all hover:scale-110 active:scale-95",
                                                    isTaskRunning && isRunning ? "bg-amber-500 hover:bg-amber-600 ring-8 ring-amber-100 dark:ring-amber-900/30" : "bg-primary ring-8 ring-primary/20"
                                                )}
                                                onClick={handleTimerToggle}
                                            >
                                                {isTaskRunning && isRunning ? (
                                                    <Pause className="h-10 w-10 fill-current" />
                                                ) : (
                                                    <Play className="h-10 w-10 fill-current ml-1" />
                                                )}
                                            </Button>

                                            {isTaskRunning && (
                                                <div className="flex items-center gap-4">
                                                    <Button 
                                                        size="icon" 
                                                        variant="outline" 
                                                        className="h-20 w-20 rounded-full border-4 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" 
                                                        onClick={reset}
                                                        title="Reset Timer"
                                                    >
                                                        <RotateCcw className="h-8 w-8" />
                                                    </Button>
                                                    
                                                    <Button 
                                                        size="icon" 
                                                        variant="outline" 
                                                        className="h-20 w-20 rounded-full border-4 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" 
                                                        onClick={() => setFocusMode(true)}
                                                        title="Enter Fullscreen Focus"
                                                    >
                                                        <Maximize2 className="h-8 w-8" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Subtasks as Large Rows */}
                                    <div className="w-full space-y-4 pt-12">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground">
                                                <ListChecks className="h-4 w-4" />
                                                <span>Mission Checklist</span>
                                            </div>
                                            <Badge variant="secondary" className="font-mono">{completedSubtasks}/{totalSubtasks}</Badge>
                                        </div>

                                        <div className="grid grid-cols-1 gap-3">
                                            {subtasks.map((subtask) => {
                                                const isFocused = activeSubtaskId === subtask.id;
                                                return (
                                                    <motion.div
                                                        key={subtask.id}
                                                        layout
                                                        className={cn(
                                                            "group relative flex items-center gap-6 p-6 rounded-[2rem] border-4 transition-all duration-500 cursor-pointer overflow-hidden",
                                                            isFocused 
                                                                ? "bg-primary/5 border-primary shadow-xl shadow-primary/10" 
                                                                : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700",
                                                            isInactive && !isFocused && "opacity-20",
                                                            subtask.isCompleted && "bg-slate-50 dark:bg-slate-900/50 opacity-40"
                                                        )}
                                                        onClick={() => setActiveSubtask(subtask.id)}
                                                    >
                                                        <div className="relative z-10 flex-shrink-0">
                                                            <Checkbox
                                                                checked={subtask.isCompleted}
                                                                onCheckedChange={() => handleToggleSubtask(subtask.id, subtask.isCompleted)}
                                                                className="h-8 w-8 rounded-xl border-4 border-slate-200 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500 transition-all hover:scale-110 active:scale-90"
                                                            />
                                                        </div>

                                                        <div className="relative z-10 flex-1 min-w-0">
                                                            <span className={cn(
                                                                "text-2xl font-bold transition-all duration-300 block truncate",
                                                                isFocused ? "text-primary" : "text-slate-700 dark:text-slate-300",
                                                                subtask.isCompleted && "line-through opacity-50"
                                                            )}>
                                                                {subtask.title}
                                                            </span>
                                                        </div>

                                                        <div className="relative z-10 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-12 w-12 rounded-full text-muted-foreground hover:bg-red-100 dark:hover:bg-red-900/20"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDeleteSubtask(subtask.id);
                                                                }}
                                                            >
                                                                <Trash2 className="h-6 w-6" />
                                                            </Button>
                                                        </div>

                                                        {isFocused && (
                                                            <motion.div
                                                                layoutId="activeSubtaskIndicator"
                                                                className="absolute left-0 top-0 bottom-0 w-2 bg-primary"
                                                            />
                                                        )}
                                                    </motion.div>
                                                );
                                            })}

                                            {/* Add Subtask Row in Focus Mode */}
                                            <div className="flex items-center gap-4 p-4 rounded-[2rem] border-4 border-dashed border-slate-200 dark:border-slate-800 focus-within:border-primary/50 transition-all mt-4 bg-muted/5">
                                                <Plus className="h-6 w-6 text-muted-foreground ml-2" />
                                                <input
                                                    type="text"
                                                    placeholder="Next mission objective..."
                                                    value={newSubtaskTitle}
                                                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                                                    onKeyDown={handleSubtaskKeyDown}
                                                    className="flex-1 bg-transparent text-xl outline-none placeholder:text-muted-foreground/30 font-bold"
                                                />
                                                {newSubtaskTitle.trim() && (
                                                    <Button size="lg" className="rounded-2xl px-8 font-black text-sm uppercase tracking-widest" onClick={handleCreateSubtask}>ADD</Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === "DETAILS" && (
                            <motion.div
                                key="details"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="h-full w-full overflow-hidden flex flex-col"
                            >
                                <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_360px] h-full w-full overflow-hidden">
                                    {/* Left Pane: Notes (Composition) */}
                                    <div className="flex flex-col h-full overflow-y-auto custom-scrollbar bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800">
                                        <div className="p-10 space-y-8 max-w-4xl mx-auto w-full">
                                            <div className="space-y-6">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                                        <StickyNote className="h-3.5 w-3.5" />
                                                        <span>Composition & Notes</span>
                                                    </div>
                                                </div>
                                                
                                                <div className="group relative min-h-[500px] flex flex-col gap-4">
                                                    <div className="flex-1 rounded-3xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/50 p-6 transition-all focus-within:border-primary/30 focus-within:bg-white dark:focus-within:bg-slate-800 shadow-sm relative overflow-hidden">
                                                        <Textarea
                                                            placeholder="Start writing in Markdown... (headings, lists, code blocks supported)"
                                                            className="min-h-[400px] w-full resize-none border-none bg-transparent p-0 text-lg leading-relaxed font-sans focus-visible:ring-0 placeholder:text-slate-300 dark:placeholder:text-slate-700"
                                                            value={notes}
                                                            onChange={(e) => setNotes(e.target.value)}
                                                        />
                                                        
                                                        {notes.trim().length > 0 && (
                                                            <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 prose prose-slate dark:prose-invert max-w-none">
                                                                <div className="text-[10px] uppercase tracking-widest font-black text-slate-300 dark:text-slate-700 mb-4 select-none">Preview</div>
                                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                                    {notes}
                                                                </ReactMarkdown>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Subtasks in Details Mode (Organizing) */}
                                            <div className="space-y-6 pb-12">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                                        <ListChecks className="h-3.5 w-3.5" />
                                                        <span>Subtasks & Structure</span>
                                                    </div>
                                                    <Badge variant="secondary" className="font-mono text-[10px]">{completedSubtasks}/{totalSubtasks}</Badge>
                                                </div>
                                                
                                                <div className="space-y-2">
                                                    {subtasks.map((subtask) => (
                                                        <div key={subtask.id} className="group flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-800">
                                                            <Checkbox
                                                                checked={subtask.isCompleted}
                                                                onCheckedChange={() => handleToggleSubtask(subtask.id, subtask.isCompleted)}
                                                                className="h-5 w-5 rounded-lg border-2"
                                                            />
                                                            <span className={cn(
                                                                "flex-1 text-sm font-medium",
                                                                subtask.isCompleted && "line-through text-slate-400"
                                                            )}>
                                                                {subtask.title}
                                                            </span>
                                                            <Button
                                                                variant="ghost" 
                                                                size="icon" 
                                                                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                onClick={() => handleDeleteSubtask(subtask.id)}
                                                            >
                                                                <Trash2 className="h-4 w-4 text-slate-300 hover:text-red-500" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                    <div className="flex items-center gap-3 px-3 py-2 mt-2 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl hover:border-primary/30 transition-colors">
                                                        <Plus className="h-4 w-4 text-slate-300" />
                                                        <input
                                                            ref={subtaskInputRef}
                                                            type="text"
                                                            placeholder="Add a structural step..."
                                                            value={newSubtaskTitle}
                                                            onChange={(e) => setNewSubtaskTitle(e.target.value)}
                                                            onKeyDown={handleSubtaskKeyDown}
                                                            className="flex-1 bg-transparent text-sm outline-none font-medium placeholder:text-slate-300"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Pane: Metadata & Attachments */}
                                    <div className="flex flex-col h-full overflow-y-auto custom-scrollbar bg-slate-50/50 dark:bg-slate-950/20">
                                        <div className="p-8 space-y-10">
                                            <DayRibbon taskId={task.id} taskTitle={task.title} />

                                            {/* Metadata Section (with Contextual Visibility) */}
                                            <section className="space-y-6">
                                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 px-1">
                                                    <Activity className="h-3.5 w-3.5" />
                                                    <span>Task Metadata</span>
                                                </div>
                                                
                                                <div className="space-y-4">
                                                    {/* Priority Selector (Opacity 20% -> 100%) */}
                                                    <div className="opacity-20 hover:opacity-100 focus-within:opacity-100 transition-opacity duration-300">
                                                        <div className="text-[9px] font-black uppercase text-slate-400 mb-1.5 block ml-1 tracking-widest">Priority</div>
                                                        <Select
                                                            value={task.priority}
                                                            onValueChange={(val: TaskPriority) => updateTask({ id: task.id, priority: val })}
                                                        >
                                                            <SelectTrigger className="h-10 w-full text-xs font-bold bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
                                                                <SelectValue placeholder="Priority" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="LOW">Low Priority</SelectItem>
                                                                <SelectItem value="MEDIUM">Medium Priority</SelectItem>
                                                                <SelectItem value="HIGH">High Priority</SelectItem>
                                                                <SelectItem value="URGENT">Urgent Mission</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>

                                                    {/* Due Date (Opacity 20% -> 100%) */}
                                                    <div className="opacity-20 hover:opacity-100 focus-within:opacity-100 transition-opacity duration-300">
                                                        <div className="text-[9px] font-black uppercase text-slate-400 mb-1.5 block ml-1 tracking-widest">Target Date</div>
                                                        <Popover>
                                                            <PopoverTrigger asChild>
                                                                <Button
                                                                    variant="outline"
                                                                    className="h-10 w-full text-xs font-bold bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl shadow-sm justify-start gap-2"
                                                                >
                                                                    <CalendarIcon className="h-3.5 w-3.5 text-primary" />
                                                                    {task.dueDate ? format(new Date(task.dueDate), "MMM d, yyyy") : "No deadline set"}
                                                                </Button>
                                                            </PopoverTrigger>
                                                            <PopoverContent className="w-auto p-0" align="end">
                                                                <Calendar
                                                                    mode="single"
                                                                    selected={task.dueDate ? new Date(task.dueDate) : undefined}
                                                                    onSelect={(date) => updateTask({ id: task.id, dueDate: date || null })}
                                                                    initialFocus
                                                                />
                                                            </PopoverContent>
                                                        </Popover>
                                                    </div>

                                                    {/* Recurrence (Opacity 20% -> 100%) */}
                                                    <div className="opacity-20 hover:opacity-100 focus-within:opacity-100 transition-opacity duration-300 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm">
                                                        <div className="flex items-center gap-2">
                                                            <Repeat className="h-3.5 w-3.5 text-primary" />
                                                            <span className="text-[10px] font-black uppercase tracking-tight">Recurring</span>
                                                        </div>
                                                        <Switch checked={task.isRecurring} onCheckedChange={(checked) => updateTask({ id: task.id, isRecurring: checked })} className="scale-75" />
                                                    </div>
                                                </div>
                                            </section>

                                            {/* Attachments Section */}
                                            <section className="space-y-6 group/attachments">
                                                <div className="flex items-center justify-between mb-2 px-1">
                                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                                        <Paperclip className="h-3.5 w-3.5" />
                                                        <span>Attachments</span>
                                                    </div>
                                                    
                                                    {/* Ghost Upload Buttons */}
                                                    <div className="flex items-center gap-1 opacity-0 group-hover/attachments:opacity-100 transition-opacity">
                                                        <Button variant="ghost" size="icon" onClick={() => setIsLinkDialogOpen(true)} className="h-7 w-7 rounded-lg">
                                                            <LinkIcon className="h-3 w-3" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} className="h-7 w-7 rounded-lg">
                                                            <Plus className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    {attachments.map((attachment) => (
                                                        <div key={attachment.id} className="group flex flex-col gap-1 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-primary/20 transition-all shadow-sm relative overflow-hidden">
                                                            <div className="flex items-center justify-between gap-3 min-w-0">
                                                                <div className="flex items-center gap-3 overflow-hidden">
                                                                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border">
                                                                        {attachment.type === "LINK" ? <LinkIcon className="h-3.5 w-3.5 text-blue-500" /> : <FileIcon className="h-3.5 w-3.5 text-slate-500" />}
                                                                    </div>
                                                                    <div className="flex flex-col min-w-0">
                                                                        <span className="text-xs font-black truncate leading-none mb-1">{attachment.name}</span>
                                                                        <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                                                                            <span>{attachment.type}</span>
                                                                            {attachment.size && (
                                                                                <>
                                                                                    <span>•</span>
                                                                                    <span>{(attachment.size / 1024).toFixed(1)} KB</span>
                                                                                </>
                                                                            )}
                                                                            <span>•</span>
                                                                            <span>{format(new Date(attachment.createdAt), "MMM d")}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                                                    <Button
                                                                        variant="ghost" 
                                                                        size="icon" 
                                                                        className="h-8 w-8 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                                                                        onClick={() => deleteAttachment.mutate(attachment.id)}
                                                                    >
                                                                        <Trash2 className="h-3.5 w-3.5 text-red-500" />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}

                                                    {attachments.length === 0 && (
                                                        <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl opacity-40">
                                                            <Paperclip className="h-6 w-6 mb-2" />
                                                            <span className="text-[10px] font-black uppercase tracking-widest">No assets yet</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </section>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === "HISTORY" && (
                            <motion.div
                                key="history"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="h-full w-full overflow-y-auto p-8 custom-scrollbar"
                            >
                                <div className="max-w-4xl mx-auto space-y-8">
                                    <div className="flex items-center gap-3 mb-8">
                                        <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                                            <HistoryIcon className="h-8 w-8" />
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Execution History</h2>
                                            <p className="text-muted-foreground text-sm font-medium">Timeline of all focus sessions and milestones</p>
                                        </div>
                                    </div>

                                    {/* Unified Session Scorecard */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
                                        {[
                                            { 
                                                label: "Focus Time", 
                                                value: `${Math.round((task.pomodoroSessions?.reduce((acc, s) => acc + (s.duration || 0), 0) || 0) / 60)}m`, 
                                                icon: Clock,
                                                color: "text-blue-500",
                                                bg: "bg-blue-50 dark:bg-blue-900/20"
                                            },
                                            { 
                                                label: "Sessions", 
                                                value: task.pomodoroSessions?.length || 0, 
                                                icon: Target,
                                                color: "text-primary",
                                                bg: "bg-primary/5"
                                            },
                                            { 
                                                label: "Interruptions", 
                                                value: task.pomodoroSessions?.reduce((acc, s) => acc + (s.interruptions || 0), 0) || 0, 
                                                icon: AlertCircle,
                                                color: "text-amber-500",
                                                bg: "bg-amber-50 dark:bg-amber-900/20"
                                            },
                                        ].map((stat, i) => (
                                            <motion.div
                                                key={stat.label}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.1 }}
                                                className={cn("p-6 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800 flex flex-col gap-4", stat.bg)}
                                            >
                                                <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center border", stat.color.replace('text-', 'bg-').replace('500', '500/10'))}>
                                                    <stat.icon className={cn("h-5 w-5", stat.color)} />
                                                </div>
                                                <div>
                                                    <div className="text-3xl font-black font-jetbrains tracking-tighter text-slate-900 dark:text-white">{stat.value}</div>
                                                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>

                                    <SessionTimeline sessions={task.pomodoroSessions || []} />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
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

            {/* Archive Confirmation Dialog */}
            <AlertDialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
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
                            onClick={() => {
                                updateTask({ id: task.id, status: "ARCHIVED" });
                                setShowArchiveDialog(false);
                                onClose();
                            }}
                            className="bg-amber-600 hover:bg-amber-700 text-white"
                        >
                            Archive Task
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
                            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Link Name</div>
                            <Input
                                placeholder="e.g. Design Specs, PR, Research"
                                value={linkName}
                                onChange={(e) => setLinkName(e.target.value)}
                                className="rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">URL</div>
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

            {/* Hidden File Input */}
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                        try {
                            await uploadFile.mutateAsync(file);
                        } finally {
                            // Reset input so the same file can be uploaded again if needed
                            if (e.target) e.target.value = "";
                        }
                    }
                }}
            />

            <AttachmentPreview
                isOpen={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
                attachment={previewAttachment}
            />
        </motion.div>
    );
}
