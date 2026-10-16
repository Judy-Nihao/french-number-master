import type { ComponentPropsWithoutRef } from "react";
import { cn } from "../../lib/utils";

type CardVariant = "tool" | "exercise" | "range" | "lookupResult";
type CardProps = ComponentPropsWithoutRef<"div"> & {
  variant?: CardVariant;
  state?: "default" | "incorrect";
};

const variants: Record<CardVariant, string> = {
  tool: "flex flex-col gap-4 bg-app-shell rounded-card border-control border-app-border p-3 md:p-6 shadow-elevation-control",
  exercise:
    "exercise-surface shrink-0 rounded-card-inner shadow-elevation-subtle overflow-hidden relative",
  range:
    "p-4 md:p-3 rounded-card-inner md:rounded-pill border-control border-app-border",
  lookupResult: "bg-transparent rounded-none pt-6 border-t border-app-dark/20",
};

export const Card = ({
  variant = "exercise",
  state = "default",
  className,
  ...props
}: CardProps) => (
  <div
    className={cn(
      "bg-app-card",
      variants[variant],
      variant === "exercise" && state === "incorrect" && "bg-app-error-panel",
      className,
    )}
    {...props}
  />
);
