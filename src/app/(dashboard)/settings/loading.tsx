"use client";

import { LoadingBox } from "@/components/ui/loading-state";

export default function SettingsLoading() {
    return (
        <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-500 py-12 px-6">
            <div className="space-y-4">
                <div className="h-10 w-48 rounded-xl bg-white/5 animate-pulse" />
                <div className="h-4 w-64 rounded-md bg-white/5 animate-pulse" />
            </div>
            
            <div className="space-y-8">
                <LoadingBox text="CONFIGURING ENVIRONMENT..." className="min-h-[400px]" />
                <LoadingBox text="KEYBOARD MAPPINGS..." className="min-h-[300px]" />
            </div>
        </div>
    );
}
