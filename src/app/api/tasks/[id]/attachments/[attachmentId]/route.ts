import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma";
import { deleteFile } from "@/lib/storage";

export async function DELETE(
    _req: Request,
    { params }: { params: { id: string; attachmentId: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const attachment = await prisma.attachment.findUnique({
            where: {
                id: params.attachmentId,
                userId: session.user.id,
            },
        });

        if (!attachment) {
            return new NextResponse("Attachment not found", { status: 404 });
        }

        // Delete from storage if it's a file
        if (attachment.type === "FILE") {
            await deleteFile(attachment.url);
        }

        // Delete from DB
        await prisma.attachment.delete({
            where: {
                id: params.attachmentId,
            },
        });

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error("[ATTACHMENT_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
