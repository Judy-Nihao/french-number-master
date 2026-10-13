import { Loader2, Volume2 } from "lucide-react";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "../../lib/utils";

type PronunciationButtonProps = ComponentPropsWithoutRef<"button"> & {
  isPlaying: boolean;
};

export const PronunciationButton = ({
  isPlaying,
  className,
  disabled,
  ...props
}: PronunciationButtonProps) => (
  <button
    type="button"
    disabled={disabled || isPlaying}
    className={cn(
      "flex h-11 w-11 shrink-0 items-center justify-center rounded-pill border-control border-app-border bg-app-card text-app-dark p-0 cursor-pointer transition-colors enabled:hover:bg-app-control-hover enabled:active:bg-app-control-active focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-dark disabled:opacity-50 disabled:cursor-not-allowed",
      className,
    )}
    {...props}
  >
    {isPlaying ? (
      <Loader2 size={20} className="animate-spin" />
    ) : (
      <Volume2 size={20} />
    )}
  </button>
);
