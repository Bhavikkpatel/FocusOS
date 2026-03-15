"use client";

import { Sidebar } from "./sidebar";
import { Header } from "@/components/header";
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
            <DashboardContent noPadding={noPadding}>
                {children}
            </DashboardContent>
        </div>
    );
}
