import type { ComponentPropsWithRef } from "react";
import { cn } from "../../lib/utils";

type ButtonVariant = "primary" | "next" | "update";
export type ButtonProps = ComponentPropsWithRef<"button"> & {
  variant?: ButtonVariant;
};

const variants: Record<ButtonVariant, string> = {
  primary:
    "w-full py-4 font-bold text-base bg-app-dark text-app-card enabled:hover:bg-app-dark/90 enabled:active:scale-95 transition-[background-color,transform] disabled:opacity-50",
  next: "min-h-11 px-4 bg-app-dark text-app-card text-sm font-semibold enabled:hover:bg-app-dark/90 enabled:active:scale-95 transition-[background-color,transform] flex items-center justify-center gap-2 group",
  update:
    "w-full md:w-auto min-h-11 shrink-0 px-8 md:px-5 py-3 md:py-2.5 border-control border-app-border bg-app-card text-app-dark text-xs font-semibold cursor-pointer transition-colors enabled:hover:bg-app-control-hover enabled:active:bg-app-control-active focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-dark disabled:cursor-not-allowed",
};

export const Button = ({
  variant = "primary",
  className,
  type = "button",
  ...props
}: ButtonProps) => (
  <button
    type={type}
    className={cn(
      "rounded-pill cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-dark disabled:cursor-not-allowed",
      variants[variant],
      className,
    )}
    {...props}
  />
);
