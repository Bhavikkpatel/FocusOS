"use client";

import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, SkipForward, Maximize2 } from "lucide-react";
import { useTimerStore } from "@/store/timer";
import { useThemeStore } from "@/store/theme";
import { formatDuration, calculateProgress } from "@/lib/utils";

import { PresetSelector } from "./preset-selector";

export function TimerDisplay() {
    const { colors } = useThemeStore();
    const {
        isRunning,
        isPaused,
        elapsed,
        total,
        sessionType,
        currentPreset,
        initWorker,
        start,
        pause,
        resume,
        reset,
        skip,
        setFocusMode,
    } = useTimerStore();

    // Initialize worker on mount
    useEffect(() => {
        initWorker();
    }, [initWorker]);

    // Calculate what to display
    // If timer is idle (not running, not paused), show the current preset's duration
    // Otherwise show the actual remaining time
    const displayTotal = (!isRunning && !isPaused && currentPreset)
        ? currentPreset.focusDuration  // Show preset duration in seconds when idle
        : total;

    const remaining = Math.max(0, displayTotal - elapsed);
    const progress = calculateProgress(elapsed, displayTotal);
    // For circular visualization: full circle (100%) at start, empty (0%) at end
    const remainingProgress = 100 - progress;

    const handleStartPause = () => {
        if (!currentPreset) return;

        if (isRunning) {
            pause();
        } else if (isPaused) {
            resume();
        } else {
            // Start new session
            // Convert seconds (from DB) to minutes (expected by start function)
            const duration = currentPreset.focusDuration / 60;
            start(duration, "FOCUS");
        }
    };

    const handleReset = () => {
        reset();
    };

    const handleSkip = () => {
        skip();
    };

    const getSessionLabel = () => {
        switch (sessionType) {
            case "FOCUS":
                return "Focus Time";
            case "SHORT_BREAK":
                return "Short Break";
            case "LONG_BREAK":
                return "Long Break";
        }
    };



    return (
        <div className="relative">
            <Card className="w-full max-w-md" style={{ backgroundColor: colors.background, color: colors.text }}>
                <CardHeader>
                    <CardTitle className="text-center text-2xl" style={{ color: colors.accent }}>
                        {getSessionLabel()}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Preset Selector */}
                    <div className="flex justify-center">
                        <PresetSelector />
                    </div>

                    {/* Circular Timer Display */}
                    <div className="flex items-center justify-center">
                        <div className="relative h-64 w-64">
                            {/* Background Circle */}
                            <svg className="h-full w-full -rotate-90 transform">
                                <circle
                                    cx="128"
                                    cy="128"
                                    r="120"
                                    stroke={colors.text}
                                    strokeWidth="8"
                                    fill="none"
                                    style={{ opacity: 0.2 }}
                                />
                                <circle
                                    cx="128"
                                    cy="128"
                                    r="120"
                                    stroke={colors.accent}
                                    strokeWidth="8"
                                    fill="none"
                                    strokeLinecap="round"
                                    className="transition-all duration-300"
                                    style={{
                                        strokeDasharray: `${2 * Math.PI * 120}`,
                                        strokeDashoffset: `${2 * Math.PI * 120 * (1 - remainingProgress / 100)}`,
                                    }}
                                />
                            </svg>
                            {/* Time Display */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-5xl font-bold" style={{ color: colors.text }}>
                                    {formatDuration(remaining)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <Progress value={progress} className="h-2" style={{ backgroundColor: colors.text + '20' }} />

                    {/* Control Buttons */}
                    <div className="flex items-center justify-center gap-4">
                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={handleReset}
                            disabled={!isRunning && !isPaused}
                            className="border-2"
                            style={{
                                borderColor: colors.text,
                                color: colors.text,
                                backgroundColor: 'transparent'
                            }}
                        >
                            <RotateCcw className="h-5 w-5" />
                        </Button>

                        <Button
                            size="lg"
                            onClick={handleStartPause}
                            className="h-16 w-16 rounded-full border-0"
                            disabled={!currentPreset}
                            style={{
                                backgroundColor: colors.accent,
                                color: '#ffffff',
                            }}
                        >
                            {isRunning ? (
                                <Pause className="h-8 w-8" />
                            ) : (
                                <Play className="h-8 w-8" />
                            )}
                        </Button>

                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={handleSkip}
                            disabled={!isRunning && !isPaused}
                            className="border-2"
                            style={{
                                borderColor: colors.text,
                                color: colors.text,
                                backgroundColor: 'transparent'
                            }}
                        >
                            <SkipForward className="h-5 w-5" />
                        </Button>
                    </div>

                    {/* Return to Focus Mode */}
                    {(isRunning || isPaused) && (
                        <div className="flex justify-center pt-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setFocusMode(true)}
                                className="gap-2 rounded-xl border-2 font-bold uppercase tracking-widest text-[10px]"
                                style={{
                                    borderColor: colors.accent + '40',
                                    color: colors.accent,
                                }}
                            >
                                <Maximize2 className="h-3 w-3" />
                                Return to Focus Mode
                            </Button>
                        </div>
                    )}

                    {/* Current Preset Info */}
                    {currentPreset && (
                        <div className="text-center text-sm" style={{ color: colors.text, opacity: 0.7 }}>
                            Using preset: <span className="font-medium">{currentPreset.name}</span>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div >
    );
}
