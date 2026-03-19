import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const addAttachmentSchema = z.object({
    name: z.string().min(1),
    url: z.string().min(1),
    type: z.enum(["FILE", "LINK"]),
    size: z.number().optional(),
    mimeType: z.string().optional(),
});

export async function GET(
    _req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const attachments = await prisma.attachment.findMany({
            where: {
                taskId: params.id,
                userId: session.user.id,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json(attachments);
    } catch (error: any) {
        if (error.digest === 'DYNAMIC_SERVER_USAGE' || error.message?.includes('Dynamic server usage')) {
            throw error;
        }
        console.error("[ATTACHMENTS_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const validatedData = addAttachmentSchema.parse(body);

        // Verify task ownership
        const task = await prisma.task.findUnique({
            where: {
                id: params.id,
                userId: session.user.id,
            },
        });

        if (!task) {
            return new NextResponse("Task not found", { status: 404 });
        }

        const attachment = await prisma.attachment.create({
            data: {
                name: validatedData.name,
                url: validatedData.url,
                type: validatedData.type,
                size: validatedData.size,
                mimeType: validatedData.mimeType,
                taskId: params.id,
                userId: session.user.id,
            },
        });

        return NextResponse.json(attachment);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new NextResponse("Invalid request data", { status: 422 });
        }
        console.error("[ATTACHMENTS_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
