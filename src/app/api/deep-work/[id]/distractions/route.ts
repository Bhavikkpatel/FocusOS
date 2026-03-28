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
        const { text } = body;

        if (!text) {
            return new NextResponse("Missing text", { status: 400 });
        }

        const deepWorkSession = await prisma.deepWorkSession.findUnique({
            where: { id: params.id, userId: session.user.id }
        });

        if (!deepWorkSession) {
            return new NextResponse("Not Found", { status: 404 });
        }

        const distraction = {
            text,
            createdAt: new Date().toISOString(),
        };

        console.log(`[DEEP_WORK_DISTRACTIONS_POST] Session ${params.id}: Adding distraction "${text}"`);

        const currentDistractions = (deepWorkSession.distractions as { text: string; createdAt: string }[]) || [];
        const updatedDistractions = [...currentDistractions, distraction];

        const updatedSession = await prisma.deepWorkSession.update({
            where: { id: params.id },
            data: {
                distractions: updatedDistractions as any,
            }
        });

        console.log(`[DEEP_WORK_DISTRACTIONS_POST] Session ${params.id} updated. Total: ${updatedDistractions.length}`);

        return NextResponse.json(updatedSession);
    } catch (error) {
        console.error("[DEEP_WORK_DISTRACTIONS_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
