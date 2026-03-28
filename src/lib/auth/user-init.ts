import { prisma } from "@/lib/prisma";

export async function initializeUserData(userId: string) {
    try {
        console.log("Creating default data for user:", userId);
        
        // Check if user already has data to avoid duplicates
        const existingProject = await prisma.project.findFirst({
            where: { userId, name: "Daily" }
        });

        if (existingProject) return;

        // Create Daily project
        await prisma.project.create({
            data: {
                name: "Daily",
                color: "#3B82F6",
                userId: userId,
                columns: {
                    create: [
                        { name: "To Do", sortOrder: 0 },
                        { name: "In Progress", sortOrder: 1 },
                        { name: "Review", sortOrder: 2 },
                        { name: "Done", sortOrder: 3 },
                    ],
                },
            },
        });

        // Create default presets
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
                userId: userId,
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
                userId: userId,
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
                userId: userId,
            },
        ];

        for (const preset of defaultPresets) {
            await prisma.pomodoroPreset.create({ data: preset });
        }
    } catch (error) {
        console.error("FAILED to create default data for user:", error);
    }
}
