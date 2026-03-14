"use client";

import {
    FolderOpen,
    LayoutGrid,
    List,
    Pencil,
    Trash2,
    Clock,
    CheckCircle2,
    ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

function formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
}

interface ProjectHeaderProps {
    project: {
        id: string;
        name: string;
        description?: string | null;
        color: string;
        totalTasks: number;
        completedTasks: number;
        totalFocusTime: number;
    };
    viewMode: "board" | "list";
    onViewModeChange: (mode: "board" | "list") => void;
    onEdit: () => void;
    onDelete: () => void;
}

export function ProjectHeader({
    project,
    viewMode,
    onViewModeChange,
    onEdit,
    onDelete,
}: ProjectHeaderProps) {
    const progress = project.totalTasks > 0
        ? Math.round((project.completedTasks / project.totalTasks) * 100)
        : 0;

    return (
        <div className="border-b bg-white dark:bg-slate-900 px-6 py-4">
            <div className="flex items-center justify-between">
                {/* Left: Back + Project info */}
                <div className="flex items-center gap-4">
                    <Link
                        href="/projects"
                        className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>

                    <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${project.color}20` }}
                    >
                        <FolderOpen
                            className="h-5 w-5"
                            style={{ color: project.color }}
                        />
                    </div>

                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                            {project.name}
                        </h1>
                        {project.description && (
                            <p className="text-sm text-muted-foreground mt-0.5">
                                {project.description}
                            </p>
                        )}
                    </div>
                </div>

                {/* Right: Stats + Controls */}
                <div className="flex items-center gap-4">
                    {/* Stats */}
                    <div className="hidden md:flex items-center gap-4 text-sm text-muted-foreground mr-2">
                        <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <span>
                                {project.completedTasks}/{project.totalTasks}
                            </span>
                        </div>
                        <div
                            className="flex items-center gap-1.5 font-medium"
                            style={{ color: project.color }}
                        >
                            <span>{progress}%</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Clock className="h-4 w-4" />
                            <span>{formatTime(project.totalFocusTime)}</span>
                        </div>
                    </div>

                    {/* View Toggle */}
                    <div className="flex items-center border rounded-lg p-0.5 bg-slate-100 dark:bg-slate-800">
                        <button
                            onClick={() => onViewModeChange("board")}
                            className={cn(
                                "p-1.5 rounded-md transition-colors",
                                viewMode === "board"
                                    ? "bg-white dark:bg-slate-700 shadow-sm text-foreground"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => onViewModeChange("list")}
                            className={cn(
                                "p-1.5 rounded-md transition-colors",
                                viewMode === "list"
                                    ? "bg-white dark:bg-slate-700 shadow-sm text-foreground"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <List className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Actions */}
                    <Button variant="ghost" size="icon" onClick={onEdit}>
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onDelete}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
