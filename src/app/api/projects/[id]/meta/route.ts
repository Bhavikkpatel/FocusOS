import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma";

export async function GET(
    _: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const project = await prisma.project.findFirst({
            where: { id: params.id, userId: session.user.id },
            include: {
                columns: {
                    select: {
                        id: true,
                        name: true,
                        sortOrder: true,
                    },
                    orderBy: { sortOrder: "asc" },
                },
            },
        });

        if (!project) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }

        // Sum focus time across all tasks in the project from Pomodoro Sessions
        const focusTimeResult = await prisma.pomodoroSession.aggregate({
            where: { 
                type: "FOCUS",
                task: { projectId: params.id }
            },
            _sum: {
                duration: true,
            },
        });

        return NextResponse.json({
            id: project.id,
            name: project.name,
            description: project.description,
            color: project.color,
            userId: project.userId,
            createdAt: (project as any).createdAt,
            updatedAt: (project as any).updatedAt,
            columns: project.columns,
            totalTasks: (project as any).totalTasks || 0,
            completedTasks: (project as any).completedTasks || 0,
            totalFocusTime: focusTimeResult._sum.duration || 0,
        });
    } catch (error: any) {
        console.error("Failed to fetch project metadata:", error);
        return NextResponse.json(
            { error: "Failed to fetch project metadata" },
            { status: 500 }
        );
    }
}
