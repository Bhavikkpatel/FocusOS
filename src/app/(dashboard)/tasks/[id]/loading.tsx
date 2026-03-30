"use client";

import { TaskExpandedSkeleton } from "@/components/tasks/task-skeleton";
import { useRouter } from "next/navigation";

export default function TaskLoading() {
    const router = useRouter();
    
    return (
        <TaskExpandedSkeleton onClose={() => router.back()} />
    );
}
