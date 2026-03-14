import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth/config";

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
        const { name, color } = body;

        const tag = await prisma.tag.findUnique({
            where: { id: params.id },
        });

        if (!tag || tag.userId !== session.user.id) {
            return new NextResponse("Not Found", { status: 404 });
        }

        if (name && name !== tag.name) {
            const existingTag = await prisma.tag.findUnique({
                where: {
                    userId_name: {
                        userId: session.user.id,
                        name: name.trim(),
                    },
                },
            });

            if (existingTag) {
                return new NextResponse("Tag already exists", { status: 409 });
            }
        }

        const updatedTag = await prisma.tag.update({
            where: { id: params.id },
            data: {
                ...(name && { name: name.trim() }),
                ...(color !== undefined && { color }),
            },
        });

        return NextResponse.json(updatedTag);
    } catch (error) {
        console.error("[TAG_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function DELETE(
    _req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const tag = await prisma.tag.findUnique({
            where: { id: params.id },
        });

        if (!tag || tag.userId !== session.user.id) {
            return new NextResponse("Not Found", { status: 404 });
        }

        await prisma.tag.delete({
            where: { id: params.id },
        });

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error("[TAG_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
