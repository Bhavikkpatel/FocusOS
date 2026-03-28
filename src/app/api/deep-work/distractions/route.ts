import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Fetch all deep work sessions for this user to filter in JS
        const sessions = await prisma.deepWorkSession.findMany({
            where: {
                userId: session.user.id,
            },
            include: {
                task: {
                    select: {
                        title: true,
                        id: true,
                        projectId: true
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        console.log(`[DISTRACTIONS_GET] Found ${sessions.length} sessions for user ${session.user.id}`);

        // Flatten distractions with session context
        const allDistractions = sessions.flatMap(session => {
            const distractions = (session.distractions as any[]) || [];
            if (distractions.length > 0) {
                console.log(`[DISTRACTIONS_GET] Session ${session.id} (Task: ${session.task?.title}) has ${distractions.length} distractions`);
            }
            return distractions.map((d, index) => ({
                id: `${session.id}-${index}`,
                sessionId: session.id,
                text: d.text,
                createdAt: d.createdAt || session.createdAt,
                context: {
                    taskTitle: session.task?.title || "Deep Work",
                    taskId: session.taskId,
                    projectId: session.projectId || session.task?.projectId || null
                }
            }));
        });

        console.log(`[DISTRACTIONS_GET] Total flattened distractions for response: ${allDistractions.length}`);

        return NextResponse.json(allDistractions);
    } catch (error) {
        console.error("[DISTRACTIONS_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
