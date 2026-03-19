import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createSubtaskSchema = z.object({
    title: z.string().min(1, "Title is required"),
});

// GET /api/tasks/[id]/subtasks
export async function GET(
    _: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Verify task ownership
        const task = await prisma.task.findUnique({
            where: { id: params.id, userId: session.user.id },
            select: { id: true },
        });

        if (!task) {
            return new NextResponse("Not Found", { status: 404 });
        }

        const subtasks = await prisma.subTask.findMany({
            where: { taskId: params.id },
            orderBy: { sortOrder: "asc" },
        });

        return NextResponse.json(subtasks);
    } catch (error: any) {
        if (error.digest === 'DYNAMIC_SERVER_USAGE' || error.message?.includes('Dynamic server usage')) {
            throw error;
        }
        console.error("[SUBTASKS_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

// POST /api/tasks/[id]/subtasks
export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Verify task ownership
        const task = await prisma.task.findUnique({
            where: { id: params.id, userId: session.user.id },
            select: { id: true },
        });

        if (!task) {
            return new NextResponse("Not Found", { status: 404 });
        }

        const body = await req.json();
        const validatedData = createSubtaskSchema.parse(body);

        // Get highest sort order
        const lastSubtask = await prisma.subTask.findFirst({
            where: { taskId: params.id },
            orderBy: { sortOrder: "desc" },
            select: { sortOrder: true },
        });

        const subtask = await prisma.subTask.create({
            data: {
                title: validatedData.title,
                taskId: params.id,
                sortOrder: (lastSubtask?.sortOrder ?? 0) + 1,
            },
        });

        return NextResponse.json(subtask);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new NextResponse("Invalid request data", { status: 422 });
        }
        console.error("[SUBTASKS_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
