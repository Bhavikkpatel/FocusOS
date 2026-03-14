import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateEventSchema = z.object({
    title: z.string().min(1).optional(),
    start: z.string().optional(),
    end: z.string().optional(),
    allDay: z.boolean().optional(),
    color: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
    taskId: z.string().optional().nullable(),
});

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
        const data = updateEventSchema.parse(body);

        const event = await prisma.calendarEvent.update({
            where: {
                id: params.id,
                userId: session.user.id,
            },
            data: {
                ...(data.title && { title: data.title }),
                ...(data.start && { start: new Date(data.start) }),
                ...(data.end && { end: new Date(data.end) }),
                ...(data.allDay !== undefined && { allDay: data.allDay }),
                ...(data.color !== undefined && { color: data.color }),
                ...(data.notes !== undefined && { notes: data.notes }),
                ...(data.taskId !== undefined && { taskId: data.taskId }),
            },
            include: {
                task: {
                    include: { projectRef: true },
                },
            },
        });

        return NextResponse.json(event);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new NextResponse("Invalid request data", { status: 422 });
        }
        console.error("[CALENDAR_PATCH]", error);
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

        await prisma.calendarEvent.delete({
            where: {
                id: params.id,
                userId: session.user.id,
            },
        });

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error("[CALENDAR_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
