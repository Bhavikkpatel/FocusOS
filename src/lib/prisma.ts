import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

// Enable query logging in dev/benchmark mode
const logConfig: any[] = ["info", "warn", "error"];
if (process.env.DEBUG_PRISMA === "true") {
    logConfig.push({
        emit: "event",
        level: "query",
    });
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
    log: logConfig,
});

if (process.env.DEBUG_PRISMA === "true") {
    (prisma as any).$on("query", (e: any) => {
        console.log(`Query: ${e.query}`);
        console.log(`Params: ${e.params}`);
        console.log(`Duration: ${e.duration}ms`);
        console.log("-----------------------------------------");
    });
}

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
