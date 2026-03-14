import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TaskDifficulty } from "@prisma/client";

interface DifficultyBadgeProps {
    difficulty: TaskDifficulty | null | undefined;
    className?: string;
}

export function DifficultyBadge({ difficulty, className }: DifficultyBadgeProps) {
    if (!difficulty) return null;

    const variants = {
        EASY: {
            label: "Easy",
            className: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
            dot: "bg-emerald-500",
        },
        MEDIUM: {
            label: "Medium",
            className: "bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800",
            dot: "bg-amber-500",
        },
        HARD: {
            label: "Hard",
            className: "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800",
            dot: "bg-red-500",
        },
    };

    const variant = variants[difficulty];

    return (
        <Badge
            variant="outline"
            className={cn(
                "flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium transition-colors",
                variant.className,
                className
            )}
        >
            <span className={cn("h-1.5 w-1.5 rounded-full", variant.dot)} />
            {variant.label}
        </Badge>
    );
}
