import { cn } from "../../lib/utils";
import { AutoResizeTextarea } from "../ui/AutoResizeTextarea";
import { Button } from "../ui/Button";
import { AnswerFeedback } from "./AnswerFeedback";
import { motion } from "motion/react";
import { CornerDownLeft } from "lucide-react";
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
  | "reducedMotion"
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
  reducedMotion,
  handleCompositionUpdate,
  dismissKeyboardHint,
}: SpellingPanelProps) => (
  <div id="test-panel" role="tabpanel" aria-labelledby="test-tab" tabIndex={0}>
    <div className="p-6 pt-8 flex flex-col gap-4 items-center relative z-10">
      <div className="@container w-full flex justify-center py-1">
        {/* The number key replays this Motion entrance for each new question. */}
        <motion.div
          key={currentNumber}
          initial={reducedMotion ? false : { scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            duration: reducedMotion ? 0 : 0.24,
            ease: [0.22, 1, 0.36, 1],
          }}
          className={cn(
            "font-sans font-semibold not-italic leading-none tracking-[-0.025em] text-app-dark max-w-full text-center",
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
            enterKeyHint="done"
            disabled={feedback !== null}
          />
        </div>

        {feedback === null && (
          <Button
            variant="primary"
            onClick={handleCheck}
            disabled={!userInput}
            aria-describedby="check-answer-shortcut"
            aria-keyshortcuts="Enter"
            className="group/shortcut relative flex items-center justify-center gap-2"
          >
            Check Answer
            <CornerDownLeft
              size={16}
              aria-hidden="true"
              className="shrink-0 opacity-60"
            />
            <span
              id="check-answer-shortcut"
              role="tooltip"
              className="pointer-events-none absolute bottom-[calc(100%+0.5rem)] hidden whitespace-nowrap rounded-field border-control border-app-border bg-app-card px-3 py-2 text-xs font-medium text-app-dark opacity-0 transition-opacity md:block group-hover/shortcut:opacity-100 group-focus-visible/shortcut:opacity-100"
            >
              Press Enter to check
            </span>
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
  </div>
);
