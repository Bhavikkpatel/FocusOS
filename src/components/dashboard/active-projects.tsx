"use client";

import { FolderOpen, Play } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useTimerStore } from "@/store/timer";
import { Button } from "@/components/ui/button";

interface ProjectStats {
    id: string;
    name: string;
    color: string;
    progress: number;
    tasksRemaining: number;
    focusMinutes: number;
    oldestTaskId: string | null;
    oldestTaskDuration: number;
}

interface ActiveProjectsProps {
    projects: ProjectStats[];
}

export function ActiveProjects({ projects }: ActiveProjectsProps) {
    const { start, setFocusMode, setZenithMode } = useTimerStore();

    const handlePlay = (e: React.MouseEvent, project: ProjectStats) => {
        e.preventDefault();
        e.stopPropagation();
        if (!project.oldestTaskId) return;
        setZenithMode(true);
        setFocusMode(true);
        start(project.oldestTaskDuration, "FOCUS", project.oldestTaskId);
    };

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl p-6 h-full flex flex-col">
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-primary/10 p-2 rounded-xl text-primary shrink-0">
                    <FolderOpen className="h-5 w-5" />
                </div>
                <div>
                    <h3 className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">Active Projects</h3>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.2em]">Launchpad</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {projects.map((project, index) => (
                    <motion.div
                        key={project.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="group"
                    >
                        <Link href={`/projects/${project.id}`}>
                            <div className="h-full flex flex-col justify-between p-4 rounded-xl bg-slate-50/50 dark:bg-white/5 border border-slate-100 dark:border-white/5 hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-md">
                                <div className="flex items-start justify-between gap-3 mb-4">
                                    <div className="min-w-0">
                                        <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-primary transition-colors">{project.name}</h4>
                                        <p className="font-jetbrains text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">
                                            {project.tasksRemaining} TASKS LEFT
                                        </p>
                                    </div>
                                    {project.oldestTaskId && (
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={(e) => handlePlay(e, project)}
                                            className="h-8 w-8 rounded-lg bg-primary/10 hover:bg-primary text-primary hover:text-black transition-all shrink-0"
                                        >
                                            <Play className="h-3.5 w-3.5 fill-current" />
                                        </Button>
                                    )}
                                </div>

                                <div className="space-y-1.5 mt-auto">
                                    <div className="flex justify-between items-end">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">PROGRESS</span>
                                        <span className="text-[10px] font-jetbrains font-bold text-slate-700 dark:text-slate-300">{project.progress}%</span>
                                    </div>
                                    <div className="h-1 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${project.progress}%` }}
                                            className="h-full bg-primary"
                                        />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
