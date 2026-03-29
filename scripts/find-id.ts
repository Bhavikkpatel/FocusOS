import { prisma } from "../src/lib/prisma";

async function run() {
    const user = await prisma.user.findUnique({ where: { email: "perf-test@focusos.com" } });
    if (!user) {
        console.log("No user found");
        return;
    }
    const project = await prisma.project.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" }
    });
    if (project) {
        console.log(`PROJECT_ID:${project.id}`);
    } else {
        console.log("No project found");
    }
}

run().catch(console.error).finally(() => prisma.$disconnect());
