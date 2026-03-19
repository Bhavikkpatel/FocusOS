"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, Plus } from "lucide-react";
import { useTimerStore } from "@/store/timer";
import { useTasks, useUpdateTask, TaskWithSessions } from "@/hooks/use-tasks";

export function CompletionDialog() {
    const { isCompletionDialogOpen, updateTimerState, start, currentTaskId } = useTimerStore();
    const { data } = useTasks({});
    const updateTask = useUpdateTask();

    // Find current task
    const allTasks = data?.pages.flatMap((page: any) => page.tasks) || [];
    const task = allTasks.find((t: any) => t.id === currentTaskId) as TaskWithSessions | undefined;

    if (!isCompletionDialogOpen || !task) return null;

    const handleAction = async (newStatus?: string) => {
        if (newStatus) {
            updateTask.mutate({ id: task.id, status: newStatus as any });
        }
        updateTimerState({ isCompletionDialogOpen: false });
    };

    const handleExtend = () => {
        updateTimerState({ isCompletionDialogOpen: false });
        // Start another 25 min focus (or whatever the task's preference is)
        const duration = task.pomodoroDuration || 25;
        start(duration, "FOCUS", task.id, task.estimatedPomodoros);
    };

    return (
        <Dialog open={isCompletionDialogOpen} onOpenChange={(open) => updateTimerState({ isCompletionDialogOpen: open })}>
            <DialogContent className="sm:max-w-md bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-0 overflow-hidden">
                <div className="bg-green-500/10 p-6 flex flex-col items-center gap-2 border-b border-green-500/20">
                    <div className="h-16 w-16 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/20">
                        <CheckCircle className="h-10 w-10 text-white" />
                    </div>
                    <DialogHeader>
                        <DialogTitle className="text-center text-2xl font-black tracking-tight text-slate-900 dark:text-white mt-2">
                            Session Complete!
                        </DialogTitle>
                        <DialogDescription className="sr-only">
                            Your focus session for {task.title} has finished.
                        </DialogDescription>
                    </DialogHeader>
                    <p className="text-slate-600 dark:text-slate-400 text-center text-sm font-medium">
                        You've finished your estimated focus for <span className="text-slate-900 dark:text-white font-bold">{task.title}</span>.
                    </p>
                </div>

                <div className="p-6 space-y-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">What's next?</p>
                    
                    <Button 
                        onClick={() => handleAction("COMPLETED")}
                        className="w-full h-14 justify-start gap-4 rounded-xl bg-green-600 hover:bg-green-700 text-white border-b-4 border-green-800 transition-all active:border-b-0 active:translate-y-1"
                    >
                        <div className="h-8 w-8 bg-white/20 rounded-lg flex items-center justify-center">
                            <CheckCircle className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col items-start text-left">
                            <span className="font-bold">Mark as Completed</span>
                            <span className="text-[10px] opacity-80">You're all done with this task</span>
                        </div>
                    </Button>

                    <Button 
                        variant="outline"
                        onClick={() => handleAction("READY_FOR_REVIEW")}
                        className="w-full h-14 justify-start gap-4 rounded-xl border-2 hover:bg-slate-50 dark:hover:bg-slate-900"
                    >
                        <div className="h-8 w-8 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                            <ArrowRight className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col items-start text-left">
                            <span className="font-bold">Move to Review</span>
                            <span className="text-[10px] opacity-60">Ready for someone to check</span>
                        </div>
                    </Button>

                    <Button 
                        variant="ghost"
                        onClick={handleExtend}
                        className="w-full h-14 justify-start gap-4 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                    >
                        <div className="h-8 w-8 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center">
                            <Plus className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col items-start text-left">
                            <span className="font-bold">Extend Focus</span>
                            <span className="text-[10px] opacity-60">Add another pomodoro session</span>
                        </div>
                    </Button>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 flex justify-center">
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleAction()}
                        className="text-xs font-bold uppercase tracking-widest opacity-50 hover:opacity-100"
                    >
                        Dismiss
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
