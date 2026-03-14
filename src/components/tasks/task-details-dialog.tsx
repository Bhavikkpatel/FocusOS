"use client";

import { format } from "date-fns";
import { Play, Clock, RotateCcw } from "lucide-react";
import { TaskWithSessions, useUpdateTask } from "@/hooks/use-tasks";
import { useTimerStore } from "@/store/timer";
import { useRouter } from "next/navigation";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface TaskDetailsDialogProps {
    task: TaskWithSessions | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function TaskDetailsDialog({ task, open, onOpenChange }: TaskDetailsDialogProps) {
    const router = useRouter();
    const { start, currentPreset } = useTimerStore();
    const { mutate: updateTask } = useUpdateTask();

    if (!task) return null;

    const handleStartTimer = () => {
        // focusDuration in DB is seconds, start() expects minutes
        // Default to 25 minutes if no preset
        const durationSeconds = currentPreset?.focusDuration || (25 * 60);
        const durationMinutes = durationSeconds / 60;
        start(durationMinutes, "FOCUS", task.id);
        if (task.status === "TODO") {
            updateTask({ id: task.id, status: "IN_PROGRESS" });
        }
        router.push("/timer");
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline">{task.priority}</Badge>
                        {task.project && <Badge variant="secondary">{task.project}</Badge>}
                    </div>
                    <DialogTitle className="text-2xl font-bold">{task.title}</DialogTitle>
                    {task.description && (
                        <DialogDescription className="text-base mt-2">
                            {task.description}
                        </DialogDescription>
                    )}
                </DialogHeader>

                <div className="flex items-center gap-4 py-4">
                    <Button onClick={handleStartTimer} className="w-full sm:w-auto" size="lg">
                        <Play className="mr-2 h-4 w-4" /> Start Focus Session
                    </Button>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground ml-auto">
                        <Clock className="h-4 w-4" />
                        <span>{task.completedPomodoros}/{task.estimatedPomodoros} Pomodoros</span>
                    </div>
                </div>

                <Separator />

                <div className="space-y-4">
                    <h4 className="font-semibold flex items-center gap-2">
                        <RotateCcw className="h-4 w-4" /> History
                    </h4>

                    <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                        {task.pomodoroSessions && task.pomodoroSessions.length > 0 ? (
                            <div className="space-y-4">
                                {task.pomodoroSessions.map((session) => (
                                    <div key={session.id} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <Badge variant={session.type === "FOCUS" ? "default" : "secondary"} className="text-[10px]">
                                                {session.type}
                                            </Badge>
                                            <span className="text-muted-foreground">
                                                {format(new Date(session.completedAt), "PP p")}
                                            </span>
                                        </div>
                                        <div className="font-medium">
                                            {Math.round(session.duration / 60)} mins
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                                No sessions recorded yet.
                            </div>
                        )}
                    </ScrollArea>
                </div>
            </DialogContent>
        </Dialog>
    );
}
