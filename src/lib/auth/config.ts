import { type NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { prisma } from "@/lib/prisma";
import type { Adapter } from "next-auth/adapters";

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma) as Adapter,
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
        GitHubProvider({
            clientId: process.env.GITHUB_CLIENT_ID || "",
            clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
        }),
    ],
    pages: {
        signIn: "/auth/signin",
        error: "/auth/error",
    },
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    callbacks: {
        async jwt({ token, user, account }) {
            if (user) {
                token.id = user.id;
            }
            if (account) {
                token.accessToken = account.access_token;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
            }
            return session;
        },
    },
    events: {
        async createUser({ user }) {
            try {
                console.log("Creating default data for user:", user.id);
                // Create Daily project for new user
                await prisma.project.create({
                    data: {
                        name: "Daily",
                        color: "#3B82F6",
                        userId: user.id,
                        columns: {
                            create: [
                                { name: "To Do", sortOrder: 0 },
                                { name: "In Progress", sortOrder: 1 },
                                { name: "Review", sortOrder: 2 },
                                { name: "Done", sortOrder: 3 },
                            ],
                        },
                    },
                });

                // Create default presets for new user
                const defaultPresets = [
                    {
                        name: "Classic Pomodoro",
                        focusDuration: 25,
                        shortBreakDuration: 5,
                        longBreakDuration: 15,
                        sessionsUntilLongBreak: 4,
                        autoStartBreaks: true,
                        autoStartFocus: false,
                        isDefault: true,
                        userId: user.id,
                    },
                    {
                        name: "Deep Work",
                        focusDuration: 50,
                        shortBreakDuration: 10,
                        longBreakDuration: 30,
                        sessionsUntilLongBreak: 3,
                        autoStartBreaks: true,
                        autoStartFocus: false,
                        isDefault: false,
                        userId: user.id,
                    },
                    {
                        name: "Flow State",
                        focusDuration: 90,
                        shortBreakDuration: 15,
                        longBreakDuration: 30,
                        sessionsUntilLongBreak: 2,
                        autoStartBreaks: false,
                        autoStartFocus: false,
                        isDefault: false,
                        userId: user.id,
                    },
                ];

                for (const preset of defaultPresets) {
                    await prisma.pomodoroPreset.create({ data: preset });
                }
            } catch (error) {
                console.error("FAILED to create default data for user:", error);
                // We DON'T re-throw here so the user can still log in
            }
        },
    },
    debug: true,
};
