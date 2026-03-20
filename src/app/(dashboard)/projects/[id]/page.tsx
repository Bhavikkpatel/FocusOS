import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { ProjectDetail } from "@/components/projects/project-detail";

export default async function ProjectPage({
    params,
}: {
    params: { id: string };
}) {
    const session = await getServerSession(authOptions);
    if (!session) redirect("/auth/signin");

    return (
        <ProjectDetail projectId={params.id} />
    );
}
