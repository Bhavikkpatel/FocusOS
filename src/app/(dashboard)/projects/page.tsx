import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { ProjectsList } from "@/components/projects/projects-list";

export default async function ProjectsPage() {
    const session = await getServerSession(authOptions);
    if (!session) redirect("/auth/signin");

    return (
        <ProjectsList />
    );
}
