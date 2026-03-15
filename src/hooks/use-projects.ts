"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface ProjectWithStats {
    id: string;
    name: string;
    description: string | null;
    color: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
    columns: Column[];
    totalTasks: number;
    completedTasks: number;
    totalFocusTime: number;
}

export interface Column {
    id: string;
    name: string;
    sortOrder: number;
    projectId: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tasks?: any[];
}

// Fetch all projects
export function useProjects() {
    return useQuery<ProjectWithStats[]>({
        queryKey: ["projects"],
        queryFn: async () => {
            const res = await fetch("/api/projects");
            if (!res.ok) throw new Error("Failed to fetch projects");
            return res.json();
        },
    });
}

// Fetch single project with columns + tasks
export function useProject(id: string | undefined) {
    return useQuery({
        queryKey: ["project", id],
        queryFn: async () => {
            const res = await fetch(`/api/projects/${id}`);
            if (!res.ok) throw new Error("Failed to fetch project");
            return res.json();
        },
        enabled: !!id,
    });
}

// Create project
export function useCreateProject() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: {
            name: string;
            description?: string;
            color?: string;
        }) => {
            const res = await fetch("/api/projects", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("Failed to create project");
            return res.json();
        },
        onMutate: () => {
            const toastId = toast.loading("Creating project...");
            return { toastId };
        },
        onSuccess: async (_, __, context) => {
            toast.success("Project created", { id: context?.toastId });
            await queryClient.invalidateQueries({ queryKey: ["projects"] });
        },
        onError: (error, _, context) => {
            toast.error(`Error: ${error.message}`, { id: context?.toastId });
        },
    });
}

// Update project
export function useUpdateProject() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({
            id,
            ...data
        }: {
            id: string;
            name?: string;
            description?: string;
            color?: string;
        }) => {
            const res = await fetch(`/api/projects/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("Failed to update project");
            return res.json();
        },
        onMutate: () => {
            const toastId = toast.loading("Updating project...");
            return { toastId };
        },
        onSuccess: async (_, variables, context) => {
            toast.success("Project updated", { id: context?.toastId });
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ["projects"] }),
                queryClient.invalidateQueries({ queryKey: ["project", variables.id] }),
                queryClient.invalidateQueries({ queryKey: ["project"] })
            ]);
        },
        onError: (error, _, context) => {
            toast.error(`Error: ${error.message}`, { id: context?.toastId });
        },
    });
}

// Delete project
export function useDeleteProject() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({
            id,
            action,
        }: {
            id: string;
            action: "move_to_inbox" | "delete_tasks";
        }) => {
            const res = await fetch(
                `/api/projects/${id}?action=${action}`,
                { method: "DELETE" }
            );
            if (!res.ok) throw new Error("Failed to delete project");
            return res.json();
        },
        onMutate: () => {
            const toastId = toast.loading("Deleting project...");
            return { toastId };
        },
        onSuccess: async (_, __, context) => {
            toast.success("Project deleted", { id: context?.toastId });
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ["projects"] }),
                queryClient.invalidateQueries({ queryKey: ["tasks"] })
            ]);
        },
        onError: (error, _, context) => {
            toast.error(`Error: ${error.message}`, { id: context?.toastId });
        },
    });
}
