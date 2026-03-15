"use client";

import { Sidebar } from "./sidebar";
import { Header } from "@/components/header";
import { Suspense } from "react";

import { cn } from "@/lib/utils";

function DashboardContent({ 
    children, 
    noPadding 
}: { 
    children: React.ReactNode; 
    noPadding: boolean 
}) {
    return (
        <main className="flex-1 flex flex-col h-full overflow-hidden relative">
            <Header />
            <div className={cn(
                "flex-1 overflow-y-auto scroll-smooth relative",
                !noPadding && "p-4 md:p-8 space-y-8"
            )}>
                {children}
            </div>
        </main>
    );
}

export function DashboardLayout({
    children,
    noPadding = false
}: {
    children: React.ReactNode;
    noPadding?: boolean;
}) {
    return (
        <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300">
            <Sidebar />
            <Suspense fallback={
                <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                    <div className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 animate-pulse" />
                    <div className="flex-1 p-4 md:p-8 space-y-8 animate-pulse">
                        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/4 mb-4" />
                        <div className="h-4 bg-slate-100 dark:bg-slate-900 rounded w-1/2" />
                    </div>
                </main>
            }>
                <DashboardContent noPadding={noPadding}>
                    {children}
                </DashboardContent>
            </Suspense>
        </div>
    );
}
