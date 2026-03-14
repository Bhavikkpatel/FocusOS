import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard";

export default async function AnalyticsPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/auth/signin");
    }

    return (
        <DashboardLayout>
            <AnalyticsDashboard />
        </DashboardLayout>
    );
}
