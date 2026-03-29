import { prisma } from "../src/lib/prisma";
import { AnalyticsService } from "../src/lib/analytics-service";
import { performance } from "perf_hooks";

async function stressTest() {
    console.log("🔥 Starting Stress Test: Concurrent SyncEvent Updates (US 14.5)");

    const userEmail = "perf-test@focusos.com";
    const user = await prisma.user.findUnique({ where: { email: userEmail } });
    if (!user) {
        console.error("No perf-test user found. Run seeding script first.");
        return;
    }

    const userId = user.id;

    // Reset analytics for today
    await prisma.analytics.deleteMany({ where: { userId } });

    const concurrentUpdates = 100;
    console.log(`🚀 Injected ${concurrentUpdates} concurrent TASK_UPDATE events...`);

    const start = performance.now();
    
    // Fire 100 concurrent updates
    const updates = Array.from({ length: concurrentUpdates }).map(async (_, i) => {
        try {
            // Simulated SyncEvent processing
            await prisma.$transaction(async (tx) => {
                 // 1. Log the SyncEvent
                await tx.syncEvent.create({
                    data: {
                        userId,
                        type: "TASK_UPDATE",
                        payload: { id: `task-${i}`, status: "COMPLETED" },
                        status: "SYNCED",
                        syncedAt: new Date(),
                    }
                });

                // 2. Trigger AnalyticsService (using the transaction context for consistency)
                await AnalyticsService.toggleTaskCompletion(userId, true, tx);
            });
            return true;
        } catch (error: any) {
            console.error(`Update ${i} failed: ${error.message}`);
            return false;
        }
    });

    const results = await Promise.all(updates);
    const duration = performance.now() - start;

    const successCount = results.filter(r => r).length;
    const failureCount = concurrentUpdates - successCount;

    console.log(`\n✅ Stress Test Finished in ${duration.toFixed(2)}ms`);
    console.log(`Results: ${successCount} Success, ${failureCount} Failure`);

    // Verify Analytics Consistency
    const analytics = await prisma.analytics.findFirst({
        where: { userId },
        orderBy: { date: "desc" },
    });

    console.log("\n📊 Verification:");
    console.log(`Total SyncEvents Created: ${await prisma.syncEvent.count({ where: { userId, type: "TASK_UPDATE" } })}`);
    console.log(`Analytics tasksCompleted: ${analytics?.tasksCompleted || 0}`);

    if (analytics?.tasksCompleted === concurrentUpdates) {
        console.log("🎯 Analytics Consistency verified! No data lost due to concurrency.");
    } else {
        console.warn("⚠️ Analytics Mismatch. Potential race condition or deadlock.");
    }
}

stressTest()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
