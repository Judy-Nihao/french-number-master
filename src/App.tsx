import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Volume2,
  CheckCircle2,
  XCircle,
  Settings2,
  ArrowRight,
  Loader2,
  Search,
} from "lucide-react";
import {
  motion,
  AnimatePresence,
  MotionConfig,
  useReducedMotion,
} from "motion/react";
import confetti from "canvas-confetti";
import { getFrenchRepresentation } from "./utils/frenchConverter";
import { ModeTabs, type PracticeMode } from "./components/ModeTabs";
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
  const [mode, setMode] = useState<PracticeMode>("test");
  const reducedMotion = useReducedMotion();
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
    if (!lookupResult?.ipa || isPlaying) return;
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
    if (currentNumber === null || !userInput.trim()) return;
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
        disableForReducedMotion: true,
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
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-app-bg flex flex-col items-center justify-center py-6 px-4 sm:py-12 sm:px-6 overflow-x-clip">
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
          <AnimatePresence initial={false}>
            {mode === "test" && (
              <motion.div
                className="overflow-hidden"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: reducedMotion ? 0 : 0.2 }}
              >
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
                        aria-label="Minimum practice number"
                        value={tempMin}
                        onChange={handleRangeInput(setTempMin)}
                        className="w-24 sm:w-20 px-2 py-2 bg-app-primary-light border-2 border-transparent rounded-2xl text-center text-sm font-bold text-app-primary focus:outline-none focus:border-app-primary transition-all"
                      />
                      <span className="text-app-dark/30 text-xs font-bold">
                        to
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        aria-label="Maximum practice number"
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
                  {(minRange !== Number(tempMin) ||
                    maxRange !== Number(tempMax)) && (
                    <p className="text-[10px] text-app-primary mt-2 font-bold text-center animate-bounce">
                      Don't forget to update!
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Exercise Card */}
          <motion.div
            layout="size"
            transition={{ duration: reducedMotion ? 0 : 0.28 }}
            className="bg-app-card rounded-[3rem] border-2 border-app-border shadow-xl shadow-app-primary/5 overflow-hidden relative"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={mode}
              layout="position"
                initial={{
                  opacity: 0,
                  x: reducedMotion ? 0 : mode === "lookup" ? 18 : -18,
                }}
                animate={{ opacity: 1, x: 0 }}
                exit={{
                  opacity: 0,
                  x: reducedMotion ? 0 : mode === "test" ? -18 : 18,
                }}
                transition={{
                  duration: reducedMotion ? 0.08 : 0.16,
                  ease: "easeOut",
                }}
              >
                {mode === "test" ? (
                  <div
                    id="test-panel"
                    role="tabpanel"
                    aria-labelledby="test-tab"
                    tabIndex={0}
                  >
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
                          <input
                            aria-label="French spelling"
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
                              <CheckCircle2
                                className="text-app-primary"
                                size={24}
                              />
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
                                  {feedback === "correct"
                                    ? "Perfect!"
                                    : "Correct Answer"}
                                </div>
                                <div className="text-2xl font-bold text-app-dark mb-1 wrap-break-word">
                                  {getFrenchRepresentation(currentNumber).word}
                                </div>
                                <div className="text-sm font-medium text-app-dark/40 bg-app-card px-3 py-1 rounded-full border border-app-border inline-block">
                                  {getFrenchRepresentation(currentNumber).ipa}
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-4">
                              <button
                                aria-label="Play answer pronunciation"
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
                ) : (
                  <div
                    id="lookup-panel"
                    role="tabpanel"
                    aria-labelledby="lookup-tab"
                    tabIndex={0}
                    className="px-8 py-7 min-h-72"
                  >
                    <div className="flex items-center gap-2 mb-6">
                      <Search size={20} className="text-app-primary" />
                      <h2 className="text-xl font-bold text-app-dark">
                        Number → French
                      </h2>
                    </div>
                    <label
                      htmlFor="lookup-number"
                      className="block text-sm font-medium text-app-dark mb-3"
                    >
                      Enter a number
                    </label>
                    <input
                      id="lookup-number"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={lookupValue}
                      onChange={handleLookup}
                      placeholder="Enter any number..."
                      className="w-full px-5 py-4 rounded-full border-4 border-app-border focus:border-app-primary focus:outline-none transition-colors font-medium"
                    />
                    {lookupResult && (
                      <div
                        className="mt-6 bg-app-primary-light/30 rounded-2xl p-4 border border-app-primary/10"
                        aria-live="polite"
                      >
                        <div className="flex justify-between items-start gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="text-xl font-bold text-app-dark mb-2 wrap-break-word">
                              {lookupResult.word}
                            </div>
                            {lookupResult.ipa && (
                              <div className="text-sm text-app-dark/70 wrap-break-word">
                                {lookupResult.ipa}
                              </div>
                            )}
                          </div>
                          {lookupResult.ipa && (
                            <button
                              onClick={playLookupAudio}
                              disabled={isPlaying}
                              aria-label="Play lookup pronunciation"
                              className="shrink-0 p-3 rounded-full bg-white border border-app-border hover:text-app-primary disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-app-primary"
                            >
                              {isPlaying ? (
                                <Loader2 size={20} className="animate-spin" />
                              ) : (
                                <Volume2 size={20} />
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>
          <ModeTabs mode={mode} onChange={setMode} />
        </div>
      </div>
    </MotionConfig>
  );
}
