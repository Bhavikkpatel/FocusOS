"use client";

import { Card } from "@/components/ui/card";
import { Calendar, AlertCircle, ChevronRight, Clock } from "lucide-react";
import { TaskWithSessions } from "@/hooks/use-tasks";
import { format } from "date-fns";
import { motion } from "framer-motion";

interface UpcomingTasksProps {
    tasks: {
        overdue: TaskWithSessions[];
        today: TaskWithSessions[];
        tomorrow: TaskWithSessions[];
    };
}

export function UpcomingTasks({ tasks }: UpcomingTasksProps) {
    const hasUpcoming = tasks.overdue.length > 0 || tasks.today.length > 0 || tasks.tomorrow.length > 0;

    return (
        <Card className="p-6 rounded-3xl border-2 border-slate-100 dark:border-slate-800/50 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="bg-amber-500/10 p-2 rounded-xl text-amber-500">
                        <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg tracking-tight">Upcoming Deadlines</h3>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Priority focus</p>
                    </div>
                </div>
            </div>

            <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {!hasUpcoming ? (
                    <div className="flex flex-col items-center justify-center h-48 text-muted-foreground opacity-50">
                        <p className="text-sm font-bold uppercase tracking-widest">No pressing deadlines</p>
                    </div>
                ) : (
                    <>
                        {tasks.overdue.length > 0 && (
                            <div className="space-y-2">
                                <h4 className="text-[10px] font-black tracking-[0.2em] uppercase text-red-500 flex items-center gap-2">
                                    <AlertCircle className="h-3 w-3" />
                                    Overdue
                                </h4>
                                {tasks.overdue.map((task) => <TaskItem key={task.id} task={task} />)}
                            </div>
                        )}

                        {tasks.today.length > 0 && (
                            <div className="space-y-2">
                                <h4 className="text-[10px] font-black tracking-[0.2em] uppercase text-blue-500 flex items-center gap-2">
                                    <Clock className="h-3 w-3" />
                                    Today
                                </h4>
                                {tasks.today.map((task) => <TaskItem key={task.id} task={task} />)}
                            </div>
                        )}

                        {tasks.tomorrow.length > 0 && (
                            <div className="space-y-2">
                                <h4 className="text-[10px] font-black tracking-[0.2em] uppercase text-slate-500 flex items-center gap-2">
                                    <Calendar className="h-3 w-3" />
                                    Tomorrow
                                </h4>
                                {tasks.tomorrow.map((task) => <TaskItem key={task.id} task={task} />)}
                            </div>
                        )}
                    </>
                )}
            </div>
        </Card>
    );
}

function TaskItem({ task }: { task: TaskWithSessions }) {
    return (
        <motion.div 
            whileHover={{ x: 4 }}
            className="group flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-white dark:bg-slate-900/50 dark:hover:bg-slate-900 border border-transparent hover:border-slate-200 dark:hover:border-slate-800 transition-all cursor-pointer shadow-sm hover:shadow"
        >
            <div className="flex-1 min-w-0 mr-4">
                <p className="text-sm font-bold truncate group-hover:text-primary transition-colors">
                    {task.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                    {task.projectRef && (
                        <span 
                            className="text-[10px] font-bold uppercase tracking-tight opacity-60"
                            style={{ color: task.projectRef.color }}
                        >
                            {task.projectRef.name}
                        </span>
                    )}
                    <span className="text-[10px] text-muted-foreground font-medium">
                        {task.dueDate ? format(new Date(task.dueDate), "MMM dd") : ''}
                    </span>
                </div>
            </div>
            <button className="h-8 w-8 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border dark:border-slate-700">
                <ChevronRight className="h-4 w-4" />
            </button>
        </motion.div>
    );
}
