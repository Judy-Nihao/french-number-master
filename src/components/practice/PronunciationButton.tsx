import { Loader2, Volume2 } from "lucide-react";
import type { ComponentPropsWithoutRef } from "react";
import { Button } from "../ui/Button";
import { cn } from "../../lib/utils";

type PronunciationButtonProps = ComponentPropsWithoutRef<"button"> & {
  isPlaying: boolean;
};

export const PronunciationButton = ({
  isPlaying,
  disabled,
  className,
  ...props
}: PronunciationButtonProps) => (
  <Button
    variant="icon"
    disabled={disabled || isPlaying}
    className={cn("h-12 w-12 shadow-elevation-subtle", className)}
    {...props}
  >
    {isPlaying ? (
      <Loader2 size={26} aria-hidden="true" className="animate-spin" />
    ) : (
      <Volume2 size={26} strokeWidth={1.85} aria-hidden="true" />
    )}
  </Button>
);
