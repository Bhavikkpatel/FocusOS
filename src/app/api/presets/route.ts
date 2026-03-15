import { NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        let presets = await prisma.pomodoroPreset.findMany({
            where: {
                userId: session.user.id,
            },
            orderBy: {
                isDefault: "desc",
            },
        });

        // Story: Lazy initialize defaults for old users who have none
        if (presets.length === 0) {
            console.log("No presets found for user, creating defaults:", session.user.id);
            const defaultPresets = [
                {
                    name: "Classic Pomodoro",
                    focusDuration: 25,
                    shortBreakDuration: 5,
                    longBreakDuration: 15,
                    sessionsUntilLongBreak: 4,
                    autoStartBreaks: true,
                    autoStartFocus: false,
                    isDefault: true,
                    userId: session.user.id,
                },
                {
                    name: "Deep Work",
                    focusDuration: 50,
                    shortBreakDuration: 10,
                    longBreakDuration: 30,
                    sessionsUntilLongBreak: 3,
                    autoStartBreaks: true,
                    autoStartFocus: false,
                    isDefault: false,
                    userId: session.user.id,
                },
                {
                    name: "Flow State",
                    focusDuration: 90,
                    shortBreakDuration: 15,
                    longBreakDuration: 30,
                    sessionsUntilLongBreak: 2,
                    autoStartBreaks: false,
                    autoStartFocus: false,
                    isDefault: false,
                    userId: session.user.id,
                },
            ];

            // Use transaction or loop to create defaults
            await Promise.all(
                defaultPresets.map(preset => prisma.pomodoroPreset.create({ data: preset }))
            );

            // Re-fetch created presets to return them (includes IDs)
            presets = await prisma.pomodoroPreset.findMany({
                where: {
                    userId: session.user.id,
                },
                orderBy: {
                    isDefault: "desc",
                },
            });
        }

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
