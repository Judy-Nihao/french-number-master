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
    "px-6 py-4 rounded-pill border-control transition-all duration-300 text-lg font-medium placeholder:text-app-dark/20",
  lookup: "px-5 py-4 rounded-pill border-control transition-colors font-medium",
  range:
    "min-w-0 px-2 py-2 rounded-field border-surface bg-app-primary-light text-center text-sm font-bold text-app-primary transition-colors disabled:cursor-not-allowed",
};

const states: Record<InputState, string> = {
  default: "border-app-border focus:border-app-primary bg-transparent",
  correct: "border-app-primary bg-app-primary-light text-app-primary",
  incorrect: "border-app-red bg-app-red/5 text-app-red",
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
        ? "border-transparent focus:border-app-primary"
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
