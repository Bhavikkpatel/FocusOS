"use client";

import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Settings2, Check } from "lucide-react";
import { useThemeStore, predefinedThemes } from "@/store/theme";
import { cn } from "@/lib/utils";

export function SettingsPanel() {
    const { colors, currentThemeId, setTheme, setColors } = useThemeStore();

    const handleThemeSelect = (theme: typeof predefinedThemes[0]) => {
        setTheme(theme);
    };

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button
                    size="icon"
                    variant="ghost"
                    title="Settings"
                >
                    <Settings2 className="h-5 w-5" />
                </Button>
            </SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Settings</SheetTitle>
                    <SheetDescription>
                        Customize your timer appearance
                    </SheetDescription>
                </SheetHeader>

                <div className="mt-6 space-y-6">
                    {/* Theme Section */}
                    <div className="space-y-3">
                        <Label className="text-base font-semibold">Color Themes</Label>
                        <div className="grid grid-cols-2 gap-3">
                            {predefinedThemes.map((theme) => (
                                <button
                                    key={theme.id}
                                    onClick={() => handleThemeSelect(theme)}
                                    className={cn(
                                        "group relative flex flex-col items-center gap-2 rounded-lg border-2 p-3 transition-all hover:border-primary",
                                        currentThemeId === theme.id
                                            ? "border-primary bg-primary/5"
                                            : "border-border"
                                    )}
                                >
                                    {/* Color Preview Circle */}
                                    <div
                                        className="relative h-12 w-12 rounded-full border-4 transition-transform group-hover:scale-110"
                                        style={{
                                            backgroundColor: theme.colors.background,
                                            borderColor: theme.colors.accent,
                                        }}
                                    >
                                        {currentThemeId === theme.id && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <Check className="h-5 w-5" style={{ color: theme.colors.accent }} />
                                            </div>
                                        )}
                                    </div>

                                    {/* Theme Name */}
                                    <span className="text-xs font-medium">
                                        {theme.name}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Custom Colors Section */}
                    <div className="space-y-3">
                        <Label className="text-base font-semibold">Custom Colors</Label>

                        {/* Background Color */}
                        <div className="space-y-2">
                            <Label htmlFor="bg-color" className="text-sm">
                                Background
                            </Label>
                            <div className="flex items-center gap-3">
                                {/* Visual preview circle */}
                                <div
                                    className="h-10 w-10 rounded-full border-2 border-border flex-shrink-0"
                                    style={{ backgroundColor: colors.background }}
                                />
                                <input
                                    id="bg-color"
                                    type="color"
                                    value={colors.background}
                                    onChange={(e) =>
                                        setColors({ background: e.target.value })
                                    }
                                    className="h-10 w-16 cursor-pointer rounded-md border"
                                />
                                <input
                                    type="text"
                                    value={colors.background}
                                    onChange={(e) =>
                                        setColors({ background: e.target.value })
                                    }
                                    className="flex h-10 flex-1 rounded-md border border-input bg-background px-3 text-sm"
                                />
                            </div>
                        </div>

                        {/* Accent Color */}
                        <div className="space-y-2">
                            <Label htmlFor="accent-color" className="text-sm">
                                Accent (Timer Ring)
                            </Label>
                            <div className="flex items-center gap-3">
                                {/* Visual preview circle */}
                                <div
                                    className="h-10 w-10 rounded-full border-2 flex-shrink-0"
                                    style={{
                                        backgroundColor: 'transparent',
                                        borderColor: colors.accent
                                    }}
                                />
                                <input
                                    id="accent-color"
                                    type="color"
                                    value={colors.accent}
                                    onChange={(e) =>
                                        setColors({ accent: e.target.value })
                                    }
                                    className="h-10 w-16 cursor-pointer rounded-md border"
                                />
                                <input
                                    type="text"
                                    value={colors.accent}
                                    onChange={(e) =>
                                        setColors({ accent: e.target.value })
                                    }
                                    className="flex h-10 flex-1 rounded-md border border-input bg-background px-3 text-sm"
                                />
                            </div>
                        </div>

                        {/* Text Color */}
                        <div className="space-y-2">
                            <Label htmlFor="text-color" className="text-sm">
                                Text Color
                            </Label>
                            <div className="flex items-center gap-3">
                                {/* Visual preview circle */}
                                <div
                                    className="h-10 w-10 rounded-full border-2 border-border flex-shrink-0"
                                    style={{ backgroundColor: colors.text }}
                                />
                                <input
                                    id="text-color"
                                    type="color"
                                    value={colors.text}
                                    onChange={(e) =>
                                        setColors({ text: e.target.value })
                                    }
                                    className="h-10 w-16 cursor-pointer rounded-md border"
                                />
                                <input
                                    type="text"
                                    value={colors.text}
                                    onChange={(e) =>
                                        setColors({ text: e.target.value })
                                    }
                                    className="flex h-10 flex-1 rounded-md border border-input bg-background px-3 text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Live Preview */}
                    <div className="space-y-2">
                        <Label className="text-base font-semibold">Preview</Label>
                        <div
                            className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 p-4 transition-colors"
                            style={{ backgroundColor: colors.background }}
                        >
                            <div
                                className="h-16 w-16 rounded-full border-4 transition-colors"
                                style={{ borderColor: colors.accent }}
                            />
                            <span className="text-sm font-medium" style={{ color: colors.text }}>
                                90:00
                            </span>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
