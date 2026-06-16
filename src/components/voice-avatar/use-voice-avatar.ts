import { useMemo } from "react";
import { Avatar, Style } from "@dicebear/core";
import definition from "@dicebear/styles/glass.json";

const glassStyle = new Style(definition);

export function useVoiceAvatar(seed: string) {
  return useMemo(() => {
    return new Avatar(glassStyle, {
      seed,
      size: 128,
    }).toDataUri();
  }, [seed]);
}
