"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { 
    CheckCircle2, 
    Circle, 
    Tag as TagIcon, 
} from "lucide-react";
import { LoadingBox } from "@/components/ui/loading-state";
import { useDebounce } from "../hooks/use-debounce";
import { useGlobalSearch } from "../hooks/use-search";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { TaskStatus } from "@prisma/client";

interface GlobalSearchProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    projectId?: string;
    projectName?: string;
}

export function GlobalSearch({ open, onOpenChange, projectId, projectName }: GlobalSearchProps) {
    const router = useRouter();
    const [query, setQuery] = React.useState("");
    const debouncedQuery = useDebounce(query, 300);
    
    const { data: searchResults, isLoading } = useGlobalSearch(debouncedQuery, projectId);

    React.useEffect(() => {
        if (!open) {
            setQuery("");
        }
    }, [open]);

    React.useEffect(() => {
        setQuery("");
    }, [projectId]);

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "j" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                onOpenChange(!open);
            }
        };

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, [open, onOpenChange]);

    const runCommand = React.useCallback((command: () => void) => {
        onOpenChange(false);
        command();
    }, [onOpenChange]);

    const hasResults = Boolean(
        searchResults && (
            searchResults.tasks.length > 0 || 
            searchResults.projects.length > 0 || 
            searchResults.tags.length > 0
        )
    );

    return (
        <CommandDialog open={open} onOpenChange={onOpenChange}>
            <CommandInput 
                placeholder={projectName ? `Search in ${projectName}...` : "Search tasks, projects, or tags..."} 
                value={query}
                onValueChange={setQuery}
            />
            <CommandList>
                {isLoading && (
                    <LoadingBox text="Searching..." className="min-h-[300px]" />
                )}
                
                {!isLoading && !hasResults && debouncedQuery.length > 0 && (
                    <CommandEmpty>No results found.</CommandEmpty>
                )}

                {searchResults && searchResults.tasks.length > 0 && (
                    <CommandGroup heading="Tasks">
                        {searchResults.tasks.map((task) => (
                            <CommandItem
                                key={task.id}
                                value={`task-${task.id}-${task.title}`}
                                onSelect={() => {
                                    runCommand(() => router.push(`/tasks?task=${task.id}`));
                                }}
                            >
                                {task.status === TaskStatus.COMPLETED ? (
                                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                                ) : (
                                    <Circle className="mr-2 h-4 w-4 text-slate-400" />
                                )}
                                <span className="flex-1 truncate">{task.title}</span>
                                {task.projectRef && (
                                    <span 
                                        className="ml-auto text-xs px-2 py-0.5 rounded-full"
                                        style={{ 
                                            backgroundColor: `${task.projectRef.color}20`,
                                            color: task.projectRef.color 
                                        }}
                                    >
                                        {task.projectRef.name}
                                    </span>
                                )}
                            </CommandItem>
                        ))}
                    </CommandGroup>
                )}

                {searchResults && searchResults.projects.length > 0 && (
                    <>
                        {searchResults.tasks.length > 0 && <CommandSeparator />}
                        <CommandGroup heading="Projects">
                            {searchResults.projects.map((project) => (
                                <CommandItem
                                    key={project.id}
                                    value={`project-${project.id}-${project.name}`}
                                    onSelect={() => {
                                        runCommand(() => router.push(`/projects/${project.id}`));
                                    }}
                                >
                                    <div 
                                        className="mr-2 h-3 w-3 rounded-full" 
                                        style={{ backgroundColor: project.color }} 
                                    />
                                    <span className="flex-1 truncate">{project.name}</span>
                                    <span className="text-xs text-slate-500">
                                        {project._count.tasks} tasks
                                    </span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </>
                )}

                {searchResults && searchResults.tags.length > 0 && (
                    <>
                        {(searchResults.tasks.length > 0 || searchResults.projects.length > 0) && <CommandSeparator />}
                        <CommandGroup heading="Tags">
                            {searchResults.tags.map((tag) => (
                                <CommandItem
                                    key={tag.id}
                                    value={`tag-${tag.id}-${tag.name}`}
                                    onSelect={() => {
                                        runCommand(() => router.push(`/tasks?tag=${tag.id}`));
                                    }}
                                >
                                    <TagIcon 
                                        className="mr-2 h-4 w-4" 
                                        style={{ color: tag.color || '#94a3b8' }} 
                                    />
                                    <span>{tag.name}</span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </>
                )}
            </CommandList>
        </CommandDialog>
    );
}
