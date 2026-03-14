import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Tag } from "@prisma/client";

interface TagBadgeProps {
    tag: Tag;
    className?: string;
    onRemove?: () => void;
}

export function TagBadge({ tag, className, onRemove }: TagBadgeProps) {
    return (
        <Badge
            variant="outline"
            className={cn(
                "flex items-center gap-1.5 px-2 py-0.5 text-xs font-normal border-muted-foreground/20",
                className
            )}
            style={tag.color ? { backgroundColor: `${tag.color}15`, borderColor: `${tag.color}30`, color: tag.color } : undefined}
        >
            <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: tag.color || "hsl(var(--muted-foreground))" }}
            />
            {tag.name}
            {onRemove && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        onRemove();
                    }}
                    className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20 text-muted-foreground hover:text-foreground transition-colors"
                >
                    <span className="sr-only">Remove</span>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-3 w-3"
                    >
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            )}
        </Badge>
    );
}
