import { Suspense } from "react";
import { Metadata } from "next";
import { CalendarView } from "@/components/calendar/calendar-view";

export const metadata: Metadata = {
    title: "Calendar - FocusOS",
    description: "Plan your day and schedule tasks on a visual calendar.",
};

export default function CalendarPage() {
    return (
        <Suspense
            fallback={
                <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
                    Loading calendar...
                </div>
            }
        >
            <CalendarView />
        </Suspense>
    );
}
