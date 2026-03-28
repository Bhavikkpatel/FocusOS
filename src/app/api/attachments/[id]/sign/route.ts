import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma";
import { getPresignedUrl } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET(
    _req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const attachment = await prisma.attachment.findFirst({
            where: {
                id: params.id,
                userId: session.user.id,
            },
        });

        if (!attachment) {
            return new NextResponse("Attachment not found", { status: 404 });
        }

        if (attachment.type !== "FILE") {
            return new NextResponse("Only files can be signed", { status: 400 });
        }

        // attachment.url now stores the key (e.g. '65e555a6-....png' or 'local:/uploads/...')
        const signedUrl = await getPresignedUrl(attachment.url);

        return NextResponse.json({ signedUrl });
    } catch (error) {
        if (error instanceof Error && (error.message?.includes('Dynamic server usage') || (error as any).digest === 'DYNAMIC_SERVER_USAGE')) {
            throw error;
        }
        console.error("[ATTACHMENT_SIGN_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
