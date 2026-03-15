"use client";

import {
    Search,
    Bell,
    Filter,
    ArrowUpDown,
    Plus,
    Menu
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useParams } from "next/navigation";
import { TaskDialog } from "@/components/tasks/task-dialog";
import { GlobalSearch } from "@/components/global-search";

import { useSidebarStore } from "@/store/sidebar";

export function Header() {
    const today = new Date();
    const params = useParams();
    const projectId = params?.id as string | undefined;
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const toggleSidebar = useSidebarStore((s) => s.toggle);

    return (
        <header className="h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 z-10 sticky top-0">
            {/* Left: Mobile Toggle & Date */}
            <div className="flex items-center gap-4">
                <button
                    className="md:hidden p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                    onClick={toggleSidebar}
                >
                    <Menu className="h-5 w-5" />
                </button>
                <div className="hidden sm:flex flex-col">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Today</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {format(today, "MMM d, EEEE")}
                    </span>
                </div>
            </div>

            {/* Center: Search */}
            <div className="flex-1 max-w-xl px-4 md:px-8">
                <div 
                    className="relative group cursor-text" 
                    onClick={() => setIsSearchOpen(true)}
                >
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                    </div>
                    <Input
                        className="block w-full pl-10 pr-3 py-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus-visible:ring-primary/20 focus-visible:border-primary shadow-sm cursor-text"
                        placeholder="Search tasks, projects, or tags..."
                        readOnly
                    />
                    <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                        <kbd className="hidden sm:inline-flex items-center border border-slate-200 dark:border-slate-600 rounded px-2 text-[10px] font-sans font-medium text-slate-400 bg-white dark:bg-slate-700">⌘J</kbd>
                    </div>
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
                <div className="hidden md:flex items-center gap-2">
                    <button className="p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 rounded-lg transition-colors relative" title="Notifications">
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
                    </button>
                    <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>
                    <Button variant="outline" size="sm" className="h-9 gap-2 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 shadow-sm">
                        <Filter className="h-4 w-4" />
                        <span>Filter</span>
                    </Button>
                    <Button variant="outline" size="sm" className="h-9 gap-2 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 shadow-sm">
                        <ArrowUpDown className="h-4 w-4" />
                        <span>Sort</span>
                    </Button>
                </div>
                <Button
                    className="gap-2 bg-primary hover:bg-primary/90 text-white shadow-md hover:shadow-lg transition-all active:scale-95"
                    onClick={() => setIsDialogOpen(true)}
                >
                    <Plus className="h-5 w-5" />
                    <span className="hidden sm:inline">New Task</span>
                </Button>
            </div>

            <TaskDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                defaultProject={projectId}
            />

            <GlobalSearch 
                open={isSearchOpen} 
                onOpenChange={setIsSearchOpen} 
            />
        </header>
    );
}
