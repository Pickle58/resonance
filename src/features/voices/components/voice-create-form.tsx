"use client";

import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Upload,
    Mic,
    Tag,
    Check,
    ChevronsUpDown,
    Globe,
    Layers,
    AlignLeft,
} from "lucide-react";
import locales from "locale-codes";

import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { VoiceFileDropzone } from "@/features/voices/components/voice-file-dropzone";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldError } from "@/components/ui/field";
import {
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent
} from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    VOICE_CATEGORIES,
    VOICE_CATEGORY_LABELS,
} from "@/features/voices/data/voice-categories";
import { VoiceRecorder } from "./voice-recorder";

const LANGUAGE_OPTIONS = locales.all
    .filter((l) => l.tag && l.tag.includes("-") && l.name)
    .map((l) => ({
        value: l.tag,
        label: l.location ? `${l.name} (${l.location})` : l.name,
    }));

const voiceCreateFormSchema = z.object({
    name: z.string().min(1, "Name is required"),
    file: z
        .instanceof(File, { message: "An audio file is required" })
        .nullable()
        .refine((f) => f !== null, "An audio file is required"),
    category: z.string().min(1, "A category is required"),
    language: z.string().min(1, "A language is required"),
    description: z.string(),
});

function LanguageCombobox({
    value,
    onChange,
    isInvalid,
}: {
    value: string;
    onChange: (value: string) => void;
    isInvalid?: boolean;
}) {
    const [open, setOpen] = useState(false);

    const selectedLabel =
        LANGUAGE_OPTIONS.find((l) => l.value === value)?.label ?? "";

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    aria-invalid={isInvalid}
                    className={cn(
                        "h-9 w-full justify-between font-normal",
                        !value && "text-muted-foreground",
                    )}
                >
                    <div className="flex items-center gap-2 truncate">
                        <Globe className="size-4 shrink-0 text-muted-foreground" />
                        {value ? selectedLabel : "Select language..."}
                    </div>
                    <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-(--radix-popover-trigger-width) p-0">
                <Command>
                    <CommandInput placeholder="Search language..." />
                    <CommandList>
                        <CommandEmpty>No language found.</CommandEmpty>
                        <CommandGroup>
                            {LANGUAGE_OPTIONS.map((lang) => (
                                <CommandItem
                                    key={lang.value}
                                    value={lang.label}
                                    onSelect={() => {
                                        onChange(lang.value);
                                        setOpen(false);
                                    }}
                                >
                                    {lang.label}
                                    <Check
                                        className={cn(
                                            "ml-auto size-4",
                                            value === lang.value ? "opacity-100" : "opacity-0",
                                        )}
                                    />
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
};

interface VoiceCreateFormProps {
    scrollable?: boolean;
    footer?: (submit: React.ReactNode) => React.ReactNode;
    onError?: (message: string) => void;
};

export function VoiceCreateForm({
    scrollable,
    footer,
    onError,
}: VoiceCreateFormProps) {
    const trpc = useTRPC();
    const queryClient = useQueryClient();

    const createMutation = useMutation({
        mutationFn: async ({
            name,
            file,
            category,
            language,
            description,
        }: {
            name: string;
            file: File;
            category: string;
            language: string;
            description?: string;
        }) => {
            const params = new URLSearchParams({
                name,
                category,
                language,
            });
            if (description) {
                params.set("description", description);
            }

            const response =
                await fetch(`/api/voices/create?${params.toString()}`, {
                    method: "POST",
                    headers: { "Content-Type": file.type },
                    body: file,
                });

            const body = (await response.json().catch(() => ({}))) as {
                error?: string;
            };

            if (!response.ok) {
                throw new Error(body.error ?? "Failed to create voice");
            }

            return body;
        },
    });

    const form = useForm({
        defaultValues: {
            name: "",
            file: null as File | null,
            category: "GENERAL" as string,
            language: "en-US" as string,
            description: "",
        },
        validators: {
            onSubmit: voiceCreateFormSchema,
        },
        onSubmit: async ({ value }) => {
            try {
                await createMutation.mutateAsync({
                    name: value.name,
                    file: value.file!,
                    category: value.category,
                    language: value.language,
                    description: value.description || undefined,
                });

                toast.success("Voice created successfully!");
                queryClient.invalidateQueries({
                    queryKey: trpc.voices.getAll.queryKey(),
                });
                form.reset();
            } catch (error) {
                const message =
                    error instanceof Error ? error.message : "Failed to create voice";

                if (onError) {
                    onError(message);
                } else {
                    toast.error(message);
                }
            }
        },
    });

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                form.handleSubmit();
            }}
            className={cn(
                "flex flex-col",
                scrollable ? "min-h-0 flex-1" : "gap-6"
            )}
        >
            <div
                className={cn(
                    scrollable
                        ? "no-scrollbar flex flex-col gap-6 overflow-y-auto px-4"
                        : "flex flex-col gap-6",
                )}
            >
                <form.Field name="file">
                    {(field) => {
                        const isInvalid =
                            field.state.meta.isTouched && !field.state.meta.isValid;

                        return (
                            <Field data-invalid={isInvalid}>
                                <Tabs defaultValue="upload">
                                    <TabsList className="h-11! w-full">
                                        <TabsTrigger value="upload">
                                            <Upload className="size-3.5" />
                                            Upload
                                        </TabsTrigger>
                                        <TabsTrigger value="record">
                                            <Mic className="size-3.5" />
                                            Record
                                        </TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="upload">
                                        <VoiceFileDropzone
                                            file={field.state.value}
                                            onFileChange={field.handleChange}
                                            isInvalid={isInvalid}
                                        />
                                    </TabsContent>
                                    <TabsContent value="record">
                                        <VoiceRecorder
                                            file={field.state.value}
                                            onFileChange={field.handleChange}
                                            isInvalid={isInvalid}
                                        />
                                    </TabsContent>
                                </Tabs>
                                {isInvalid && <FieldError errors={field.state.meta.errors} />}
                            </Field>
                        );
                    }}
                </form.Field>

                <form.Field name="name">
                    {(field) => {
                        const isInvalid =
                            field.state.meta.isTouched && !field.state.meta.isValid;

                        return (
                            <Field data-invalid={isInvalid}>
                                <div className="relative flex items-center">
                                    <div className="pointer-events-none absolute left-0 flex h-full items-center justify-center">
                                        <Tag className="size-4 text-muted-foreground" />
                                    </div>
                                    <Input
                                        id={field.name}
                                        placeholder="Voice Label"
                                        aria-invalid={isInvalid}
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        onBlur={field.handleBlur}
                                        className="pl-10"
                                    />
                                </div>
                                {isInvalid && <FieldError errors={field.state.meta.errors} />}
                            </Field>
                        );
                    }}
                </form.Field>

                <form.Field name="category">
                    {(field) => {
                        const isInvalid =
                            field.state.meta.isTouched && !field.state.meta.isValid;

                        return (
                            <Field data-invalid={isInvalid}>
                                <div className="relative flex items-center">
                                    <div className="pointer-events-none absolute left-0 flex h-full w-11 items-center justify-center">
                                        <Layers className="size-4 text-muted-foreground" />
                                    </div>
                                    <Select
                                        value={field.state.value}
                                        onValueChange={field.handleChange}
                                    >
                                        <SelectTrigger className="w-full pl-10">
                                            <SelectValue
                                                placeholder="Select category..."
                                            />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {VOICE_CATEGORIES.map((cat) => (
                                                <SelectItem key={cat} value={cat}>
                                                    {VOICE_CATEGORY_LABELS[cat]}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                {isInvalid && <FieldError errors={field.state.meta.errors} />}
                            </Field>
                        );
                    }}
                </form.Field>

                <form.Field name="language">
                    {(field) => {
                        const isInvalid =
                            field.state.meta.isTouched && !field.state.meta.isValid;
                        return (
                            <Field data-invalid={isInvalid}>
                                <LanguageCombobox
                                    value={field.state.value}
                                    onChange={field.handleChange}
                                    isInvalid={isInvalid}
                                />
                                {isInvalid && <FieldError errors={field.state.meta.errors} />}
                            </Field>
                        );
                    }}
                </form.Field>

                <form.Field name="description">
                    {(field) => {
                        const isInvalid =
                            field.state.meta.isTouched && !field.state.meta.isValid;

                        return (
                            <Field data-invalid={isInvalid}>
                                <div className="relative flex items-center">
                                    <div className="pointer-events-none absolute left-0 flex h-full w-11 items-center justify-center">
                                        <AlignLeft className="size-4 text-muted-foreground" />
                                    </div>
                                    <Textarea
                                        id={field.name}
                                        placeholder="Describe this voice..."
                                        aria-invalid={isInvalid}
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        onBlur={field.handleBlur}
                                        className="min-h-20 pl-10"
                                        rows={3}
                                    />

                                </div>
                                {isInvalid && <FieldError errors={field.state.meta.errors} />}
                            </Field>
                        );
                    }}
                </form.Field>

                <form.Subscribe
                    selector={(s) => ({
                        isSubmitting: s.isSubmitting,
                    })}
                >
                    {({ isSubmitting }) => {
                        const submitButton = (
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Creating..." : "Create Voice"}
                            </Button>
                        );

                        return footer ? footer(submitButton) : submitButton;
                    }}
                </form.Subscribe>
            </div>
        </form>
    )
}