"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface ColumnData {
    id: string;
    name: string;
    sortOrder: number;
    projectId: string;
    _count?: { tasks: number };
}

// Fetch columns for a project
export function useColumns(projectId: string | undefined) {
    return useQuery<ColumnData[]>({
        queryKey: ["columns", projectId],
        queryFn: async () => {
            const res = await fetch(`/api/projects/${projectId}/columns`);
            if (!res.ok) throw new Error("Failed to fetch columns");
            return res.json();
        },
        enabled: !!projectId,
    });
}

// Create column
export function useCreateColumn() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({
            projectId,
            name,
        }: {
            projectId: string;
            name: string;
        }) => {
            const res = await fetch(`/api/projects/${projectId}/columns`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name }),
            });
            if (!res.ok) throw new Error("Failed to create column");
            return res.json();
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["columns", variables.projectId],
            });
            queryClient.invalidateQueries({
                queryKey: ["project", variables.projectId],
            });
        },
    });
}

// Update column (rename, reorder)
export function useUpdateColumn() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({
            projectId,
            colId,
            ...data
        }: {
            projectId: string;
            colId: string;
            name?: string;
            sortOrder?: number;
        }) => {
            const res = await fetch(
                `/api/projects/${projectId}/columns/${colId}`,
                {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                }
            );
            if (!res.ok) throw new Error("Failed to update column");
            return res.json();
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["columns", variables.projectId],
            });
            queryClient.invalidateQueries({
                queryKey: ["project", variables.projectId],
            });
        },
    });
}

// Delete column
export function useDeleteColumn() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({
            projectId,
            colId,
        }: {
            projectId: string;
            colId: string;
        }) => {
            const res = await fetch(
                `/api/projects/${projectId}/columns/${colId}`,
                { method: "DELETE" }
            );
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to delete column");
            }
            return res.json();
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["columns", variables.projectId],
            });
            queryClient.invalidateQueries({
                queryKey: ["project", variables.projectId],
            });
        },
    });
}
