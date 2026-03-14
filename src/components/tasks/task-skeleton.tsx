import { Skeleton } from "@/components/ui/skeleton";

export function TaskSkeleton() {
    return (
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 rounded-xl border bg-card px-4 py-3 border-l-[4px] border-l-slate-200 dark:border-l-slate-800 animate-pulse">
            <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                {/* Checkbox Placeholder */}
                <div className="mt-1 sm:mt-0 shrink-0">
                    <Skeleton className="h-5 w-5 rounded-md" />
                </div>

                <div className="flex flex-col min-w-0 flex-1 gap-2 w-full">
                    {/* Title & Badges Row Placeholder */}
                    <div className="flex items-center gap-2 flex-wrap">
                        {/* Title Box */}
                        <Skeleton className="h-4 w-48 rounded" />
                        
                        {/* Badges */}
                        <Skeleton className="h-4 w-16 rounded-md" />
                        <Skeleton className="h-4 w-12 rounded-md" />
                    </div>

                    {/* Description Placeholder */}
                    <Skeleton className="h-3 w-3/4 max-w-sm rounded mt-0.5" />

                    {/* Meta Row Placeholder */}
                    <div className="flex items-center gap-3 mt-1 text-[11px]">
                        <Skeleton className="h-3 w-16 rounded" />
                        <Skeleton className="h-3 w-20 rounded" />
                    </div>
                </div>
            </div>

            {/* Right Section: Actions Placeholder */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0 self-end sm:self-center mt-2 sm:mt-0">
                {/* Status Badge */}
                <Skeleton className="h-5 w-20 rounded-full" />
                {/* Focus Button */}
                <Skeleton className="h-7 w-16 rounded-md" />
                {/* More Action */}
                <Skeleton className="h-7 w-7 rounded-full" />
            </div>
        </div>
    );
}

export function TaskListSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Page Header Skeleton */}
            <div className="space-y-6">
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-40 rounded-md" />
                        <Skeleton className="h-4 w-64 rounded-md" />
                    </div>

                    {/* Quick Stats Skeleton */}
                    <div className="flex flex-wrap items-center gap-3">
                        {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className="h-16 w-32 rounded-xl" />
                        ))}
                    </div>
                </div>

                {/* Filters Row Skeleton */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-2 border-t border-slate-100 dark:border-slate-800/50">
                    <div className="flex flex-wrap items-center gap-2">
                        {[1, 2, 3, 4].map((i) => (
                            <Skeleton key={i} className="h-9 w-[120px] rounded-lg" />
                        ))}
                    </div>
                    <Skeleton className="h-9 w-[150px] rounded-xl" />
                </div>
            </div>

            {/* View Content Skeleton - 5 task items */}
            <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                    <TaskSkeleton key={i} />
                ))}
            </div>
        </div>
    );
}

export function TaskExpandedSkeleton({ onClose }: { onClose: () => void }) {
    return (
        <div className="absolute inset-0 z-40 flex flex-col bg-background shadow-2xl border-l border-slate-200 dark:border-slate-800 animate-pulse">
            <div className="flex h-full flex-col">
                {/* Header Top Bar */}
                <div className="flex flex-col gap-4 border-b p-4 sm:p-6 bg-background">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-3">
                            {/* Breadcrumbs Skeleton */}
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-4 w-16 rounded" />
                                <Skeleton className="h-4 w-24 rounded" />
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                {/* Difficulty Badge */}
                                <Skeleton className="h-6 w-16 rounded-full" />
                                {/* Priority Select */}
                                <Skeleton className="h-7 w-28 rounded-md" />
                                {/* Calendar Button */}
                                <Skeleton className="h-7 w-28 rounded-md" />
                                {/* Status Badge */}
                                <Skeleton className="h-7 w-24 rounded-full" />
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <div className="cursor-pointer" onClick={onClose}>
                                <Skeleton className="h-8 w-8 rounded-full" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Areas */}
                <div className="flex flex-1 overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] w-full overflow-hidden">

                        {/* Left Column: Details, Subtasks & Progress */}
                        <div className="flex flex-col border-r h-full bg-background/50">
                            <div className="p-8 pb-4 space-y-4">
                                {/* Title Skeleton */}
                                <Skeleton className="h-10 w-3/4 rounded-lg" />
                                {/* Description Skeleton */}
                                <Skeleton className="h-24 w-full rounded-xl" />
                            </div>

                            {/* Subtasks & Notes Grid */}
                            <div className="px-8 py-4 grid grid-cols-1 xl:grid-cols-2 gap-6">
                                {/* Subtasks Section */}
                                <div className="rounded-2xl border bg-card shadow-sm h-64 p-4">
                                    <Skeleton className="h-6 w-32 rounded-md mb-6" />
                                    <div className="space-y-4">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="flex items-center gap-3">
                                                <Skeleton className="h-5 w-5 rounded-md" />
                                                <Skeleton className="h-5 flex-1 rounded-md" />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Persistent Notes */}
                                <div className="rounded-2xl border bg-card shadow-sm h-64 p-4">
                                    <Skeleton className="h-6 w-32 rounded-md mb-4" />
                                    <Skeleton className="h-full w-full rounded-xl" />
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Timer & Analytics */}
                        <div className="hidden lg:flex flex-col h-full bg-slate-50/50 dark:bg-slate-900/20">
                            <div className="p-6 space-y-6">
                                {/* Timer Skeleton */}
                                <Skeleton className="h-64 w-full rounded-2xl" />
                                
                                {/* Quick Stats Skeleton */}
                                <div className="grid grid-cols-2 gap-3">
                                    {[1, 2, 3, 4].map(i => (
                                        <Skeleton key={i} className="h-20 w-full rounded-xl" />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
