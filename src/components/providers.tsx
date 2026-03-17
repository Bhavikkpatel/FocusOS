"use client";

import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { FloatingTimer } from "@/components/timer/floating-timer";
import { FocusMode } from "@/components/timer/focus-mode";
import { FocusPromptDialog } from "@/components/timer/focus-prompt-dialog";
import { ThemeProvider } from "next-themes";
import { CompletionDialog } from "@/components/timer/completion-dialog";

export function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 60 * 1000, // 1 minute
                        refetchOnWindowFocus: false,
                    },
                },
            })
    );

    return (
        <SessionProvider>
            <QueryClientProvider client={queryClient}>
                <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                    {children}
                    <Toaster />
                    <SonnerToaster />
                    <FloatingTimer />
                    <FocusMode />
                    <FocusPromptDialog />
                    <CompletionDialog />
                </ThemeProvider>
            </QueryClientProvider>
        </SessionProvider>
    );
}
