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
      <div className="min-h-screen bg-app-bg flex flex-col items-center justify-center py-6 px-4 sm:py-12 sm:px-6 overflow-x-clip">
        <div className="w-full max-w-lg flex flex-col relative">
          {/* Header */}
          <header className="mb-6 text-center">
            <h1 className="font-display text-4xl font-semibold  text-app-dark">
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
            <ModeTabs mode={mode} onChange={setMode} />
          </Card>
        </div>
      </div>
    </MotionConfig>
  );
};

export default App;
