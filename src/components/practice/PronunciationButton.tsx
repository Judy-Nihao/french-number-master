import { Loader2, Volume2 } from "lucide-react";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "../../lib/utils";

type PronunciationButtonProps = ComponentPropsWithoutRef<"button"> & {
  isPlaying: boolean;
  variant?: "answer" | "lookup";
};

const variants = {
  answer:
    "p-4 border-surface hover:border-app-primary hover:text-app-primary transition-all shadow-elevation-control group",
  lookup:
    "shrink-0 p-3 border-control hover:text-app-primary focus-visible:outline-2 focus-visible:outline-app-primary",
};

export const PronunciationButton = ({
  isPlaying,
  variant = "answer",
  className,
  disabled,
  ...props
}: PronunciationButtonProps) => {
  const size = variant === "answer" ? 24 : 20;
  return (
    <button
      type="button"
      disabled={disabled || isPlaying}
      className={cn(
        "rounded-pill bg-app-card border-app-border disabled:opacity-50",
        variants[variant],
        className,
      )}
      {...props}
    >
      {isPlaying ? (
        <Loader2
          size={size}
          className={cn(
            "animate-spin",
            variant === "answer" && "text-app-primary",
          )}
        />
      ) : (
        <Volume2
          size={size}
          className={
            variant === "answer"
              ? "text-app-dark group-hover:text-app-primary transition-colors"
              : undefined
          }
        />
      )}
    </button>
  );
};
