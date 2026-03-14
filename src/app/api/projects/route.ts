import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createProjectSchema = z.object({
    name: z.string().min(1).max(100),
    description: z.string().optional(),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
});

const DEFAULT_COLUMNS = [
    { name: "To Do", sortOrder: 0 },
    { name: "In Progress", sortOrder: 1 },
    { name: "Review", sortOrder: 2 },
    { name: "Done", sortOrder: 3 },
];

// GET /api/projects — List all projects for the user
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const projects = await prisma.project.findMany({
            where: { userId: session.user.id },
            include: {
                columns: { orderBy: { sortOrder: "asc" } },
                _count: { select: { tasks: true } },
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
            orderBy: { createdAt: "desc" },
        });

        // Self-healing migration: Ensure "Daily" project exists
        const dailyProject = projects.find(p => p.name === "Daily");
        if (!dailyProject) {
            console.log(`Creating missing 'Daily' project for user ${session.user.id}`);
            const newDaily = await prisma.project.create({
                data: {
                    name: "Daily",
                    color: "#3B82F6",
                    userId: session.user.id,
                    columns: {
                        create: DEFAULT_COLUMNS,
                    },
                },
                include: {
                    columns: { orderBy: { sortOrder: "asc" } },
                    _count: { select: { tasks: true } },
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
            });
            projects.unshift(newDaily);
        }

        // Compute stats for each project
        const projectsWithStats = projects.map((project) => {
            const totalTasks = project.tasks.length;
            const completedTasks = project.tasks.filter(
                (t) => t.status === "COMPLETED"
            ).length;
            const totalFocusTime = project.tasks.reduce(
                (sum, t) =>
                    sum +
                    t.pomodoroSessions.reduce((s, ps) => s + ps.duration, 0),
                0
            );

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { tasks: _tasks, _count: _c, ...rest } = project;
            return {
                ...rest,
                totalTasks,
                completedTasks,
                totalFocusTime,
            };
        });

        return NextResponse.json(projectsWithStats);
    } catch (error) {
        console.error("Failed to fetch projects:", error);
        return NextResponse.json(
            { error: "Failed to fetch projects" },
            { status: 500 }
        );
    }
}

// POST /api/projects — Create a new project with default columns
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const data = createProjectSchema.parse(body);

        const project = await prisma.project.create({
            data: {
                name: data.name,
                description: data.description,
                color: data.color || "#3B82F6",
                userId: session.user.id,
                columns: {
                    create: DEFAULT_COLUMNS,
                },
            },
            include: {
                columns: { orderBy: { sortOrder: "asc" } },
            },
        });

        return NextResponse.json(project, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Invalid input", details: error.errors },
                { status: 400 }
            );
        }
        console.error("Failed to create project:", error);
        return NextResponse.json(
            { error: "Failed to create project" },
            { status: 500 }
        );
    }
}
