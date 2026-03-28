import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";

export async function GET() {
    try {
        const isSelfHosted = process.env.IS_SELF_HOSTED === "true" || process.env.NODE_ENV === "development";

        let config = await prisma.systemConfig.findUnique({
            where: { id: "singleton" }
        });

        if (!config) {
            config = await prisma.systemConfig.create({
                data: {
                    id: "singleton",
                    enableGoogleAuth: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
                    enableCredentialsAuth: true
                }
            });
        }

        const envStatus = {
            hasGoogleSecret: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
            hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
            hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
            isSelfHosted
        };

        return NextResponse.json({ config, envStatus });
    } catch (error) {
        console.error("CONFIG_GET_ERROR", error);
        return NextResponse.json({ error: "Failed to fetch config" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const isSelfHosted = process.env.IS_SELF_HOSTED === "true" || process.env.NODE_ENV === "development";

        if (!isSelfHosted) {
            const session = await getServerSession(authOptions);
            if (!session) {
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }
        }

        const { enableGoogleAuth, enableCredentialsAuth } = await req.json();

        const config = await prisma.systemConfig.upsert({
            where: { id: "singleton" },
            update: {
                enableGoogleAuth: enableGoogleAuth ?? undefined,
                enableCredentialsAuth: enableCredentialsAuth ?? undefined,
            },
            create: {
                id: "singleton",
                enableGoogleAuth: enableGoogleAuth ?? false,
                enableCredentialsAuth: enableCredentialsAuth ?? true,
            }
        });

        return NextResponse.json(config);
    } catch (error) {
        console.error("CONFIG_POST_ERROR", error);
        return NextResponse.json({ error: "Failed to update config" }, { status: 500 });
    }
}
