import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { toast } from "sonner";

export type SessionType = "FOCUS" | "SHORT_BREAK" | "LONG_BREAK";

export interface PomodoroPreset {
    id: string;
    name: string;
    focusDuration: number;        // in minutes
    shortBreakDuration: number;   // in minutes
    longBreakDuration: number;    // in minutes
    sessionsUntilLongBreak: number;
    autoStartBreaks: boolean;
    autoStartFocus: boolean;
    isDefault: boolean;
}

export interface TimerState {
    // Timer state
    isRunning: boolean;
    isPaused: boolean;
    elapsed: number;              // in seconds
    total: number;                // in seconds
    sessionType: SessionType;
    sessionsCompleted: number;
    currentTaskId: string | null;
    interruptions: number;
    lastInterruptionTime: number;
    isFocusModeOpen: boolean;
    isFocusPromptOpen: boolean;
    isVictory: boolean;
    isCompletionDialogOpen: boolean;
    estimatedPomodoros: number | null;
    lastUpdated: number;         // timestamp
    sessionToRate: string | null;
    isAntiGravityMode: boolean;
    sessionDistractions: string[];
    deepWorkSessionId: string | null;

    activeSubtaskId: string | null;
    autoStartFocusTab: boolean;
    currentCalendarEventId: string | null;

    // Preset
    currentPreset: PomodoroPreset | null;
    presets: PomodoroPreset[];

    // Distraction Sync
    hasNewDistraction: boolean;
    resetDistractionSync: () => void;

    // Conflict state
    isConfirmingNewSession: { duration: number; type: SessionType; taskId: string } | null;

    // Worker
    worker: Worker | null;

    // Actions
    initWorker: () => void;
    start: (duration: number, type: SessionType, taskId?: string, estimatedPomodoros?: number, calendarEventId?: string | null) => void;
    pause: () => void;
    resume: () => void;
    reset: () => void;
    skip: () => void;
    setCurrentPreset: (preset: PomodoroPreset) => void;
    setPresets: (presets: PomodoroPreset[]) => void;
    updateTimerState: (payload: Partial<TimerState>) => void;
    completeSession: () => void;
    addInterruption: (note?: string) => void;
    setActiveSubtask: (id: string | null) => void;
    setFocusMode: (open: boolean) => void;
    setFocusPrompt: (open: boolean) => void;
    setConfirmingNewSession: (state: { duration: number; type: SessionType; taskId: string } | null) => void;
    confirmNewSession: () => void;
    setSessionToRate: (sessionId: string | null) => void;
    setAntiGravityMode: (val: boolean) => void;
    toggleAntiGravityMode: () => void;
    energyLevel: "HIGH" | "LOW";
    setEnergyLevel: (level: "HIGH" | "LOW") => void;
}

