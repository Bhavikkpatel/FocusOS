import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Tag } from "@prisma/client";
import { toast } from "sonner";

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
        onMutate: async (newTagData) => {
            const toastId = toast.loading("Creating tag...");
            
            await queryClient.cancelQueries({ queryKey: ["tags"] });
            const previousTags = queryClient.getQueryData<Tag[]>(["tags"]);

            // Optimistically update to the new value
            if (previousTags) {
                queryClient.setQueryData<Tag[]>(["tags"], (old) => {
                    if (!old) return [];
                    // Create a temporary tag with a fake ID
                    const optimisticTag: Tag = {
                        id: `temp-${Date.now()}`,
                        name: newTagData.name,
                        color: newTagData.color || null,
                        userId: "temp-user",
                        createdAt: new Date(),
                        updatedAt: new Date()
                    };
                    return [...old, optimisticTag];
                });
            }

            return { previousTags, toastId };
        },
        onSuccess: (_, __, context) => {
            toast.success("Tag created", { id: context?.toastId });
        },
        onError: (error, _, context) => {
            if (context?.previousTags) {
                queryClient.setQueryData(["tags"], context.previousTags);
            }
            toast.error(error.message || "Failed to create tag", { id: context?.toastId });
        },
        onSettled: () => {
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
        onMutate: async ({ id, data }) => {
            const toastId = toast.loading("Updating tag...");
            
            await queryClient.cancelQueries({ queryKey: ["tags"] });
            const previousTags = queryClient.getQueryData<Tag[]>(["tags"]);

            // Optimistically update to the new value
            if (previousTags) {
                queryClient.setQueryData<Tag[]>(["tags"], (old) => {
                    if (!old) return [];
                    return old.map(tag => 
                        tag.id === id ? { ...tag, ...data } : tag
                    );
                });
            }

            return { previousTags, toastId };
        },
        onSuccess: (_, __, context) => {
            toast.success("Tag updated", { id: context?.toastId });
            // Optionally invalidate tasks to update tag display
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
        },
        onError: (error, _, context) => {
            if (context?.previousTags) {
                queryClient.setQueryData(["tags"], context.previousTags);
            }
            toast.error(error.message || "Failed to update tag", { id: context?.toastId });
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["tags"] });
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
        onMutate: async (id) => {
            const toastId = toast.loading("Deleting tag...");
            
            await queryClient.cancelQueries({ queryKey: ["tags"] });
            const previousTags = queryClient.getQueryData<Tag[]>(["tags"]);

            // Optimistically update to the new value
            if (previousTags) {
                queryClient.setQueryData<Tag[]>(["tags"], (old) => {
                    if (!old) return [];
                    return old.filter(tag => tag.id !== id);
                });
            }

            return { previousTags, toastId };
        },
        onSuccess: (_, __, context) => {
            toast.success("Tag deleted", { id: context?.toastId });
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
        },
        onError: (error, _, context) => {
            if (context?.previousTags) {
                queryClient.setQueryData(["tags"], context.previousTags);
            }
            toast.error(error.message || "Failed to delete tag", { id: context?.toastId });
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["tags"] });
        }
    });
}
