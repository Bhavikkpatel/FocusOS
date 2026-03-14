import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ThemeColors {
    background: string;
    accent: string;
    text: string; // Main text color
}

export interface ColorTheme {
    id: string;
    name: string;
    colors: ThemeColors;
}

interface ThemeState {
    colors: ThemeColors;
    currentThemeId: string | null;
    setColors: (colors: Partial<ThemeColors>) => void;
    setTheme: (theme: ColorTheme) => void;
    resetColors: () => void;
}

const defaultColors: ThemeColors = {
    background: "#ffffff",
    accent: "#3b82f6", // Blue
    text: "#000000", // Black text for light background
};

export const predefinedThemes: ColorTheme[] = [
    {
        id: "light",
        name: "Light",
        colors: { background: "#ffffff", accent: "#3b82f6", text: "#000000" },
    },
    {
        id: "dark",
        name: "Dark",
        colors: { background: "#1e293b", accent: "#60a5fa", text: "#f1f5f9" },
    },
    {
        id: "ocean",
        name: "Ocean",
        colors: { background: "#ecfeff", accent: "#06b6d4", text: "#164e63" },
    },
    {
        id: "sunset",
        name: "Sunset",
        colors: { background: "#fff7ed", accent: "#f97316", text: "#7c2d12" },
    },
    {
        id: "forest",
        name: "Forest",
        colors: { background: "#f0fdf4", accent: "#22c55e", text: "#14532d" },
    },
    {
        id: "purple",
        name: "Purple Dream",
        colors: { background: "#faf5ff", accent: "#a855f7", text: "#581c87" },
    },
    {
        id: "rose",
        name: "Rose",
        colors: { background: "#fff1f2", accent: "#f43f5e", text: "#881337" },
    },
];

export const useThemeStore = create<ThemeState>()(
    persist(
        (set) => ({
            colors: defaultColors,
            currentThemeId: "light",
            setColors: (newColors) =>
                set((state) => ({
                    colors: { ...state.colors, ...newColors },
                    currentThemeId: null, // Custom theme
                })),
            setTheme: (theme) =>
                set({
                    colors: theme.colors,
                    currentThemeId: theme.id,
                }),
            resetColors: () =>
                set({
                    colors: defaultColors,
                    currentThemeId: "light",
                }),
        }),
        {
            name: "theme-storage",
        }
    )
);
