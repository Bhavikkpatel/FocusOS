"use client";

import { LoadingBox } from "@/components/ui/loading-state";

export default function DashboardLoading() {
    return (
        <div className="space-y-8 pb-16 max-w-[1600px] mx-auto animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                    <div className="h-10 w-64 rounded-xl bg-white/5 animate-pulse" />
                    <div className="h-4 w-48 rounded-md bg-white/5 animate-pulse" />
                </div>
            </div>
            <LoadingBox text="ORCHESTRATING LAUNCHPAD..." className="min-h-[600px] border-none bg-transparent" />
        </div>
    );
}
