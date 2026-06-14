"use client";

import { useSelector } from "@tanstack/react-store";
import type { AnyFormState } from "@tanstack/react-form";

import { 
    Field, 
    FieldGroup, 
    FieldLabel 
} from "@/components/ui/field";
import { Slider } from "@/components/ui/slider";
import { useTypedAppFormContext } from "@/hooks/use-app-form";

import { sliders } from "@/features/text-to-speech/data/sliders";
import {
    ttsFormOptions,
    type TTSFormValues,
} from "@/features/text-to-speech/components/text-to-speech-form";

type SliderFieldName = keyof Pick<
    TTSFormValues,
    "temperature" | "topP" | "topK" | "repetitionPenalty"
>;

type SliderFieldRenderProps = {
    state: { value: TTSFormValues[SliderFieldName] };
    handleChange: (value: TTSFormValues[SliderFieldName]) => void;
};

export function SettingsPanelSettings() {
    const form = useTypedAppFormContext(ttsFormOptions);
    const isSubmitting = useSelector(
        form.store,
        (state: AnyFormState) => state.isSubmitting,
    );

    return (
       <>
       {/* Voice Style Dropdown Section */}
       <div className="border-b border-dashed p-4">
            <p className="tezt-sm text-muted-foreground">
                Voice selector coming soon
            </p>
       </div>

       {/* Voice Adjustments Section */}
       <div className="flex-1 p-4">
            <FieldGroup className="gap-8">
                {sliders.map((slider) => (
                    <form.Field key={slider.id} name={slider.id}>
                        {(field: SliderFieldRenderProps) => (
                            <Field>
                                <FieldLabel>{slider.label}</FieldLabel>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-muted-foreground">
                                        {slider.leftLabel}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {slider.rightLabel}
                                    </span>
                                </div>
                                <Slider 
                                    value={[field.state.value]}
                                    onValueChange={(value) => {
                                        field.handleChange(value[0]);
                                    }}
                                    min={slider.min}
                                    max={slider.max}
                                    step={slider.step}
                                    disabled={isSubmitting}
                                    className="**:data-[slot=slider-thumb]:size-3 **:data-[slot=slider-thumb]:bg-foreground **:data-[slot=slider-track]:h-1"
                                />
                                
                            </Field>
                        )}
                    </form.Field>
                ))}
            </FieldGroup>
       </div>
       </> 
    );
};