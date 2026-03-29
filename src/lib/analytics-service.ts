import { PrismaClient, Prisma } from "@prisma/client";
import { startOfDay } from "date-fns";
import { prisma as defaultPrisma } from "@/lib/prisma";

export class AnalyticsService {
    /**
     * Increment or decrement tasks completed for today (Daily Snapshot)
     */
    static async toggleTaskCompletion(userId: string, isCompleted: boolean, tx: Prisma.TransactionClient | PrismaClient = defaultPrisma) {
        const today = startOfDay(new Date());
        const increment = isCompleted ? 1 : -1;

        await tx.analytics.upsert({
            where: {
                userId_date: {
                    userId,
                    date: today,
                },
            },
            update: {
                tasksCompleted: {
                    increment,
                },
            },
            create: {
                userId,
                date: today,
                tasksCompleted: isCompleted ? 1 : 0,
            },
        });
    }

    /**
     * Update focus time for today (Daily Snapshot)
     */
    static async recordFocusTime(userId: string, durationSeconds: number, tx: Prisma.TransactionClient | PrismaClient = defaultPrisma) {
        const today = startOfDay(new Date());

        await tx.analytics.upsert({
            where: {
                userId_date: {
                    userId,
                    date: today,
                },
            },
            update: {
                totalFocusTime: {
                    increment: durationSeconds,
                },
                totalPomodoros: {
                    increment: 1,
                },
            },
            create: {
                userId,
                date: today,
                totalFocusTime: durationSeconds,
                totalPomodoros: 1,
            },
        });
    }

    /**
     * Increment or decrement tasks completed for a project (Weightless Project Stats)
     */
    static async toggleProjectTaskCompletion(projectId: string | null | undefined, isCompleted: boolean, tx: Prisma.TransactionClient | PrismaClient = defaultPrisma) {
        if (!projectId) return;
        await tx.project.update({
            where: { id: projectId },
            data: {
                completedTasks: {
                    increment: isCompleted ? 1 : -1,
                },
            },
        });
    }

    /**
     * Update total task count for a project (when task is created/deleted/unlinked)
     */
    static async updateProjectTotalTasks(projectId: string | null | undefined, action: "increment" | "decrement", tx: Prisma.TransactionClient | PrismaClient = defaultPrisma) {
        if (!projectId) return;
        await tx.project.update({
            where: { id: projectId },
            data: {
                totalTasks: {
                    increment: action === "increment" ? 1 : -1,
                },
            },
        });
    }
}
