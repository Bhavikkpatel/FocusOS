import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma";

export async function GET(
    _req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const deepWorkSession = await (prisma as any).deepWorkSession.findUnique({
            where: { 
                id: params.id,
                userId: session.user.id
            },
            include: {
                pomodoroSessions: true
            }
        });

        if (!deepWorkSession) {
            return new NextResponse("Not Found", { status: 404 });
        }

        return NextResponse.json(deepWorkSession);
    } catch (error) {
        console.error("[DEEP_WORK_GET]", error);
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
        const { distractions, energy } = body;

        const updatedSession = await (prisma as any).deepWorkSession.update({
            where: { 
                id: params.id,
                userId: session.user.id
            },
            data: {
                ...(distractions !== undefined && { distractions }),
                ...(energy !== undefined && { energy: parseInt(energy) }),
            }
        });

        return NextResponse.json(updatedSession);
    } catch (error) {
        console.error("[DEEP_WORK_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
