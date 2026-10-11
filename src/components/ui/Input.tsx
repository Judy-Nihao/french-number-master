import type { ComponentPropsWithRef } from "react";
import { cn } from "../../lib/utils";

export type InputState = "default" | "correct" | "incorrect";
type InputVariant = "answer" | "lookup" | "range";

export type InputProps = ComponentPropsWithRef<"input"> & {
  variant?: InputVariant;
  state?: InputState;
};

const variants: Record<InputVariant, string> = {
  answer:
    "px-6 py-4 rounded-pill border-control transition-all duration-300 text-lg font-medium placeholder:text-app-dark/60",
  lookup: "px-5 py-4 rounded-pill border-control transition-colors font-medium",
  range:
    "min-w-0 px-2 py-2 rounded-field border-surface bg-app-bg text-center text-sm font-bold text-app-dark transition-colors disabled:cursor-not-allowed",
};

const states: Record<InputState, string> = {
  default: "border-app-dark/15 focus:border-app-dark bg-app-card",
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
      variants[variant],
      variant === "range"
        ? "border-transparent focus:border-app-dark"
        : states[state],
      className,
    )}
    {...props}
  />
);

// Numeric filtering belongs to the controller; these are browser input hints.
export const NumberInput = (props: InputProps) => (
  <Input inputMode="numeric" pattern="[0-9]*" {...props} />
);
