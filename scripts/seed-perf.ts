import { PrismaClient, Column } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

async function seed(profile: "SMALL" | "MEDIUM" | "HEAVY") {
    const userEmail = "perf-test@focusos.com";
    let user = await prisma.user.findUnique({ where: { email: userEmail } });
    if (!user) {
        user = await prisma.user.create({ data: { email: userEmail, name: "Perf Tester" } });
    }

    const userId = user.id;

    console.log(`🧹 Cleaning state for user: ${userEmail}`);
    await prisma.analytics.deleteMany({ where: { userId } });
    await prisma.task.deleteMany({ where: { userId } });
    await prisma.project.deleteMany({ where: { userId } });

    const configs = {
        SMALL: { projects: 1, columns: 5, tasksPerProject: 50, subTasks: 0, attachments: 0 },
        MEDIUM: { projects: 5, columns: 8, tasksPerProject: 1000, subTasks: 2, attachments: 0 },
        HEAVY: { projects: 10, columns: 9, tasksPerProject: 5000, subTasks: 5, attachments: 3 },
    };

    const config = configs[profile];
    console.log(`🚀 Seeding Profile: ${profile} (${config.projects * config.tasksPerProject} total tasks)`);

    for (let p = 0; p < config.projects; p++) {
        const project = await prisma.project.create({
            data: {
                userId,
                name: `Project ${p + 1} - ${faker.commerce.productName()}`,
                description: faker.lorem.paragraph(),
                color: faker.color.rgb({ prefix: "#" }),
                totalTasks: config.tasksPerProject,
                completedTasks: 0,
            } as any
        });

        const columns: Column[] = [];
        for (let c = 0; c < config.columns; c++) {
            const col = await prisma.column.create({
                data: {
                    projectId: project.id,
                    name: `Column ${c + 1}`,
                    sortOrder: c,
                }
            });
            columns.push(col);
        }

        // Batch creation for performance
        const BATCH_SIZE = 100;
        for (let i = 0; i < config.tasksPerProject; i += BATCH_SIZE) {
            const batchTasks = Array.from({ length: Math.min(BATCH_SIZE, config.tasksPerProject - i) }).map((_, idx) => {
                const globalIdx = i + idx;
                const col = columns[globalIdx % columns.length];
                return prisma.task.create({
                    data: {
                        userId,
                        projectId: project.id,
                        columnId: col.id,
                        title: `${globalIdx + 1}: ${faker.git.commitMessage()}`,
                        description: faker.lorem.paragraphs(2),
                        notes: faker.lorem.paragraphs(1),
                        priority: faker.helpers.arrayElement(["LOW", "MEDIUM", "HIGH", "URGENT"]),
                        status: faker.helpers.arrayElement(["TODO", "IN_PROGRESS", "READY_FOR_REVIEW", "COMPLETED"]),
                        estimatedPomodoros: faker.number.int({ min: 1, max: 10 }),
                        completedPomodoros: faker.number.int({ min: 0, max: 5 }),
                        columnOrder: globalIdx,
                    },
                }).then(async (task) => {
                    // Create related items if needed
                    if (config.subTasks > 0) {
                        await prisma.subTask.createMany({
                            data: Array.from({ length: config.subTasks }).map((_, si) => ({
                                taskId: task.id,
                                title: faker.hacker.phrase(),
                                isCompleted: faker.datatype.boolean(),
                                sortOrder: si,
                            }))
                        });
                    }
                    if (config.attachments > 0) {
                        await prisma.attachment.createMany({
                            data: Array.from({ length: config.attachments }).map(() => ({
                                taskId: task.id,
                                userId,
                                name: faker.system.fileName(),
                                url: faker.internet.url(),
                                type: "FILE" as any,
                                mimeType: "application/octet-stream",
                                size: faker.number.int({ min: 100, max: 50000 }),
                            }))
                        });
                    }
                    return task;
                });
            });

            await Promise.all(batchTasks);
            console.log(`Project ${p + 1}: ${i + BATCH_SIZE} tasks created...`);
        }
        
        // Update completed count for project
        const completedCount = await prisma.task.count({
            where: { projectId: project.id, status: "COMPLETED" }
        });
        await prisma.project.update({
            where: { id: project.id },
            data: { completedTasks: completedCount } as any
        });
    }

    console.log("✅ Seeding Complete!");
}

const profile = (process.argv[2]?.toUpperCase() as any) || "SMALL";
if (!["SMALL", "MEDIUM", "HEAVY"].includes(profile)) {
    console.error("Invalid profile. Use SMALL, MEDIUM, or HEAVY.");
    process.exit(1);
}

seed(profile).catch(console.error).finally(() => prisma.$disconnect());
