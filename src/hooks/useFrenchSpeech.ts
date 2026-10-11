import { useState } from "react";

export const useFrenchSpeech = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  const speak = (word: string, { rate = 1, resume = false } = {}) => {
    if (isPlaying) return;
    setIsPlaying(true);
    window.speechSynthesis.cancel();
    // Some browsers need a short delay after cancellation.
    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = "fr-FR";
      utterance.rate = rate;
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice =
        voices.find(
          (voice) =>
            voice.lang.startsWith("fr") &&
            (voice.name.includes("Female") ||
              voice.name.includes("Google") ||
              voice.name.includes("Natural")),
        ) || voices.find((voice) => voice.lang.startsWith("fr"));
      if (preferredVoice) utterance.voice = preferredVoice;
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
      if (resume && window.speechSynthesis.paused)
        window.speechSynthesis.resume();
    }, 50);
  };

  return { isPlaying, speak };
};
