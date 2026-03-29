import { prisma } from "../src/lib/prisma";
import { performance } from "perf_hooks";
import fs from "fs";

async function benchmark() {
    console.log("📊 Starting Performance Benchmark Suite (US 14.2, 14.3)");

    const userEmail = "perf-test@focusos.com";
    const user = await prisma.user.findUnique({ where: { email: userEmail } });
    if (!user) {
        console.error("No perf-test user found. Run seeding script first.");
        return;
    }

    const project = await prisma.project.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
    });

    if (!project) {
        console.error("No projects found for perf-test user.");
        return;
    }

    const iterations = 100;
    const results: any[] = [];

    console.log(`🚀 Benchmarking project: ${project.name} (${project.id})`);
    console.log(`📈 Running ${iterations} iterations...`);

    for (let i = 0; i < iterations; i++) {
        // --- 1. Prisma Query Execution Time (US 14.2) ---
        const startPrisma = performance.now();
        const tasks = await prisma.task.findMany({
            where: { projectId: project.id },
            select: {
                id: true,
                title: true,
                status: true,
                priority: true,
                _count: {
                    select: { subtasks: true, attachments: true }
                }
            }
        });
        const prismaDuration = performance.now() - startPrisma;

        // --- 2. API Latency & Payload Size (Simulated for this script) ---
        // Note: Real API latency should be measured via a running server.
        // We'll simulate the "Split" vs "Monolithic" query comparison here.
        
        const startMono = performance.now();
        const monolithicProject = await prisma.project.findUnique({
            where: { id: project.id },
            include: {
                columns: {
                    include: {
                        tasks: {
                            include: {
                                subtasks: true,
                                attachments: true,
                                tags: true,
                                pomodoroSessions: true
                            }
                        }
                    }
                }
            }
        });
        const monoDuration = performance.now() - startMono;
        const monoPayloadSize = JSON.stringify(monolithicProject).length;

        const startSplit = performance.now();
        const meta = await prisma.project.findFirst({
             where: { id: project.id },
        });
        const tasksSplit = await prisma.task.findMany({
            where: { projectId: project.id },
            select: { id: true, title: true, status: true, priority: true, _count: true }
        });
        const splitDuration = performance.now() - startSplit;
        const splitPayloadSize = JSON.stringify({ meta, tasksSplit }).length;

        results.push({
            iteration: i + 1,
            prismaDuration,
            monoDuration,
            splitDuration,
            monoPayloadSize,
            splitPayloadSize,
            reduction: ((monoPayloadSize - splitPayloadSize) / monoPayloadSize * 100).toFixed(2),
        });

        if (i % 20 === 0) console.log(`Iteration ${i}...`);
    }

    // --- Generate Statistics ---
    const stats = {
        prismaTaskFetch: calculateStats(results.map(r => r.prismaDuration)),
        monoAPI: calculateStats(results.map(r => r.monoDuration)),
        splitAPI: calculateStats(results.map(r => r.splitDuration)),
        avgPayloadReduction: (results.reduce((acc, r) => acc + parseFloat(r.reduction), 0) / iterations).toFixed(2) + "%",
    };

    console.log("\n==== BENCHMARK RESULTS ====");
    console.table({
        "Weightless Task Fetch (ms)": stats.prismaTaskFetch,
        "Monolithic Project (ms)": stats.monoAPI,
        "Split Project (ms)": stats.splitAPI,
    });
    console.log(`Average Payload Size Reduction: ${stats.avgPayloadReduction}`);

    // --- Save to CSV ---
    const csvContent = "Iteration,PrismaDur,MonoDur,SplitDur,MonoSize,SplitSize,Reduction%\n" +
        results.map(r => `${r.iteration},${r.prismaDuration},${r.monoDuration},${r.splitDuration},${r.monoPayloadSize},${r.splitPayloadSize},${r.reduction}`).join("\n");
    
    fs.writeFileSync("performance-report.csv", csvContent);
    console.log("\n📄 performance-report.csv generated.");
}

function calculateStats(times: number[]) {
    return {
        min: Math.min(...times).toFixed(2),
        max: Math.max(...times).toFixed(2),
        avg: (times.reduce((a, b) => a + b, 0) / times.length).toFixed(2),
    };
}

benchmark().catch(console.error).finally(() => prisma.$disconnect());
