/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useProjects, ProjectWithStats } from "@/hooks/use-projects";
import { ProjectDialog } from "./project-dialog";
import { Plus, FolderOpen, Clock, CheckCircle2, ListTodo, Edit, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDeleteProject } from "@/hooks/use-projects";
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
    ContextMenuSeparator,
    ContextMenuShortcut,
} from "@/components/ui/context-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Link from "next/link";

function formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
}

function ProjectCard({ project, onEdit }: { project: ProjectWithStats, onEdit: (project: ProjectWithStats) => void }) {
    const deleteProject = useDeleteProject();
    const router = useRouter();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const progress = project.totalTasks > 0
        ? Math.round((project.completedTasks / project.totalTasks) * 100)
        : 0;

    return (
        <>
            <ContextMenu>
                <ContextMenuTrigger asChild>
                    <Link href={`/projects/${project.id}`}>
                        <div className="group relative rounded-xl border bg-white dark:bg-slate-900 p-5 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 cursor-pointer overflow-hidden">
                            {/* Color accent bar */}
                            <div
                                className="absolute top-0 left-0 right-0 h-1 rounded-t-xl"
                                style={{ backgroundColor: project.color }}
                            />

                            {/* Header */}
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
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
                                        <h3 className="font-semibold text-slate-900 dark:text-white">
                                            {project.name}
                                        </h3>
                                        {project.description && (
                                            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                                                {project.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Progress bar */}
                            <div className="mb-3">
                                <div className="flex items-center justify-between text-xs mb-1">
                                    <span className="text-muted-foreground">Progress</span>
                                    <span className="font-medium" style={{ color: project.color }}>
                                        {progress}%
                                    </span>
                                </div>
                                <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-500"
                                        style={{
                                            width: `${progress}%`,
                                            backgroundColor: project.color,
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <ListTodo className="h-3.5 w-3.5" />
                                    <span>{project.totalTasks} tasks</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                                    <span>{project.completedTasks} done</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Clock className="h-3.5 w-3.5" />
                                    <span>{formatTime(project.totalFocusTime)}</span>
                                </div>
                            </div>
                        </div>
                    </Link>
                </ContextMenuTrigger>
                <ContextMenuContent className="w-64">
                    <ContextMenuItem onClick={() => router.push(`/projects/${project.id}`)}>
                        <FolderOpen className="mr-2 h-4 w-4" /> Open Project
                    </ContextMenuItem>
                    <ContextMenuItem
                        onClick={() => onEdit(project)}
                        disabled={project.name === "Daily"}
                    >
                        <Edit className="mr-2 h-4 w-4" /> Edit Project
                    </ContextMenuItem>
                    <ContextMenuSeparator />
                    <ContextMenuItem
                        disabled={project.name === "Daily"}
                        onClick={(e) => {
                            e.stopPropagation();
                        }}
                        onSelect={(e) => {
                            e.preventDefault();
                            setDeleteDialogOpen(true);
                        }}
                        className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950"
                    >
                        Delete Project
                        <ContextMenuShortcut>
                            <Trash2 className="h-4 w-4" />
                        </ContextMenuShortcut>
                    </ContextMenuItem>
                </ContextMenuContent>
            </ContextMenu>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure you want to delete this project?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This cannot be undone. Its tasks will be moved to the Inbox.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deleteProject.mutate({ id: project.id, action: "move_to_inbox" })}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            Delete Project
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

export function ProjectsList() {
    const { data: projects, isLoading, error } = useProjects();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<any | null>(null);

    const handleOpenCreate = () => {
        setEditingProject(null);
        setDialogOpen(true);
    };

    const handleOpenEdit = (project: ProjectWithStats) => {
        setEditingProject(project);
        setDialogOpen(true);
    };

    if (isLoading) {
        return <div className="p-8 text-center text-muted-foreground">Loading projects...</div>;
    }

    if (error) {
        return <div className="p-8 text-center text-red-500">Error loading projects</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-end justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                        Projects
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 text-base">
                        Organize your work into focused projects
                    </p>
                </div>
                <button
                    onClick={handleOpenCreate}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm shadow-md hover:shadow-lg hover:bg-primary/90 transition-all active:scale-95"
                >
                    <Plus className="h-4 w-4" />
                    New Project
                </button>
            </div>

            {/* Projects Grid */}
            {projects && projects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {projects.map((project) => (
                        <ProjectCard key={project.id} project={project} onEdit={handleOpenEdit} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 border-2 border-dashed rounded-xl">
                    <FolderOpen className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                        No projects yet
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        Create your first project to start organizing tasks
                    </p>
                    <button
                        onClick={handleOpenCreate}
                        className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
                    >
                        Create Project
                    </button>
                </div>
            )}

            <ProjectDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                projectToEdit={editingProject}
            />
        </div>
    );
}
