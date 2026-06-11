"use client";

import { useSettings } from "@/store/settings";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Timer, Zap, History, Sliders, Calendar, BarChart2, Lightbulb } from "lucide-react";

export function PreferencesSettings() {
    const {
        enablePomodoro,
        enableHighEnergySession,
        showHistoryView,
        showAvailabilityRibbon,
        enableAnalytics,
        enableInsights,
        setEnablePomodoro,
        setEnableHighEnergySession,
        setShowHistoryView,
        setShowAvailabilityRibbon,
        setEnableAnalytics,
        setEnableInsights,
    } = useSettings();

    return (
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 shadow-sm rounded-xl">
            <CardHeader className="p-6 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <Sliders className="h-5 w-5" />
                    </div>
                    <div>
                        <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">Workspace Preferences</CardTitle>
                        <CardDescription className="text-xs text-slate-500 mt-1">
                             Customize your FocusOS core workspace protocols and interface modes.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-6 divide-y divide-slate-100 dark:divide-slate-800/60">
                {/* 1. Enable Pomodoro Toggle */}
                <div className="flex items-start justify-between py-6 first:pt-0">
                    <div className="flex items-start gap-4">
                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 text-slate-500 mt-0.5">
                            <Timer className="h-5 w-5" />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="pomodoro-toggle" className="text-sm font-bold text-slate-900 dark:text-white">
                                Focus Timer (Pomodoro)
                            </Label>
                            <p className="text-xs text-slate-500 max-w-md">
                                Enable the focus timer execution panel, Pomodoro estimates, and Zenith Mode protocols within task detail views.
                            </p>
                        </div>
                    </div>
                    <Switch
                        id="pomodoro-toggle"
                        checked={enablePomodoro}
                        onCheckedChange={setEnablePomodoro}
                        className="scale-95"
                    />
                </div>

                {/* 2. Enable High Energy Sessions Toggle */}
                <div className="flex items-start justify-between py-6">
                    <div className="flex items-start gap-4">
                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 text-slate-500 mt-0.5">
                            <Zap className="h-5 w-5" />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="energy-toggle" className="text-sm font-bold text-slate-900 dark:text-white">
                                High Energy Sessions
                            </Label>
                            <p className="text-xs text-slate-500 max-w-md">
                                Display energy level selectors in the workspace header, allowing you to toggle tasks by energy batching filters.
                            </p>
                        </div>
                    </div>
                    <Switch
                        id="energy-toggle"
                        checked={enableHighEnergySession}
                        onCheckedChange={setEnableHighEnergySession}
                        className="scale-95"
                    />
                </div>

                {/* 3. Enable History View Toggle */}
                <div className="flex items-start justify-between py-6">
                    <div className="flex items-start gap-4">
                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 text-slate-500 mt-0.5">
                            <History className="h-5 w-5" />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="history-toggle" className="text-sm font-bold text-slate-900 dark:text-white">
                                Task History & Timeline
                            </Label>
                            <p className="text-xs text-slate-500 max-w-md">
                                Display detailed execution timelines, focus session counts, and rating history inside the task detail tabs.
                            </p>
                        </div>
                    </div>
                    <Switch
                        id="history-toggle"
                        checked={showHistoryView}
                        onCheckedChange={setShowHistoryView}
                        className="scale-95"
                    />
                </div>

                {/* 4. Enable Availability Ribbon Toggle */}
                <div className="flex items-start justify-between py-6">
                    <div className="flex items-start gap-4">
                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 text-slate-500 mt-0.5">
                            <Calendar className="h-5 w-5" />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="ribbon-toggle" className="text-sm font-bold text-slate-900 dark:text-white">
                                Daily Availability Ribbon
                            </Label>
                            <p className="text-xs text-slate-500 max-w-md">
                                Display the interactive hour allocation slots and daily schedule block inside the task details sidebar.
                            </p>
                        </div>
                    </div>
                    <Switch
                        id="ribbon-toggle"
                        checked={showAvailabilityRibbon}
                        onCheckedChange={setShowAvailabilityRibbon}
                        className="scale-95"
                    />
                </div>

                {/* 5. Enable Analytics View Toggle */}
                <div className="flex items-start justify-between py-6">
                    <div className="flex items-start gap-4">
                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 text-slate-500 mt-0.5">
                            <BarChart2 className="h-5 w-5" />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="analytics-toggle" className="text-sm font-bold text-slate-900 dark:text-white">
                                Analytics dashboard
                            </Label>
                            <p className="text-xs text-slate-500 max-w-md">
                                Enable the core focus and performance analytics tab to analyze focus sessions, completed workflows, and velocity graphs.
                            </p>
                        </div>
                    </div>
                    <Switch
                        id="analytics-toggle"
                        checked={enableAnalytics}
                        onCheckedChange={setEnableAnalytics}
                        className="scale-95"
                    />
                </div>

                {/* 6. Enable Dashboard Insights Toggle */}
                <div className="flex items-start justify-between py-6 last:pb-0">
                    <div className="flex items-start gap-4">
                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 text-slate-500 mt-0.5">
                            <Lightbulb className="h-5 w-5" />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="insights-toggle" className="text-sm font-bold text-slate-900 dark:text-white">
                                Dashboard insights
                            </Label>
                            <p className="text-xs text-slate-500 max-w-md">
                                Display the productivity insights, behavioral trends, and focus optimization suggestions tab in your Launchpad.
                            </p>
                        </div>
                    </div>
                    <Switch
                        id="insights-toggle"
                        checked={enableInsights}
                        onCheckedChange={setEnableInsights}
                        className="scale-95"
                    />
                </div>
            </CardContent>
        </Card>
    );
}
