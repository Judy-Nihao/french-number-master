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
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 20, opacity: 0 }}
      className={cn(
        "border-t-surface border-app-border p-6",
        feedback === "correct" ? "bg-app-primary-light" : "bg-app-red/5",
      )}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="flex flex-col items-center text-center">
            <div
              className={cn(
                "text-[10px] uppercase tracking-[0.2em] font-bold mb-1",
                feedback === "correct" ? "text-app-primary" : "text-app-red",
              )}
            >
              {feedback === "correct" ? "Perfect!" : "Correct Answer"}
            </div>
            <div className="text-2xl font-bold text-app-dark mb-1 wrap-break-word">
              {representation.word}
            </div>
            <div className="text-sm font-medium text-app-dark/40 bg-app-card px-3 py-1 rounded-pill border-control border-app-border inline-block">
              {representation.ipa}
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <PronunciationButton
            aria-label="Play answer pronunciation"
            onClick={playAudio}
            isPlaying={isPlaying}
          />
        </div>
      </div>
    </motion.div>
  );
};
