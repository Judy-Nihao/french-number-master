import { useEffect, useRef, useState } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
} from "motion/react";
import { cn } from "../lib/utils";

import type { PracticeMode } from "../types";

export const ModeTabs = ({
  mode,
  onChange,
}: {
  mode: PracticeMode;
  onChange: (mode: PracticeMode) => void;
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef(0);
  const ignoreClickUntil = useRef(0);
  const [travel, setTravel] = useState(0);
  const x = useMotionValue(0);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const observer = new ResizeObserver(() =>
      setTravel((track.clientWidth - 8) / 2),
    );
    observer.observe(track);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const animation = animate(
      x,
      mode === "lookup" ? travel : 0,
      reducedMotion
        ? { duration: 0 }
        : { type: "spring", stiffness: 480, damping: 36 },
    );
    return () => animation.stop();
  }, [mode, travel, reducedMotion, x]);

  return (
    <motion.div
      ref={trackRef}
      role="tablist"
      aria-label="Number practice mode"
      className="relative mt-6 grid grid-cols-2 rounded-pill border-control border-app-border bg-app-card p-1 select-none"
      style={{ touchAction: "pan-y" }}
      onPanStart={() => {
        dragStart.current = x.get();
      }}
      onPan={(_, info) => {
        x.set(Math.max(0, Math.min(travel, dragStart.current + info.offset.x)));
      }}
      onPanEnd={(_, info) => {
        if (Math.abs(info.offset.x) < 6) return;
        ignoreClickUntil.current = Date.now() + 250;
        const next =
          x.get() + info.velocity.x * 0.08 > travel / 2 ? "lookup" : "test";
        onChange(next);
        // Snap back even when the gesture leaves the selected mode unchanged.
        animate(
          x,
          next === "lookup" ? travel : 0,
          reducedMotion
            ? { duration: 0 }
            : { type: "spring", stiffness: 480, damping: 36 },
        );
      }}
    >
      <motion.div
        aria-hidden="true"
        className="absolute left-1 top-1 bottom-1 rounded-pill bg-app-dark pointer-events-none"
        style={{ x, width: "calc((100% - 8px) / 2)" }}
      />
      {(["test", "lookup"] as const).map((tabMode) => (
        <button
          key={tabMode}
          id={`${tabMode}-tab`}
          role="tab"
          aria-selected={mode === tabMode}
          aria-controls={`${tabMode}-panel`}
          tabIndex={mode === tabMode ? 0 : -1}
          onClick={() => {
            if (Date.now() >= ignoreClickUntil.current) onChange(tabMode);
          }}
          onKeyDown={(event) => {
            if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key))
              return;
            event.preventDefault();
            const next =
              event.key === "Home"
                ? "test"
                : event.key === "End"
                  ? "lookup"
                  : mode === "test"
                    ? "lookup"
                    : "test";
            onChange(next);
            document.getElementById(`${next}-tab`)?.focus();
          }}
          className={cn(
            "relative z-10 min-h-12 px-2 py-3 rounded-pill text-xs sm:text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-dark",
            mode === tabMode
              ? "text-app-card"
              : "text-app-dark/70 hover:text-app-dark",
          )}
        >
          {tabMode === "test" ? "Number Spelling Test" : "Number Lookup"}
        </button>
      ))}
    </motion.div>
  );
};
