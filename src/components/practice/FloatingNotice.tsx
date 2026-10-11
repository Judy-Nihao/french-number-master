import { AnimatePresence, motion, useReducedMotion } from "motion/react";

type FloatingNoticeProps = { visible: boolean; message?: string };

export const FloatingNotice = ({
  visible,
  message = "Don't forget to update!",
}: FloatingNoticeProps) => {
  const reducedMotion = useReducedMotion();
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="pointer-events-none fixed inset-x-0 top-[calc(env(safe-area-inset-top)+2rem)] z-50 flex justify-center px-4"
    >
      <AnimatePresence>
        {visible && (
          // Motion retains the notice through its exit and disables movement for reduced motion.
          <motion.div
            key="input-notice"
            initial={{ opacity: 0, y: reducedMotion ? 0 : -32 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reducedMotion ? 0 : -24 }}
            transition={{ duration: reducedMotion ? 0 : 0.25, ease: "easeOut" }}
          >
            {/* Keep the floating keyframes in Motion so reduced-motion changes take effect immediately. */}
            <motion.div
              animate={{ y: reducedMotion ? 0 : [0, -2, 0] }}
              transition={
                reducedMotion
                  ? { duration: 0 }
                  : {
                      duration: 3.2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.3,
                    }
              }
              className="rounded-pill border-control border-app-border bg-app-notice px-4 py-2 text-center text-[11px] font-medium tracking-wide text-app-dark/65"
            >
              <span>{message}</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
