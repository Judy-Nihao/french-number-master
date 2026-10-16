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
          <header className="@container relative px-3 text-left md:px-6">
            <h1 className="flex flex-col items-start gap-1 font-sans font-bold tracking-[-0.035em] text-app-dark">
              <span className="font-display text-[clamp(2.75rem,11cqi,3.5rem)] leading-none font-medium italic">
                French
              </span>
              <span className="text-[clamp(1.75rem,8cqi,2.5rem)] leading-tight">Number Master</span>
            </h1>
            <div aria-hidden="true" className="pointer-events-none absolute right-5 top-1/2 grid w-28 -translate-y-1/2 grid-cols-[auto_auto] items-center gap-x-2 gap-y-2 select-none md:right-10 md:w-40 md:gap-x-3 md:gap-y-3">
              <span className="justify-self-end rounded-2xl rounded-bl-none border-control border-app-dark/70 bg-app-shell px-2 py-1 font-sans text-sm leading-none font-medium text-app-dark md:px-3 md:py-2 md:text-base">
                un
              </span>
              <span className="justify-self-end rounded-2xl rounded-br-none border-control border-app-dark/70 bg-app-shell px-2 py-1 font-display text-lg leading-none font-medium italic text-app-dark md:px-3 md:py-2 md:text-2xl">
                deux
              </span>
              <span className="col-span-2 justify-self-center rounded-2xl rounded-bl-none border-control border-app-dark/70 bg-app-shell px-3 py-1 font-sans text-sm leading-none font-medium text-app-dark md:px-4 md:py-2 md:text-base">
                trois
              </span>
            </div>
          </header>

          <Card variant="tool">
            {/* Range settings */}
            <RangeSettings {...practice} />

            <div ref={alignmentRef}>
              {/* Main Exercise Card */}
              <Card data-mode={mode === "test" ? "spelling" : "lookup"}>
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
                        className="transition-transform duration-150 group-hover:translate-x-1 group-active:translate-x-1.5 motion-reduce:transform-none motion-reduce:transition-none"
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
