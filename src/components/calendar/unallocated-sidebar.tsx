"use client";

import * as React from "react";
import { useTasks } from "@/hooks/use-tasks";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Draggable } from "@fullcalendar/interaction";
import { cn } from "@/lib/utils";
import { Calendar, AlertCircle, Clock, GripVertical, Search, Tag as TagIcon, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTags } from "@/hooks/use-tags";

interface UnallocatedSidebarProps {}

export function UnallocatedSidebar({}: UnallocatedSidebarProps) {
    const [filter, setFilter] = React.useState<"today" | "priority" | "all">("today");
    const [search, setSearch] = React.useState("");
    const [tagId, setTagId] = React.useState<string>("ALL");
    const containerRef = React.useRef<HTMLDivElement>(null);

    const { data: tags = [] } = useTags();

    const { data, isLoading } = useTasks({
        status: "TODO",
        unallocatedOnly: true,
        ...(filter === "today" ? { dueDate: "today" } : (filter === "priority" ? { priority: "HIGH" } : {})),
        search: search || undefined,
        tagId: tagId === "ALL" ? undefined : tagId,
    });

    const tasks = data?.pages.flatMap((page) => page.tasks) || [];

    React.useEffect(() => {
        if (!containerRef.current || tasks.length === 0) return;

        const draggable = new Draggable(containerRef.current, {
            itemSelector: ".draggable-task",
            eventData: (eventEl) => {
                const taskId = eventEl.getAttribute("data-task-id");
                const task = tasks.find((t) => t.id === taskId);
                if (!task) return {};

                // Duration in minutes: estimatedPomodoros * pomodoroDuration
                const durationMinutes = (task.estimatedPomodoros || 1) * (task.pomodoroDuration || 25);
                
                return {
                    id: task.id,
                    title: task.title,
                    duration: { minutes: durationMinutes },
                    extendedProps: {
                        taskId: task.id,
                        task: task,
                    },
                    backgroundColor: task.projectRef?.color || "#6366f1",
                    borderColor: task.projectRef?.color || "#6366f1",
                };
            },
        });

        return () => draggable.destroy();
    }, [tasks]);

    return (
        <div className="flex flex-col h-full w-80 border-l border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">Unallocated</h3>
                    <Badge variant="secondary" className="font-mono">{tasks.length}</Badge>
                </div>

                <Tabs value={filter} onValueChange={(v: any) => setFilter(v)} className="w-full">
                    <TabsList className="grid w-full grid-cols-3 h-9">
                        <TabsTrigger value="today" className="text-xs">Today</TabsTrigger>
                        <TabsTrigger value="priority" className="text-xs">Priority</TabsTrigger>
                        <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                    </TabsList>
                </Tabs>

                <div className="flex flex-col gap-2">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                        <Input
                            placeholder="Search tasks..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-8 h-9 text-xs bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                        />
                        {search && (
                            <button 
                                onClick={() => setSearch("")}
                                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </div>
                    
                    <Select value={tagId} onValueChange={setTagId}>
                        <SelectTrigger className="h-9 text-xs bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                            <div className="flex items-center gap-2">
                                <TagIcon className="h-3.5 w-3.5 text-slate-400" />
                                <SelectValue placeholder="Filter by tag" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Tags</SelectItem>
                            {tags.map((tag) => (
                                <SelectItem key={tag.id} value={tag.id}>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tag.color || "#ccc" }} />
                                        {tag.name}
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <ScrollArea className="flex-1">
                <div ref={containerRef} className="p-4 space-y-3">
                    {isLoading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-24 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
                            ))}
                        </div>
                    ) : tasks.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                            <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                                <Calendar className="h-6 w-6 text-slate-400" />
                            </div>
                            <p className="text-sm font-medium text-slate-500">No unallocated tasks found</p>
                        </div>
                    ) : (
                        tasks.map((task) => (
                            <Card
                                key={task.id}
                                data-task-id={task.id}
                                className={cn(
                                    "draggable-task group relative p-4 cursor-grab active:cursor-grabbing hover:border-primary/50 transition-all border-2",
                                    "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm"
                                )}
                            >
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-start justify-between gap-2">
                                        <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 leading-tight">
                                            {task.title}
                                        </h4>
                                        <GripVertical className="h-4 w-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>

                                    <div className="flex items-center gap-3 mt-1">
                                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                                            <Clock className="h-3 w-3" />
                                            <span>{(task.estimatedPomodoros || 1) * (task.pomodoroDuration || 25)}m</span>
                                        </div>
                                        {task.priority === "URGENT" && (
                                            <div className="flex items-center gap-1 text-[10px] font-bold text-red-500 uppercase tracking-tighter">
                                                <AlertCircle className="h-3 w-3" />
                                                <span>Urgent</span>
                                            </div>
                                        )}
                                        {task.projectRef && (
                                            <Badge 
                                                variant="outline" 
                                                className="text-[9px] h-4 px-1.5 border-slate-200"
                                                style={{ borderColor: `${task.projectRef.color}40`, color: task.projectRef.color }}
                                            >
                                                {task.projectRef.name}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        ))
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}
