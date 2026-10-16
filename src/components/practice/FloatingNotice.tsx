import { useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, useReducedMotion } from "motion/react";

type FloatingNoticeProps = { visible: boolean; message?: string };
type NoticePosition = {
  left: number;
  top: number;
  width: number;
  above: boolean;
};

export const FloatingNotice = ({
  visible,
  message = "Switch to a Latin alphabet keyboard.",
}: FloatingNoticeProps) => {
  const reducedMotion = useReducedMotion();
  const [position, setPosition] = useState<NoticePosition | null>(null);

  useLayoutEffect(() => {
    if (!visible) {
      setPosition(null);
      return;
    }
    const field = document.activeElement;
    if (!(
      field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement
    ))
      return;
    let frame = 0;
    const measure = () => {
      const rect = field.getBoundingClientRect();
      const viewport = window.visualViewport;
      const viewLeft = viewport?.offsetLeft ?? 0;
      const viewTop = viewport?.offsetTop ?? 0;
      const viewWidth = viewport?.width ?? window.innerWidth;
      const width = Math.min(288, viewWidth - 32);
      const mobile = window.matchMedia("(width < 768px)").matches;
      const above = rect.top - viewTop >= 64;
      setPosition({
        left: mobile
          ? viewLeft + (viewWidth - width) / 2
          : Math.max(
              viewLeft + 16,
              Math.min(
                rect.left + rect.width / 2 - width / 2,
                viewLeft + (viewport?.width ?? window.innerWidth) - width - 16,
              ),
            ),
        top: above ? rect.top - 8 : rect.bottom + 8,
        width,
        above,
      });
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("resize", schedule);
    document.addEventListener("scroll", schedule, true);
    window.visualViewport?.addEventListener("resize", schedule);
    window.visualViewport?.addEventListener("scroll", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", schedule);
      document.removeEventListener("scroll", schedule, true);
      window.visualViewport?.removeEventListener("resize", schedule);
      window.visualViewport?.removeEventListener("scroll", schedule);
    };
  }, [visible]);

  // Portal avoids clipping by the exercise card's animated height and overflow boundaries.
  return createPortal(
    <div role="status" aria-live="polite" aria-atomic="true">
      {visible && position && (
        <div
          className="pointer-events-none fixed z-50"
          // Field and viewport coordinates must be measured at runtime; static classes cannot anchor this notice.
          style={{
            left: position.left,
            top: position.top,
            width: position.width,
            transform: position.above ? "translateY(-100%)" : undefined,
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: reducedMotion ? 0 : 3 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.15 }}
            className="rounded-field border-control border-app-input-border/60 bg-app-shell px-3 py-2 text-center text-xs font-medium text-app-dark shadow-elevation-control"
          >
            {message}
          </motion.div>
        </div>
      )}
    </div>,
    document.body,
  );
};
