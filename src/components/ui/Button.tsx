import type { ComponentPropsWithRef } from "react";
import { motion } from "motion/react";
import { cn } from "../../lib/utils";

type ButtonVariant = "primary" | "next" | "update";
export type ButtonProps = ComponentPropsWithRef<"button"> & {
  variant?: ButtonVariant;
};

const variants: Record<ButtonVariant, string> = {
  primary:
    "w-full py-4 font-bold text-lg bg-app-dark text-app-card hover:bg-app-dark/90 transition-all  active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
  next: "w-full py-4 bg-app-dark text-app-card hover:bg-app-dark/90 transition-all  flex items-center justify-center gap-2 group",
  update:
    "w-full sm:w-auto shrink-0 px-8 sm:px-5 py-3 sm:py-2.5 bg-app-dark text-app-card text-xs font-bold hover:scale-105 active:scale-95 transition-transform  focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-dark disabled:cursor-not-allowed disabled:hover:scale-100",
};

export const Button = ({
  variant = "primary",
  className,
  type = "button",
  ...props
}: ButtonProps) => (
  <button
    type={type}
    className={cn("rounded-pill", variants[variant], className)}
    {...props}
  />
);

export const AnimatedButton = motion.create(Button);
