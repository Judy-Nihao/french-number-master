import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Volume2,
  CheckCircle2,
  XCircle,
  Settings2,
  ArrowRight,
  Loader2,
  Search,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import { getFrenchRepresentation } from "./utils/frenchConverter";
import { cn } from "./lib/utils";

export default function App() {
  const [minRange, setMinRange] = useState(0);
  const [maxRange, setMaxRange] = useState(20);
  const [tempMin, setTempMin] = useState<number | string>(0);
  const [tempMax, setTempMax] = useState<number | string>(20);
  const [currentNumber, setCurrentNumber] = useState<number | null>(null);
  const [userInput, setUserInput] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(
    null,
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [lookupValue, setLookupValue] = useState<string>("");
  const [lookupResult, setLookupResult] = useState<{
    word: string;
    ipa: string;
  } | null>(null);
  const [isLookupOpen, setIsLookupOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const poolRef = useRef<number[]>([]);
  const lastNumberRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const generateRandomNumber = useCallback(() => {
    const rangeSize = maxRange - minRange + 1;
    if (rangeSize <= 0) return;

    // Use shuffle bag only for small ranges to avoid memory issues
    const USE_POOL_LIMIT = 5000;

    if (rangeSize <= USE_POOL_LIMIT) {
      if (poolRef.current.length === 0) {
        const range = Array.from({ length: rangeSize }, (_, i) => i + minRange);
        for (let i = range.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [range[i], range[j]] = [range[j], range[i]];
        }
        if (
          range.length > 1 &&
          range[range.length - 1] === lastNumberRef.current
        ) {
          const first = range.pop()!;
          const second = range.pop()!;
          range.push(first);
          range.push(second);
        }
        poolRef.current = range;
      }
      const nextNumber = poolRef.current.pop()!;
      setCurrentNumber(nextNumber);
      lastNumberRef.current = nextNumber;
    } else {
      // For huge ranges, just pick random
      let random;
      do {
        random = Math.floor(Math.random() * rangeSize) + minRange;
      } while (random === lastNumberRef.current && rangeSize > 1);

      setCurrentNumber(random);
      lastNumberRef.current = random;
    }

    setUserInput("");
    setFeedback(null);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [minRange, maxRange]);

  useEffect(() => {
    generateRandomNumber();
  }, [generateRandomNumber]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)");
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const handleLookup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === "" || /^\d+$/.test(val)) {
      setLookupValue(val);
      if (val !== "") {
        const num = parseInt(val);
        if (num <= 999999999999999) {
          setLookupResult(getFrenchRepresentation(num));
        } else {
          setLookupResult({ word: "Trop grand / Too large", ipa: "" });
        }
      } else {
        setLookupResult(null);
      }
    }
  };

  const playLookupAudio = () => {
    if (!lookupResult || isPlaying) return;
    setIsPlaying(true);
    window.speechSynthesis.cancel();
    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(lookupResult.word);
      utterance.lang = "fr-FR";
      const availableVoices = window.speechSynthesis.getVoices();
      const preferredVoice =
        availableVoices.find(
          (v) =>
            v.lang.startsWith("fr") &&
            (v.name.includes("Female") ||
              v.name.includes("Google") ||
              v.name.includes("Natural")),
        ) || availableVoices.find((v) => v.lang.startsWith("fr"));

      if (preferredVoice) utterance.voice = preferredVoice;
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
    }, 50);
  };

  const handleRangeInput =
    (setter: React.Dispatch<React.SetStateAction<number | string>>) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      if (val === "" || /^\d+$/.test(val)) {
        setter(val);
      }
    };

  const handleAnswerInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // 限制：只允許法文字母、空格、連字號及法文特有重音符號，防止中文輸入
    // 允許：a-z, A-Z, 0-9 (以防萬一), 空格, 連字號, 以及法文重音符號
    const frenchRegex = /^[a-zA-Z0-9\s\-éàèêëîïôûùçÉÀÈÊËÎÏÔÛÙÇ]*$/;
    if (frenchRegex.test(val)) {
      setUserInput(val);
    }
  };

  const handleUpdateRange = () => {
    const valMin = typeof tempMin === "string" ? parseInt(tempMin) : tempMin;
    const valMax = typeof tempMax === "string" ? parseInt(tempMax) : tempMax;

    const newMin = Math.max(
      0,
      Math.min(isNaN(valMin) ? 0 : valMin, 999999999999999),
    );
    const newMax = Math.max(
      0,
      Math.min(isNaN(valMax) ? 100 : valMax, 999999999999999),
    );

    if (newMin <= newMax) {
      setMinRange(newMin);
      setMaxRange(newMax);
      setTempMin(newMin);
      setTempMax(newMax);
    } else {
      // Swap if min > max
      setMinRange(newMax);
      setMaxRange(newMin);
      setTempMin(newMax);
      setTempMax(newMin);
    }
    // 重置 pool 以適應新範圍
    poolRef.current = [];
  };

  const handleCheck = () => {
    if (currentNumber === null) return;
    const representation = getFrenchRepresentation(currentNumber);
    const correctWord = representation.word.toLowerCase();
    const input = userInput.trim().toLowerCase();

    // Normalize: Treat hyphens as spaces and squeeze multiple spaces into one
    const normalize = (str: string) =>
      str.replace(/-/g, " ").replace(/\s+/g, " ").trim();

    if (normalize(input) === normalize(correctWord)) {
      setFeedback("correct");
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#48944C", "#E8F5E9", "#FFD54F"],
      });
    } else {
      setFeedback("incorrect");
    }
  };

  const playAudio = () => {
    if (currentNumber === null || isPlaying) return;

    setIsPlaying(true);
    const representation = getFrenchRepresentation(currentNumber);
    const word = representation.word;

    // Use Web Speech API (System Default)
    window.speechSynthesis.cancel();

    // Some browsers need a small delay after cancel
    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = "fr-FR";
      utterance.rate = 0.9;

      // Try to find a female/natural French voice
      const availableVoices = window.speechSynthesis.getVoices();
      const preferredVoice =
        availableVoices.find(
          (v) =>
            v.lang.startsWith("fr") &&
            (v.name.includes("Female") ||
              v.name.includes("Google") ||
              v.name.includes("Natural")),
        ) || availableVoices.find((v) => v.lang.startsWith("fr"));

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);

      window.speechSynthesis.speak(utterance);

      // Chrome bug: sometimes it gets stuck, resume helps
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    }, 50);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (feedback !== null) {
        generateRandomNumber();
      } else {
        handleCheck();
      }
    }
  };

  return (
    <div className="min-h-screen bg-app-bg flex flex-col items-center justify-center py-6 px-4 sm:py-12 sm:px-6 overflow-x-hidden">
      <div className="w-full max-w-md flex flex-col relative">
        {/* Organic Background Shape - Top Left */}
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-app-primary/10 rounded-full blur-3xl -z-10" />
        {/* Organic Background Shape - Bottom Right */}
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-app-accent/10 rounded-full blur-3xl -z-10" />

        {/* Header */}
        <header className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-app-dark tracking-tight">
            French Number Master
          </h1>
        </header>

        {/* Range Settings - Clean Pill Card */}
        <div className="mb-6">
          <div className="bg-app-card p-4 sm:p-3 rounded-4xl border-2 border-app-border flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-3 shadow-sm">
            <div className="flex items-center gap-2 pl-2">
              <Settings2 size={18} className="text-app-primary" />
              <span className="text-xs font-bold text-app-dark/60 uppercase tracking-wider">
                Range
              </span>
            </div>
            <div className="flex items-center gap-4 sm:gap-2 flex-1 justify-center">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={tempMin}
                onChange={handleRangeInput(setTempMin)}
                className="w-24 sm:w-20 px-2 py-2 bg-app-primary-light border-2 border-transparent rounded-2xl text-center text-sm font-bold text-app-primary focus:outline-none focus:border-app-primary transition-all"
              />
              <span className="text-app-dark/30 text-xs font-bold">to</span>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={tempMax}
                onChange={handleRangeInput(setTempMax)}
                className="w-24 sm:w-20 px-2 py-2 bg-app-primary-light border-2 border-transparent rounded-2xl text-center text-sm font-bold text-app-primary focus:outline-none focus:border-app-primary transition-all"
              />
            </div>
            <button
              onClick={handleUpdateRange}
              className="w-full sm:w-auto px-8 sm:px-5 py-3 sm:py-2.5 bg-app-dark text-white rounded-full text-xs font-bold hover:scale-105 active:scale-95 transition-all shadow-md"
            >
              Update
            </button>
          </div>
          {(minRange !== Number(tempMin) || maxRange !== Number(tempMax)) && (
            <p className="text-[10px] text-app-primary mt-2 font-bold text-center animate-bounce">
              Don't forget to update!
            </p>
          )}
        </div>

        {/* Main Exercise Card */}
        <div className="bg-app-card rounded-[3rem] border-2 border-app-border shadow-xl shadow-app-primary/5 overflow-hidden relative">
          <div className="px-8 py-7 flex flex-col items-center relative z-10">
            <motion.div
              key={currentNumber}
              initial={{ scale: 0.8, opacity: 0, rotate: -5 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              className="text-8xl font-bold text-app-dark mb-8 drop-shadow-sm"
            >
              {currentNumber}
            </motion.div>

            <div className="w-full space-y-4">
              <div className="relative group">
                <input
                  ref={inputRef}
                  type="text"
                  value={userInput}
                  onChange={handleAnswerInput}
                  onKeyDown={handleKeyDown}
                  placeholder="Type in French..."
                  disabled={feedback !== null}
                  className={cn(
                    "w-full px-6 py-4 rounded-full border-4 transition-all duration-300 text-lg font-medium focus:outline-none placeholder:text-app-dark/20",
                    feedback === "correct"
                      ? "border-app-primary bg-app-primary-light text-app-primary"
                      : feedback === "incorrect"
                        ? "border-app-red bg-app-red/5 text-app-red"
                        : "border-app-border focus:border-app-primary bg-transparent",
                  )}
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
                  <motion.button
                    key="check"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={handleCheck}
                    disabled={!userInput}
                    className="w-full py-4 rounded-full font-bold text-lg bg-app-primary text-white hover:bg-app-primary/90 transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Check Answer
                  </motion.button>
                ) : (
                  <motion.button
                    key="next"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    onClick={generateRandomNumber}
                    className="w-full py-4 rounded-full bg-app-dark text-white hover:bg-app-dark/90 transition-all shadow-lg flex items-center justify-center gap-2 group"
                  >
                    <span className="font-bold">Next Question</span>
                    <ArrowRight
                      size={20}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Feedback Section - Speech Bubble Style */}
          <AnimatePresence>
            {feedback !== null && currentNumber !== null && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                className={cn(
                  "border-t-2 border-app-border p-6",
                  feedback === "correct"
                    ? "bg-app-primary-light"
                    : "bg-app-red/5",
                )}
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <div className="flex flex-col items-center text-center">
                      <div
                        className={cn(
                          "text-[10px] uppercase tracking-[0.2em] font-bold mb-1",
                          feedback === "correct"
                            ? "text-app-primary"
                            : "text-app-red",
                        )}
                      >
                        {feedback === "correct" ? "Perfect!" : "Correct Answer"}
                      </div>
                      <div className="text-2xl font-bold text-app-dark mb-1">
                        {getFrenchRepresentation(currentNumber).word}
                      </div>
                      <div className="text-sm font-medium text-app-dark/40 bg-app-card px-3 py-1 rounded-full border border-app-border inline-block">
                        {getFrenchRepresentation(currentNumber).ipa}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={playAudio}
                      disabled={isPlaying}
                      className="p-4 rounded-full bg-app-card border-2 border-app-border hover:border-app-primary hover:text-app-primary transition-all shadow-md group disabled:opacity-50"
                    >
                      {isPlaying ? (
                        <Loader2
                          size={24}
                          className="text-app-primary animate-spin"
                        />
                      ) : (
                        <Volume2
                          size={24}
                          className="text-app-dark group-hover:text-app-primary transition-colors"
                        />
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      {/* Independent Number Lookup */}
      <div className="mt-6 flex justify-center">
      <button
        onClick={() => {
          setLookupValue("");
          setLookupResult(null);
          setIsLookupOpen(true);
        }}
        aria-haspopup="dialog"
        className="bg-app-dark text-white flex items-center justify-center gap-2 px-6 py-3.5 rounded-full shadow-md hover:bg-app-dark/85 active:scale-95 transition-all focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-app-primary"
      >
        <Search size={16} />
        <span className="text-sm font-bold">Look up a number</span>
      </button>
      </div>
      </div>

      {/* Lookup Drawer / Dialog */}
      <AnimatePresence>
        {isLookupOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLookupOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={isDesktop ? { opacity: 0, scale: 0.95 } : { y: "100%" }}
              animate={isDesktop ? { opacity: 1, scale: 1 } : { y: 0 }}
              exit={isDesktop ? { opacity: 0, scale: 0.95 } : { y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className={cn(
                "fixed z-50 bg-app-card w-full p-6 shadow-2xl",
                isDesktop
                  ? "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-w-md rounded-3xl"
                  : "bottom-0 left-0 right-0 rounded-t-3xl pb-10 min-h-[30vh]",
              )}
            >
              {/* Panel Header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Search size={18} className="text-app-primary" />
                  <h2 className="text-lg font-bold text-app-dark">
                    Number → French
                  </h2>
                </div>
                <button
                  onClick={() => setIsLookupOpen(false)}
                  className="p-2 rounded-full hover:bg-app-border transition-colors"
                >
                  <X size={18} className="text-app-dark/50" />
                </button>
              </div>

              {/* Lookup Input */}
              <div className="space-y-4">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={lookupValue}
                  onChange={handleLookup}
                  placeholder="Enter any number..."
                  autoFocus
                  className="w-full px-4 py-3 rounded-xl border-2 border-app-border focus:border-app-primary focus:outline-none transition-all font-medium"
                />

                <AnimatePresence>
                  {lookupResult && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-app-primary-light/30 rounded-xl p-4 border border-app-primary/10">
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex-1">
                            <div className="text-xl font-bold text-app-dark mb-1 wrap-break-word">
                              {lookupResult.word}
                            </div>
                            <div className="text-xs font-medium text-app-dark/50 italic">
                              {lookupResult.ipa}
                            </div>
                          </div>
                          <button
                            onClick={playLookupAudio}
                            disabled={isPlaying}
                            className="p-3 rounded-full bg-white shadow-sm hover:text-app-primary transition-all disabled:opacity-50"
                          >
                            {isPlaying ? (
                              <Loader2
                                size={18}
                                className="text-app-primary animate-spin"
                              />
                            ) : (
                              <Volume2
                                size={18}
                                className="text-app-dark hover:text-app-primary"
                              />
                            )}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
