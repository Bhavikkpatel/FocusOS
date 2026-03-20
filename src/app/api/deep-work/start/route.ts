import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json().catch(() => ({}));
        const { taskId, projectId } = body;

        const deepWorkSession = await (prisma as any).deepWorkSession.create({
            data: {
                userId: session.user.id,
                taskId,
                projectId,
                startTime: new Date(),
            }
        });

        return NextResponse.json(deepWorkSession);
    } catch (error) {
        console.error("[DEEP_WORK_START_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
