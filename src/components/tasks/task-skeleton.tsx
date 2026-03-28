import { LoadingBox, LoadingSpinner } from "@/components/ui/loading-state";

export function TaskSkeleton() {
    return (
        <div className="w-full h-[88px] flex items-center justify-center rounded-xl border border-white/5 bg-white/[0.02]">
            <LoadingSpinner spinnerSize={16} />
        </div>
    );
}

export function TaskListSkeleton() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                <div className="space-y-2">
                    <div className="h-8 w-40 rounded-md bg-white/5 animate-pulse" />
                    <div className="h-4 w-64 rounded-md bg-white/5 animate-pulse" />
                </div>
            </div>
            
            <LoadingBox text="ARCHITECTING TASK VIEW..." className="min-h-[400px]" />
        </div>
    );
}

export function TaskExpandedSkeleton({ onClose }: { onClose: () => void }) {
    return (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-[#0A0A0B]/80 backdrop-blur-sm border-l border-white/10">
            <div className="absolute top-6 right-6 z-50">
                <button 
                    onClick={onClose}
                    className="h-8 w-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors"
                >
                    <span className="sr-only">Close</span>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            <LoadingSpinner text="DECONSTRUCTING TASK DETAILS..." spinnerSize={32} />
        </div>
    );
}
