import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { SessionConflictDialog } from "@/components/timer/session-conflict-dialog";
import { FocusRatingDialog } from "@/components/timer/focus-rating-dialog";
import { TimerInitializer } from "@/components/timer/timer-initializer";
import NextTopLoader from 'nextjs-toploader';
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" });

export const metadata: Metadata = {
    title: "FocusOS - Pomodoro Productivity App",
    description: "Modern Pomodoro timer with task management, analytics, and cross-device sync",
};

import { CommandBar } from "@/components/command-bar";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning className={cn(inter.variable, jetbrains.variable)}>
            <body className="font-sans antialiased">
                <NextTopLoader color="#3B82F6" showSpinner={false} shadow="0 0 10px #3B82F6,0 0 5px #3B82F6" />
                <Providers>
                    <TimerInitializer />
                    {children}
                    <CommandBar />
                    <SessionConflictDialog />
                    <FocusRatingDialog />
                </Providers>
            </body>
        </html>
    );
}
