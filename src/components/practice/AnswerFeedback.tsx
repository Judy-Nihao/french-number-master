import { ArrowRight } from "lucide-react";
import { Button } from "../ui/Button";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "../../lib/utils";
import { PronunciationButton } from "./PronunciationButton";
import { getFrenchRepresentation } from "../../utils/frenchConverter";

type AnswerFeedbackProps = {
  currentNumber: number;
  feedback: "correct" | "incorrect";
  isPlaying: boolean;
  playAudio: () => void;
  onNext: () => void;
};

export const AnswerFeedback = ({
  currentNumber,
  feedback,
  isPlaying,
  playAudio,
  onNext,
}: AnswerFeedbackProps) => {
  const representation = getFrenchRepresentation(currentNumber);
  const reducedMotion = useReducedMotion();
  // Motion animates entrance only; exit retention would overlap the next question's layout.
  return (
    <motion.div
      initial={reducedMotion ? false : { y: 12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        y: { type: "spring", stiffness: 280, damping: 22 },
        opacity: { duration: reducedMotion ? 0 : 0.2 },
      }}
      className={cn(
        "flex flex-col gap-3 border-t px-6 py-6 sm:px-7 sm:py-7",
        feedback === "incorrect"
          ? "border-app-red/40 bg-app-error-light"
          : "border-app-border bg-app-answer",
      )}
    >
      <div className="min-w-0 flex flex-col gap-1 text-left">
        <div
          className={cn(
            "text-[10px] uppercase tracking-[0.2em] font-bold",
            feedback === "correct" ? "text-app-success" : "text-app-red",
          )}
        >
          {feedback === "correct" ? "Perfect!" : "Correct Answer"}
        </div>
        <div
          className={cn(
            "text-xl sm:text-2xl font-bold wrap-anywhere",
            feedback === "incorrect" ? "text-app-red" : "text-app-dark",
          )}
        >
          {representation.word}
        </div>
        <div className="text-sm font-medium text-app-dark/75 wrap-anywhere">
          {representation.ipa}
        </div>
      </div>
      <div className="flex items-center justify-between gap-3">
        <PronunciationButton
          variant="lookup"
          aria-label="Play answer pronunciation"
          title="Play pronunciation"
          onClick={playAudio}
          isPlaying={isPlaying}
          className="flex h-11 w-11 shrink-0 items-center justify-center p-0"
        />
        <Button variant="next" onClick={onNext} aria-label="Next question">
          Next{" "}
          <ArrowRight
            size={16}
            aria-hidden="true"
            className="group-hover:translate-x-1 transition-transform"
          />
        </Button>
      </div>
    </motion.div>
  );
};
