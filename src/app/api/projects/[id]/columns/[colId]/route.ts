import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateColumnSchema = z.object({
    name: z.string().min(1).max(50).optional(),
    sortOrder: z.number().int().min(0).optional(),
});

// Verify project ownership
async function verifyAccess(projectId: string, colId: string, userId: string) {
    const column = await prisma.column.findFirst({
        where: {
            id: colId,
            projectId,
            project: { userId },
        },
    });
    return column;
}

// PATCH /api/projects/[id]/columns/[colId] — Update column
export async function PATCH(
    req: Request,
    { params }: { params: { id: string; colId: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const column = await verifyAccess(params.id, params.colId, session.user.id);
        if (!column) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        const body = await req.json();
        const data = updateColumnSchema.parse(body);

        const updated = await prisma.column.update({
            where: { id: params.colId },
            data,
        });

        return NextResponse.json(updated);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Invalid input", details: error.errors },
                { status: 400 }
            );
        }
        console.error("Failed to update column:", error);
        return NextResponse.json(
            { error: "Failed to update column" },
            { status: 500 }
        );
    }
}

// DELETE /api/projects/[id]/columns/[colId] — Delete column
export async function DELETE(
    _: Request,
    { params }: { params: { id: string; colId: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const column = await verifyAccess(params.id, params.colId, session.user.id);
        if (!column) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        // Check if column has tasks
        const taskCount = await prisma.task.count({
            where: { columnId: params.colId },
        });

        if (taskCount > 0) {
            return NextResponse.json(
                { error: "Column has tasks. Reassign them before deleting." },
                { status: 400 }
            );
        }

        await prisma.column.delete({ where: { id: params.colId } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to delete column:", error);
        return NextResponse.json(
            { error: "Failed to delete column" },
            { status: 500 }
        );
    }
}
