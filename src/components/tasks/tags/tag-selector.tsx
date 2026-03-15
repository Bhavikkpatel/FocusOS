import * as React from "react";
import { Check, Plus, Tags } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useTags, useCreateTag } from "@/hooks/use-tags";

interface TagSelectorProps {
    selectedTags: any[];
    onTagsChange: (tags: string[]) => void;
    trigger?: React.ReactNode;
    className?: string;
    align?: "start" | "center" | "end";
}

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

export function TagSelector({ selectedTags, onTagsChange, trigger, className, align = "center" }: TagSelectorProps) {
    const [open, setOpen] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState("");
    const { data: tags = [], isLoading } = useTags();
    const createTag = useCreateTag();

    // Prevent propagation so click doesn't trigger card clicks
    const handleToggle = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setOpen(!open);
    };

    const handleSelectTag = (tag: any) => {
        const isSelected = selectedTags.some((t: any) => t.id === tag.id);
        const newSelected = isSelected
            ? selectedTags.filter((t: any) => t.id !== tag.id).map((t: any) => t.id)
            : [...selectedTags.map((t: any) => t.id), tag.id];

        onTagsChange(newSelected);
    };

    const handleCreateTag = async () => {
        if (!searchQuery.trim()) return;

        try {
            const color = TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)];
            const newTag = await createTag.mutateAsync({ 
                name: searchQuery.trim(),
                color 
            });
            onTagsChange([...selectedTags.map(t => t.id), newTag.id]);
            setSearchQuery("");
        } catch (error) {
            console.error("Failed to create tag", error);
        }
    };

    const isExactMatch = tags.some((t: any) => t.name.toLowerCase() === searchQuery.trim().toLowerCase());

    const defaultTrigger = (
        <Button
            variant="outline"
            size="sm"
            role="combobox"
            aria-expanded={open}
            onClick={handleToggle}
            className={cn("h-8 border-dashed", className)}
        >
            <Tags className="mr-2 h-4 w-4" />
            {selectedTags.length > 0 ? (
                <>
                    <span className="hidden sm:inline-block mr-2">{selectedTags.length} selected</span>
                    <span className="sm:hidden">{selectedTags.length}</span>
                </>
            ) : (
                "Add Tags"
            )}
        </Button>
    );

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                {trigger || defaultTrigger}
            </PopoverTrigger>
            <PopoverContent
                className="w-[200px] p-0"
                align={align}
                onClick={(e) => e.stopPropagation()}
                onInteractOutside={() => setOpen(false)}
            >
                <Command>
                    <CommandInput
                        placeholder="Search tags..."
                        value={searchQuery}
                        onValueChange={setSearchQuery}
                    />
                    <CommandEmpty className="py-2 text-center text-sm">
                        {isLoading ? "Loading tags..." : "No tags found."}
                        {searchQuery.trim() && !isExactMatch && !isLoading && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full mt-2 justify-start font-normal text-muted-foreground"
                                onClick={handleCreateTag}
                                disabled={createTag.isPending}
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Create "{searchQuery}"
                            </Button>
                        )}
                    </CommandEmpty>
                    <CommandList>
                        <CommandGroup>
                            {tags.map((tag: any) => {
                                const isSelected = selectedTags.some((t: any) => t.id === tag.id);
                                return (
                                    <CommandItem
                                        key={tag.id}
                                        value={tag.name}
                                        onSelect={() => handleSelectTag(tag)}
                                        className="flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span
                                                className="h-2 w-2 rounded-full"
                                                style={{ backgroundColor: tag.color || "hsl(var(--muted-foreground))" }}
                                            />
                                            {tag.name}
                                        </div>
                                        {isSelected && <Check className="h-4 w-4" />}
                                    </CommandItem>
                                );
                            })}
                        </CommandGroup>
                        {searchQuery.trim() && !isExactMatch && !isLoading && tags.length > 0 && (
                            <CommandGroup heading="Create new">
                                <CommandItem
                                    onSelect={handleCreateTag}
                                    disabled={createTag.isPending}
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    <span>Create "{searchQuery}"</span>
                                </CommandItem>
                            </CommandGroup>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
