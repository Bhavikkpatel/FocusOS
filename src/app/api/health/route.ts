import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Try to perform a simple query to verify DB connection
        const userCount = await prisma.user.count();
        
        return NextResponse.json({ 
            status: "healthy", 
            database: "connected",
            userCount,
            timestamp: new Date().toISOString(),
            env: {
                hasDbUrl: !!process.env.DATABASE_URL,
                hasDirectUrl: !!process.env.DIRECT_URL,
                nodeEnv: process.env.NODE_ENV
            }
        });
    } catch (error: any) {
        console.error("Database health check failed:", error);
        return NextResponse.json({ 
            status: "unhealthy", 
            database: "disconnected",
            error: error.message,
            stack: process.env.NODE_ENV === "development" ? error.stack : undefined
        }, { status: 500 });
    }
}
