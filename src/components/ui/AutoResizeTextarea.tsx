import { useImperativeHandle, useLayoutEffect, useRef, useState } from "react";
import type { ComponentPropsWithRef } from "react";
import { cn } from "../../lib/utils";
import { inputVariants, inputStates, type InputState } from "./Input";

type AutoResizeTextareaProps = ComponentPropsWithRef<"textarea"> & {
  state?: InputState;
};

export const AutoResizeTextarea = ({
  ref,
  state = "default",
  value,
  className,
  ...props
}: AutoResizeTextareaProps) => {
  const fieldRef = useRef<HTMLTextAreaElement>(null);
  const [multiline, setMultiline] = useState(false);
  useImperativeHandle(ref, () => fieldRef.current!);

  useLayoutEffect(() => {
    const field = fieldRef.current;
    if (!field) return;
    let active = true;
    const resize = () => {
      if (!active) return;
      // Content and font metrics determine the height at runtime; static Tailwind classes cannot measure scrollHeight.
      field.style.height = "auto";
      const style = getComputedStyle(field);
      const padding =
        parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
      const border =
        parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
      setMultiline(
        field.scrollHeight > parseFloat(style.lineHeight) + padding + 1,
      );
      field.style.height = `${field.scrollHeight + border}px`;
    };
    resize();
    let width = field.clientWidth;
    const observer = new ResizeObserver(() => {
      if (field.clientWidth !== width) {
        width = field.clientWidth;
        resize();
      }
    });
    observer.observe(field);
    document.fonts.ready.then(resize);
    return () => {
      active = false;
      observer.disconnect();
    };
  }, [value, state]);

  return (
    <textarea
      {...props}
      ref={fieldRef}
      value={value}
      rows={1}
      className={cn(
        "w-full focus:outline-none",
        inputVariants.answer,
        inputStates[state],
        "block resize-none overflow-hidden pr-14 transition-colors wrap-anywhere",
        multiline ? "rounded-field" : "rounded-pill",
        className,
      )}
    />
  );
};
