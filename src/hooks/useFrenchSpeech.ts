import { useCallback, useEffect, useRef, useState } from "react";

// Public asset URL only: no Supabase SDK or credentials are needed for playback.
export const NUMBER_AUDIO_BASE_URL =
  "https://jocvgblmasogslxohlem.supabase.co/storage/v1/object/public/number-audio/fr-FR/v1";

export const getNumberAudioUrl = (number: number) =>
  `${NUMBER_AUDIO_BASE_URL}/${number}.mp3`;

export const useFrenchSpeech = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const activeRef = useRef(false);
  const cleanupRef = useRef<(() => void) | null>(null);
  const requestRef = useRef(0);

  const cancel = useCallback(() => {
    requestRef.current += 1;
    cleanupRef.current?.();
    cleanupRef.current = null;
    activeRef.current = false;
    window.speechSynthesis?.cancel();
    setIsPlaying(false);
  }, []);

  useEffect(() => cancel, [cancel]);

  const speak = (
    number: number,
    word: string,
    { rate = 1, resume = false } = {},
  ) => {
    if (activeRef.current || !Number.isSafeInteger(number) || number < 0) return;
    cancel();
    const request = requestRef.current;
    const isCurrent = () => request === requestRef.current;
    activeRef.current = true;
    setIsPlaying(true);

    const finish = () => {
      if (!isCurrent()) return;
      cleanupRef.current?.();
      cleanupRef.current = null;
      activeRef.current = false;
      setIsPlaying(false);
    };

    const audio = new Audio(getNumberAudioUrl(number));
    audio.playbackRate = rate;
    audio.preservesPitch = true;
    let loadTimer: ReturnType<typeof setTimeout>;
    let fallbackStarted = false;
    const disposeAudio = () => {
      clearTimeout(loadTimer);
      audio.onended = null;
      audio.onerror = null;
      audio.onplaying = null;
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    };
    cleanupRef.current = disposeAudio;

    const fallback = () => {
      if (!isCurrent() || fallbackStarted) return;
      fallbackStarted = true;
      disposeAudio();
      const synth = window.speechSynthesis;
      if (!synth) {
        finish();
        return;
      }
      // Retain the cancellation delay needed by some browser speech engines.
      const timer = setTimeout(() => {
        if (!isCurrent()) return;
        const utterance = new SpeechSynthesisUtterance(word);
        utterance.lang = "fr-FR";
        utterance.rate = rate;
        const voices = synth.getVoices();
        const preferredVoice = voices.find(
          (voice) => voice.lang.startsWith("fr") &&
            (voice.name.includes("Female") || voice.name.includes("Google") ||
              voice.name.includes("Natural")),
        ) || voices.find((voice) => voice.lang.startsWith("fr"));
        if (preferredVoice) utterance.voice = preferredVoice;
        utterance.onend = finish;
        utterance.onerror = finish;
        cleanupRef.current = () => {
          utterance.onend = null;
          utterance.onerror = null;
        };
        try {
          synth.speak(utterance);
          if (resume && synth.paused) synth.resume();
        } catch {
          finish();
        }
      }, 50);
      cleanupRef.current = () => clearTimeout(timer);
    };

    audio.onended = finish;
    audio.onerror = fallback;
    audio.onplaying = () => clearTimeout(loadTimer);
    // Do not let an unavailable asset leave the pronunciation button waiting forever.
    loadTimer = setTimeout(fallback, 3000);
    try {
      void audio.play().catch((error: unknown) => {
        if (!isCurrent() || fallbackStarted) return;
        // A blocked user gesture should allow another tap, not start a second engine.
        if (error instanceof DOMException && error.name === "NotAllowedError") finish();
        else fallback();
      });
    } catch {
      fallback();
    }
  };

  return { isPlaying, speak, cancel };
};
