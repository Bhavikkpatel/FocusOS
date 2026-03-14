"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Settings2 } from "lucide-react";
import { useThemeStore } from "@/store/theme";

export function ThemeSettings() {
    const { colors, setColors, resetColors } = useThemeStore();
    const [open, setOpen] = useState(false);
    const [tempColors, setTempColors] = useState(colors);

    const handleSave = () => {
        setColors(tempColors);
        setOpen(false);
    };

    const handleReset = () => {
        resetColors();
        setTempColors({ background: "#ffffff", accent: "#3b82f6", text: "#0f172a" });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="icon" variant="outline" title="Theme settings">
                    <Settings2 className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Theme Settings</DialogTitle>
                    <DialogDescription>
                        Customize your timer&apos;s colors
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                    {/* Background Color */}
                    <div className="grid gap-2">
                        <Label htmlFor="background">Background Color</Label>
                        <div className="flex items-center gap-3">
                            <input
                                id="background"
                                type="color"
                                value={tempColors.background}
                                onChange={(e) =>
                                    setTempColors({
                                        ...tempColors,
                                        background: e.target.value,
                                    })
                                }
                                className="h-10 w-20 cursor-pointer rounded border"
                            />
                            <input
                                type="text"
                                value={tempColors.background}
                                onChange={(e) =>
                                    setTempColors({
                                        ...tempColors,
                                        background: e.target.value,
                                    })
                                }
                                className="flex h-10 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                                placeholder="#ffffff"
                            />
                        </div>
                    </div>

                    {/* Accent Color */}
                    <div className="grid gap-2">
                        <Label htmlFor="accent">Accent Color (Timer)</Label>
                        <div className="flex items-center gap-3">
                            <input
                                id="accent"
                                type="color"
                                value={tempColors.accent}
                                onChange={(e) =>
                                    setTempColors({
                                        ...tempColors,
                                        accent: e.target.value,
                                    })
                                }
                                className="h-10 w-20 cursor-pointer rounded border"
                            />
                            <input
                                type="text"
                                value={tempColors.accent}
                                onChange={(e) =>
                                    setTempColors({
                                        ...tempColors,
                                        accent: e.target.value,
                                    })
                                }
                                className="flex h-10 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                                placeholder="#3b82f6"
                            />
                        </div>
                    </div>

                    {/* Preview */}
                    <div className="grid gap-2">
                        <Label>Preview</Label>
                        <div
                            className="h-24 rounded-lg border-2 p-4"
                            style={{ backgroundColor: tempColors.background }}
                        >
                            <div
                                className="h-full rounded-full"
                                style={{
                                    backgroundColor: tempColors.accent,
                                    width: "60%",
                                }}
                            />
                        </div>
                    </div>
                </div>
                <div className="flex justify-between">
                    <Button variant="outline" onClick={handleReset}>
                        Reset to Default
                    </Button>
                    <Button onClick={handleSave}>Save Changes</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
