"use client";

import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LoadingProps {
    text?: string;
    className?: string;
    spinnerSize?: number;
}

export function LoadingSpinner({ text, className, spinnerSize = 24 }: LoadingProps) {
    return (
        <div className={cn("flex flex-col items-center justify-center gap-4", className)}>
            <Loader2 
                className="text-primary animate-spin" 
                style={{ width: spinnerSize, height: spinnerSize }} 
            />
            {text && (
                <p className="text-[10px] font-mono font-bold text-primary/60 uppercase tracking-[0.3em] animate-pulse">
                    {text}
                </p>
            )}
        </div>
    );
}

export function LoadingBox({ text, className }: LoadingProps) {
    return (
        <div className={cn(
            "w-full h-full min-h-[200px] flex items-center justify-center rounded-2xl bg-white/[0.02] border border-white/5",
            className
        )}>
            <LoadingSpinner text={text} />
        </div>
    );
}

export function LoadingScreen({ text = "INITIALIZING SANCTUARY..." }: LoadingProps) {
    return (
        <div className="fixed inset-0 z-[100] bg-[#0A0A0B] flex items-center justify-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative"
            >
                <div className="absolute inset-0 bg-primary/10 blur-[100px] rounded-full" />
                <LoadingSpinner text={text} spinnerSize={40} className="relative z-10" />
            </motion.div>
        </div>
    );
}