export const useTimerStore = create<TimerState>()(
    devtools(
        persist(
            (set, get) => ({
                // Initial state
                isRunning: false,
                isPaused: false,
                elapsed: 0,
                total: 0,
                sessionType: "FOCUS",
                sessionsCompleted: 0,
                currentTaskId: null,
                interruptions: 0,
                lastInterruptionTime: 0,
                isFocusModeOpen: false,
                isFocusPromptOpen: false,
                isVictory: false,
                isCompletionDialogOpen: false,
                estimatedPomodoros: null,
                isConfirmingNewSession: null,
                sessionToRate: null,
                currentPreset: null,
                lastUpdated: Date.now(),
                presets: [],
                worker: null,
                isAntiGravityMode: true,
                energyLevel: "HIGH",
                setEnergyLevel: (level: "HIGH" | "LOW") => set({ energyLevel: level }),
                sessionDistractions: [],
                deepWorkSessionId: null,
                activeSubtaskId: null,
                autoStartFocusTab: true,
                currentCalendarEventId: null,
                hasNewDistraction: false,

                initWorker: () => {
                    if (typeof window === "undefined") return;

                    // Prevent duplicate worker creation
                    if (get().worker) return;

                    const worker = new Worker("/timer-worker.js");

                    worker.onmessage = (e: MessageEvent) => {
                        const { type, payload } = e.data;

                        if (type === "TICK") {
                            set({
                                elapsed: payload.elapsed,
                                total: payload.total,
                                isRunning: payload.isRunning,
                                lastUpdated: Date.now(),
                            });
                        } else if (type === "COMPLETE") {
                            get().completeSession();
                        }
                    };

                    // Sync worker with current store state (for rehydration)
                    const state = get();
                    let { elapsed, isRunning } = state;
                    const { total, lastUpdated } = state;

                    // Story 2: Handle time gap while page was closed
                    if (isRunning && lastUpdated > 0) {
                        const gap = Math.floor((Date.now() - lastUpdated) / 1000);
                        if (gap > 0) {
                            elapsed += gap;
                            if (elapsed >= total) {
                                elapsed = total;
                                isRunning = false;
                                // Session will be completed by the handle session logic below
                            }
                        }
                    }

                    if (elapsed > 0 || isRunning) {
                        worker.postMessage({
                            type: "SYNC",
                            payload: { elapsed, total, isRunning }
                        });
                    }

                    set({ worker, elapsed, isRunning });

                    // If we finished a session during the gap
                    if (isRunning === false && elapsed >= total && total > 0) {
                        setTimeout(() => get().completeSession(), 100);
                    }
                },

                start: (duration: number, type: SessionType, taskId?: string, estimatedPomodoros?: number, calendarEventId?: string | null) => {
                    const state = get();
                    const { worker, isRunning, currentTaskId } = state;

                    // Story 5: Prevent multiple active focus sessions
                    if (isRunning && taskId && currentTaskId && taskId !== currentTaskId) {
                        set({ isConfirmingNewSession: { duration, type, taskId } });
                        return;
                    }

                    if (!worker) {
                        get().initWorker();
                        // Wait for worker to initialize
                        setTimeout(() => {
                            get().start(duration, type, taskId);
                        }, 100);
                        return;
                    }

                    const totalSeconds = duration * 60;

                    worker.postMessage({
                        type: "START",
                        payload: { duration: totalSeconds },
                    });

                    set({
                        isRunning: true,
                        isPaused: false,
                        elapsed: 0,
                        total: totalSeconds,
                        sessionType: type,
                        currentTaskId: taskId || null,
                        currentCalendarEventId: calendarEventId || null,
                        estimatedPomodoros: estimatedPomodoros !== undefined ? estimatedPomodoros : state.estimatedPomodoros,
                        interruptions: 0,
                        lastInterruptionTime: 0,
                        isVictory: false,
                        isCompletionDialogOpen: false,
                        sessionDistractions: [],
                        // Feature: Centralized focus prompt logic
                        // Decoupled: Only show prompt if starting a session WITHOUT a taskId (Deep Session)
                        isFocusPromptOpen: type === "FOCUS" && !state.isFocusModeOpen && !taskId
                    });

                    // Start Deep Work Session ONLY if it's an explicit Deep Session (no taskId)
                    // Regular task focus sessions (with taskId) will no longer trigger DeepWorkSession entries
                    if (type === "FOCUS" && !taskId && !state.deepWorkSessionId) {
                        fetch("/api/deep-work/start", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ taskId: undefined }) 
                        })
                        .then(res => res.json())
                        .then(data => {
                            if (data?.id) {
                                set({ deepWorkSessionId: data.id });
                                console.log(`[TimerStore] Deep work session started: ${data.id}`);
                            }
                        })
                        .catch(err => console.error("Error starting deep work session:", err));
                    }
                },

                pause: () => {
                    let { worker } = get();
                    if (!worker) {
                        get().initWorker();
                        worker = get().worker;
                    }
                    worker?.postMessage({ type: "PAUSE" });

                    // Story 8: Track manual timer pauses as interruptions if it's a focus session
                    if (get().sessionType === "FOCUS") {
                        get().addInterruption();
                    }

                    set({ isRunning: false, isPaused: true, lastUpdated: Date.now() });
                },

                resume: () => {
                    let { worker } = get();
                    if (!worker) {
                        get().initWorker();
                        worker = get().worker;
                    }
                    worker?.postMessage({ type: "RESUME" });
                    set({ isRunning: true, isPaused: false, lastUpdated: Date.now() });
                },

                reset: () => {
                    let { worker } = get();
                    if (!worker) {
                        get().initWorker();
                        worker = get().worker;
                    }
                    worker?.postMessage({ type: "RESET" });
                    set({
                        isRunning: false,
                        isPaused: false,
                        elapsed: 0,
                        interruptions: 0,
                        lastInterruptionTime: 0,
                        lastUpdated: Date.now(),
                        deepWorkSessionId: null, // Reset session ID on fresh start
                        sessionDistractions: []
                    });
                },

                skip: () => {
                    get().reset();
                    get().completeSession();
                },

                setCurrentPreset: (preset: PomodoroPreset) => {
                    set({ currentPreset: preset });
                },

                setPresets: (presets: PomodoroPreset[]) => {
                    set({ presets });
                    const defaultPreset = presets.find((p) => p.isDefault);
                    if (defaultPreset && !get().currentPreset) {
                        set({ currentPreset: defaultPreset });
                    }
                },

                updateTimerState: (payload: Partial<TimerState>) => {
                    set(payload);
                },

                completeSession: () => {
                    const state = get();
                    const { sessionType, sessionsCompleted, currentPreset, elapsed, total, interruptions, currentTaskId, currentCalendarEventId, estimatedPomodoros } = state;

                    set({ isRunning: false, isPaused: false });

                    // Determine next session type
                    let nextSessionType: SessionType;
                    let nextSessionsCompleted = sessionsCompleted;

                    if (sessionType === "FOCUS") {
                        nextSessionsCompleted += 1;
                        const shouldLongBreak =
                            currentPreset &&
                            nextSessionsCompleted % currentPreset.sessionsUntilLongBreak === 0;

                        nextSessionType = shouldLongBreak ? "LONG_BREAK" : "SHORT_BREAK";
                    } else {
                        nextSessionType = "FOCUS";
                    }

                    set({ sessionsCompleted: nextSessionsCompleted });

                    // Story 8.1: Elastic Timeline - Shift subsequent tasks if overrun
                    if (sessionType === "FOCUS" && currentCalendarEventId && elapsed > total) {
                        const overrunSeconds = elapsed - total;
                        const shiftMinutes = Math.ceil(overrunSeconds / 60);
                        
                        fetch("/api/calendar/shift-after", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                eventId: currentCalendarEventId,
                                shiftMinutes: shiftMinutes,
                            })
                        })
                        .then(res => res.json())
                        .then(data => {
                            if (data.success && data.shiftedCount > 0) {
                                toast.info(`Timeline adjusted by ${shiftMinutes}m`, {
                                    description: `${data.shiftedCount} tasks shifted forward.`,
                                    action: {
                                        label: "Undo",
                                        onClick: () => {
                                            fetch("/api/calendar/shift-after", {
                                                method: "POST",
                                                headers: { "Content-Type": "application/json" },
                                                body: JSON.stringify({
                                                    eventId: currentCalendarEventId,
                                                    shiftMinutes: -shiftMinutes,
                                                })
                                            }).then(() => {
                                                toast.success("Timeline restored");
                                            }).catch(err => console.error("Error restoring timeline:", err));
                                        }
                                    }
                                });
                            }
                        })
                        .catch(err => console.error("Error shifting timeline:", err));
                    }

                    // Story 3 & 4: Link session to task and store metadata
                    if (sessionType === "FOCUS" && currentTaskId) {
                        fetch(`/api/tasks/${currentTaskId}/pomodoro`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                type: sessionType,
                                duration: elapsed,
                                interruptions: interruptions,
                                wasInterrupted: false, // Session completed normally
                                deepWorkSessionId: state.deepWorkSessionId, // Link to Deep Work Session
                            })
                        })
                            .then(async (res) => {
                                if (!res.ok) {
                                    console.error("Failed to increment task pomodoros");
                                    return;
                                }
                                const data = await res.json();
                                // Set the new session ID to trigger the rating dialog
                                if (data && data.sessionId) {
                                    set({ sessionToRate: data.sessionId });
                                }
                            })
                            .catch((err) => console.error("Error incrementing pomodoros:", err));
                    }

                    // Auto-start next session if enabled
                    if (currentPreset) {
                        const shouldAutoStart =
                            (nextSessionType === "FOCUS" && currentPreset.autoStartFocus) ||
                            (nextSessionType !== "FOCUS" && currentPreset.autoStartBreaks);

                        if (shouldAutoStart) {
                            // Get duration in seconds from preset
                            const durationSeconds =
                                nextSessionType === "FOCUS"
                                    ? currentPreset.focusDuration
                                    : nextSessionType === "SHORT_BREAK"
                                        ? currentPreset.shortBreakDuration
                                        : currentPreset.longBreakDuration;

                            // Convert to minutes for start function
                            const durationMinutes = durationSeconds / 60;

                            setTimeout(() => {
                                get().start(durationMinutes, nextSessionType);
                            }, 1000);
                        }
                    }

                    // Victory detection: config sessions over AND break is over
                    if ((sessionType === "SHORT_BREAK" || sessionType === "LONG_BREAK") &&
                        estimatedPomodoros &&
                        sessionsCompleted >= estimatedPomodoros) {
                        set({ isVictory: true });
                    }
                },

                addInterruption: (note?: string) => {
                    const now = Date.now();
                    const state = get();
                    
                    set({
                        interruptions: state.interruptions + 1,
                        sessionDistractions: note ? [...state.sessionDistractions, note] : state.sessionDistractions,
                        lastInterruptionTime: now
                    });

                    // Sync with Deep Work Session if active and note provided
                    if (state.deepWorkSessionId && note) {
                        fetch(`/api/deep-work/${state.deepWorkSessionId}/distractions`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ text: note })
                        })
                        .then(res => {
                            if (res.ok) {
                                set({ hasNewDistraction: true }); // Only trigger sync AFTER success
                            } else {
                                toast.error("Failed to sync distraction");
                            }
                        })
                        .catch(err => {
                            console.error("Error syncing distraction:", err);
                            toast.error("Connectivity error: Distraction not saved");
                        });
                    }
                },
                resetDistractionSync: () => set({ hasNewDistraction: false }),
                setActiveSubtask: (id: string | null) => set({ activeSubtaskId: id }),
                setFocusMode: (open: boolean) => set({ isFocusModeOpen: open }),
                setFocusPrompt: (open: boolean) => set({ isFocusPromptOpen: open }),
                setConfirmingNewSession: (val) => set({ isConfirmingNewSession: val }),
                confirmNewSession: () => {
                    const { isConfirmingNewSession } = get();
                    if (!isConfirmingNewSession) return;

                    // Reset current timer
                    get().reset();

                    // Start new one
                    get().start(
                        isConfirmingNewSession.duration,
                        isConfirmingNewSession.type,
                        isConfirmingNewSession.taskId
                    );

                    set({ isConfirmingNewSession: null });
                },
                setSessionToRate: (sessionId: string | null) => set({ sessionToRate: sessionId }),
                setAntiGravityMode: (val) => set({ isAntiGravityMode: val }),
                toggleAntiGravityMode: () => set((state) => ({ isAntiGravityMode: !state.isAntiGravityMode })),
            }),
            {
                name: "timer-storage",
                partialize: (state) => ({
                    currentPreset: state.currentPreset,
                    sessionsCompleted: state.sessionsCompleted,
                    // Story 6: Resume Active Session after navigation
                    isRunning: state.isRunning,
                    isPaused: state.isPaused,
                    elapsed: state.elapsed,
                    total: state.total,
                    sessionType: state.sessionType,
                    currentTaskId: state.currentTaskId,
                    estimatedPomodoros: state.estimatedPomodoros,
                    lastUpdated: state.lastUpdated,
                    isAntiGravityMode: state.isAntiGravityMode,
                    deepWorkSessionId: state.deepWorkSessionId,
                    currentCalendarEventId: state.currentCalendarEventId,
                    hasNewDistraction: state.hasNewDistraction,
                }),
            }
        )
    )
);
