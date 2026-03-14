import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth/config";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const categories = await prisma.category.findMany({
            where: { userId: session.user.id },
            orderBy: { name: 'asc' },
        });

        return NextResponse.json(categories);
    } catch (error) {
        console.error("[CATEGORIES_GET]", error);
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
        const { name } = body;

        if (!name || typeof name !== 'string') {
            return new NextResponse("Invalid name", { status: 400 });
        }

        // Check if category with this name already exists for this user
        const existingCategory = await prisma.category.findUnique({
            where: {
                userId_name: {
                    userId: session.user.id,
                    name: name.trim(),
                },
            },
        });

        if (existingCategory) {
            return new NextResponse("Category already exists", { status: 409 });
        }

        const category = await prisma.category.create({
            data: {
                name: name.trim(),
                userId: session.user.id,
            },
        });

        return NextResponse.json(category);
    } catch (error) {
        console.error("[CATEGORIES_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
