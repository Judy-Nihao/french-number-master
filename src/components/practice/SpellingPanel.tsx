import { cn } from "../../lib/utils";
import { AutoResizeTextarea } from "../ui/AutoResizeTextarea";
import { Button } from "../ui/Button";
import { AnimatedHeight } from "../ui/AnimatedHeight";
import { AnswerFeedback } from "./AnswerFeedback";
import { motion } from "motion/react";
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
  | "playAudio"
  | "handleCompositionUpdate"
  | "dismissKeyboardHint"
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
  playAudio,
  isPlaying,
  handleCompositionUpdate,
  dismissKeyboardHint,
}: SpellingPanelProps) => (
  <AnimatedHeight
    id="test-panel"
    role="tabpanel"
    aria-labelledby="test-tab"
    tabIndex={0}
  >
    <div className="p-6 flex flex-col gap-6 items-center relative z-10">
      {/* The number key replays this Motion entrance for each new question. */}
      <motion.div
        key={currentNumber}
        initial={{ scale: 0.8, opacity: 0, rotate: -5 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        className={cn(
          "font-bold text-app-dark max-w-full wrap-anywhere text-center",
          numberSizeClasses[String(currentNumber ?? "").length] ?? "text-8xl",
        )}
      >
        {currentNumber}
      </motion.div>

      <div className="w-full flex flex-col gap-4">
        <div className="relative group">
          <AutoResizeTextarea
            onCompositionUpdate={handleCompositionUpdate}
            onBlur={dismissKeyboardHint}
            state={feedback ?? "default"}
            aria-label="French spelling"
            ref={inputRef}
            value={userInput}
            onChange={handleAnswerInput}
            onKeyDown={handleKeyDown}
            placeholder="Type in French..."
            disabled={feedback !== null}
          />
        </div>

        {feedback === null && (
          <Button variant="primary" onClick={handleCheck} disabled={!userInput}>
            Check Answer
          </Button>
        )}
      </div>
    </div>

    {/* Remove the previous state immediately so exiting content cannot reserve layout space. */}
    {feedback !== null && currentNumber !== null && (
      <AnswerFeedback
        currentNumber={currentNumber}
        feedback={feedback}
        isPlaying={isPlaying}
        playAudio={playAudio}
      />
    )}
  </AnimatedHeight>
);
