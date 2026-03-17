"use client";

import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { FolderOpen, Target, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface ProjectStats {
    id: string;
    name: string;
    color: string;
    progress: number;
    tasksRemaining: number;
    focusMinutes: number;
}

interface ActiveProjectsProps {
    projects: ProjectStats[];
}

export function ActiveProjects({ projects }: ActiveProjectsProps) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-500/10 p-2 rounded-xl text-blue-500">
                        <FolderOpen className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">Active Projects</h3>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Deep work targets</p>
                    </div>
                </div>
                <Link 
                    href="/projects" 
                    className="text-xs font-bold uppercase tracking-widest text-primary hover:underline hover:opacity-80 transition-all flex items-center gap-1"
                >
                    View All <ArrowRight className="h-3 w-3" />
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects.map((project, index) => (
                    <motion.div
                        key={project.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Link href={`/projects/${project.id}`}>
                            <Card className="p-5 rounded-2xl border-2 border-slate-100 dark:border-slate-800/50 hover:border-primary/20 transition-all duration-300 shadow-sm hover:shadow-md group relative overflow-hidden">
                                <div className="flex items-center gap-3 mb-4">
                                    <div 
                                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg"
                                        style={{ backgroundColor: project.color, boxShadow: `0 8px 16px -4px ${project.color}40` }}
                                    >
                                        {project.name[0]}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">{project.name}</h4>
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-1">
                                                <Target className="h-3 w-3 text-muted-foreground" />
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase">{project.tasksRemaining} tasks left</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-3 w-3 text-muted-foreground" />
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase">{project.focusMinutes}m spent</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">
                                        <span>Progress</span>
                                        <span className="text-slate-900 dark:text-white">{project.progress}%</span>
                                    </div>
                                    <Progress value={project.progress} className="h-1.5" indicatorClassName="bg-slate-900 dark:bg-white" />
                                </div>
                                
                                <ArrowRight className="absolute bottom-5 right-5 h-4 w-4 text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                            </Card>
                        </Link>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
