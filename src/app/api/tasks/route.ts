import { NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma";
import { Prisma, TaskStatus, TaskPriority } from "@prisma/client";
import { z } from "zod";

const createTaskSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
    difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).optional().nullable(),
    estimatedPomodoros: z.number().int().min(1).default(1),
    autoComplete: z.boolean().optional().default(false),
    project: z.string().optional(),
    projectId: z.string().optional().nullable(),
    columnId: z.string().optional().nullable(),
    categoryId: z.string().optional().nullable(),
    tags: z.array(z.string()).optional(), // Tag IDs
    dueDate: z.string().optional().nullable(),
    isRecurring: z.boolean().optional().default(false),
    recurrenceType: z.enum(["DAILY", "WEEKLY", "MONTHLY", "CUSTOM"]).optional().nullable(),
    recurrenceInterval: z.number().int().min(1).optional().nullable(),
    recurrenceDays: z.string().optional().nullable(),
    status: z.enum(["TODO", "IN_PROGRESS", "READY_FOR_REVIEW", "COMPLETED", "ON_HOLD", "ARCHIVED"]).optional(),
});

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const status = searchParams.get("status");
        const project = searchParams.get("project");
        const projectId = searchParams.get("projectId");
        const priority = searchParams.get("priority");
        const difficulty = searchParams.get("difficulty");
        const categoryId = searchParams.get("categoryId");
        const tagId = searchParams.get("tagId");

        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");
        const skip = (page - 1) * limit;

        // Build query filters
        const where: Prisma.TaskWhereInput = {
            userId: session.user.id,
            status: { not: "ARCHIVED" }, // Default to not showing archived
        };

        if (status && status !== "ALL") {
            where.status = status as TaskStatus;
        }

        if (project) {
            where.project = project;
        }

        if (projectId) {
            where.projectId = projectId;
        }

        if (priority) {
            where.priority = priority as TaskPriority;
        }

        if (difficulty) {
            where.difficulty = difficulty as any;
        }

        if (categoryId) {
            where.categoryId = categoryId;
        }

        if (tagId) {
            where.tags = {
                some: { id: tagId }
            };
        }

        const [tasks, total] = await Promise.all([
            prisma.task.findMany({
                where,
                orderBy: [
                    { sortOrder: 'asc' },   // User defined order
                    { priority: 'desc' },   // Then by priority
                    { createdAt: 'desc' },  // Then by newest
                ],
                include: {
                    projectRef: true,
                    pomodoroSessions: true,
                    category: true,
                    tags: true,
                    subtasks: {
                        orderBy: { sortOrder: "asc" },
                    },
                },
                skip,
                take: limit,
            }),
            prisma.task.count({ where })
        ]);

        return NextResponse.json({
            tasks,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error("[TASKS_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const validatedData = createTaskSchema.parse(body);

        // Get the highest order to append to the end
        const lastTask = await prisma.task.findFirst({
            where: { userId: session.user.id },
            orderBy: { sortOrder: 'desc' },
            select: { sortOrder: true }
        });

        const newOrder = (lastTask?.sortOrder ?? 0) + 1;

        let effectiveColumnId = validatedData.columnId;
        let projectName = validatedData.project;

        if (validatedData.projectId) {
            const project = await prisma.project.findUnique({
                where: { id: validatedData.projectId },
                include: { columns: { orderBy: { sortOrder: "asc" }, take: 1 } }
            });

            if (project) {
                projectName = project.name;
                if (!effectiveColumnId && project.columns.length > 0) {
                    effectiveColumnId = project.columns[0].id;
                }
            }
        }

        const task = await prisma.task.create({
            data: {
                userId: session.user.id,
                title: validatedData.title,
                description: validatedData.description,
                priority: validatedData.priority || "MEDIUM",
                difficulty: validatedData.difficulty,
                estimatedPomodoros: validatedData.estimatedPomodoros,
                autoComplete: validatedData.autoComplete,
                project: projectName,
                projectId: validatedData.projectId,
                columnId: effectiveColumnId,
                categoryId: validatedData.categoryId,
                tags: validatedData.tags && validatedData.tags.length > 0 ? {
                    connect: validatedData.tags.map(id => ({ id }))
                } : undefined,
                dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null,
                sortOrder: newOrder,
                status: validatedData.status || "TODO",
                isRecurring: validatedData.isRecurring,
                recurrenceType: validatedData.recurrenceType,
                recurrenceInterval: validatedData.recurrenceInterval,
                recurrenceDays: validatedData.recurrenceDays,
            } as any,
        });

        return NextResponse.json(task);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new NextResponse("Invalid request data", { status: 422 });
        }
        console.error("[TASKS_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
