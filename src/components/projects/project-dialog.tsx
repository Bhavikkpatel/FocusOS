"use client";

import { useState } from "react";
import { useCreateProject, useUpdateProject } from "@/hooks/use-projects";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const PROJECT_COLORS = [
    "#3B82F6", // blue
    "#8B5CF6", // violet
    "#EC4899", // pink
    "#EF4444", // red
    "#F97316", // orange
    "#EAB308", // yellow
    "#22C55E", // green
    "#06B6D4", // cyan
];

interface ProjectDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    projectToEdit?: {
        id: string;
        name: string;
        description?: string | null;
        color: string;
    };
}

export function ProjectDialog({
    open,
    onOpenChange,
    projectToEdit,
}: ProjectDialogProps) {
    const [name, setName] = useState(projectToEdit?.name || "");
    const [description, setDescription] = useState(
        projectToEdit?.description || ""
    );
    const [color, setColor] = useState(
        projectToEdit?.color || PROJECT_COLORS[0]
    );

    const createProject = useCreateProject();
    const updateProject = useUpdateProject();
    const isEdit = !!projectToEdit;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        if (isEdit) {
            updateProject.mutate(
                { id: projectToEdit.id, name: name.trim(), description, color },
                { onSuccess: () => onOpenChange(false) }
            );
        } else {
            createProject.mutate(
                { name: name.trim(), description, color },
                {
                    onSuccess: () => {
                        onOpenChange(false);
                        setName("");
                        setDescription("");
                        setColor(PROJECT_COLORS[0]);
                    },
                }
            );
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {isEdit ? "Edit Project" : "New Project"}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                    {/* Name */}
                    <div>
                        <label htmlFor="name" className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                            Project Name
                        </label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Website Redesign"
                            disabled={projectToEdit?.name === "Daily"}
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label htmlFor="description" className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                            Description{" "}
                            <span className="text-muted-foreground font-normal">
                                (optional)
                            </span>
                        </label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Brief project description..."
                            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none h-20"
                        />
                    </div>

                    {/* Color Picker */}
                    <div>
                        <span id="color-label" className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                            Color
                        </span>
                        <div className="flex gap-2" role="group" aria-labelledby="color-label">
                            {PROJECT_COLORS.map((c) => (
                                <button
                                    key={c}
                                    type="button"
                                    disabled={projectToEdit?.name === "Daily"}
                                    onClick={() => setColor(c)}
                                    className={cn(
                                        "w-8 h-8 rounded-full transition-all border-2",
                                        color === c
                                            ? "border-slate-900 dark:border-white scale-110 ring-2 ring-offset-2"
                                            : "border-transparent hover:scale-105",
                                        projectToEdit?.name === "Daily" && "opacity-50 cursor-not-allowed"
                                    )}
                                    style={{ backgroundColor: c }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-2 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={
                                !name.trim() ||
                                createProject.isPending ||
                                updateProject.isPending
                            }
                        >
                            {(createProject.isPending || updateProject.isPending) && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            {isEdit ? "Save Changes" : "Create Project"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
