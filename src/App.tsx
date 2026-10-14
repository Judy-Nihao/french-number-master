import { FloatingNotice } from "./components/practice/FloatingNotice";
import { ArrowRight } from "lucide-react";
import { Button } from "./components/ui/Button";
import { Card } from "./components/ui/Card";
import { motion, AnimatePresence, MotionConfig } from "motion/react";
import { ModeTabs } from "./components/ModeTabs";
import { RangeSettings } from "./components/practice/RangeSettings";
import { SpellingPanel } from "./components/practice/SpellingPanel";
import { LookupPanel } from "./components/practice/LookupPanel";
import { useNumberPractice } from "./hooks/useNumberPractice";

const App = () => {
  const practice = useNumberPractice();
  const { mode, setMode, reducedMotion } = practice;
  return (
    <MotionConfig reducedMotion="user">
      <FloatingNotice
        message={
          practice.keyboardHint
            ? "Switch to a Latin alphabet keyboard."
            : undefined
        }
        visible={
          practice.keyboardHint ||
          (mode === "test" &&
            (practice.minRange !== Number(practice.tempMin) ||
              practice.maxRange !== Number(practice.tempMax)))
        }
      />
      <div className="min-h-screen bg-app-bg flex flex-col items-center py-6 px-4 md:py-12 md:px-6 overflow-x-clip">
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

            {/* Main Exercise Card */}
            <Card
              state={
                mode === "test" && practice.feedback === "incorrect"
                  ? "incorrect"
                  : "default"
              }
            >
              <AnimatePresence mode="wait" initial={false}>
                {/* Motion coordinates directional enter/exit with AnimatePresence and reduced-motion preferences. */}
                <motion.div
                  key={mode}
                  initial={{
                    opacity: 0,
                    x: reducedMotion ? 0 : mode === "lookup" ? 18 : -18,
                  }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{
                    opacity: 0,
                    x: reducedMotion ? 0 : mode === "test" ? -18 : 18,
                  }}
                  transition={{
                    duration: reducedMotion ? 0.08 : 0.16,
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
            </Card>
            {mode === "test" && practice.feedback !== null && (
              <div className="flex justify-center">
                <Button
                  variant="next"
                  onClick={practice.generateRandomNumber}
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
            <ModeTabs mode={mode} onChange={setMode} />
          </Card>
        </div>
      </div>
    </MotionConfig>
  );
};

export default App;
