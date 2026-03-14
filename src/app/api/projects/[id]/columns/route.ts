import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createColumnSchema = z.object({
    name: z.string().min(1).max(50),
});

// GET /api/projects/[id]/columns — List columns for a project
export async function GET(
    _: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Verify project ownership
        const project = await prisma.project.findFirst({
            where: { id: params.id, userId: session.user.id },
        });
        if (!project) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        const columns = await prisma.column.findMany({
            where: { projectId: params.id },
            orderBy: { sortOrder: "asc" },
            include: {
                _count: { select: { tasks: true } },
            },
        });

        return NextResponse.json(columns);
    } catch (error) {
        console.error("Failed to fetch columns:", error);
        return NextResponse.json(
            { error: "Failed to fetch columns" },
            { status: 500 }
        );
    }
}

// POST /api/projects/[id]/columns — Create a column
export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const project = await prisma.project.findFirst({
            where: { id: params.id, userId: session.user.id },
        });
        if (!project) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        const body = await req.json();
        const data = createColumnSchema.parse(body);

        // Get max sortOrder
        const maxCol = await prisma.column.findFirst({
            where: { projectId: params.id },
            orderBy: { sortOrder: "desc" },
        });

        const column = await prisma.column.create({
            data: {
                name: data.name,
                sortOrder: (maxCol?.sortOrder ?? -1) + 1,
                projectId: params.id,
            },
        });

        return NextResponse.json(column, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Invalid input", details: error.errors },
                { status: 400 }
            );
        }
        console.error("Failed to create column:", error);
        return NextResponse.json(
            { error: "Failed to create column" },
            { status: 500 }
        );
    }
}
