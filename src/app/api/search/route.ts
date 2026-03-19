import { NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const query = searchParams.get("q") || "";

        if (!query.trim()) {
            return NextResponse.json({ tasks: [], projects: [], tags: [] });
        }

        const [tasks, projects, tags] = await Promise.all([
            prisma.task.findMany({
                where: {
                    userId: session.user.id,
                    OR: [
                        { title: { contains: query, mode: "insensitive" } },
                        { description: { contains: query, mode: "insensitive" } },
                    ],
                },
                take: 5,
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    title: true,
                    status: true,
                    priority: true,
                    projectRef: { select: { id: true, name: true, color: true } }
                }
            }),
            prisma.project.findMany({
                where: {
                    userId: session.user.id,
                    OR: [
                        { name: { contains: query, mode: "insensitive" } },
                        { description: { contains: query, mode: "insensitive" } },
                    ],
                },
                take: 5,
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    name: true,
                    color: true,
                    _count: { select: { tasks: true } }
                }
            }),
            prisma.tag.findMany({
                where: {
                    userId: session.user.id,
                    name: { contains: query, mode: "insensitive" },
                },
                take: 5,
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    name: true,
                    color: true,
                }
            }),
        ]);

        return NextResponse.json({ tasks, projects, tags });
    } catch (error: any) {
        if (error.digest === 'DYNAMIC_SERVER_USAGE' || error.message?.includes('Dynamic server usage')) {
            throw error;
        }
        console.error("Search error:", error);
        return NextResponse.json(
            { error: "Failed to perform search" },
            { status: 500 }
        );
    }
}
