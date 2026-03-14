import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Category } from "@prisma/client";

export function useCategories() {
    return useQuery<Category[]>({
        queryKey: ["categories"],
        queryFn: async () => {
            const res = await fetch("/api/categories");
            if (!res.ok) throw new Error("Failed to fetch categories");
            return res.json();
        }
    });
}

export function useCreateCategory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: { name: string }) => {
            const res = await fetch("/api/categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error(await res.text());
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["categories"] });
        }
    });
}

export function useUpdateCategory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }: { id: string, data: { name: string } }) => {
            const res = await fetch(`/api/categories/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error(await res.text());
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["categories"] });
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
        }
    });
}

export function useDeleteCategory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/categories/${id}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error(await res.text());
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["categories"] });
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
        }
    });
}
