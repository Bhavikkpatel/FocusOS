import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ProjectDetail } from "@/components/projects/project-detail";

export default async function ProjectPage({
    params,
}: {
    params: { id: string };
}) {
    const session = await getServerSession(authOptions);
    if (!session) redirect("/auth/signin");

    return (
        <DashboardLayout noPadding={true}>
            <ProjectDetail projectId={params.id} />
        </DashboardLayout>
    );
}
