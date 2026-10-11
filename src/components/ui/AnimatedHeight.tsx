import { useLayoutEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import type { HTMLMotionProps } from "motion/react";
import { cn } from "../../lib/utils";

export const AnimatedHeight = ({
  children,
  className,
  ...props
}: Omit<HTMLMotionProps<"div">, "children"> & { children: ReactNode }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number>();
  const reducedMotion = useReducedMotion();

  useLayoutEffect(() => {
    const content = contentRef.current;
    if (!content) return;
    const measure = () => setHeight(content.offsetHeight);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(content);
    return () => observer.disconnect();
  }, []);

  return (
    <motion.div
      {...props}
      initial={false}
      animate={{ height }}
      // Natural content height must be measured at runtime. An overdamped spring avoids height overshoot.
      transition={
        reducedMotion
          ? { duration: 0 }
          : { type: "spring", stiffness: 240, damping: 30, mass: 0.8 }
      }
      className={cn("overflow-hidden", className)}
    >
      <div ref={contentRef} className="flow-root">
        {children}
      </div>
    </motion.div>
  );
};
