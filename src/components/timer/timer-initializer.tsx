"use client";

import { useEffect } from "react";
import { useTimerStore } from "@/store/timer";

export function TimerInitializer() {
    const initWorker = useTimerStore((state) => state.initWorker);

    useEffect(() => {
        initWorker();
    }, [initWorker]);

    // Story 8: Track tab switches and window blur events
    useEffect(() => {
        const handleDistraction = () => {
            const state = useTimerStore.getState();
            if (state.isRunning && state.sessionType === "FOCUS") {
                state.addInterruption();
            }
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === "hidden") {
                handleDistraction();
            }
        };

        window.addEventListener("blur", handleDistraction);
        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            window.removeEventListener("blur", handleDistraction);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, []);

    return null;
}
