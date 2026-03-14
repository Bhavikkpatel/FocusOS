"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useTimerStore } from "@/store/timer";
import { Zap } from "lucide-react";

export function FocusPromptDialog() {
    const { isFocusPromptOpen, setFocusPrompt, setFocusMode } = useTimerStore();

    const handleAccept = () => {
        setFocusPrompt(false);
        setFocusMode(true);
    };

    const handleDecline = () => {
        setFocusPrompt(false);
    };

    return (
        <AlertDialog open={isFocusPromptOpen} onOpenChange={setFocusPrompt}>
            <AlertDialogContent className="max-w-[400px]">
                <AlertDialogHeader>
                    <div className="flex items-center gap-2 text-primary mb-2">
                        <Zap className="h-5 w-5 fill-current" />
                        <span className="text-xs font-bold uppercase tracking-widest">Deep Work</span>
                    </div>
                    <AlertDialogTitle className="text-2xl font-bold">Enter Focus Mode?</AlertDialogTitle>
                    <AlertDialogDescription className="text-base">
                        Jump into full-screen focus mode to eliminate distractions and get things done.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="mt-4">
                    <AlertDialogCancel onClick={handleDecline}>Keep Normal View</AlertDialogCancel>
                    <AlertDialogAction onClick={handleAccept} className="bg-primary hover:bg-primary/90">
                        Yes, Let&apos;s Focus
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
