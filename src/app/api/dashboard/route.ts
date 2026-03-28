import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay, subDays, format } from "date-fns";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const energy = searchParams.get("energy");

        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const userId = session.user.id;
        const now = new Date();
        const todayStart = startOfDay(now);
        const todayEnd = endOfDay(now);

        // 1. Productivity Summary (Today) & User Goal
        const [todaySessions, todayCompletedTasks, userData] = await Promise.all([
            prisma.pomodoroSession.findMany({
                where: {
                    userId,
                    completedAt: { gte: todayStart, lte: todayEnd },
                    type: "FOCUS",
                },
                select: { duration: true },
            }),
            prisma.task.count({
                where: {
                    userId,
                    status: "COMPLETED",
                    completedAt: { gte: todayStart, lte: todayEnd },
                },
            }),
            prisma.user.findUnique({
                where: { id: userId },
                select: { dailyFocusGoal: true }
            })
        ]);

        const totalFocusTimeToday = todaySessions.reduce((acc, s) => acc + s.duration, 0);
        const sessionsCompletedToday = todaySessions.length;

        // 2. Weekly Focus Chart (Last 7 days)
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const date = subDays(todayStart, 6 - i);
            return {
                date,
                label: format(date, "EEE"),
                seconds: 0,
            };
        });

        const weeklySessions = await prisma.pomodoroSession.findMany({
            where: {
                userId,
                completedAt: { gte: subDays(todayStart, 6) },
                type: "FOCUS",
            },
            select: { duration: true, completedAt: true },
        });

        weeklySessions.forEach((s) => {
            const dayIndex = last7Days.findIndex(
                (d) => format(d.date, "yyyy-MM-dd") === format(s.completedAt, "yyyy-MM-dd")
            );
            if (dayIndex > -1) {
                last7Days[dayIndex].seconds += s.duration;
            }
        });

        const weeklyFocusData = last7Days.map((d) => ({
            name: d.label,
            minutes: Math.round(d.seconds / 60),
        }));

        // 3. Project Distribution
        const allFocusSessions = await prisma.pomodoroSession.findMany({
            where: { userId, type: "FOCUS" },
            include: { task: { select: { projectRef: { select: { name: true, color: true } } } } },
        });

        const projectMinutes: Record<string, { minutes: number; color: string }> = {};
        allFocusSessions.forEach((s) => {
            const projectName = s.task?.projectRef?.name || "No Project";
            const color = s.task?.projectRef?.color || "#94a3b8";
            if (!projectMinutes[projectName]) {
                projectMinutes[projectName] = { minutes: 0, color };
            }
            projectMinutes[projectName].minutes += Math.round(s.duration / 60);
        });

        const projectDistributionData = Object.entries(projectMinutes).map(([name, data]) => ({
            name,
            value: data.minutes,
            color: data.color,
        }));

        // 4. Upcoming Tasks (Filtered by Energy if applicable)
        const energyFilter = energy === "low" ? {
            OR: [
                { difficulty: "EASY" as const },
                { tags: { some: { name: { in: ["Admin", "Quick", "Low Energy"] } } } }
            ]
        } : {};

        const upcomingTasks = await prisma.task.findMany({
            where: {
                userId,
                status: { not: "COMPLETED" },
                ...(energyFilter as any)
            },
            include: { projectRef: true, tags: true },
            orderBy: [{ dueDate: "asc" }, { priority: "desc" }],
            take: 10,
        });

        const categorizedTasks = {
            overdue: upcomingTasks.filter((t) => t.dueDate && t.dueDate < todayStart),
            today: upcomingTasks.filter((t) => !t.dueDate || (t.dueDate >= todayStart && t.dueDate <= todayEnd)),
            tomorrow: upcomingTasks.filter((t) => t.dueDate && t.dueDate > todayEnd),
        };

        // 5. Active Projects
        const activeProjects = await prisma.project.findMany({
            where: { userId },
            include: {
                _count: {
                    select: {
                        tasks: { where: { status: { not: "COMPLETED" } } },
                    },
                },
                tasks: {
                    select: {
                        status: true,
                        pomodoroSessions: {
                            where: { type: "FOCUS" },
                            select: { duration: true },
                        },
                    },
                },
            },
            take: 5,
        });

        const projectStats = await Promise.all(activeProjects.map(async (p) => {
            const totalTasks = p.tasks.length;
            const completedTasks = p.tasks.filter((t) => t.status === "COMPLETED").length;
            const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
            const focusMinutes = p.tasks.reduce((acc, t) => {
                const sessionTime = t.pomodoroSessions.reduce((sum, s) => sum + s.duration, 0);
                return acc + Math.round(sessionTime / 60);
            }, 0);

            const oldestTask = await prisma.task.findFirst({
                where: { projectId: p.id, status: { not: "COMPLETED" } },
                orderBy: { createdAt: "asc" },
                select: { id: true, pomodoroDuration: true }
            });

            return {
                id: p.id,
                name: p.name,
                color: p.color,
                progress,
                tasksRemaining: p._count.tasks,
                focusMinutes,
                oldestTaskId: oldestTask?.id || null,
                oldestTaskDuration: oldestTask?.pomodoroDuration || 25,
            };
        }));

        return NextResponse.json({
            summary: {
                totalFocusTimeToday: Math.round(totalFocusTimeToday / 60),
                sessionsCompletedToday,
                tasksCompletedToday: todayCompletedTasks,
                dailyFocusGoal: userData?.dailyFocusGoal || 240,
            },
            weeklyFocusData,
            projectDistributionData,
            upcomingTasks: categorizedTasks,
            activeProjects: projectStats,
            heroTask: upcomingTasks.length > 0 ? upcomingTasks[0] : null,
        });
    } catch (error) {
        if (error instanceof Error && (error.message?.includes('Dynamic server usage') || (error as any).digest === 'DYNAMIC_SERVER_USAGE')) {
            throw error;
        }
        console.error("[DASHBOARD_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
