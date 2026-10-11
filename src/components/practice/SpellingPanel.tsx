import { cn } from "../../lib/utils";
import { AutoResizeTextarea } from "../ui/AutoResizeTextarea";
import { AnimatedButton } from "../ui/Button";
import { AnswerFeedback } from "./AnswerFeedback";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import type { PracticeController } from "../../hooks/useNumberPractice";

// Static class names let Tailwind generate every supported number size.
const numberSizeClasses: Record<number, string> = {
  6: "text-[calc(480px/6)]",
  7: "text-[calc(480px/7)]",
  8: "text-[calc(480px/8)]",
  9: "text-[calc(480px/9)]",
  10: "text-[calc(480px/10)]",
  11: "text-[calc(480px/11)]",
  12: "text-[calc(480px/12)]",
  13: "text-[calc(480px/13)]",
  14: "text-[calc(480px/14)]",
  15: "text-[calc(480px/15)]",
};

type SpellingPanelProps = Pick<
  PracticeController,
  | "currentNumber"
  | "inputRef"
  | "userInput"
  | "handleAnswerInput"
  | "handleKeyDown"
  | "feedback"
  | "handleCheck"
  | "generateRandomNumber"
  | "playAudio"
  | "isPlaying"
>;

export const SpellingPanel = ({
  currentNumber,
  inputRef,
  userInput,
  handleAnswerInput,
  handleKeyDown,
  feedback,
  handleCheck,
  generateRandomNumber,
  playAudio,
  isPlaying,
}: SpellingPanelProps) => (
  <div id="test-panel" role="tabpanel" aria-labelledby="test-tab" tabIndex={0}>
    <div className="p-6 flex flex-col items-center relative z-10">
      {/* The number key replays this Motion entrance for each new question. */}
      <motion.div
        key={currentNumber}
        initial={{ scale: 0.8, opacity: 0, rotate: -5 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        className={cn(
          "font-bold text-app-dark mb-6 max-w-full wrap-anywhere text-center",
          numberSizeClasses[String(currentNumber ?? "").length] ?? "text-8xl",
        )}
      >
        {currentNumber}
      </motion.div>

      <div className="w-full space-y-4">
        <div className="relative group">
          <AutoResizeTextarea
            state={feedback ?? "default"}
            aria-label="French spelling"
            ref={inputRef}
            value={userInput}
            onChange={handleAnswerInput}
            onKeyDown={handleKeyDown}
            placeholder="Type in French..."
            disabled={feedback !== null}
          />
          <div className="absolute right-5 top-5 pointer-events-none flex items-center gap-2">
            {feedback === "correct" && (
              <CheckCircle2 className="text-app-success" size={24} />
            )}
            {feedback === "incorrect" && (
              <XCircle className="text-app-red" size={24} />
            )}
          </div>
        </div>

        {/* Motion keeps the outgoing button mounted until its exit finishes before showing the next action. */}
        <AnimatePresence mode="wait">
          {feedback === null ? (
            <AnimatedButton
              key="check"
              variant="primary"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCheck}
              disabled={!userInput}
            >
              Check Answer
            </AnimatedButton>
          ) : (
            <AnimatedButton
              key="next"
              variant="next"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              onClick={generateRandomNumber}
            >
              <span className="font-bold">Next Question</span>
              <ArrowRight
                size={20}
                className="group-hover:translate-x-1 transition-transform"
              />
            </AnimatedButton>
          )}
        </AnimatePresence>
      </div>
    </div>

    {/* Feedback Section - Speech Bubble Style */}
    <AnimatePresence>
      {feedback !== null && currentNumber !== null && (
        <AnswerFeedback
          currentNumber={currentNumber}
          feedback={feedback}
          isPlaying={isPlaying}
          playAudio={playAudio}
        />
      )}
    </AnimatePresence>
  </div>
);
