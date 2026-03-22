import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma";
import { addMinutes } from "date-fns";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { eventId, shiftMinutes } = body;

        if (!eventId || !shiftMinutes) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        // 1. Get the triggering event
        const triggeringEvent = await prisma.calendarEvent.findUnique({
            where: { id: eventId },
        });

        if (!triggeringEvent || triggeringEvent.userId !== session.user.id) {
            return new NextResponse("Event not found", { status: 404 });
        }

        // 2. Find all events starting after this one ended (on the same day)
        const triggeringEnd = new Date(triggeringEvent.end);
        const dayEnd = new Date(triggeringEnd);
        dayEnd.setHours(23, 59, 59, 999);

        const subsequentEvents = await prisma.calendarEvent.findMany({
            where: {
                userId: session.user.id,
                start: {
                    gte: triggeringEnd,
                },
                id: {
                    not: eventId,
                },
                // Only shift events for the same day to avoid cascading across days indefinitely
                end: {
                    lte: dayEnd,
                }
            },
            orderBy: {
                start: 'asc',
            },
        });

        // 3. Shift each event
        const updates = subsequentEvents.map((event) => {
            return prisma.calendarEvent.update({
                where: { id: event.id },
                data: {
                    start: addMinutes(new Date(event.start), shiftMinutes),
                    end: addMinutes(new Date(event.end), shiftMinutes),
                },
            });
        });

        await prisma.$transaction(updates);

        return NextResponse.json({ 
            success: true, 
            shiftedCount: subsequentEvents.length,
            shiftMinutes 
        });
    } catch (error) {
        console.error("[CALENDAR_SHIFT_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
