import type { ComponentPropsWithRef } from "react";
import { cn } from "../../lib/utils";

type ButtonVariant = "primary" | "next" | "update" | "icon";
export type ButtonProps = ComponentPropsWithRef<"button"> & {
  variant?: ButtonVariant;
};

const variants: Record<ButtonVariant, string> = {
  primary:
    "w-full py-4 font-bold text-base bg-app-dark text-app-card enabled:hover:bg-app-dark/90 enabled:active:scale-95 transition-[background-color,transform] disabled:opacity-50",
  next: "w-40 max-w-full min-h-12 px-6 rounded-card-inner bg-app-next bg-linear-to-br from-app-next to-app-next-end text-app-card text-sm font-semibold shadow-elevation-subtle enabled:hover:brightness-[1.14] enabled:active:brightness-[0.82] enabled:active:scale-[0.98] transition-[filter,transform] duration-150 enabled:active:duration-75 motion-reduce:transition-none motion-reduce:transform-none flex items-center justify-center gap-2 group",
  icon: "flex h-control w-control shrink-0 items-center justify-center border-control border-app-border bg-app-card text-app-dark p-0 transition-colors enabled:hover:bg-app-control-hover enabled:active:bg-app-control-active disabled:opacity-50",
  update:
    "w-full md:w-auto min-h-control shrink-0 px-8 md:px-5 py-3 md:py-2.5 border-control border-app-border bg-app-card text-app-dark text-xs font-semibold transition-colors enabled:hover:bg-app-control-hover enabled:active:bg-app-control-active",
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
      "rounded-pill cursor-pointer focus-visible:control-focus disabled:cursor-not-allowed",
      variants[variant],
      className,
    )}
    {...props}
  />
);
