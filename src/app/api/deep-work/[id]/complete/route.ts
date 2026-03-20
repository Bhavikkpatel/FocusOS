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
        const { energy } = body;

        const deepWorkSession = await (prisma as any).deepWorkSession.update({
            where: { id: params.id, userId: session.user.id },
            data: {
                endTime: new Date(),
                energy: energy ? parseInt(energy) : null,
            }
        });

        return NextResponse.json(deepWorkSession);
    } catch (error) {
        console.error("[DEEP_WORK_COMPLETE_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
