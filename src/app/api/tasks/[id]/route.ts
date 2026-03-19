
import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { calculateNextOccurrence } from "@/lib/recurrence";

const updateTaskSchema = z.object({
    title: z.string().min(1).optional(),
    description: z.string().optional(),
    status: z.enum(["TODO", "IN_PROGRESS", "READY_FOR_REVIEW", "COMPLETED", "ON_HOLD", "ARCHIVED"]).optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
    difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).optional().nullable(),
    estimatedPomodoros: z.number().int().min(1).optional(),
    autoComplete: z.boolean().optional(),
    projectId: z.string().optional().nullable(),
    columnId: z.string().optional().nullable(),
    categoryId: z.string().optional().nullable(),
    columnOrder: z.number().int().min(0).optional(),
    tags: z.array(z.string()).optional(), // Tag IDs
    recurrenceType: z.enum(["DAILY", "WEEKLY", "MONTHLY", "CUSTOM"]).optional().nullable(),
    recurrenceInterval: z.number().int().min(1).optional().nullable(),
    recurrenceDays: z.string().optional().nullable(),
    isRecurring: z.boolean().optional(),
    notes: z.string().optional(),
    dueDate: z.string().optional().nullable(),
    sortOrder: z.number().optional(),
});

export async function GET(
    _: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const task = await prisma.task.findUnique({
            where: {
                id: params.id,
                userId: session.user.id,
            },
            include: {
                projectRef: true,
                pomodoroSessions: true,
                category: true,
                tags: true,
                attachments: true,
                subtasks: {
                    orderBy: { sortOrder: "asc" },
                },
            },
        });

        if (!task) {
            return new NextResponse("Not Found", { status: 404 });
        }

        return NextResponse.json(task);
    } catch (error: any) {
        if (error.digest === 'DYNAMIC_SERVER_USAGE' || error.message?.includes('Dynamic server usage')) {
            throw error;
        }
        console.error("[TASK_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const validatedData = updateTaskSchema.parse(body);

        const existingTask = await prisma.task.findUnique({
            where: { id: params.id, userId: session.user.id },
            include: { subtasks: true }
        });

        if (!existingTask) {
            return new NextResponse("Not Found", { status: 404 });
        }

        // Prevent completing task if it has unfinished subtasks
        if (validatedData.status === "COMPLETED") {
            const hasUnfinishedSubtasks = existingTask.subtasks.some(st => !st.isCompleted);
            if (hasUnfinishedSubtasks) {
                return new NextResponse("Cannot complete task with unfinished subtasks", { status: 400 });
            }
        }

        const updateData: any = {
            ...validatedData,
            dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : undefined,
        };

        if (validatedData.tags !== undefined) {
            updateData.tags = {
                set: validatedData.tags.map(id => ({ id }))
            };
        }

        // If project is changing, sync name and ensure valid column
        if (validatedData.projectId !== undefined && validatedData.projectId !== existingTask.projectId) {
            if (validatedData.projectId === null) {
                updateData.project = null;
                updateData.columnId = null;
            } else {
                const project = await prisma.project.findUnique({
                    where: { id: validatedData.projectId },
                    include: { columns: { orderBy: { sortOrder: "asc" }, take: 1 } }
                });

                if (project) {
                    updateData.project = project.name;
                    if (!validatedData.columnId && project.columns.length > 0) {
                        updateData.columnId = project.columns[0].id;
                        // Also update status for first column
                        const firstColName = project.columns[0].name.toLowerCase();
                        if (firstColName.includes("done") || firstColName.includes("completed")) {
                            updateData.status = "COMPLETED";
                        } else if (firstColName.includes("progress") || firstColName.includes("doing")) {
                            updateData.status = "IN_PROGRESS";
                        } else {
                            updateData.status = "TODO";
                        }
                    }
                }
            }
        }

        // Derive status from columnId if provided and status isn't explicitly sent
        if (validatedData.columnId && !validatedData.status) {
            const column = await prisma.column.findUnique({
                where: { id: validatedData.columnId }
            });
            if (column) {
                const colName = column.name.toLowerCase();
                if (colName.includes("done") || colName.includes("completed")) {
                    updateData.status = "COMPLETED";
                } else if (colName.includes("progress") || colName.includes("doing") || colName.includes("review")) {
                    updateData.status = colName.includes("review") ? "READY_FOR_REVIEW" : "IN_PROGRESS";
                } else if (colName.includes("hold")) {
                    updateData.status = "ON_HOLD";
                } else if (colName.includes("todo") || colName.includes("to do") || colName.includes("backlog")) {
                    updateData.status = "TODO";
                }
            }
        }

        // Story 1: If marking as COMPLETED, try to move to "Done" column
        if (validatedData.status === "COMPLETED" && (validatedData.projectId || existingTask.projectId)) {
            const pid = validatedData.projectId || existingTask.projectId;
            if (pid) {
                const doneColumn = await prisma.column.findFirst({
                    where: {
                        projectId: pid,
                        name: { in: ["Done", "Completed", "COMPLETED", "DONE", "done", "completed"] }
                    }
                });
                if (doneColumn) {
                    updateData.columnId = doneColumn.id;
                }
            }
        }

        // If marking as IN_PROGRESS, try to move to "In Progress" column
        if (validatedData.status === "IN_PROGRESS" && (validatedData.projectId || existingTask.projectId)) {
            const pid = validatedData.projectId || existingTask.projectId;
            if (pid) {
                const inProgressColumn = await prisma.column.findFirst({
                    where: {
                        projectId: pid,
                        name: { in: ["In Progress", "In progress", "Doing", "DOING", "in progress", "doing"] }
                    }
                });
                if (inProgressColumn) {
                    updateData.columnId = inProgressColumn.id;
                }
            }
        }

        const task = await prisma.task.update({
            where: {
                id: params.id,
                userId: session.user.id,
            },
            data: updateData,
            include: { tags: true, projectRef: true }
        });

        const t = task as any;
        // If task was just marked COMPLETED and is recurring, spawn next one
        if (validatedData.status === "COMPLETED" && t.isRecurring && !t.lastOccurrenceId) {
            const nextDueDate = calculateNextOccurrence(
                t.dueDate || new Date(),
                t.recurrenceType,
                t.recurrenceInterval || 1,
                t.recurrenceDays || undefined
            );

            const nextTask = await prisma.task.create({
                data: {
                    title: t.title,
                    description: t.description,
                    priority: t.priority,
                    difficulty: t.difficulty,
                    estimatedPomodoros: t.estimatedPomodoros,
                    autoComplete: t.autoComplete,
                    projectId: t.projectId,
                    categoryId: t.categoryId,
                    userId: t.userId,
                    dueDate: nextDueDate,
                    status: "TODO",
                    isRecurring: true,
                    recurrenceType: t.recurrenceType,
                    recurrenceInterval: t.recurrenceInterval,
                    recurrenceDays: t.recurrenceDays,
                    tags: {
                        connect: t.tags.map((tag: any) => ({ id: tag.id }))
                    },
                    // If it belongs to a project, put it in the first column or same column?
                    // Usually first column (To Do)
                    columnId: t.columnId,
                } as any
            });

            // Link them to avoid double generation
            await prisma.task.update({
                where: { id: task.id },
                data: { lastOccurrenceId: nextTask.id } as any
            });
        }

        return NextResponse.json(task);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new NextResponse("Invalid request data", { status: 422 });
        }
        console.error("[TASK_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function DELETE(
    _: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const task = await prisma.task.delete({
            where: {
                id: params.id,
                userId: session.user.id,
            },
        });

        return NextResponse.json(task);
    } catch (error) {
        console.error("[TASK_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
