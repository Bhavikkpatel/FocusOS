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

export function SessionConflictDialog() {
    const { isConfirmingNewSession, setConfirmingNewSession, confirmNewSession } = useTimerStore();

    return (
        <AlertDialog
            open={!!isConfirmingNewSession}
            onOpenChange={(open) => !open && setConfirmingNewSession(null)}
        >
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Switch Focus Session?</AlertDialogTitle>
                    <AlertDialogDescription>
                        You already have a focus session running for another task.
                        Do you want to stop the current session and start focusing on this new task instead?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => confirmNewSession()}>
                        Switch Session
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
