"use client";

import {
    Plus,
    Menu,
    ChevronLeft,
    LayoutGrid,
    List,
    Pencil,
    Trash2,
    Filter,
    Zap
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { usePathname, useParams, useRouter } from "next/navigation";
import { useProject } from "@/hooks/use-projects";
import { TaskDialog } from "@/components/tasks/task-dialog";
import { GlobalSearch } from "@/components/global-search";
import { useSidebarStore } from "@/store/sidebar";
import { useLayoutStore } from "@/store/layout";
import { ProjectDialog } from "./projects/project-dialog";
import { cn } from "@/lib/utils";
import { useTags } from "@/hooks/use-tags";
import { 
    Popover, 
    PopoverContent, 
    PopoverTrigger 
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
    Select as UISelect, 
    SelectContent as UISelectContent, 
    SelectItem as UISelectItem, 
    SelectTrigger as UISelectTrigger, 
    SelectValue as UISelectValue 
} from "@/components/ui/select";

export function Header() {
    const today = new Date();
    const pathname = usePathname();
    const params = useParams();
    const router = useRouter();
    const projectId = params?.id as string | undefined;
    const { data: project } = useProject(projectId);
    
    const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
    const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    
    const toggleSidebar = useSidebarStore((s) => s.toggle);
    
    const { 
        projectViewMode, 
        setProjectViewMode,
        calendarViewMode,
        setCalendarViewMode,
        setCalendarCommand,
        setProjectCommand,
        headerConfig,
        lowEnergyMode,
        setLowEnergyMode,
        projectFilters,
        setProjectFilters,
        resetProjectFilters
    } = useLayoutStore();

    // Dynamic Title Logic
    const getTitle = () => {
        if (pathname === "/app") return "Dashboard";
        if (pathname === "/projects") return "Projects";
        if (pathname.startsWith("/projects/") && projectId) {
            return project?.name || "Loading Project...";
        }
        if (pathname.startsWith("/calendar")) return "Calendar";
        if (pathname.startsWith("/settings")) return "Settings";
        if (pathname.startsWith("/analytics")) return "Analytics";
        if (pathname.startsWith("/tasks")) return "Tasks";
        if (pathname.startsWith("/timer")) return "Focus Timer";
        return "FocusOS";
    };

    const title = headerConfig?.title ?? getTitle();
    const isProjectDetail = pathname.startsWith("/projects/") && projectId;
    const isNestedPage = isProjectDetail || pathname.startsWith("/tasks/");
    const showBackButton = headerConfig?.showBackButton ?? isNestedPage;

    return (
        <header className="h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 z-50 sticky top-0">
            {/* Left: Mobile Toggle & Contextual Title / Back */}
            <div className="flex items-center gap-4 min-w-0">
                <button
                    className="md:hidden p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg flex-shrink-0"
                    onClick={toggleSidebar}
                >
                    <Menu className="h-5 w-5" />
                </button>
                
                {showBackButton && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="flex-shrink-0 h-9 w-9 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                        onClick={() => router.back()}
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                )}

                <div className="flex flex-col min-w-0">
                    <h1 className="text-lg font-bold text-slate-900 dark:text-white truncate leading-tight" title={typeof title === "string" ? title : undefined}>
                        {title}
                    </h1>
                    <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                        <span>Today is</span>
                        <span className="text-slate-500 dark:text-slate-300">
                            {format(today, "MMM d")}
                        </span>
                    </div>
                </div>
            </div>


            {/* Right: Actions */}
            <div className="flex items-center gap-2">
                {/* Contextual / Custom Actions */}
                <div className="flex items-center gap-2 mr-2">
                    {headerConfig?.actions ? (
                        headerConfig.actions
                    ) : (
                        <>
                            {/* Projects List Actions */}
                            {pathname === "/projects" && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="gap-2 h-9 border-primary/20 hover:border-primary/50 text-primary hover:bg-primary/5 bg-primary/5 dark:bg-primary/10"
                                    onClick={() => setIsProjectDialogOpen(true)}
                                >
                                    <Plus className="h-4 w-4" />
                                    <span className="hidden sm:inline">Create Project</span>
                                </Button>
                            )}

                            {/* Project Detail Actions */}
                            {isProjectDetail && (
                                <div className="flex items-center gap-2">
                                    {/* View toggle */}
                                    <div className="flex items-center border rounded-lg p-0.5 bg-slate-100 dark:bg-slate-800">
                                        <button
                                            onClick={() => setProjectViewMode("board")}
                                            className={cn(
                                                "p-1.5 rounded-md transition-all",
                                                projectViewMode === "board"
                                                    ? "bg-white dark:bg-slate-600 shadow-sm text-slate-900 dark:text-white"
                                                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                                            )}
                                            title="Board view"
                                        >
                                            <LayoutGrid className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => setProjectViewMode("list")}
                                            className={cn(
                                                "p-1.5 rounded-md transition-all",
                                                projectViewMode === "list"
                                                    ? "bg-white dark:bg-slate-600 shadow-sm text-slate-900 dark:text-white"
                                                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                                            )}
                                            title="List view"
                                        >
                                            <List className="h-4 w-4" />
                                        </button>
                                    </div>

                                    {/* Filter */}
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className={cn(
                                                    "h-9 w-9 relative",
                                                    (projectFilters.tag !== "ALL" || 
                                                     projectFilters.status !== "ALL" || 
                                                     projectFilters.difficulty !== "ALL" || 
                                                     projectFilters.hasTimer) && "text-primary bg-primary/5"
                                                )} 
                                                title="Filter tasks"
                                            >
                                                <Filter className="h-4 w-4" />
                                                {(projectFilters.tag !== "ALL" || 
                                                  projectFilters.status !== "ALL" || 
                                                  projectFilters.difficulty !== "ALL" || 
                                                  projectFilters.hasTimer) && (
                                                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full border-2 border-white dark:border-slate-900" />
                                                )}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-80 p-4" align="end">
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="font-bold text-sm">Filters</h4>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        className="h-7 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-primary"
                                                        onClick={resetProjectFilters}
                                                    >
                                                        Reset
                                                    </Button>
                                                </div>

                                                <Separator />

                                                <div className="space-y-4">
                                                    {/* Tag Filter */}
                                                    <div className="space-y-2">
                                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tag</Label>
                                                        <TagsFilterSelect 
                                                            value={projectFilters.tag} 
                                                            onChange={(val) => setProjectFilters({ tag: val })} 
                                                        />
                                                    </div>

                                                    {/* Status Filter */}
                                                    <div className="space-y-2">
                                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</Label>
                                                        <UISelect 
                                                            value={projectFilters.status} 
                                                            onValueChange={(val) => setProjectFilters({ status: val })}
                                                        >
                                                            <UISelectTrigger className="h-8 text-xs">
                                                                <UISelectValue placeholder="All Statuses" />
                                                            </UISelectTrigger>
                                                            <UISelectContent>
                                                                <UISelectItem value="ALL">All Statuses</UISelectItem>
                                                                <UISelectItem value="TODO">To Do</UISelectItem>
                                                                <UISelectItem value="IN_PROGRESS">In Progress</UISelectItem>
                                                                <UISelectItem value="READY_FOR_REVIEW">Review</UISelectItem>
                                                                <UISelectItem value="COMPLETED">Completed</UISelectItem>
                                                                <UISelectItem value="ON_HOLD">On Hold</UISelectItem>
                                                            </UISelectContent>
                                                        </UISelect>
                                                    </div>

                                                    {/* Difficulty Filter */}
                                                    <div className="space-y-2">
                                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Difficulty</Label>
                                                        <UISelect 
                                                            value={projectFilters.difficulty} 
                                                            onValueChange={(val) => setProjectFilters({ difficulty: val })}
                                                        >
                                                            <UISelectTrigger className="h-8 text-xs">
                                                                <UISelectValue placeholder="All Difficulties" />
                                                            </UISelectTrigger>
                                                            <UISelectContent>
                                                                <UISelectItem value="ALL">All Difficulties</UISelectItem>
                                                                <UISelectItem value="EASY">Easy</UISelectItem>
                                                                <UISelectItem value="MEDIUM">Medium</UISelectItem>
                                                                <UISelectItem value="HARD">Hard</UISelectItem>
                                                            </UISelectContent>
                                                        </UISelect>
                                                    </div>

                                                    <Separator />

                                                    {/* Timer Filter */}
                                                    <div className="flex items-center justify-between">
                                                        <div className="space-y-0.5">
                                                            <Label className="text-xs font-bold">Has Focus Time</Label>
                                                            <p className="text-[10px] text-muted-foreground text-pretty">
                                                                Only show tasks with timer history
                                                            </p>
                                                        </div>
                                                        <Switch 
                                                            checked={projectFilters.hasTimer}
                                                            onCheckedChange={(val) => setProjectFilters({ hasTimer: val })}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </PopoverContent>
                                    </Popover>

                                    {/* Project Settings (Edit/Delete) */}
                                    <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-700 mx-1" />
                                    <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setProjectCommand("edit")} title="Edit project">
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-9 w-9 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950" 
                                        onClick={() => setProjectCommand("delete")}
                                        title="Delete project"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>

                                    <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-700 mx-1" />
                                    <Button 
                                        size="sm" 
                                        className="gap-1.5 h-9 bg-primary"
                                        onClick={() => setIsTaskDialogOpen(true)}
                                    >
                                        <Plus className="h-4 w-4" />
                                        <span className="hidden sm:inline">Add Task</span>
                                    </Button>
                                </div>
                            )}

                            {/* Calendar Actions */}
                            {pathname === "/calendar" && (
                                <>
                                    <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-700 mx-1" />
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="h-9 font-bold"
                                        onClick={() => setCalendarCommand("today")}
                                    >
                                        Today
                                    </Button>
                                    <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 p-1">
                                        <button
                                            onClick={() => setCalendarViewMode("timeGridDay")}
                                            className={cn(
                                                "px-3 py-1 rounded-md text-xs font-bold transition-all",
                                                calendarViewMode === "timeGridDay"
                                                    ? "bg-primary text-white shadow-sm"
                                                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                                            )}
                                        >
                                            Day
                                        </button>
                                        <button
                                            onClick={() => setCalendarViewMode("timeGridWeek")}
                                            className={cn(
                                                "px-3 py-1 rounded-md text-xs font-bold transition-all",
                                                calendarViewMode === "timeGridWeek"
                                                    ? "bg-primary text-white shadow-sm"
                                                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                                            )}
                                        >
                                            Week
                                        </button>
                                        <button
                                            onClick={() => setCalendarViewMode("dayGridMonth")}
                                            className={cn(
                                                "px-3 py-1 rounded-md text-xs font-bold transition-all",
                                                calendarViewMode === "dayGridMonth"
                                                    ? "bg-primary text-white shadow-sm"
                                                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                                            )}
                                        >
                                            Month
                                        </button>
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </div>

                {/* Energy Toggle */}
                <button
                    onClick={() => setLowEnergyMode(!lowEnergyMode)}
                    className={cn(
                        "p-2 rounded-xl transition-all duration-300 flex items-center gap-2 px-3 mr-2",
                        lowEnergyMode 
                            ? "bg-amber-500/10 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]" 
                            : "bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    )}
                    title={lowEnergyMode ? "Low Energy Mode Active" : "High Energy Mode"}
                >
                    <Zap className={cn("h-4 w-4", lowEnergyMode && "fill-current")} />
                    <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">
                        {lowEnergyMode ? "Low Energy" : "High Energy"}
                    </span>
                </button>


                {/* Global New Task (Show on Dashboard or if not in project detail) */}
                {(pathname === "/app" || pathname === "/tasks") && (
                    <Button
                        className="gap-2 bg-primary hover:bg-primary/90 text-white shadow-sm h-9 ml-2"
                        onClick={() => setIsTaskDialogOpen(true)}
                    >
                        <Plus className="h-4 w-4" />
                        <span className="hidden sm:inline">New Task</span>
                    </Button>
                )}
            </div>

            <TaskDialog
                open={isTaskDialogOpen}
                onOpenChange={setIsTaskDialogOpen}
                defaultProject={projectId}
            />

            <ProjectDialog
                open={isProjectDialogOpen}
                onOpenChange={setIsProjectDialogOpen}
            />

            <GlobalSearch 
                open={isSearchOpen} 
                onOpenChange={setIsSearchOpen} 
                projectId={projectId}
                projectName={project?.name}
            />
        </header>
    );
}

function TagsFilterSelect({ value, onChange }: { value: string, onChange: (val: string) => void }) {
    const { data: tags = [] } = useTags();
    
    return (
        <UISelect value={value} onValueChange={onChange}>
            <UISelectTrigger className="h-8 text-xs">
                <UISelectValue placeholder="All Tags" />
            </UISelectTrigger>
            <UISelectContent>
                <UISelectItem value="ALL">All Tags</UISelectItem>
                {tags.map((tag) => (
                    <UISelectItem key={tag.id} value={tag.id}>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tag.color || '#ccc' }} />
                            {tag.name}
                        </div>
                    </UISelectItem>
                ))}
            </UISelectContent>
        </UISelect>
    );
}
