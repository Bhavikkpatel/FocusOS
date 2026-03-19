"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, X, ExternalLink, FileText, ImageIcon, FileIcon } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AttachmentPreviewProps {
    isOpen: boolean;
    onClose: () => void;
    attachment: {
        id: string;
        name: string;
        url: string;
        type: "FILE" | "LINK";
        mimeType?: string | null;
        size?: number | null;
    } | null;
}

export function AttachmentPreview({ isOpen, onClose, attachment }: AttachmentPreviewProps) {
    const [textContent, setTextContent] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen && attachment && attachment.type === "FILE") {
            const isText = 
                attachment.mimeType?.startsWith("text/") || 
                attachment.mimeType === "application/json" ||
                attachment.name.endsWith(".md") ||
                attachment.name.endsWith(".ts") ||
                attachment.name.endsWith(".tsx") ||
                attachment.name.endsWith(".js") ||
                attachment.name.endsWith(".jsx") ||
                attachment.name.endsWith(".css");

            if (isText) {
                setIsLoading(true);
                fetch(attachment.url)
                    .then((res) => res.text())
                    .then((text) => {
                        setTextContent(text);
                        setIsLoading(false);
                    })
                    .catch((err) => {
                        console.error("Failed to fetch text content:", err);
                        setTextContent("Error loading file content.");
                        setIsLoading(false);
                    });
            } else {
                setTextContent(null);
            }
        }
    }, [isOpen, attachment]);

    if (!attachment) return null;

    const isImage = attachment.mimeType?.startsWith("image/");
    const isPdf = attachment.mimeType === "application/pdf";
    const isText = textContent !== null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-4xl w-[90vw] h-[80vh] flex flex-col p-0 gap-0 overflow-hidden bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 shadow-2xl [&>button]:hidden">
                <DialogDescription className="sr-only">
                    View and manage task attachments
                </DialogDescription>
                <DialogHeader className="p-4 border-b flex-row items-center justify-between space-y-0 bg-slate-50/50 dark:bg-slate-900/50">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="bg-white dark:bg-slate-800 p-2 rounded-lg border shadow-sm shrink-0">
                            {attachment.type === "LINK" ? (
                                <ExternalLink className="h-4 w-4 text-blue-500" />
                            ) : isImage ? (
                                <ImageIcon className="h-4 w-4 text-purple-500" />
                            ) : isPdf ? (
                                <FileText className="h-4 w-4 text-red-500" />
                            ) : (
                                <FileIcon className="h-4 w-4 text-slate-500" />
                            )}
                        </div>
                        <DialogTitle className="text-sm font-bold truncate">
                            {attachment.name}
                        </DialogTitle>
                    </div>
                    <div className="flex items-center gap-2">
                        {attachment.type === "FILE" && (
                            <a href={attachment.url} download={attachment.name}>
                                <Button variant="outline" size="sm" className="h-8 gap-2 px-3 rounded-lg border-slate-200 dark:border-slate-700">
                                    <Download className="h-3.5 w-3.5" />
                                    <span className="text-xs font-semibold">Download</span>
                                </Button>
                            </a>
                        )}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="h-8 w-8 rounded-lg"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-hidden bg-slate-50/30 dark:bg-slate-900/10">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
                        </div>
                    ) : isImage ? (
                        <div className="flex items-center justify-center h-full p-4">
                            <img
                                src={attachment.url}
                                alt={attachment.name}
                                className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                            />
                        </div>
                    ) : isPdf ? (
                        <iframe
                            src={`${attachment.url}#toolbar=0`}
                            className="w-full h-full border-none"
                            title={attachment.name}
                        />
                    ) : isText ? (
                        <ScrollArea className="h-full w-full">
                            <div className="p-6">
                                <pre className="font-mono text-xs leading-relaxed whitespace-pre-wrap break-words bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                    {textContent}
                                </pre>
                            </div>
                        </ScrollArea>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center p-8 opacity-40">
                            <FileIcon className="h-16 w-16 mb-4" />
                            <p className="text-sm font-bold">No preview available for this file type</p>
                            <p className="text-xs mt-2">You can still download the file to view it</p>
                            <a href={attachment.url} download={attachment.name} className="mt-4">
                                <Button variant="outline" className="rounded-xl border-slate-200 dark:border-slate-800">
                                    Download File
                                </Button>
                            </a>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
