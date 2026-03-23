"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useLayoutStore } from "@/store/layout";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Rocket, Zap, Command, Calendar as CalendarIcon, Paperclip, Flag, Bell, MoreHorizontal, Inbox, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGlobalSearch } from "@/hooks/use-search";
import { useDebounce } from "@/hooks/use-debounce";
import { useRouter, useParams } from "next/navigation";
import { useTimerStore } from "@/store/timer";
import { useCreateTask } from "@/hooks/use-tasks";
import { useProjects } from "@/hooks/use-projects";
import { TaskPriority } from "@prisma/client";
import { format } from "date-fns";
import { toast } from "sonner";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function CommandBar() {
    const { isCommandCaptureOpen, setCommandCaptureOpen, commandCaptureMode } = useLayoutStore();
    const [query, setQuery] = useState("");
    const [description, setDescription] = useState("");
    const [mode, setMode] = useState<"search" | "create">(commandCaptureMode);
    const debouncedQuery = useDebounce(query, 200);
    const { data: results, isLoading } = useGlobalSearch(debouncedQuery);
    const [isGhosted, setIsGhosted] = useState(false);
    const router = useRouter();
    const { start, setFocusMode, setZenithMode } = useTimerStore();
    const { mutate: createTask } = useCreateTask();
    const inputRef = useRef<HTMLInputElement>(null);

    // Keyboard shortcuts
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (
                e.target instanceof HTMLInputElement || 
                e.target instanceof HTMLTextAreaElement || 
                (e.target as HTMLElement).isContentEditable
            ) {
                if (e.target !== inputRef.current) return;
            }

            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setCommandCaptureOpen(!isCommandCaptureOpen, "search");
            }

            if (e.key === "t" && !isCommandCaptureOpen) {
                e.preventDefault();
                setCommandCaptureOpen(true, "create");
            }

            if (e.key === "Escape" && isCommandCaptureOpen) {
                setCommandCaptureOpen(false);
            }
        };
        window.addEventListener("keydown", down);
        return () => window.removeEventListener("keydown", down);
    }, [isCommandCaptureOpen, setCommandCaptureOpen]);

    const params = useParams();
    const defaultProjectId = params?.id as string | undefined;
    const [priority, setPriority] = useState<TaskPriority>("MEDIUM");
    const [dueDate, setDueDate] = useState<Date | null>(null);
    const [projectId, setProjectId] = useState<string | null>(defaultProjectId || null);
    const { data: projects } = useProjects();

    const selectedProject = projects?.find(p => p.id === projectId);

    const handleCreateTask = () => {
        if (!query.trim()) return;
        createTask({ 
            title: query.trim(),
            description: description.trim() || undefined,
            priority,
            dueDate,
            projectId: projectId || projects?.find(p => p.name === "Daily")?.id
        });
        setQuery("");
        setDescription("");
        setPriority("MEDIUM");
        setDueDate(null);
        setProjectId(null);
        setCommandCaptureOpen(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && mode === "create" && query.trim() && !e.shiftKey) {
            e.preventDefault();
            handleCreateTask();
        }
    };

    // Ghost behavior
    useEffect(() => {
        if (!isCommandCaptureOpen) {
            setIsGhosted(false);
            return;
        }
        let timeout: NodeJS.Timeout;
        const resetGhost = () => {
            setIsGhosted(false);
            clearTimeout(timeout);
            timeout = setTimeout(() => setIsGhosted(true), 5000);
        };
        window.addEventListener("mousemove", resetGhost);
        window.addEventListener("keydown", resetGhost);
        resetGhost();
        return () => {
            window.removeEventListener("mousemove", resetGhost);
            window.removeEventListener("keydown", resetGhost);
            clearTimeout(timeout);
        };
    }, [isCommandCaptureOpen]);

    useEffect(() => {
        if (isCommandCaptureOpen) {
            setMode(commandCaptureMode);
            setProjectId(defaultProjectId || null);
            if (inputRef.current) {
                inputRef.current.focus();
            }
        } else {
            setQuery("");
            setDescription("");
        }
    }, [isCommandCaptureOpen, commandCaptureMode, defaultProjectId]);

    const handleLaunch = useCallback((taskId: string, duration: number = 25) => {
        setCommandCaptureOpen(false);
        setZenithMode(true);
        setFocusMode(true);
        start(duration, "FOCUS", taskId);
    }, [setCommandCaptureOpen, setZenithMode, setFocusMode, start]);

    return (
        <AnimatePresence>
            {isCommandCaptureOpen && (
                <div 
                    className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-hidden pointer-events-none"
                    onKeyDown={handleKeyDown}
                >
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm z-0 pointer-events-auto" 
                        onClick={() => setCommandCaptureOpen(false)}
                    />
                    
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ 
                            opacity: isGhosted ? 0.3 : 1, 
                            scale: 1, 
                            filter: isGhosted ? "blur(4px)" : "blur(0px)"
                        }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className={cn(
                            "relative z-50 w-full max-w-2xl bg-white dark:bg-[#161618] border border-slate-200 dark:border-white/5 rounded-2xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden transition-all duration-300 pointer-events-auto",
                            isGhosted && "hover:opacity-100 hover:blur-none"
                        )}
                        onMouseEnter={() => setIsGhosted(false)}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {mode === "search" ? (
                            <div className="flex flex-col">
                                <div className="relative flex items-center px-8 py-6 border-b border-slate-100 dark:border-white/5">
                                    <Search className="h-6 w-6 text-slate-400 mr-4" />
                                    <input
                                        ref={inputRef}
                                        placeholder="Search tasks or projects... (Cmd+K)"
                                        className="flex-1 bg-transparent border-none outline-none text-slate-900 dark:text-white text-xl font-bold placeholder:text-slate-300 dark:placeholder:text-slate-700 pointer-events-auto"
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                    />
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/5 text-[10px] font-black text-slate-400 uppercase tracking-widest border border-slate-200 dark:border-white/5">
                                        <Command className="h-3.5 w-3.5" />
                                        <span>K</span>
                                    </div>
                                </div>
                                
                                <div className="max-h-[450px] overflow-y-auto p-4 custom-scrollbar pointer-events-auto">
                                    {isLoading && (
                                        <div className="p-12 flex flex-col items-center justify-center text-slate-400 gap-4">
                                            <div className="h-8 w-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                                            <p className="text-[10px] font-black uppercase tracking-widest">Searching Missions...</p>
                                        </div>
                                    )}
                                    
                                    {results && results.tasks.length > 0 && (
                                        <div className="space-y-2 mb-6">
                                            <p className="px-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4">Tasks</p>
                                            {results.tasks.map((task) => (
                                                <div 
                                                    key={task.id}
                                                    className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 group/item cursor-pointer transition-all active:scale-[0.98] pointer-events-auto"
                                                    onClick={() => handleLaunch(task.id, task.pomodoroDuration)}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover/item:bg-primary group-hover/item:text-black transition-colors">
                                                            <Rocket className="h-5 w-5" />
                                                        </div>
                                                        <div>
                                                            <p className="text-base font-bold text-slate-900 dark:text-white group-hover/item:text-primary transition-colors">{task.title}</p>
                                                            <p className="text-[10px] font-mono text-slate-400 uppercase tracking-[0.2em]">{task.projectRef?.name || "Inbox"}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3 opacity-0 group-hover/item:opacity-100 transition-all translate-x-4 group-hover/item:translate-x-0">
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">Launch Focus</span>
                                                        <div className="h-10 w-10 rounded-xl bg-primary text-black flex items-center justify-center shadow-lg shadow-primary/20">
                                                            <Zap className="h-5 w-5 fill-current" />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {results && results.projects.length > 0 && (
                                        <div className="space-y-2 mb-4">
                                            <p className="px-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4">Projects</p>
                                            {results.projects.map((project) => (
                                                <div 
                                                    key={project.id}
                                                    className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 group/item cursor-pointer transition-all active:scale-[0.98] pointer-events-auto"
                                                    onClick={() => {
                                                        setCommandCaptureOpen(false);
                                                        router.push(`/projects/${project.id}`);
                                                    }}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div 
                                                            className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md"
                                                            style={{ backgroundColor: project.color }}
                                                        >
                                                            {project.name[0]}
                                                        </div>
                                                        <div>
                                                            <p className="text-base font-bold text-slate-900 dark:text-white group-hover/item:text-primary transition-colors">{project.name}</p>
                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{project._count.tasks} Tasks Remaining</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col bg-white dark:bg-[#161618] pointer-events-auto">
                                <div className="p-8 space-y-4">
                                    <div className="space-y-1">
                                        <input
                                            ref={inputRef}
                                            autoFocus
                                            placeholder="Practice math problems daily at 4pm"
                                            className="w-full bg-transparent border-none outline-none text-2xl font-bold text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-700 pointer-events-auto"
                                            value={query}
                                            onChange={(e) => setQuery(e.target.value)}
                                        />
                                        <input
                                            placeholder="Description"
                                            className="w-full bg-transparent border-none outline-none text-sm font-medium text-slate-500 placeholder:text-slate-300 dark:placeholder:text-slate-700 pointer-events-auto"
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                        />
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2 pt-2">
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <button type="button" className={cn(
                                                    "flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold transition-colors pointer-events-auto",
                                                    dueDate 
                                                        ? "border-primary bg-primary/10 text-primary" 
                                                        : "border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5"
                                                )}>
                                                    <CalendarIcon className="h-3.5 w-3.5" />
                                                    {dueDate ? format(dueDate, "MMM d") : "Date"}
                                                </button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0 z-[10000]" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={dueDate || undefined}
                                                    onSelect={(date) => setDueDate(date || null)}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>

                                        <button 
                                            type="button" 
                                            onClick={() => toast.info("Attachment feature coming soon...")}
                                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors pointer-events-auto"
                                        >
                                            <Paperclip className="h-3.5 w-3.5" />
                                            Attachment
                                        </button>

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button type="button" className={cn(
                                                    "flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold transition-colors pointer-events-auto",
                                                    priority !== "MEDIUM"
                                                        ? "border-orange-200 bg-orange-50 text-orange-600 dark:bg-orange-950/20 dark:text-orange-400"
                                                        : "border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5"
                                                )}>
                                                    <Flag className={cn(
                                                        "h-3.5 w-3.5",
                                                        priority === "URGENT" && "text-red-500 fill-red-500",
                                                        priority === "HIGH" && "text-orange-500 fill-orange-500"
                                                    )} />
                                                    {priority.charAt(0) + priority.slice(1).toLowerCase()}
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="start" className="z-[10000]">
                                                {["LOW", "MEDIUM", "HIGH", "URGENT"].map((p) => (
                                                    <DropdownMenuItem 
                                                        key={p} 
                                                        onClick={() => setPriority(p as TaskPriority)}
                                                        className="flex items-center gap-2"
                                                    >
                                                        <Flag className={cn(
                                                            "h-3.5 w-3.5",
                                                            p === "URGENT" && "text-red-500",
                                                            p === "HIGH" && "text-orange-500",
                                                            p === "MEDIUM" && "text-blue-500",
                                                            p === "LOW" && "text-slate-400"
                                                        )} />
                                                        {p.charAt(0) + p.slice(1).toLowerCase()}
                                                    </DropdownMenuItem>
                                                ))}
                                            </DropdownMenuContent>
                                        </DropdownMenu>

                                        <button 
                                            type="button" 
                                            onClick={() => toast.info("Reminders coming soon...")}
                                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors pointer-events-auto"
                                        >
                                            <Bell className="h-3.5 w-3.5" />
                                            Reminders
                                        </button>

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button type="button" className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors pointer-events-auto">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="z-[10000]">
                                                <DropdownMenuItem onClick={() => {
                                                    setQuery("");
                                                    setDescription("");
                                                    setPriority("MEDIUM");
                                                    setDueDate(null);
                                                    setProjectId(null);
                                                }}>
                                                    Clear Form
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>

                                <div className="px-8 py-4 bg-slate-50/50 dark:bg-black/20 border-t border-slate-100 dark:border-white/5 flex items-center justify-between pointer-events-auto">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button type="button" className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer text-slate-600 dark:text-slate-400 font-bold text-sm transition-colors group pointer-events-auto">
                                                <Inbox className="h-4 w-4" />
                                                <span>{selectedProject?.name || "Inbox"}</span>
                                                <ChevronDown className="h-3 w-3 opacity-50 group-hover:opacity-100 transition-opacity" />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="start" className="z-[10000] w-56">
                                            <DropdownMenuItem onClick={() => setProjectId(null)}>
                                                <Inbox className="h-4 w-4 mr-2" />
                                                Inbox
                                            </DropdownMenuItem>
                                            {projects?.map((p) => (
                                                <DropdownMenuItem key={p.id} onClick={() => setProjectId(p.id)}>
                                                    <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: p.color }} />
                                                    {p.name}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>

                                    <div className="flex items-center gap-3">
                                        <button 
                                            type="button"
                                            onClick={() => setCommandCaptureOpen(false)}
                                            className="px-4 py-2 rounded-xl text-sm font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors pointer-events-auto"
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            type="button"
                                            disabled={!query.trim()}
                                            onClick={handleCreateTask}
                                            className="px-6 py-2 rounded-xl text-sm font-black bg-[#f0a69d] dark:bg-[#e0958c] text-white shadow-lg shadow-orange-500/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 pointer-events-auto"
                                        >
                                            Add task
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
