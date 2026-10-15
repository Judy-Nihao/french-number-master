import { Loader2, Volume2 } from "lucide-react";
import type { ComponentPropsWithoutRef } from "react";
import { Button } from "../ui/Button";

type PronunciationButtonProps = ComponentPropsWithoutRef<"button"> & {
  isPlaying: boolean;
};

export const PronunciationButton = ({
  isPlaying,
  disabled,
  ...props
}: PronunciationButtonProps) => (
  <Button variant="icon" disabled={disabled || isPlaying} {...props}>
    {isPlaying ? (
      <Loader2 size={24} className="animate-spin" />
    ) : (
      <Volume2 size={24} />
    )}
  </Button>
);
