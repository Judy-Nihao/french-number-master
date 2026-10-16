import { FloatingNotice } from "./components/practice/FloatingNotice";
import { ArrowRight } from "lucide-react";
import { Button } from "./components/ui/Button";
import { AnimatedHeight } from "./components/ui/AnimatedHeight";
import { Card } from "./components/ui/Card";
import { motion, AnimatePresence, MotionConfig } from "motion/react";
import { ModeTabs } from "./components/ModeTabs";
import { RangeSettings } from "./components/practice/RangeSettings";
import { SpellingPanel } from "./components/practice/SpellingPanel";
import { LookupPanel } from "./components/practice/LookupPanel";
import { useNumberPractice } from "./hooks/useNumberPractice";
import { useKeyboardViewport } from "./hooks/useKeyboardViewport";

const App = () => {
  const practice = useNumberPractice();
  const { mode, setMode, reducedMotion } = practice;
  const { pageRef, alignmentRef } = useKeyboardViewport(mode);
  return (
    <MotionConfig reducedMotion="user">
      <FloatingNotice
        message="Switch to a Latin alphabet keyboard."
        visible={practice.keyboardHint}
      />
      <div
        ref={pageRef}
        className="min-h-[calc(100vh+var(--keyboard-inset,0px))] bg-app-bg flex flex-col items-center py-6 px-4 md:py-12 md:px-6 overflow-x-clip"
      >
        <div className="w-full max-w-lg flex flex-col gap-4 relative">
          {/* Header */}
          <header className="text-center">
            <h1 className="font-display text-3xl md:text-5xl font-medium italic text-app-dark text-balance">
              French Number Master
            </h1>
          </header>

          <Card variant="tool">
            {/* Range settings */}
            <RangeSettings {...practice} />

            <div ref={alignmentRef}>
              {/* Main Exercise Card */}
              <Card
                data-mode={mode === "test" ? "spelling" : "lookup"}
              >
                <AnimatedHeight>
                  <AnimatePresence mode="popLayout" initial={false}>
                    {/* popLayout removes the exiting panel from measurement while the incoming panel sets the target height. */}
                    <motion.div
                      key={mode}
                      initial={{
                        opacity: 0.35,
                        x: reducedMotion ? 0 : mode === "lookup" ? 6 : -6,
                      }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{
                        opacity: 0,
                        x: reducedMotion ? 0 : mode === "test" ? -6 : 6,
                      }}
                      transition={{
                        duration: reducedMotion ? 0 : 0.18,
                        ease: "easeOut",
                      }}
                    >
                      {mode === "test" ? (
                        <SpellingPanel {...practice} />
                      ) : (
                        <LookupPanel {...practice} />
                      )}
                    </motion.div>
                  </AnimatePresence>
                </AnimatedHeight>
              </Card>
              <AnimatedHeight className="overflow-visible">
                {mode === "test" && practice.feedback !== null && (
                  <div className="flex justify-center pt-4">
                    <Button
                      variant="next"
                      onClick={practice.handleNextQuestion}
                      aria-label="Next question"
                    >
                      Next
                      <ArrowRight
                        size={16}
                        aria-hidden="true"
                        className="group-hover:translate-x-1 transition-transform"
                      />
                    </Button>
                  </div>
                )}
              </AnimatedHeight>
            </div>
            <ModeTabs mode={mode} onChange={setMode} />
          </Card>
        </div>
      </div>
    </MotionConfig>
  );
};

export default App;
