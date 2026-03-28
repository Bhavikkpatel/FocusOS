"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Tag as TagIcon, Check, X } from "lucide-react";
import { LoadingSpinner, LoadingBox } from "@/components/ui/loading-state";
import { useTags, useCreateTag, useUpdateTag, useDeleteTag } from "@/hooks/use-tags";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const TAG_COLORS = [
    "#94a3b8", // slate
    "#ef4444", // red
    "#f97316", // orange
    "#eab308", // yellow
    "#22c55e", // green
    "#3b82f6", // blue
    "#8b5cf6", // violet
    "#ec4899", // pink
];

export function TagManagement() {
    const { data: tags = [], isLoading } = useTags();
    const createTag = useCreateTag();
    const updateTag = useUpdateTag();
    const deleteTag = useDeleteTag();

    const [newName, setNewName] = useState("");
    const [newColor, setNewColor] = useState(TAG_COLORS[0]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState("");
    const [editColor, setEditColor] = useState("");

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim()) return;

        createTag.mutate(
            { name: newName.trim(), color: newColor },
            {
                onSuccess: () => {
                    setNewName("");
                    setNewColor(TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)]);
                    toast.success("Tag created");
                },
                onError: (error: any) => {
                    toast.error(error.message || "Failed to create tag");
                }
            }
        );
    };

    const startEditing = (tag: any) => {
        setEditingId(tag.id);
        setEditName(tag.name);
        setEditColor(tag.color || TAG_COLORS[0]);
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditName("");
        setEditColor("");
    };

    const handleUpdate = (id: string) => {
        if (!editName.trim()) return;

        updateTag.mutate(
            { id, data: { name: editName.trim(), color: editColor } },
            {
                onSuccess: () => {
                    setEditingId(null);
                    toast.success("Tag updated");
                },
                onError: (error: any) => {
                    toast.error(error.message || "Failed to update tag");
                }
            }
        );
    };

    const handleDelete = (id: string, name: string) => {
        if (confirm(`Are you sure you want to delete the tag "${name}"? This will remove it from all tasks.`)) {
            deleteTag.mutate(id, {
                onSuccess: () => {
                    toast.success("Tag deleted");
                }
            });
        }
    };

    if (isLoading) {
        return (
            <LoadingBox text="SYNCING TAGS..." className="min-h-[300px]" />
        );
    }

    return (
        <div className="space-y-6">
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Plus className="h-5 w-5 text-primary" />
                        Create New Tag
                    </CardTitle>
                    <CardDescription>Add a new category to organize your tasks</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <Input
                                placeholder="Tag name (e.g. Work, Urgent, Personal)"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                className="h-10"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                                {TAG_COLORS.map((c) => (
                                    <button
                                        key={c}
                                        type="button"
                                        onClick={() => setNewColor(c)}
                                        className={cn(
                                            "w-6 h-6 rounded-full transition-all border-2",
                                            newColor === c
                                                ? "border-white dark:border-slate-900 ring-2 ring-primary scale-110"
                                                : "border-transparent hover:scale-105"
                                        )}
                                        style={{ backgroundColor: c }}
                                    />
                                ))}
                            </div>
                            <Button type="submit" disabled={!newName.trim() || createTag.isPending}>
                                {createTag.isPending ? <LoadingSpinner spinnerSize={16} /> : "Add Tag"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <TagIcon className="h-5 w-5 text-primary" />
                        Manage Tags
                    </CardTitle>
                    <CardDescription>Edit or remove existing tags</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {tags.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground italic">
                                No tags created yet.
                            </div>
                        ) : (
                            tags.map((tag: any) => (
                                <div key={tag.id} className="flex items-center justify-between p-4 hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                                    {editingId === tag.id ? (
                                        <div className="flex-1 flex flex-col sm:flex-row items-center gap-3">
                                            <Input
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                className="h-9 sm:max-w-xs"
                                                autoFocus
                                            />
                                            <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700">
                                                {TAG_COLORS.map((c) => (
                                                    <button
                                                        key={c}
                                                        type="button"
                                                        onClick={() => setEditColor(c)}
                                                        className={cn(
                                                            "w-5 h-5 rounded-full transition-all border-2",
                                                            editColor === c
                                                                ? "border-white dark:border-slate-900 ring-2 ring-primary scale-110"
                                                                : "border-transparent hover:scale-105"
                                                        )}
                                                        style={{ backgroundColor: c }}
                                                    />
                                                ))}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button size="sm" onClick={() => handleUpdate(tag.id)} disabled={updateTag.isPending}>
                                                    <Check className="h-4 w-4 mr-1" /> Save
                                                </Button>
                                                <Button size="sm" variant="ghost" onClick={cancelEditing}>
                                                    <X className="h-4 w-4 mr-1" /> Cancel
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-3 h-3 rounded-full shadow-sm"
                                                    style={{ backgroundColor: tag.color || TAG_COLORS[0] }}
                                                />
                                                <span className="font-semibold text-slate-900 dark:text-slate-100">{tag.name}</span>
                                                <Badge variant="secondary" className="bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 font-normal">
                                                    {tag._count?.tasks || 0} tasks
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-primary dark:hover:text-primary" onClick={() => startEditing(tag)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-red-500 dark:hover:text-red-400" onClick={() => handleDelete(tag.id, tag.name)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
