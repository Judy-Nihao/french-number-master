import type { ComponentPropsWithoutRef } from "react";
import { cn } from "../../lib/utils";

type CardVariant = "exercise" | "range" | "lookupResult";
type CardProps = ComponentPropsWithoutRef<"div"> & { variant?: CardVariant };

const variants: Record<CardVariant, string> = {
  exercise:
    "min-h-84 shrink-0 rounded-card border-surface border-app-border shadow-elevation-panel shadow-app-primary/5 overflow-hidden relative",
  range:
    "p-4 sm:p-3 rounded-card sm:rounded-pill border-surface border-app-border shadow-elevation-subtle",
  lookupResult:
    "bg-app-primary-light/30 rounded-field p-4 border-control border-app-primary/10",
};

export const Card = ({
  variant = "exercise",
  className,
  ...props
}: CardProps) => (
  <div className={cn("bg-app-card", variants[variant], className)} {...props} />
);
