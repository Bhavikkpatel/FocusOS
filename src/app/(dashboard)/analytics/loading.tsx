"use client";

import { LoadingBox } from "@/components/ui/loading-state";

export default function AnalyticsLoading() {
    return (
        <div className="space-y-12 pb-16 max-w-7xl mx-auto py-10 px-6 animate-in fade-in duration-500">
            <div className="space-y-4">
                <div className="h-10 w-64 rounded-xl bg-white/5 animate-pulse" />
                <div className="h-4 w-96 rounded-md bg-white/5 animate-pulse" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <LoadingBox text="COMPILING PERFORMANCE METRICS..." className="min-h-[400px]" />
                <LoadingBox text="DATA VISTA GENERATING..." className="min-h-[400px]" />
            </div>
        </div>
    );
}
