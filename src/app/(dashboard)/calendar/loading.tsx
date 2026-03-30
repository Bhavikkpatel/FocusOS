"use client";

import { LoadingBox } from "@/components/ui/loading-state";

export default function CalendarLoading() {
    return (
        <div className="h-full flex flex-col space-y-6 animate-in fade-in duration-500 overflow-hidden">
            <div className="flex items-center justify-between px-6 pt-2">
                <div className="space-y-2">
                    <div className="h-8 w-40 rounded-xl bg-white/5 animate-pulse" />
                    <div className="h-4 w-64 rounded-md bg-white/5 animate-pulse" />
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-10 w-24 rounded-xl bg-white/5 animate-pulse" />
                    <div className="h-10 w-24 rounded-xl bg-white/5 animate-pulse" />
                </div>
            </div>
            <div className="flex-1 px-6 pb-6">
                <LoadingBox text="SYNCHRONIZING TIMELINE..." className="h-full min-h-[600px]" />
            </div>
        </div>
    );
}
