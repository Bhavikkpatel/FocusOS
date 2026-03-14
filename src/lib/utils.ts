import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind CSS classes with proper precedence
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Format duration in seconds to MM:SS format
 */
export function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

/**
 * Calculate percentage for progress indicators
 */
export function calculateProgress(elapsed: number, total: number): number {
    return Math.min(100, Math.max(0, (elapsed / total) * 100));
}
