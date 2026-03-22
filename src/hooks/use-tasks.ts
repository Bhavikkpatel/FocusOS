import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { Task, TaskStatus, TaskPriority, PomodoroSession, SubTask, Project, Tag, Category, TaskDifficulty, Attachment } from "@prisma/client";
import { toast } from "sonner";

export type TaskWithSessions = Task & {
    projectRef: Project | null;
    pomodoroSessions: (PomodoroSession & { rating?: number | null })[];
    subtasks: SubTask[];
    tags: Tag[];
    category: Category | null;
    pomodoroDuration: number;
    autoComplete?: boolean;
    isRecurring: boolean;
    recurrenceType?: string | null;
    recurrenceInterval?: number | null;
    recurrenceDays?: string | null;
    lastOccurrenceId?: string | null;
    attachments: Attachment[];
};

// Query Keys
export const taskKeys = {
    all: ["tasks"] as const,
    lists: () => [...taskKeys.all, "list"] as const,
    list: (filters: TaskFilters) => [...taskKeys.lists(), { ...filters }] as const,
    details: () => [...taskKeys.all, "detail"] as const,
    detail: (id: string) => [...taskKeys.details(), id] as const,
};

export interface TaskFilters {
    status?: TaskStatus | "ALL";
    priority?: TaskPriority;
    difficulty?: TaskDifficulty;
    project?: string;
    tagId?: string;
    categoryId?: string;
    dueDate?: "today" | "all";
    unallocatedOnly?: boolean;
    search?: string;
}

export interface CreateTaskInput {
    title: string;
    description?: string;
    priority?: TaskPriority;
    difficulty?: TaskDifficulty | null;
    estimatedPomodoros?: number;
    project?: string;
    projectId?: string | null;
    columnId?: string | null;
    categoryId?: string | null;
    tags?: string[];
    dueDate?: Date | null;
    autoComplete?: boolean;
    status?: TaskStatus;
    isRecurring?: boolean;
    recurrenceType?: "DAILY" | "WEEKLY" | "MONTHLY" | "CUSTOM" | null;
    recurrenceInterval?: number | null;
    recurrenceDays?: string | null;
}

export interface UpdateTaskInput extends Partial<CreateTaskInput> {
    id: string;
    status?: TaskStatus;
    completedPomodoros?: number;
    tags?: string[];
    notes?: string;
    columnId?: string | null;
    categoryId?: string | null;
    difficulty?: TaskDifficulty | null;
    columnOrder?: number;
    autoComplete?: boolean;
    isRecurring?: boolean;
    recurrenceType?: "DAILY" | "WEEKLY" | "MONTHLY" | "CUSTOM" | null;
    recurrenceInterval?: number | null;
    recurrenceDays?: string | null;
}

// Hooks
export interface TasksResponse {
    tasks: TaskWithSessions[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export function useTasks(filters: TaskFilters = {}) {
    return useInfiniteQuery({
        queryKey: taskKeys.list(filters),
        queryFn: async ({ pageParam = 1 }) => {
            const params = new URLSearchParams();
            params.append("page", pageParam.toString());
            params.append("limit", "20");

            if (filters.status && filters.status !== "ALL") params.append("status", filters.status);
            if (filters.priority) params.append("priority", filters.priority);
            if (filters.difficulty) params.append("difficulty", filters.difficulty);
            if (filters.project) params.append("project", filters.project);
            if (filters.tagId) params.append("tagId", filters.tagId);
            if (filters.categoryId) params.append("categoryId", filters.categoryId);
            if (filters.dueDate) params.append("dueDate", filters.dueDate);
            if (filters.unallocatedOnly) params.append("unallocatedOnly", "true");
            if (filters.search) params.append("search", filters.search);

            const response = await fetch(`/api/tasks?${params.toString()}`);
            if (!response.ok) {
                throw new Error("Failed to fetch tasks");
            }
            return response.json() as Promise<TasksResponse>;
        },
        getNextPageParam: (lastPage: TasksResponse) => {
            if (lastPage.meta.page < lastPage.meta.totalPages) {
                return lastPage.meta.page + 1;
            }
            return undefined;
        },
        initialPageParam: 1,
        placeholderData: (previousData) => previousData,
    });
}

export function useCreateTask() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (newTask: CreateTaskInput) => {
            const response = await fetch("/api/tasks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newTask),
            });

            if (!response.ok) {
                throw new Error("Failed to create task");
            }
            return response.json() as Promise<Task>;
        },
        onMutate: () => {
            const toastId = toast.loading("Creating task...");
            return { toastId };
        },
        onSuccess: async (_, __, context) => {
            toast.success("Task created", { id: context?.toastId });
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: taskKeys.all }),
                queryClient.invalidateQueries({ queryKey: ["projects"] }),
                queryClient.invalidateQueries({ queryKey: ["project"] })
            ]);
        },
        onError: (error, _, context) => {
            toast.error(`Error: ${error.message}`, { id: context?.toastId });
        },
    });
}

