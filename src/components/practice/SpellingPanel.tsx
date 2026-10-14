import { cn } from "../../lib/utils";
import { AutoResizeTextarea } from "../ui/AutoResizeTextarea";
import { Button } from "../ui/Button";
import { AnimatedHeight } from "../ui/AnimatedHeight";
import { AnswerFeedback } from "./AnswerFeedback";
import { motion } from "motion/react";
import type { PracticeController } from "../../hooks/useNumberPractice";

// Static classes combine digit-based caps with the available number-row width.
const numberSizeClasses: Record<number, string> = {
  3: "text-[clamp(1rem,calc(100cqi/2.1),5.5rem)]",
  4: "text-[clamp(1rem,calc(100cqi/2.8),4.5rem)]",
  5: "text-[clamp(1rem,calc(100cqi/3.5),3.75rem)]",
  6: "text-[clamp(1rem,calc(100cqi/4.2),3.5rem)]",
  7: "text-[clamp(1rem,calc(100cqi/4.9),3rem)]",
  8: "text-[clamp(1rem,calc(100cqi/5.6),2.75rem)]",
  9: "text-[clamp(1rem,calc(100cqi/6.3),2.5rem)]",
  10: "text-[clamp(1rem,calc(100cqi/7),2.25rem)]",
  11: "text-[clamp(1rem,calc(100cqi/7.7),2rem)]",
  12: "text-[clamp(1rem,calc(100cqi/8.4),1.875rem)]",
  13: "text-[clamp(1rem,calc(100cqi/9.1),1.75rem)]",
  14: "text-[clamp(1rem,calc(100cqi/9.8),1.625rem)]",
  15: "text-[clamp(1rem,calc(100cqi/10.5),1.5rem)]",
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
    <div className="p-6 pt-8 flex flex-col gap-4 items-center relative z-10">
      <div className="@container w-full flex justify-center py-1">
        {/* The number key replays this Motion entrance for each new question. */}
        <motion.div
          key={currentNumber}
          initial={{ scale: 0.8, opacity: 0, rotate: -5 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          className={cn(
            "font-display font-semibold not-italic leading-none tracking-[-0.025em] text-app-dark max-w-full text-center",
            numberSizeClasses[String(currentNumber ?? "").length] ?? "text-8xl",
          )}
        >
          {currentNumber}
        </motion.div>
      </div>

      <div className="w-full flex flex-col gap-4">
        <div className="relative group">
          <AutoResizeTextarea
            onCompositionUpdate={handleCompositionUpdate}
            onBlur={dismissKeyboardHint}
            state={feedback ?? "default"}
            aria-label="French spelling"
            aria-invalid={feedback === "incorrect"}
            aria-describedby={feedback !== null ? "answer-feedback" : undefined}
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
