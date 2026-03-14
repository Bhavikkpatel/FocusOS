import { NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createEventSchema = z.object({
    title: z.string().min(1),
    start: z.string(),
    end: z.string(),
    allDay: z.boolean().optional().default(false),
    color: z.string().optional(),
    notes: z.string().optional(),
    taskId: z.string().optional().nullable(),
    // Fields for creating a new task simultaneously
    createTask: z.boolean().optional().default(false),
    taskPriority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
    taskProjectId: z.string().optional().nullable(),
    taskEstimatedPomodoros: z.number().int().optional(),
    taskPomodoroDuration: z.number().int().optional(),
});

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const start = searchParams.get("start");
        const end = searchParams.get("end");

        const events = await prisma.calendarEvent.findMany({
            where: {
                userId: session.user.id,
                ...(start && end
                    ? {
                          start: { gte: new Date(start) },
                          end: { lte: new Date(end) },
                      }
                    : {}),
            },
            include: {
                task: {
                    include: {
                        projectRef: true,
                        pomodoroSessions: true,
                        subtasks: true,
                        tags: true,
                    },
                },
            },
            orderBy: { start: "asc" },
        });

        return NextResponse.json(events);
    } catch (error) {
        console.error("[CALENDAR_GET]", error);
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
        const data = createEventSchema.parse(body);

        let resolvedTaskId = data.taskId || null;

        // Optionally create a new task alongside the event
        if (data.createTask && !resolvedTaskId) {
            const newTask = await prisma.task.create({
                data: {
                    title: data.title,
                    userId: session.user.id,
                    priority: data.taskPriority || "MEDIUM",
                    projectId: data.taskProjectId || null,
                    estimatedPomodoros: data.taskEstimatedPomodoros || 1,
                    pomodoroDuration: data.taskPomodoroDuration || 25,
                    status: "TODO",
                },
            });
            resolvedTaskId = newTask.id;
        }

        const event = await prisma.calendarEvent.create({
            data: {
                title: data.title,
                start: new Date(data.start),
                end: new Date(data.end),
                allDay: data.allDay,
                color: data.color || null,
                notes: data.notes || null,
                taskId: resolvedTaskId,
                userId: session.user.id,
            },
            include: {
                task: {
                    include: { projectRef: true },
                },
            },
        });

        return NextResponse.json(event, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new NextResponse("Invalid request data", { status: 422 });
        }
        console.error("[CALENDAR_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
