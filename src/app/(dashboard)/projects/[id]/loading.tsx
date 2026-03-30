"use client";

import { motion } from "framer-motion";

export default function ProjectLoading() {
    return (
        <div className="flex items-center justify-center h-full">
            <div className="text-muted-foreground flex items-center gap-2">
                <motion.div 
                    animate={{ rotate: 360 }} 
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full"
                />
                <span>Architecting workspace...</span>
            </div>
        </div>
    );
}