export function useUpdateTask() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...data }: UpdateTaskInput) => {
            const response = await fetch(`/api/tasks/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Failed to update task");
            }
            return response.json() as Promise<Task>;
        },
        // Optimistic Update
        onMutate: async (updatedTask) => {
            const toastId = toast.loading("Updating task...");
            await queryClient.cancelQueries({ queryKey: taskKeys.lists() });
            await queryClient.cancelQueries({ queryKey: ["project"] });

            const previousTasks = queryClient.getQueryData<unknown>(taskKeys.lists());

            // Optimistically update the single project view cache
            queryClient.setQueriesData({ queryKey: ["project"] }, (oldData: unknown) => {
                if (!oldData || typeof oldData !== 'object') return oldData;

                const data = oldData as Record<string, unknown>;

                // If it's the ProjectWithStats object
                if (data.columns && Array.isArray(data.columns)) {
                    let taskToMove: TaskWithSessions | null = null;

                    // 1. Find the task and remove it from its current column if columnId is changing
                    const updatedColumns = data.columns.map((col: Record<string, unknown>) => {
                        const colTasks = col.tasks as TaskWithSessions[] | undefined;
                        const taskIndex = colTasks?.findIndex((t: TaskWithSessions) => t.id === updatedTask.id);
                        if (colTasks && taskIndex !== undefined && taskIndex > -1) {
                            taskToMove = { ...colTasks[taskIndex], ...updatedTask } as unknown as TaskWithSessions;
                            // If columnId changed, remove from this column
                            if (updatedTask.columnId && updatedTask.columnId !== col.id) {
                                return {
                                    ...col,
                                    tasks: colTasks.filter((t: TaskWithSessions) => t.id !== updatedTask.id)
                                };
                            }
                            // Otherwise just update in place
                            const newTasks = [...colTasks];
                            newTasks[taskIndex] = taskToMove!;
                            return { ...col, tasks: newTasks };
                        }
                        return col;
                    });

                    // 2. If task was moved to a different column, add it to the new column
                    if (taskToMove && updatedTask.columnId) {
                        const targetColIndex = updatedColumns.findIndex((c: Record<string, unknown>) => c.id === updatedTask.columnId);
                        const sourceColIndex = data.columns.findIndex((c: Record<string, unknown>) => {
                            const cTasks = c.tasks as TaskWithSessions[] | undefined;
                            return cTasks?.some((t: TaskWithSessions) => t.id === updatedTask.id);
                        });

                        if (targetColIndex > -1 && targetColIndex !== sourceColIndex) {
                            const targetTasks = updatedColumns[targetColIndex].tasks as TaskWithSessions[] | undefined;
                            updatedColumns[targetColIndex] = {
                                ...updatedColumns[targetColIndex],
                                tasks: [...(targetTasks || []), taskToMove]
                            };
                        }
                    }

                    return { ...data, columns: updatedColumns };
                }
                return oldData;
            });

            // Optimistically update the infinite tasks list cache
            queryClient.setQueriesData({ queryKey: taskKeys.lists() }, (oldData: unknown) => {
                const data = oldData as { pages?: { tasks: TaskWithSessions[] }[] };
                if (!data?.pages) return oldData;
                return {
                    ...data,
                    pages: data.pages.map((page) => ({
                        ...page,
                        tasks: page.tasks.map((t) => t.id === updatedTask.id ? { ...t, ...updatedTask } : t)
                    }))
                };
            });

            // Optimistically update the individual task detail cache
            queryClient.setQueryData(taskKeys.detail(updatedTask.id), (oldData: unknown) => {
                if (!oldData) return oldData;
                return { ...(oldData as Record<string, unknown>), ...updatedTask };
            });

            return { previousTasks, toastId };
        },
        onSuccess: (_, __, context) => {
            toast.success("Task updated", { id: context?.toastId });
        },
        onError: (err, _newTodo, context) => {
            // context.previousTasks is correct type if we typed checking above properly
            if (context?.previousTasks) {
                queryClient.setQueryData(taskKeys.lists(), context.previousTasks);
            }
            toast.error(err.message || "Failed to update task", { id: context?.toastId });
        },
        onSettled: async () => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: taskKeys.all }),
                queryClient.invalidateQueries({ queryKey: ["projects"] }),
                queryClient.invalidateQueries({ queryKey: ["project"] })
            ]);
        },
    });
}

export function useDeleteTask() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/tasks/${id}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("Failed to delete task");
            return res.json();
        },
        onMutate: () => {
            const toastId = toast.loading("Deleting task...");
            return { toastId };
        },
        onSuccess: async (_, __, context) => {
            toast.success("Task deleted", { id: context?.toastId });
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: taskKeys.all }),
                queryClient.invalidateQueries({ queryKey: ["project"] })
            ]);
        },
        onError: (error, _, context) => {
            toast.error(`Failed to delete task: ${error.message}`, { id: context?.toastId });
        },
    });
}

export function useTask(id: string | null) {
    return useQuery({
        queryKey: taskKeys.detail(id || ""),
        queryFn: async () => {
            if (!id) return null;
            const res = await fetch(`/api/tasks/${id}`);
            if (!res.ok) throw new Error("Failed to fetch task");
            return res.json() as Promise<TaskWithSessions>;
        },
        enabled: !!id,
        placeholderData: (previousData) => previousData,
    });
}

// Pomodoro Rating Hook
export function useRateSession() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, rating }: { id: string, rating: number }) => {
            const res = await fetch(`/api/pomodoro/${id}/rating`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ rating }),
            });
            if (!res.ok) throw new Error("Failed to rate session");
            return res.json();
        },
        onMutate: () => {
            const toastId = toast.loading("Saving rating...");
            return { toastId };
        },
        onSuccess: async (_, __, context) => {
            toast.success("Focus rated successfully", { id: context?.toastId });
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: taskKeys.lists() }),
                queryClient.invalidateQueries({ queryKey: ["project"] })
            ]);
        },
        onError: (_, __, context) => {
            toast.error("Failed to save rating", { id: context?.toastId });
        },
    });
}
