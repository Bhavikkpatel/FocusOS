import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SubTask } from "@prisma/client";
import { toast } from "sonner";
import { taskKeys } from "./use-tasks";

// Query Keys
export const subtaskKeys = {
    all: ["subtasks"] as const,
    list: (taskId: string) => [...subtaskKeys.all, taskId] as const,
};

// Hooks
export function useSubtasks(taskId: string) {
    return useQuery({
        queryKey: subtaskKeys.list(taskId),
        queryFn: async () => {
            const response = await fetch(`/api/tasks/${taskId}/subtasks`);
            if (!response.ok) {
                throw new Error("Failed to fetch subtasks");
            }
            return response.json() as Promise<SubTask[]>;
        },
        enabled: !!taskId,
    });
}

export function useCreateSubtask() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ taskId, title }: { taskId: string; title: string }) => {
            const response = await fetch(`/api/tasks/${taskId}/subtasks`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title }),
            });

            if (!response.ok) {
                throw new Error("Failed to create subtask");
            }
            return response.json() as Promise<SubTask>;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: subtaskKeys.list(data.taskId) });
            queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
        },
        onError: (error) => {
            toast.error(`Error: ${error.message}`);
        },
    });
}

export function useUpdateSubtask() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            taskId,
            subtaskId,
            ...data
        }: {
            taskId: string;
            subtaskId: string;
            title?: string;
            notes?: string | null;
            isCompleted?: boolean;
            sortOrder?: number;
        }) => {
            const response = await fetch(`/api/tasks/${taskId}/subtasks/${subtaskId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error("Failed to update subtask");
            }
            return response.json() as Promise<SubTask>;
        },
        // Optimistic toggle for isCompleted
        onMutate: async (variables) => {
            await queryClient.cancelQueries({ queryKey: subtaskKeys.list(variables.taskId) });
            const previous = queryClient.getQueryData<SubTask[]>(subtaskKeys.list(variables.taskId));

            if (previous && variables.isCompleted !== undefined) {
                queryClient.setQueryData<SubTask[]>(
                    subtaskKeys.list(variables.taskId),
                    previous.map((s) =>
                        s.id === variables.subtaskId
                            ? { ...s, isCompleted: variables.isCompleted! }
                            : s
                    )
                );
            }

            return { previous };
        },
        onError: (_err, variables, context) => {
            if (context?.previous) {
                queryClient.setQueryData(subtaskKeys.list(variables.taskId), context.previous);
            }
            toast.error("Failed to update subtask");
        },
        onSettled: (_data, _err, variables) => {
            queryClient.invalidateQueries({ queryKey: subtaskKeys.list(variables.taskId) });
            queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
        },
    });
}

export function useDeleteSubtask() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ taskId, subtaskId }: { taskId: string; subtaskId: string }) => {
            const response = await fetch(`/api/tasks/${taskId}/subtasks/${subtaskId}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Failed to delete subtask");
            }
            return response.json();
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: subtaskKeys.list(variables.taskId) });
            queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
        },
        onError: () => {
            toast.error("Failed to delete subtask");
        },
    });
}
