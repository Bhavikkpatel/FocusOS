import { useQuery } from "@tanstack/react-query";
import { TaskStatus, TaskPriority } from "@prisma/client";

export interface SearchTaskResult {
    id: string;
    title: string;
    status: TaskStatus;
    priority: TaskPriority;
    projectRef: {
        id: string;
        name: string;
        color: string;
    } | null;
}

export interface SearchProjectResult {
    id: string;
    name: string;
    color: string;
    _count: { tasks: number };
}

export interface SearchTagResult {
    id: string;
    name: string;
    color: string | null;
}

export interface SearchResponse {
    tasks: SearchTaskResult[];
    projects: SearchProjectResult[];
    tags: SearchTagResult[];
}

export function useGlobalSearch(query: string) {
    return useQuery({
        queryKey: ["search", query],
        queryFn: async () => {
            if (!query.trim()) {
                return { tasks: [], projects: [], tags: [] } as SearchResponse;
            }
            
            const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
            if (!res.ok) {
                throw new Error("Failed to fetch search results");
            }
            return res.json() as Promise<SearchResponse>;
        },
        enabled: Boolean(query.trim().length > 0),
        staleTime: 60 * 1000, 
    });
}
