"use client";

import { useState, useEffect } from "react";
import { useLayoutStore } from "@/store/layout";
import { useProjectMeta, useProjectTasks, useDeleteProject } from "@/hooks/use-projects";
import { ProjectKanban } from "./project-kanban";
import { ProjectListView } from "./project-list-view";
import { AnimatePresence, motion } from "framer-motion";
import { ProjectDialog } from "./project-dialog";
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
import { useRouter } from "next/navigation";

export function ProjectDetail({ projectId }: { projectId: string }): JSX.Element | null {
    const { data: project, isLoading: isMetaLoading, error: metaError } = useProjectMeta(projectId);
    const { data: tasks, isLoading: isTasksLoading } = useProjectTasks(projectId);
    const deleteProject = useDeleteProject();
    const router = useRouter();
    const { 
        projectViewMode, 
        setProjectViewMode,
        projectCommand,
        clearProjectCommand,
        setNoPadding
    } = useLayoutStore();

    const [hydratedTasks, setHydratedTasks] = useState<Record<string, any[]> | null>(null);

    // Progressive Hydration Logic
    useEffect(() => {
        if (!tasks) {
            setHydratedTasks(null);
            return;
        }

        // Phase 1: Immediate partial render (first 10 items per column)
        const partial: Record<string, any[]> = {};
        Object.keys(tasks).forEach(colId => {
            partial[colId] = tasks[colId].slice(0, 10);
        });
        setHydratedTasks(partial);

        // Phase 2: Deferred full render (after frame paint)
        const timer = setTimeout(() => {
            setHydratedTasks(tasks);
        }, 100);

        return () => clearTimeout(timer);
    }, [tasks]);

    useEffect(() => {
        if (!projectCommand) return;
        if (projectCommand === "edit") setEditOpen(true);
        if (projectCommand === "delete") setDeleteOpen(true);
        clearProjectCommand();
    }, [projectCommand, clearProjectCommand]);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);

    useEffect(() => {
        const savedView = localStorage.getItem(`focusos_project_view_${projectId}`);
        if (savedView === "list" || savedView === "board") {
            setProjectViewMode(savedView as "list" | "board");
        }
        
        // Disable padding for project detail page
        setNoPadding(true);
        return () => setNoPadding(false);
    }, [projectId, setProjectViewMode, setNoPadding]);

    const handleSelectTask = (id: string | null) => {
        if (id) {
            router.push(`/tasks/${id}`);
        }
    };


    if (isMetaLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-muted-foreground flex items-center gap-2">
                    <motion.div 
                        animate={{ rotate: 360 }} 
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full"
                    />
                    <span>Loading workspace...</span>
                </div>
            </div>
        );
    }

    if (metaError || !project) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-red-500">Project not found</div>
            </div>
        );
    }

    const handleDelete = (action: "move_to_inbox" | "delete_tasks") => {
        deleteProject.mutate(
            { id: projectId, action },
            {
                onSuccess: () => {
                    router.push("/projects");
                },
            }
        );
    };

    return (
        <div className="flex flex-col h-full relative">

            <div className="flex-1 overflow-hidden p-6 relative">
                <AnimatePresence mode="wait">
                    {projectViewMode === "board" ? (
                        <motion.div
                            key="board"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="h-full w-full"
                        >
                            <ProjectKanban 
                                project={project} 
                                tasks={hydratedTasks || {}}
                                isLoadingTasks={isTasksLoading && !hydratedTasks}
                                onSelectTask={handleSelectTask}
                            />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="list"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="h-full w-full"
                        >
                            <ProjectListView 
                                project={project} 
                                tasks={hydratedTasks || {}}
                                isLoadingTasks={isTasksLoading && !hydratedTasks}
                                onSelectTask={handleSelectTask}
                             />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Edit Dialog */}
            <ProjectDialog
                open={editOpen}
                onOpenChange={setEditOpen}
                projectToEdit={{
                    id: project.id,
                    name: project.name,
                    description: project.description,
                    color: project.color,
                }}
            />

            {/* Delete Confirmation */}
            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Project</AlertDialogTitle>
                        <AlertDialogDescription>
                            What would you like to do with the tasks in &quot;{project.name}&quot;?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => handleDelete("move_to_inbox")}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            Move Tasks to Inbox
                        </AlertDialogAction>
                        <AlertDialogAction
                            onClick={() => handleDelete("delete_tasks")}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Delete All Tasks
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
