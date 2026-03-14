import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("Seeding database...");

    // Create default Pomodoro presets
    /*
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
        },
    ];
    */

    console.log("Default presets will be created per user on first login");
    console.log("Seed completed successfully");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
