"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { TimerDisplay } from "@/components/timer/timer-display";
import { useTimerStore } from "@/store/timer";
import { useThemeStore } from "@/store/theme";
import { PomodoroPreset } from "@/store/timer";


export default function TimerPage() {
    const { data: session } = useSession();
    const { setPresets } = useTimerStore();
    const { colors } = useThemeStore();

    // Fetch user's presets
    const { data: presets } = useQuery({
        queryKey: ["presets"],
        queryFn: async () => {
            const response = await fetch("/api/presets");
            if (!response.ok) throw new Error("Failed to fetch presets");
            return response.json() as Promise<PomodoroPreset[]>;
        },
        enabled: !!session,
    });

    // Update store when presets are loaded
    useEffect(() => {
        if (presets) {
            setPresets(presets);
        }
    }, [presets, setPresets]);

    return (
        <div className="flex h-full items-center justify-center transition-colors duration-300" style={{
            backgroundColor: colors.background,
            color: colors.text
        }}>
            <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-center">
                <TimerDisplay />
            </div>
        </div>
    );
}
