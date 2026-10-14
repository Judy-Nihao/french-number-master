import type { ComponentPropsWithRef } from "react";
import { cn } from "../../lib/utils";

export type InputState = "default" | "correct" | "incorrect";
type InputVariant = "answer" | "lookup" | "range";

export type InputProps = ComponentPropsWithRef<"input"> & {
  variant?: InputVariant;
  state?: InputState;
};

export const inputVariants: Record<InputVariant, string> = {
  answer:
    "px-6 py-4 rounded-pill border-control transition-all duration-300 text-lg font-medium placeholder:text-app-dark/60",
  lookup:
    "px-5 py-4 rounded-pill border-control transition-colors font-medium placeholder:text-app-dark/60",
  range:
    "min-w-0 min-h-11 px-2 py-2 rounded-field border-control bg-app-bg text-center text-sm font-bold tabular-nums text-app-dark transition-colors disabled:cursor-not-allowed",
};

export const inputStates: Record<InputState, string> = {
  default: "border-app-input-border focus:border-app-dark bg-app-card",
  correct: "border-app-success bg-app-primary-light text-app-success",
  incorrect: "border-surface border-app-red bg-app-error-light text-app-red",
};

export const Input = ({
  variant = "lookup",
  state = "default",
  className,
  type = "text",
  ...props
}: InputProps) => (
  <input
    type={type}
    className={cn(
      "w-full focus:outline-none",
      inputVariants[variant],
      variant === "range"
        ? "border-app-border focus:border-app-dark"
        : inputStates[state],
      className,
    )}
    {...props}
  />
);

// Numeric filtering belongs to the controller; these are browser input hints.
export const NumberInput = (props: InputProps) => (
  <Input inputMode="numeric" pattern="[0-9]*" {...props} />
);
