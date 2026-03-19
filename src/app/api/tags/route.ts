import { NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth/config";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const tags = await prisma.tag.findMany({
            where: { userId: session.user.id },
            orderBy: { name: 'asc' },
        });

        return NextResponse.json(tags);
    } catch (error: any) {
        if (error.digest === 'DYNAMIC_SERVER_USAGE' || error.message?.includes('Dynamic server usage')) {
            throw error;
        }
        console.error("[TAGS_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { name, color } = body;

        if (!name || typeof name !== 'string') {
            return new NextResponse("Invalid name", { status: 400 });
        }

        // Check if tag with this name already exists for this user
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

        const tag = await prisma.tag.create({
            data: {
                name: name.trim(),
                color: color || null,
                userId: session.user.id,
            },
        });

        return NextResponse.json(tag);
    } catch (error) {
        console.error("[TAGS_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
