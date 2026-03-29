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

        const tasks = await prisma.task.findMany({
            where: {
                projectId: params.id,
                userId: session.user.id,
            },
            orderBy: { columnOrder: "asc" },
            select: {
                id: true,
                title: true,
                status: true,
                priority: true,
                difficulty: true,
                dueDate: true,
                columnId: true,
                columnOrder: true,
                projectId: true,
                createdAt: true,
                updatedAt: true,
                tags: true,
                _count: {
                    select: {
                        subtasks: true,
                        attachments: true,
                        pomodoroSessions: {
                            where: { type: "FOCUS" }
                        }
                    }
                }
            }
        });

        // Group tasks by columnId for easier frontend consumption
        const tasksByColumn = tasks.reduce((acc: any, task) => {
            const columnId = task.columnId || "unallocated";
            if (!acc[columnId]) acc[columnId] = [];
            acc[columnId].push(task);
            return acc;
        }, {});

        return NextResponse.json(tasksByColumn);
    } catch (error: any) {
        console.error("Failed to fetch project tasks:", error);
        return NextResponse.json(
            { error: "Failed to fetch project tasks" },
            { status: 500 }
        );
    }
}
