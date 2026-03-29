import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";

async function run() {
    console.log("Setting password for perf-test@focusos.com...");
    const user = await prisma.user.findUnique({ where: { email: "perf-test@focusos.com" } });
    if (!user) {
        console.log("User not found!");
        return;
    }

    const hashedPassword = await bcrypt.hash("password123", 10);
    await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword }
    });
    console.log("Password updated successfully!");
}

run().catch(console.error).finally(() => prisma.$disconnect());
