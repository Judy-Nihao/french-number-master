import { useEffect, useRef } from "react";
import type { PracticeMode } from "../types";

const SETTLE_DELAY = 180;
const MIN_KEYBOARD_DROP = 150;
const CLOSE_THRESHOLD = 80;

/** Align the exercise once per detected keyboard opening, without taking over manual scrolling. */
export const useKeyboardViewport = (mode: PracticeMode, gap = 16) => {
  const pageRef = useRef<HTMLDivElement>(null);
  const alignmentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const viewport = window.visualViewport;
    const page = pageRef.current;
    if (!viewport || !page || !matchMedia("(any-pointer: coarse)").matches)
      return;

    let baselineHeight = viewport.height;
    let baselineWidth = viewport.width;
    let keyboardOpen = false;
    let aligned = false;
    let userScrolled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let blurTimer: ReturnType<typeof setTimeout> | undefined;

    const cancelPending = () => clearTimeout(timer);
    const eligibleField = () => {
      const field = document.activeElement;
      return (
        (field instanceof HTMLInputElement ||
          field instanceof HTMLTextAreaElement) &&
        !field.disabled &&
        !field.readOnly &&
        !!field.closest("#test-panel, #lookup-panel")
      );
    };
    const reset = () => {
      cancelPending();
      keyboardOpen = false;
      aligned = false;
      userScrolled = false;
      page.style.removeProperty("--keyboard-inset");
    };
    const sample = () => {
      // Pinch zoom also changes viewport height; never treat it as a keyboard opening.
      if (Math.abs(viewport.scale - 1) > 0.02) {
        cancelPending();
        return;
      }
      // Rotation and split-screen resizing establish a new baseline instead of scrolling.
      if (Math.abs(viewport.width - baselineWidth) > 32) {
        reset();
        baselineWidth = viewport.width;
        baselineHeight = viewport.height;
        return;
      }
      const drop = baselineHeight - viewport.height;
      if (!eligibleField() || drop < CLOSE_THRESHOLD) {
        reset();
        baselineHeight = Math.max(baselineHeight, viewport.height);
        return;
      }
      if (!keyboardOpen) {
        if (drop < Math.max(MIN_KEYBOARD_DROP, baselineHeight * 0.2)) return;
        keyboardOpen = true;
      }
      // Runtime viewport measurements provide temporary scroll room above the keyboard.
      page.style.setProperty("--keyboard-inset", `${Math.round(drop)}px`);
      if (aligned || userScrolled) return;
      cancelPending();
      timer = setTimeout(() => {
        if (
          !eligibleField() ||
          userScrolled ||
          Math.abs(viewport.scale - 1) > 0.02
        )
          return;
        const target = alignmentRef.current;
        if (!target) return;
        aligned = true;
        // offsetTop accounts for browser panning of the visual viewport within the layout viewport.
        const top =
          window.scrollY +
          target.getBoundingClientRect().top -
          viewport.offsetTop -
          gap;
        window.scrollTo({ top: Math.max(0, top), behavior: "instant" });
      }, SETTLE_DELAY);
    };
    const onBlur = () => {
      clearTimeout(blurTimer);
      blurTimer = setTimeout(sample, 0);
    };
    const onManualScroll = () => {
      if (!keyboardOpen) return;
      userScrolled = true;
      cancelPending();
    };
    const onOrientationChange = () => {
      reset();
      baselineHeight = viewport.height;
      baselineWidth = viewport.width;
    };

    document.addEventListener("focusin", sample);
    document.addEventListener("focusout", onBlur);
    document.addEventListener("touchmove", onManualScroll, { passive: true });
    document.addEventListener("wheel", onManualScroll, { passive: true });
    viewport.addEventListener("resize", sample);
    viewport.addEventListener("scroll", sample);
    window.addEventListener("orientationchange", onOrientationChange);

    return () => {
      reset();
      clearTimeout(blurTimer);
      document.removeEventListener("focusin", sample);
      document.removeEventListener("focusout", onBlur);
      document.removeEventListener("touchmove", onManualScroll);
      document.removeEventListener("wheel", onManualScroll);
      viewport.removeEventListener("resize", sample);
      viewport.removeEventListener("scroll", sample);
      window.removeEventListener("orientationchange", onOrientationChange);
    };
  }, [mode, gap]);

  return { pageRef, alignmentRef };
};
