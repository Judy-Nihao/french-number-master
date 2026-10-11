import { Input } from "../ui/Input";
import { AnimatedButton } from "../ui/Button";
import { AnswerFeedback } from "./AnswerFeedback";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import type { PracticeController } from "../../hooks/useNumberPractice";

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
    <div className="px-8 py-7 flex flex-col items-center relative z-10">
      <motion.div
        key={currentNumber}
        initial={{ scale: 0.8, opacity: 0, rotate: -5 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        className="text-8xl font-bold text-app-dark mb-8 drop-shadow-sm max-w-full wrap-anywhere text-center"
        style={{
          fontSize: `${Math.min(96, 480 / String(currentNumber ?? "").length)}px`,
        }}
      >
        {currentNumber}
      </motion.div>

      <div className="w-full space-y-4">
        <div className="relative group">
          <Input
            variant="answer"
            state={feedback ?? "default"}
            aria-label="French spelling"
            ref={inputRef}
            type="text"
            value={userInput}
            onChange={handleAnswerInput}
            onKeyDown={handleKeyDown}
            placeholder="Type in French..."
            disabled={feedback !== null}
          />
          <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {feedback === "correct" && (
              <CheckCircle2 className="text-app-primary" size={24} />
            )}
            {feedback === "incorrect" && (
              <XCircle className="text-app-red" size={24} />
            )}
          </div>
        </div>

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
