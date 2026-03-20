"use client";

import React, { useState, useEffect, useRef } from "react";
import { useLayoutStore } from "@/store/layout";
import { useCreateTask } from "@/hooks/use-tasks";
import { motion, AnimatePresence } from "framer-motion";
import { Hash, AtSign, Calendar, Send } from "lucide-react";

export function CommandCapture() {
    const { isCommandCaptureOpen, setCommandCaptureOpen } = useLayoutStore();
    const [text, setText] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    const createTask = useCreateTask();

    // Auto-focus when opened
    useEffect(() => {
        if (isCommandCaptureOpen) {
            const timer = setTimeout(() => inputRef.current?.focus(), 50);
            return () => clearTimeout(timer);
        } else {
            setText("");
            return undefined; // Explicitly return undefined for linting
        }
    }, [isCommandCaptureOpen]);

    // Basic Parsing (Regex based for speed/simplicity)
    const parseCommand = (input: string) => {
        const tags = input.match(/#(\w+)/g)?.map(t => t.slice(1)) || [];
        const projects = input.match(/@(\w+)/g)?.map(p => p.slice(1)) || [];
        
        // Remove tokens from title
        let title = input
            .replace(/#(\w+)/g, "")
            .replace(/@(\w+)/g, "")
            .trim();
        
        // Very basic date parsing for demonstration (tomorrow, today)
        let dueDate: Date | null = null;
        if (title.toLowerCase().includes("tomorrow")) {
            dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + 1);
            title = title.replace(/tomorrow/i, "").trim();
        } else if (title.toLowerCase().includes("today")) {
            dueDate = new Date();
            title = title.replace(/today/i, "").trim();
        }

        return { title, tags, projects, dueDate };
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim()) return;

        const { title, tags, dueDate } = parseCommand(text);
        
        try {
            await createTask.mutateAsync({
                title,
                tags,
                dueDate,
                status: "TODO",
                priority: "MEDIUM",
            });
            
            // Clear and close
            setText("");
            setCommandCaptureOpen(false);
        } catch (error) {
            console.error("Failed to capture task:", error);
        }
    };

    const parsed = parseCommand(text);

    return (
        <AnimatePresence>
            {isCommandCaptureOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -21 }}
                    className="fixed inset-x-0 top-0 z-[100] flex justify-center pt-24 px-4 pointer-events-none"
                >
                    <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl pointer-events-auto overflow-hidden">
                        <form onSubmit={handleSubmit} className="relative">
                            <input
                                ref={inputRef}
                                type="text"
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="Type a command... (e.g. Finish report tomorrow #work @internal)"
                                className="w-full h-14 pl-6 pr-14 bg-transparent border-none focus:ring-0 text-lg font-mono placeholder:text-slate-400 placeholder:font-sans dark:text-white"
                                style={{ fontFamily: "'JetBrains Mono', monospace" }}
                            />
                            <button 
                                type="submit"
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-primary transition-colors"
                            >
                                <Send className="h-5 w-5" />
                            </button>
                        </form>

                        {/* Parsing Preview */}
                        {text.trim() && (
                            <div className="px-6 py-3 bg-slate-50/50 dark:bg-slate-800/50 flex items-center gap-4 text-xs font-semibold">
                                <span className="text-slate-400 uppercase tracking-wider">Parsing</span>
                                
                                <div className="flex items-center gap-3">
                                    {parsed.dueDate && (
                                        <div className="flex items-center gap-1.5 text-blue-500 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md">
                                            <Calendar className="h-3 w-3" />
                                            <span>{parsed.dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                        </div>
                                    )}
                                    
                                    {parsed.tags.map(tag => (
                                        <div key={tag} className="flex items-center gap-1.5 text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-md">
                                            <Hash className="h-3 w-3" />
                                            <span>{tag}</span>
                                        </div>
                                    ))}

                                    {parsed.projects.map(project => (
                                        <div key={project} className="flex items-center gap-1.5 text-amber-500 bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 rounded-md">
                                            <AtSign className="h-3 w-3" />
                                            <span>{project}</span>
                                        </div>
                                    ))}

                                    {!parsed.dueDate && parsed.tags.length === 0 && parsed.projects.length === 0 && (
                                        <span className="text-slate-400 italic font-normal">No metadata detected yet...</span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
