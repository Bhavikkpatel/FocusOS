import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const ratingSchema = z.object({
    rating: z.number().int().min(1).max(5),
});

export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { rating } = ratingSchema.parse(body);

        // Verify the session belongs to the user
        const existingSession = await prisma.pomodoroSession.findUnique({
            where: {
                id: params.id,
                userId: session.user.id,
            }
        });

        if (!existingSession) {
            return new NextResponse("Not Found", { status: 404 });
        }

        const updatedSession = await prisma.pomodoroSession.update({
            where: { id: params.id },
            data: { rating: rating },
        });

        return NextResponse.json(updatedSession);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new NextResponse(JSON.stringify(error.issues), { status: 422 });
        }
        console.error("Error rating pomodoro session:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
