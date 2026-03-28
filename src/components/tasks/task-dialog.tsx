"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoadingSpinner } from "@/components/ui/loading-state";
import { format } from "date-fns";
import * as z from "zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { useCreateTask, useUpdateTask } from "@/hooks/use-tasks";
import { useProjects } from "@/hooks/use-projects";
import { useCategories } from "@/hooks/use-categories";
import { useTags } from "@/hooks/use-tags";
import { TagSelector } from "./tags/tag-selector";
import { Task } from "@prisma/client";
import { Flag, Calendar as CalendarIcon, Minus, Plus, Repeat, Timer } from "lucide-react";

const taskSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
    estimatedPomodoros: z.coerce.number().min(1).max(20),
    project: z.string().optional(),
    categoryId: z.string().optional().nullable(),
    dueDate: z.date().optional().nullable(),
    difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).optional().nullable(),
    tags: z.array(z.string()).optional(),
    autoComplete: z.boolean(),
    isRecurring: z.boolean().optional(),
    recurrenceType: z.enum(["DAILY", "WEEKLY", "MONTHLY", "CUSTOM"]).optional().nullable(),
    recurrenceInterval: z.number().int().min(1).optional().nullable(),
    recurrenceDays: z.string().optional().nullable(),
});

interface TaskDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    taskToEdit?: Task;
    defaultProject?: string;
}

