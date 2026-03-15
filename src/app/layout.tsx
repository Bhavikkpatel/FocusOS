import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { SessionConflictDialog } from "@/components/timer/session-conflict-dialog";
import { FocusRatingDialog } from "@/components/timer/focus-rating-dialog";
import { TimerInitializer } from "@/components/timer/timer-initializer";
import NextTopLoader from 'nextjs-toploader';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "FocusOS - Pomodoro Productivity App",
    description: "Modern Pomodoro timer with task management, analytics, and cross-device sync",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={inter.className}>
                <NextTopLoader color="#3B82F6" showSpinner={false} shadow="0 0 10px #3B82F6,0 0 5px #3B82F6" />
                <Providers>
                    <TimerInitializer />
                    {children}
                    <SessionConflictDialog />
                    <FocusRatingDialog />
                </Providers>
            </body>
        </html>
    );
}
