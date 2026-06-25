"use client";

import { useCallback, useRef, useState } from "react";
import {
    AudioLines,
    FileAudio,
    FolderOpen,
    Pause,
    Play,
    X,
} from "lucide-react";
import { toast } from "sonner";

import { cn, formatFileSize } from "@/lib/utils";
import { useAudioPlayback } from "@/hooks/use-audio-playback";
import { Button } from "@/components/ui/button";

const MAX_FILE_SIZE = 20 * 1024 * 1024;

function isAudioFile(file: File) {
    return (
        file.type.startsWith("audio/") ||
        /\.(mp3|wav|ogg|m4a|aac|flac|webm|opus)$/i.test(file.name)
    );
}

function validateFile(file: File): boolean {
    if (!isAudioFile(file)) {
        toast.error("Please upload an audio file.");
        return false;
    }

    if (file.size > MAX_FILE_SIZE) {
        toast.error("File must be 20MB or smaller.");
        return false;
    }

    return true;
}

export function VoiceFileDropzone({
    file,
    onFileChange,
    isInvalid,
}: {
    file: File | null;
    onFileChange: (file: File | null) => void;
    isInvalid?: boolean;
}) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDragActive, setIsDragActive] = useState(false);
    const [isDragReject, setIsDragReject] = useState(false);
    const { isPlaying, togglePlay } = useAudioPlayback(file);

    const handleFile = useCallback(
        (nextFile: File | null) => {
            if (!nextFile) {
                onFileChange(null);
                return;
            }

            if (validateFile(nextFile)) {
                onFileChange(nextFile);
            }
        },
        [onFileChange],
    );

    const handleDragEnter = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragActive(true);

        const hasAudio = Array.from(event.dataTransfer.items).some(
            (item) => item.kind === "file" && item.type.startsWith("audio/"),
        );
        setIsDragReject(!hasAudio);
    }, []);

    const handleDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.stopPropagation();
        event.dataTransfer.dropEffect = "copy";
    }, []);

    const handleDragLeave = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.stopPropagation();

        if (event.currentTarget.contains(event.relatedTarget as Node)) {
            return;
        }

        setIsDragActive(false);
        setIsDragReject(false);
    }, []);

    const handleDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();
            event.stopPropagation();
            setIsDragActive(false);
            setIsDragReject(false);

            const droppedFile = event.dataTransfer.files[0];
            if (droppedFile) {
                handleFile(droppedFile);
            }
        },
        [handleFile],
    );

    const handleInputChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const selectedFile = event.target.files?.[0] ?? null;
            handleFile(selectedFile);
            event.target.value = "";
        },
        [handleFile],
    );

    if (file) {
        return (
            <div className="flex items-center gap-3 rounded-xl border p-4">
                <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                    <FileAudio className="size-5 text-muted-foreground" />
                </div>

                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)}
                    </p>
                </div>

                <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={togglePlay}
                >
                    {isPlaying ? (
                        <Pause className="size-4" />
                    ) : (
                        <Play className="size-4" />
                    )}
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => onFileChange(null)}
                >
                    <X className="size-4" />
                </Button>
            </div>
        );
    }

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={() => inputRef.current?.click()}
            onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    inputRef.current?.click();
                }
            }}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
                "flex cursor-pointer flex-col items-center justify-center gap-4 overflow-hidden rounded-2xl border px-6 py-10 transition-colors",
                isDragReject || isInvalid
                    ? "border-destructive"
                    : isDragActive
                      ? "border-primary"
                      : "",
            )}
        >
            <input
                ref={inputRef}
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={handleInputChange}
            />
            <div className="flex size-12 items-center justify-center rounded-xl bg-muted">
                <AudioLines className="size-5 text-muted-foreground" />
            </div>

            <div className="flex flex-col items-center gap-1.5">
                <p className="text-base font-semibold tracking-tight">
                    Upload your audio file
                </p>

                <p className="text-center text-sm text-muted-foreground">
                    Supports all audio formats, max size 20MB
                </p>
            </div>

            <Button type="button" variant="outline" size="sm">
                <FolderOpen className="size-3.5" />
                Upload file
            </Button>
        </div>
    );
}
