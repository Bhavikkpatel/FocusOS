import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateProjectSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().optional(),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
});

async function verifyOwnership(projectId: string, userId: string) {
    const project = await prisma.project.findFirst({
        where: { id: projectId, userId },
    });
    return project;
}

// GET /api/projects/[id] — Get single project with columns and tasks
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
                    orderBy: { sortOrder: "asc" },
                    include: {
                        tasks: {
                            orderBy: { columnOrder: "asc" },
                            include: {
                                subtasks: true,
                                tags: true,
                                pomodoroSessions: {
                                    where: { type: "FOCUS" },
                                    select: { duration: true },
                                },
                            },
                        },
                    },
                },
                tasks: {
                    select: {
                        status: true,
                        pomodoroSessions: {
                            where: { type: "FOCUS" },
                            select: { duration: true },
                        },
                    },
                },
            },
        });

        if (!project) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        // Compute stats
        const totalTasks = project.tasks.length;
        const completedTasks = project.tasks.filter(
            (t) => t.status === "COMPLETED"
        ).length;
        const totalFocusTime = project.tasks.reduce(
            (sum, t) =>
                sum + t.pomodoroSessions.reduce((s, ps) => s + ps.duration, 0),
            0
        );

        return NextResponse.json({
            ...project,
            totalTasks,
            completedTasks,
            totalFocusTime,
        });
    } catch (error: any) {
        if (error.digest === 'DYNAMIC_SERVER_USAGE' || error.message?.includes('Dynamic server usage')) {
            throw error;
        }
        console.error("Failed to fetch project:", error);
        return NextResponse.json(
            { error: "Failed to fetch project" },
            { status: 500 }
        );
    }
}

// PATCH /api/projects/[id] — Update project
export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const project = await verifyOwnership(params.id, session.user.id);
        if (!project) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        const body = await req.json();
        const data = updateProjectSchema.parse(body);

        // Prevent renaming 'Daily'
        if (project.name === "Daily" && data.name && data.name !== "Daily") {
            return NextResponse.json({ error: "The 'Daily' project cannot be renamed" }, { status: 403 });
        }

        const updated = await prisma.project.update({
            where: { id: params.id },
            data,
            include: {
                columns: { orderBy: { sortOrder: "asc" } },
            },
        });

        return NextResponse.json(updated);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Invalid input", details: error.errors },
                { status: 400 }
            );
        }
        console.error("Failed to update project:", error);
        return NextResponse.json(
            { error: "Failed to update project" },
            { status: 500 }
        );
    }
}

// DELETE /api/projects/[id]?action=move_to_inbox|delete_tasks
export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const project = await verifyOwnership(params.id, session.user.id);
        if (!project) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        if (project.name === "Daily") {
            return NextResponse.json({ error: "The 'Daily' project cannot be deleted" }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const action = searchParams.get("action") || "move_to_inbox";

        if (action === "move_to_inbox") {
            // Find the Daily project to move tasks to
            const dailyProject = await prisma.project.findFirst({
                where: { userId: session.user.id, name: "Daily" },
            });

            // Unlink tasks from project (move them to Daily project or Inbox if Daily missing)
            await prisma.task.updateMany({
                where: { projectId: params.id },
                data: {
                    projectId: dailyProject?.id || null,
                    columnId: null,
                    columnOrder: 0
                },
            });
        } else if (action === "delete_tasks") {
            // Delete all tasks in the project
            await prisma.task.deleteMany({
                where: { projectId: params.id },
            });
        }

        // Delete project (columns cascade-delete)
        await prisma.project.delete({ where: { id: params.id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to delete project:", error);
        return NextResponse.json(
            { error: "Failed to delete project" },
            { status: 500 }
        );
    }
}
