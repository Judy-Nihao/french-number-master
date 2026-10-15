import { cn } from "../../lib/utils";
import { AutoResizeTextarea } from "../ui/AutoResizeTextarea";
import { Button } from "../ui/Button";
import { AnswerFeedback } from "./AnswerFeedback";
import { motion } from "motion/react";
import { CornerDownLeft } from "lucide-react";
import type { PracticeController } from "../../hooks/useNumberPractice";

// Three size bands use container width rather than per-digit style overrides.
const getNumberSizeClass = (number: number | null) => {
  const digits = String(number ?? "").length;
  if (digits <= 4) return "text-[clamp(1rem,32cqi,5rem)]";
  if (digits <= 9) return "text-[clamp(1rem,17cqi,3.5rem)]";
  return "text-[clamp(1rem,10cqi,2rem)]";
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
    <div className="p-6 flex flex-col gap-2 items-center relative z-10">
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
            "font-sans font-semibold tracking-[-0.025em] text-app-dark max-w-full text-center",
            getNumberSizeClass(currentNumber),
            "leading-none",
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
