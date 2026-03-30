"use client";

import { LoadingBox } from "@/components/ui/loading-state";

export default function ProjectsLoading() {
    return (
        <div className="space-y-8 pb-16 max-w-7xl mx-auto animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-6">
                <div className="space-y-2">
                    <div className="h-10 w-48 rounded-xl bg-white/5 animate-pulse" />
                    <div className="h-4 w-64 rounded-md bg-white/5 animate-pulse" />
                </div>
            </div>
            <div className="px-6">
                <LoadingBox text="ASSEMBLING WORKSPACES..." className="min-h-[500px]" />
            </div>
        </div>
    );
}
