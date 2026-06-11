import { LoadingSpinner } from "@/components/ui/loading-state";

export default function DashboardLoading() {
    return (
        <div className="w-full h-[60vh] flex items-center justify-center">
            <LoadingSpinner spinnerSize={32} />
        </div>
    );
}
