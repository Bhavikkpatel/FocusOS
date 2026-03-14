import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSubtaskSchema = z.object({
    title: z.string().min(1).optional(),
    notes: z.string().optional().nullable(),
    isCompleted: z.boolean().optional(),
    sortOrder: z.number().optional(),
});

// PATCH /api/tasks/[id]/subtasks/[subtaskId]
export async function PATCH(
    req: Request,
    { params }: { params: { id: string; subtaskId: string } }
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
        const validatedData = updateSubtaskSchema.parse(body);

        const subtask = await prisma.subTask.update({
            where: {
                id: params.subtaskId,
                taskId: params.id,
            },
            data: validatedData,
        });

        return NextResponse.json(subtask);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new NextResponse("Invalid request data", { status: 422 });
        }
        console.error("[SUBTASK_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

// DELETE /api/tasks/[id]/subtasks/[subtaskId]
export async function DELETE(
    _: Request,
    { params }: { params: { id: string; subtaskId: string } }
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

        const subtask = await prisma.subTask.delete({
            where: {
                id: params.subtaskId,
                taskId: params.id,
            },
        });

        return NextResponse.json(subtask);
    } catch (error) {
        console.error("[SUBTASK_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
