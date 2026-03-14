import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Tag } from "@prisma/client";

export function useTags() {
    return useQuery<Tag[]>({
        queryKey: ["tags"],
        queryFn: async () => {
            const res = await fetch("/api/tags");
            if (!res.ok) throw new Error("Failed to fetch tags");
            return res.json();
        }
    });
}

export function useCreateTag() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: { name: string; color?: string | null }) => {
            const res = await fetch("/api/tags", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error(await res.text());
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tags"] });
        }
    });
}

export function useUpdateTag() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }: { id: string, data: { name?: string; color?: string | null } }) => {
            const res = await fetch(`/api/tags/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error(await res.text());
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tags"] });
            // Optionally invalidate tasks to update tag display
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
        }
    });
}

export function useDeleteTag() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/tags/${id}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error(await res.text());
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tags"] });
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
        }
    });
}
