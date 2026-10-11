import { motion } from "motion/react";
import { cn } from "../../lib/utils";
import { PronunciationButton } from "./PronunciationButton";
import { getFrenchRepresentation } from "../../utils/frenchConverter";

type AnswerFeedbackProps = {
  currentNumber: number;
  feedback: "correct" | "incorrect";
  isPlaying: boolean;
  playAudio: () => void;
};

export const AnswerFeedback = ({
  currentNumber,
  feedback,
  isPlaying,
  playAudio,
}: AnswerFeedbackProps) => {
  const representation = getFrenchRepresentation(currentNumber);
  // AnimatePresence owns this panel's enter/exit lifecycle; keep animation values in Motion props.
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 20, opacity: 0 }}
      className={cn(
        "border-t p-5 sm:p-6",
        feedback === "incorrect"
          ? "border-app-red/40 bg-app-error-light"
          : "border-app-border bg-app-answer",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1 text-left">
          <div
            className={cn(
              "text-[10px] uppercase tracking-[0.2em] font-bold mb-1",
              feedback === "correct" ? "text-app-success" : "text-app-red",
            )}
          >
            {feedback === "correct" ? "Perfect!" : "Correct Answer"}
          </div>
          <div
            className={cn(
              "text-xl sm:text-2xl font-bold mb-1 wrap-anywhere",
              feedback === "incorrect" ? "text-app-red" : "text-app-dark",
            )}
          >
            {representation.word}
          </div>
          <div className="text-sm font-medium text-app-dark/75 wrap-anywhere">
            {representation.ipa}
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <PronunciationButton
            variant="lookup"
            aria-label="Play answer pronunciation"
            title="Play pronunciation"
            onClick={playAudio}
            isPlaying={isPlaying}
            className="flex h-11 w-11 items-center justify-center p-0"
          />
        </div>
      </div>
    </motion.div>
  );
};
