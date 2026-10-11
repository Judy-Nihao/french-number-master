import { useFrenchSpeech } from "./useFrenchSpeech";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useReducedMotion } from "motion/react";
import confetti from "canvas-confetti";
import { getFrenchRepresentation } from "../utils/frenchConverter";
import type { PracticeMode, FrenchRepresentation } from "../types";

export const useNumberPractice = () => {
  const [minRange, setMinRange] = useState(0);
  const [maxRange, setMaxRange] = useState(20);
  const [tempMin, setTempMin] = useState<number | string>(0);
  const [tempMax, setTempMax] = useState<number | string>(20);
  const [currentNumber, setCurrentNumber] = useState<number | null>(null);
  const [userInput, setUserInput] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(
    null,
  );
  const { isPlaying, speak } = useFrenchSpeech();
  const [lookupValue, setLookupValue] = useState<string>("");
  const [lookupResult, setLookupResult] = useState<FrenchRepresentation | null>(
    null,
  );
  const [mode, setMode] = useState<PracticeMode>("test");
  const reducedMotion = useReducedMotion();
  const poolRef = useRef<number[]>([]);
  const lastNumberRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

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
    if (lookupResult?.ipa) speak(lookupResult.word);
  };

  const handleRangeInput =
    (setter: React.Dispatch<React.SetStateAction<number | string>>) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      if (val === "" || /^\d+$/.test(val)) {
        setter(val);
      }
    };

  const handleAnswerInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
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
        colors: ["primary", "primary-light", "accent"].map((color) =>
          getComputedStyle(document.documentElement)
            .getPropertyValue(`--color-app-${color}`)
            .trim(),
        ),
        disableForReducedMotion: true,
      });
    } else {
      setFeedback("incorrect");
    }
  };

  const playAudio = () => {
    if (currentNumber !== null) {
      speak(getFrenchRepresentation(currentNumber).word, {
        rate: 0.9,
        resume: true,
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
      e.preventDefault();
      if (feedback !== null) {
        generateRandomNumber();
      } else {
        handleCheck();
      }
    }
  };

  return {
    minRange,
    maxRange,
    tempMin,
    tempMax,
    currentNumber,
    userInput,
    feedback,
    isPlaying,
    lookupValue,
    lookupResult,
    mode,
    setMode,
    reducedMotion,
    inputRef,
    generateRandomNumber,
    handleLookup,
    playLookupAudio,
    handleRangeInput,
    setTempMin,
    setTempMax,
    handleAnswerInput,
    handleUpdateRange,
    handleCheck,
    playAudio,
    handleKeyDown,
  };
};

export type PracticeController = ReturnType<typeof useNumberPractice>;
