import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { calculateNextOccurrence } from "@/lib/recurrence";

export async function POST(_req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const now = new Date();

        // 1. Find all recurring tasks that are overdue and haven't spawned a successor yet
        // We only process tasks that are NOT completed/archived.
        // If they are completed, they should have been processed by the PATCH route.
        // This is a safety catch for missed completions or time-based triggers.
        const overdueTasks = await prisma.task.findMany({
            where: {
                userId: session.user.id,
                isRecurring: true,
                lastOccurrenceId: null,
                dueDate: {
                    lt: now,
                },
                status: {
                    notIn: ["COMPLETED", "ARCHIVED"],
                },
            } as any,
            include: {
                tags: true,
            },
        });

        const results = [];

        for (const task of overdueTasks) {
            const t = task as any;
            const nextDueDate = calculateNextOccurrence(
                t.dueDate || now,
                t.recurrenceType,
                t.recurrenceInterval || 1,
                t.recurrenceDays || undefined
            );

            // Create the next occurrence
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
                    columnId: t.columnId,
                } as any
            });

            // Link the old one to the new one
            await prisma.task.update({
                where: { id: t.id },
                data: { lastOccurrenceId: nextTask.id } as any
            });

            results.push({
                originalId: t.id,
                newId: nextTask.id,
                title: t.title,
                nextDueDate,
            });
        }

        return NextResponse.json({
            processed: overdueTasks.length,
            details: results,
        });
    } catch (error) {
        console.error("[RECURRENCE_PROCESS_ERROR]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