export function TaskDialog({ open, onOpenChange, taskToEdit, defaultProject }: TaskDialogProps) {
    const createTask = useCreateTask();
    const updateTask = useUpdateTask();
    const { data: projects } = useProjects();
    const { data: categories = [] } = useCategories();
    const { data: allTags = [] } = useTags();

    const form = useForm<z.infer<typeof taskSchema>>({
        resolver: zodResolver(taskSchema),
        defaultValues: {
            title: "",
            description: "",
            priority: "MEDIUM",
            estimatedPomodoros: 4,
            project: "",
            categoryId: null,
            dueDate: null,
            difficulty: "MEDIUM",
            tags: [],
            autoComplete: false,
            isRecurring: false,
            recurrenceType: "DAILY",
            recurrenceInterval: 1,
            recurrenceDays: "",
        },
    });

    useEffect(() => {
        if (taskToEdit) {
            form.reset({
                title: taskToEdit.title,
                description: taskToEdit.description || "",
                priority: taskToEdit.priority,
                estimatedPomodoros: taskToEdit.estimatedPomodoros,
                project: taskToEdit.projectId || "",
                categoryId: (taskToEdit as any).categoryId || null,
                dueDate: taskToEdit.dueDate ? new Date(taskToEdit.dueDate) : null,
                difficulty: (taskToEdit as any).difficulty || "MEDIUM",
                tags: (taskToEdit as any).tags?.map((t: any) => (typeof t === 'string' ? t : t.id)) || [],
                autoComplete: taskToEdit.autoComplete || false,
                isRecurring: taskToEdit.isRecurring || false,
                recurrenceType: (taskToEdit as any).recurrenceType || "DAILY",
                recurrenceInterval: (taskToEdit as any).recurrenceInterval || 1,
                recurrenceDays: (taskToEdit as any).recurrenceDays || "",
            });
        } else {
            const dailyProjectId = projects?.find(p => p.name === "Daily")?.id;

            form.reset({
                title: "",
                description: "",
                priority: "MEDIUM",
                estimatedPomodoros: 4,
                project: defaultProject || dailyProjectId || "",
                categoryId: null,
                dueDate: null,
                difficulty: "MEDIUM",
                tags: [],
                autoComplete: false,
                isRecurring: false,
                recurrenceType: "DAILY",
                recurrenceInterval: 1,
                recurrenceDays: "",
            });
        }
    }, [taskToEdit, form, defaultProject, open, projects]);

    const onSubmit = (values: z.infer<typeof taskSchema>) => {
        const { project: _p, ...taskData } = values;

        if (taskToEdit) {
            updateTask.mutate({
                id: taskToEdit.id,
                ...taskData,
                projectId: values.project || null,
            }, {
                onSuccess: () => onOpenChange(false)
            });
        } else {
            createTask.mutate({
                ...taskData,
                projectId: values.project || null,
            }, {
                onSuccess: () => onOpenChange(false)
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl p-0 gap-0 overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 my-auto">
                <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <DialogTitle className="text-xl font-semibold text-slate-900 dark:text-white tracking-tight">
                        {taskToEdit ? "Edit Task" : "Create New Task"}
                    </DialogTitle>
                    <DialogDescription className="text-sm text-slate-500 mt-1.5">
                        {taskToEdit ? "Modify existing task details." : "Add a new task to your project workflow."}
                    </DialogDescription>
                </DialogHeader>

                <div className="max-h-[85vh] overflow-y-auto">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Left Column: Info */}
                                <div className="space-y-6">
                                    {/* Task Title */}
                                    <FormField
                                        control={form.control}
                                        name="title"
                                        render={({ field }) => (
                                            <FormItem className="space-y-2">
                                                <FormLabel className="text-sm font-medium text-slate-900 dark:text-white">Task Title</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="e.g., Q3 Financial Review"
                                                        className="rounded-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 h-11 px-4"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Description */}
                                    <FormField
                                        control={form.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem className="space-y-2">
                                                <FormLabel className="text-sm font-medium text-slate-900 dark:text-white">Description</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Add details about the task..."
                                                        className="rounded-2xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 min-h-[120px] px-4 py-3 resize-none"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="hidden md:block bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
                                        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Pro Tips</h4>
                                        <ul className="text-xs text-slate-500 space-y-2 list-disc pl-4">
                                            <li>Break down complex tasks into smaller Pomodoros.</li>
                                            <li>Set a due date to keep track of deadlines.</li>
                                            <li>Use priority levels to sort your workflow.</li>
                                        </ul>
                                    </div>
                                </div>

                                {/* Right Column: Settings */}
                                <div className="space-y-6">
                                    {/* Project */}
                                    <FormField
                                        control={form.control}
                                        name="project"
                                        render={({ field }) => (
                                            <FormItem className="space-y-2">
                                                <FormLabel className="text-sm font-medium text-slate-900 dark:text-white">Project</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="rounded-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 h-11 px-4">
                                                            <SelectValue placeholder="Select project..." />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {projects?.map((project) => (
                                                            <SelectItem key={project.id} value={project.id}>
                                                                <div className="flex items-center gap-2">
                                                                    <div
                                                                        className="w-2 h-2 rounded-full"
                                                                        style={{ backgroundColor: project.color }}
                                                                    />
                                                                    {project.name}
                                                                </div>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Category */}
                                    <FormField
                                        control={form.control}
                                        name="categoryId"
                                        render={({ field }) => (
                                            <FormItem className="space-y-2">
                                                <FormLabel className="text-sm font-medium text-slate-900 dark:text-white">Category</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value || "none"}>
                                                    <FormControl>
                                                        <SelectTrigger className="rounded-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 h-11 px-4">
                                                            <SelectValue placeholder="Select category..." />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="none" className="text-slate-500 italic">None</SelectItem>
                                                        {categories?.map((cat) => (
                                                            <SelectItem key={cat.id} value={cat.id}>
                                                                {cat.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Priority */}
                                    <FormField
                                        control={form.control}
                                        name="priority"
                                        render={({ field }) => (
                                            <FormItem className="space-y-2">
                                                <FormLabel className="text-sm font-medium text-slate-900 dark:text-white">Priority</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <SelectTrigger className="rounded-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 h-11 px-4 pr-10">
                                                                <SelectValue placeholder="Set priority..." />
                                                            </SelectTrigger>
                                                            <span className="pointer-events-none absolute right-3 top-3 text-slate-400">
                                                                <Flag className="h-5 w-5" />
                                                            </span>
                                                        </div>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="LOW">Low</SelectItem>
                                                        <SelectItem value="MEDIUM">Medium</SelectItem>
                                                        <SelectItem value="HIGH">High</SelectItem>
                                                        <SelectItem value="URGENT">Urgent</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Grid: Due Date & Pomodoros */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <FormField
                                            control={form.control}
                                            name="dueDate"
                                            render={({ field }) => (
                                                <FormItem className="space-y-2 flex flex-col pt-[8px]">
                                                    <FormLabel className="text-sm font-medium text-slate-900 dark:text-white">Due Date</FormLabel>
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <FormControl>
                                                                <Button
                                                                    variant={"outline"}
                                                                    className={cn(
                                                                        "w-full rounded-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 h-11 px-4 text-left font-normal truncate flex items-center justify-between",
                                                                        !field.value && "text-muted-foreground"
                                                                    )}
                                                                >
                                                                    {field.value ? format(field.value, "MMM d, yyyy") : <span>Pick a date</span>}
                                                                    <div className="flex items-center gap-2">
                                                                        <CalendarIcon className="h-4 w-4 opacity-50 flex-shrink-0" />
                                                                    </div>
                                                                </Button>
                                                            </FormControl>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-auto p-0" align="start">
                                                            <Calendar
                                                                mode="single"
                                                                selected={field.value || undefined}
                                                                onSelect={(date) => {
                                                                    field.onChange(date || null);
                                                                }}
                                                                disabled={(date) => {
                                                                    // disable dates in the past
                                                                    const today = new Date();
                                                                    today.setHours(0, 0, 0, 0);
                                                                    return date < today;
                                                                }}
                                                                initialFocus
                                                            />
                                                            <div className="p-3 border-t bg-slate-50 dark:bg-slate-800 flex justify-end">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        e.stopPropagation();
                                                                        field.onChange(null);
                                                                    }}
                                                                    className="h-8 text-xs text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                                >
                                                                    Clear Date
                                                                </Button>
                                                            </div>
                                                        </PopoverContent>
                                                    </Popover>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="estimatedPomodoros"
                                            render={({ field }) => (
                                                <FormItem className="space-y-2">
                                                    <FormLabel className="text-sm font-medium text-slate-900 dark:text-white">Pomodoros</FormLabel>
                                                    <FormControl>
                                                        <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-full h-11 px-2 w-full justify-between">
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"
                                                                onClick={() => field.onChange(Math.max(1, field.value - 1))}
                                                            >
                                                                <Minus className="h-4 w-4" />
                                                            </Button>
                                                            <div className="flex items-center gap-2 flex-1 justify-center">
                                                                <Timer className="h-4 w-4 text-slate-400" />
                                                                <span className="text-sm font-semibold tabular-nums">{field.value}</span>
                                                            </div>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"
                                                                onClick={() => field.onChange(Math.min(20, field.value + 1))}
                                                            >
                                                                <Plus className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    {/* Difficulty Level */}
                                    <FormField
                                        control={form.control}
                                        name="difficulty"
                                        render={({ field }) => (
                                            <FormItem className="space-y-3">
                                                <FormLabel className="text-sm font-medium text-slate-900 dark:text-white">Difficulty</FormLabel>
                                                <div className="flex items-center gap-2">
                                                    {["EASY", "MEDIUM", "HARD"].map((level) => (
                                                        <label key={level} className="cursor-pointer flex-1">
                                                            <input
                                                                type="radio"
                                                                className="peer sr-only"
                                                                value={level}
                                                                checked={field.value === level}
                                                                onChange={field.onChange}
                                                            />
                                                            <div className="rounded-full border border-slate-200 dark:border-slate-700 py-2 text-center text-xs font-medium text-slate-500 transition-all hover:bg-slate-50 peer-checked:border-primary peer-checked:bg-primary/10 peer-checked:text-primary dark:hover:bg-slate-800">
                                                                {level.charAt(0) + level.slice(1).toLowerCase()}
                                                            </div>
                                                        </label>
                                                    ))}
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Tags */}
                                    <FormField
                                        control={form.control}
                                        name="tags"
                                        render={({ field }) => {
                                            const selectedTagObjects = allTags.filter(t => field.value?.includes(t.id));
                                            return (
                                                <FormItem className="space-y-3 flex flex-col">
                                                    <FormLabel className="text-sm font-medium text-slate-900 dark:text-white">Tags</FormLabel>
                                                    <FormControl>
                                                        <TagSelector
                                                            selectedTags={selectedTagObjects}
                                                            onTagsChange={field.onChange}
                                                            align="start"
                                                            className="w-full justify-start rounded-full border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 h-11 px-4 border-solid"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            );
                                        }}
                                    />

                                    {/* Auto-complete Toggle */}
                                    <FormField
                                        control={form.control}
                                        name="autoComplete"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-slate-50/50 dark:bg-slate-800/50">
                                                <div className="space-y-0.5">
                                                    <FormLabel className="text-sm font-medium text-slate-900 dark:text-white">Auto-complete</FormLabel>
                                                    <p className="text-[10px] text-slate-500">Close when done</p>
                                                </div>
                                                <FormControl>
                                                    <Switch
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />

                                    {/* Recurrence Trigger */}
                                    <FormField
                                        control={form.control}
                                        name="isRecurring"
                                        render={({ field }) => (
                                            <div className="space-y-4">
                                                <FormItem className="flex flex-row items-center justify-between rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-slate-50/50 dark:bg-slate-800/50">
                                                    <div className="space-y-0.5">
                                                        <div className="flex items-center gap-2">
                                                            <Repeat className="h-4 w-4 text-primary" />
                                                            <FormLabel className="text-sm font-medium text-slate-900 dark:text-white">Recurring Task</FormLabel>
                                                        </div>
                                                        <p className="text-[10px] text-slate-500">Repeat this task automatically</p>
                                                    </div>
                                                    <FormControl>
                                                        <Switch
                                                            checked={field.value}
                                                            onCheckedChange={field.onChange}
                                                        />
                                                    </FormControl>
                                                </FormItem>

                                                {field.value && (
                                                    <div className="p-4 rounded-xl border bg-slate-50/30 dark:bg-slate-800/20 space-y-4 animate-in fade-in slide-in-from-top-2">
                                                        <FormField
                                                            control={form.control}
                                                            name="recurrenceType"
                                                            render={({ field: typeField }) => (
                                                                <FormItem className="space-y-1.5">
                                                                    <FormLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Repeat Type</FormLabel>
                                                                    <Select onValueChange={typeField.onChange} value={typeField.value || "DAILY"}>
                                                                        <FormControl>
                                                                            <SelectTrigger className="h-9 rounded-lg bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                                                                <SelectValue placeholder="Daily" />
                                                                            </SelectTrigger>
                                                                        </FormControl>
                                                                        <SelectContent>
                                                                            <SelectItem value="DAILY">Daily</SelectItem>
                                                                            <SelectItem value="WEEKLY">Weekly</SelectItem>
                                                                            <SelectItem value="MONTHLY">Monthly</SelectItem>
                                                                            <SelectItem value="CUSTOM">Every X Days</SelectItem>
                                                                        </SelectContent>
                                                                    </Select>
                                                                </FormItem>
                                                            )}
                                                        />

                                                        {form.watch("recurrenceType") === "WEEKLY" && (
                                                            <FormField
                                                                control={form.control}
                                                                name="recurrenceDays"
                                                                render={({ field: daysField }) => (
                                                                    <FormItem className="space-y-2">
                                                                        <FormLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Days of Week</FormLabel>
                                                                        <div className="flex flex-wrap gap-1.5">
                                                                            {["S", "M", "T", "W", "T", "F", "S"].map((day, idx) => {
                                                                                const isSelected = daysField.value?.split(",").includes(idx.toString());
                                                                                return (
                                                                                    <Button
                                                                                        key={`${day}-${idx}`}
                                                                                        type="button"
                                                                                        variant={isSelected ? "default" : "outline"}
                                                                                        className={cn(
                                                                                            "h-8 w-8 p-0 rounded-md text-[10px] transition-all",
                                                                                            isSelected ? "bg-primary text-white" : "text-slate-500"
                                                                                        )}
                                                                                        onClick={() => {
                                                                                            const current = daysField.value ? daysField.value.split(",") : [];
                                                                                            const next = current.includes(idx.toString())
                                                                                                ? current.filter(d => d !== idx.toString())
                                                                                                : [...current, idx.toString()];
                                                                                            daysField.onChange(next.sort().join(","));
                                                                                        }}
                                                                                    >
                                                                                        {day}
                                                                                    </Button>
                                                                                );
                                                                            })}
                                                                        </div>
                                                                    </FormItem>
                                                                )}
                                                            />
                                                        )}

                                                        {(form.watch("recurrenceType") === "DAILY" || form.watch("recurrenceType") === "CUSTOM") && (
                                                            <FormField
                                                                control={form.control}
                                                                name="recurrenceInterval"
                                                                render={({ field: intervalField }) => (
                                                                    <FormItem className="space-y-1.5">
                                                                        <FormLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                                                            Repeat Every {intervalField.value} {intervalField.value === 1 ? 'Day' : 'Days'}
                                                                        </FormLabel>
                                                                        <FormControl>
                                                                            <div className="flex items-center gap-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg h-9 px-2">
                                                                                <Button
                                                                                    type="button"
                                                                                    variant="ghost"
                                                                                    size="icon"
                                                                                    className="h-7 w-7"
                                                                                    onClick={() => intervalField.onChange(Math.max(1, (intervalField.value || 1) - 1))}
                                                                                >
                                                                                    <Minus className="h-3 w-3" />
                                                                                </Button>
                                                                                <span className="text-sm font-medium flex-1 text-center">{intervalField.value || 1}</span>
                                                                                <Button
                                                                                    type="button"
                                                                                    variant="ghost"
                                                                                    size="icon"
                                                                                    className="h-7 w-7"
                                                                                    onClick={() => intervalField.onChange(Math.min(365, (intervalField.value || 1) + 1))}
                                                                                >
                                                                                    <Plus className="h-3 w-3" />
                                                                                </Button>
                                                                            </div>
                                                                        </FormControl>
                                                                    </FormItem>
                                                                )}
                                                            />
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                                <Button
                                    variant="outline"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        onOpenChange(false);
                                    }}
                                    className="rounded-full h-10 px-6 border-slate-200 text-slate-900 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={createTask.isPending || updateTask.isPending}
                                    className="rounded-full h-10 px-6 bg-primary hover:bg-primary/90 text-white shadow-sm"
                                >
                                    {(createTask.isPending || updateTask.isPending) && (
                                        <LoadingSpinner spinnerSize={16} className="mr-2" />
                                    )}
                                    {taskToEdit ? "Save Changes" : "Create Task"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
