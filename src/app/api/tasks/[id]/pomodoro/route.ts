import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma";

export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json().catch(() => ({}));
        const { 
            type = "FOCUS", 
            duration = 0, 
            interruptions = 0, 
            wasInterrupted = false,
            deepWorkSessionId = null
        } = body;

        const task = await prisma.task.findUnique({
            where: { id: params.id, userId: session.user.id },
        });

        if (!task) {
            return new NextResponse("Not Found", { status: 404 });
        }

        const nextCompleted = type === "FOCUS" ? task.completedPomodoros + 1 : task.completedPomodoros;
        let nextStatus = task.status;

        // Auto-complete logic (only if it was a focus session that actually incremented the count)
        let nextColumnId = task.columnId;
        const shouldAutoComplete = (task as unknown as { autoComplete: boolean }).autoComplete;
        if (type === "FOCUS" && shouldAutoComplete && nextCompleted >= task.estimatedPomodoros) {

            // Check if all subtasks are completed before auto-completing
            const subtasks = await prisma.subTask.findMany({
                where: { taskId: task.id }
            });
            const allSubtasksCompleted = subtasks.length === 0 || subtasks.every((st) => st.isCompleted);

            if (allSubtasksCompleted) {
                nextStatus = "COMPLETED";

                // Story 2: If auto-completing, try to move to "Done" column
                if (task.projectId) {
                    const doneColumn = await prisma.column.findFirst({
                        where: {
                            projectId: task.projectId,
                            name: { in: ["Done", "Completed", "COMPLETED", "DONE"], mode: 'insensitive' }
                        }
                    });
                    if (doneColumn) {
                        nextColumnId = doneColumn.id;
                    }
                }
            }
        }

        // 1. Update the Task
        const updatedTask = await prisma.task.update({
            where: { id: params.id },
            data: {
                completedPomodoros: nextCompleted,
                status: nextStatus,
                columnId: nextColumnId,
                completedAt: nextStatus === "COMPLETED" ? new Date() : task.completedAt,
            },
        });

        // 2. Create the Pomodoro Session Record
        const sessionRecord = await prisma.pomodoroSession.create({
            data: {
                type: type,
                duration: duration,
                interruptions: interruptions,
                wasInterrupted: wasInterrupted,
                taskId: params.id,
                userId: session.user.id,
                completedAt: new Date(),
                deepWorkSessionId, // Link to Deep Work Session
            }
        });

        // 3. If part of a Deep Work Session, update the session aggregate
        if (deepWorkSessionId && type === "FOCUS") {
            await prisma.deepWorkSession.update({
                where: { id: deepWorkSessionId },
                data: {
                    totalDuration: { increment: duration },
                    sessionCount: { increment: 1 },
                    interruptions: { increment: interruptions },
                }
            });
        }

        return NextResponse.json({
            ...updatedTask,
            sessionId: sessionRecord.id
        });
    } catch (error) {
        console.error("[TASK_POMODORO_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
