"use client";

import { useState } from "react";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useTimerStore } from "@/store/timer";
import { useRateSession } from "@/hooks/use-tasks";
import { Star, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export function FocusRatingDialog() {
    const { sessionToRate, setSessionToRate } = useTimerStore();
    const rateSession = useRateSession();
    const [rating, setRating] = useState<number>(0);
    const [hoveredRating, setHoveredRating] = useState<number>(0);

    const handleDismiss = () => {
        setSessionToRate(null);
        setRating(0);
        setHoveredRating(0);
    };

    const handleSubmit = () => {
        if (!sessionToRate || rating === 0) return;

        rateSession.mutate({ id: sessionToRate, rating }, {
            onSettled: () => {
                handleDismiss();
            }
        });
    };

    return (
        <AlertDialog open={!!sessionToRate} onOpenChange={(open) => !open && handleDismiss()}>
            <AlertDialogContent className="max-w-[400px] border-2 border-primary/20 bg-background/95 backdrop-blur shadow-2xl overflow-hidden">
                {/* Decorative background glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />

                <AlertDialogHeader className="relative z-10 space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Zap className="h-4 w-4 text-primary fill-current" />
                        </div>
                        <span className="text-[10px] font-black tracking-[0.2em] text-primary uppercase">Session Complete</span>
                    </div>
                    <AlertDialogTitle className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                        How was your focus?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-sm font-medium text-slate-500">
                        Rate the quality of your deep work session to track your concentration trends over time.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="flex justify-center gap-2 py-8 relative z-10">
                    {[1, 2, 3, 4, 5].map((value) => (
                        <button
                            key={value}
                            type="button"
                            className="relative group focus:outline-none"
                            onMouseEnter={() => setHoveredRating(value)}
                            onMouseLeave={() => setHoveredRating(0)}
                            onClick={() => setRating(value)}
                        >
                            <Star
                                className={cn(
                                    "h-10 w-10 transition-all duration-200 stroke-[1.5px]",
                                    (hoveredRating || rating) >= value
                                        ? "fill-primary text-primary drop-shadow-[0_0_8px_rgba(255,193,7,0.5)] scale-110"
                                        : "fill-transparent text-slate-300 dark:text-slate-700 hover:text-slate-400 group-hover:scale-105"
                                )}
                            />
                        </button>
                    ))}
                </div>

                <AlertDialogFooter className="relative z-10 flex flex-col sm:flex-row gap-2 mt-4">
                    <Button
                        variant="ghost"
                        onClick={handleDismiss}
                        className="font-semibold text-muted-foreground hover:text-foreground"
                    >
                        Skip
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={rating === 0 || rateSession.isPending}
                        className="font-bold tracking-wide flex-1 sm:flex-none"
                    >
                        {rateSession.isPending ? "Saving..." : "Save Rating"}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
