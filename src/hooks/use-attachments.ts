import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Attachment } from "@prisma/client";
import { toast } from "sonner";

export const attachmentKeys = {
    all: ["attachments"] as const,
    list: (taskId: string) => [...attachmentKeys.all, "list", taskId] as const,
};

export function useAttachments(taskId: string) {
    return useQuery({
        queryKey: attachmentKeys.list(taskId),
        queryFn: async () => {
            const response = await fetch(`/api/tasks/${taskId}/attachments`);
            if (!response.ok) {
                throw new Error("Failed to fetch attachments");
            }
            return response.json() as Promise<Attachment[]>;
        },
        enabled: !!taskId,
    });
}

export function useAddAttachment(taskId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: { name: string; url: string; type: "FILE" | "LINK"; size?: number; mimeType?: string }) => {
            const response = await fetch(`/api/tasks/${taskId}/attachments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error("Failed to add attachment");
            }
            return response.json() as Promise<Attachment>;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: attachmentKeys.list(taskId) });
            queryClient.invalidateQueries({ queryKey: ["tasks", "detail", taskId] });
            toast.success("Attachment added");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to add attachment");
        },
    });
}

export function useUploadFile(taskId: string) {
    const addAttachment = useAddAttachment(taskId);

    return useMutation({
        mutationFn: async (file: File) => {
            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Upload failed");
            }

            const uploadResult = await response.json();

            return addAttachment.mutateAsync({
                name: uploadResult.name,
                url: uploadResult.url,
                type: "FILE",
                size: uploadResult.size,
                mimeType: uploadResult.mimeType,
            });
        },
        onError: (error: any) => {
            toast.error(error.message || "Upload failed");
        },
    });
}

export function useDeleteAttachment(taskId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (attachmentId: string) => {
            const response = await fetch(`/api/tasks/${taskId}/attachments/${attachmentId}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Failed to delete attachment");
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: attachmentKeys.list(taskId) });
            queryClient.invalidateQueries({ queryKey: ["tasks", "detail", taskId] });
            toast.success("Attachment removed");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to delete attachment");
        },
    });
}
