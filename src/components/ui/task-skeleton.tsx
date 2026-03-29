export function TaskSkeleton() {
    return (
        <div className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-sm flex flex-col gap-3">
            <div className="flex justify-between items-start gap-2">
                <div className="flex-1 space-y-2">
                    {/* Title skeleton */}
                    <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-md w-3/4 animate-pulse" />
                    <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-md w-1/2 animate-pulse" />
                </div>
                {/* Priority dot skeleton */}
                <div className="h-2 w-2 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" />
            </div>

            <div className="flex flex-wrap gap-1.5">
                {/* Tag skeletons */}
                <div className="h-5 w-12 bg-slate-50 dark:bg-slate-800/50 rounded-full animate-pulse" />
                <div className="h-5 w-16 bg-slate-50 dark:bg-slate-800/50 rounded-full animate-pulse" />
            </div>

            <div className="flex items-center justify-between mt-1 pt-3 border-t border-slate-50 dark:border-slate-800/50">
                <div className="flex items-center gap-3">
                    {/* Subtasks and Sessions skeleton */}
                    <div className="h-3 w-10 bg-slate-50 dark:bg-slate-800/50 rounded animate-pulse" />
                    <div className="h-3 w-14 bg-slate-50 dark:bg-slate-800/50 rounded animate-pulse" />
                </div>
                {/* Play button skeleton */}
                <div className="h-7 w-7 rounded-full bg-slate-100 dark:bg-slate-800 animate-pulse" />
            </div>
        </div>
    );
}

export function TaskColumnSkeleton({ count = 3 }: { count?: number }) {
    return (
        <div className="flex flex-col gap-3">
            {Array.from({ length: count }).map((_, i) => (
                <TaskSkeleton key={i} />
            ))}
        </div>
    );
}
