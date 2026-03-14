import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const presets = await prisma.pomodoroPreset.findMany({
            where: {
                userId: session.user.id,
            },
            orderBy: {
                isDefault: "desc",
            },
        });

        return NextResponse.json(presets);
    } catch (error) {
        console.error("Error fetching presets:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();

        const preset = await prisma.pomodoroPreset.create({
            data: {
                ...body,
                userId: session.user.id,
            },
        });

        return NextResponse.json(preset);
    } catch (error) {
        console.error("Error creating preset:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
