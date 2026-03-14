"use client";

import { useTimerStore } from "@/store/timer";
import { useThemeStore } from "@/store/theme";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export function PresetSelector() {
    const { presets, currentPreset, setCurrentPreset, isRunning, isPaused, reset } = useTimerStore();
    const { colors } = useThemeStore();

    // Debug logging
    console.log("PresetSelector - presets:", presets);
    console.log("PresetSelector - currentPreset:", currentPreset);

    const handlePresetChange = (presetId: string) => {
        const preset = presets.find((p) => p.id === presetId);
        if (preset) {
            setCurrentPreset(preset);

            // Reset timer if it's currently running or paused
            // This ensures the new preset's duration is applied
            if (isRunning || isPaused) {
                reset();
            }
        }
    };

    return (
        <div className="flex items-center gap-2">
            <Select
                value={currentPreset?.id || ""}
                onValueChange={handlePresetChange}
            >
                <SelectTrigger className="w-[200px]" style={{
                    borderColor: colors.text,
                    color: colors.text,
                    backgroundColor: 'transparent'
                }}>
                    <SelectValue placeholder="Select preset" />
                </SelectTrigger>
                <SelectContent>
                    {presets.map((preset) => (
                        <SelectItem key={preset.id} value={preset.id}>
                            {preset.name} ({Math.floor(preset.focusDuration / 60)}/
                            {Math.floor(preset.shortBreakDuration / 60)})
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
