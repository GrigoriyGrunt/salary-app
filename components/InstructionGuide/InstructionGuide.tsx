
"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./InstructionGuide.module.css";

const STORY_DURATION = 10_000;
const STORIES = [
  "/images/guide-home.png",
  "/images/guide-week.png",
  "/images/guide-schedule.png",
  "/images/guide-shift-data.png",
  "/images/guide-month-summary.png",
  "/images/guide-statistics.png",
  "/images/guide-hours-mentor.png",
  "/images/guide-money.png",
  "/images/guide-bonus-deductions.png",
  "/images/guide-bonus-form.png",
  "/images/guide-profile.png",
  "/images/guide-report.png",
];

export default function InstructionGuide() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStory, setCurrentStory] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const elapsedRef = useRef(0);
  const startedAtRef = useRef(0);

  useEffect(() => {
    const openGuide = () => {
      elapsedRef.current = 0;
      setCurrentStory(0);
      setProgress(0);
      setIsPaused(false);
      setIsOpen(true);
    };

    window.addEventListener("open-instruction-guide", openGuide);

    return () => {
      window.removeEventListener("open-instruction-guide", openGuide);
    };
  }, []);

  useEffect(() => {
    if (!isOpen || isPaused) return;

    startedAtRef.current = Date.now();

    const interval = window.setInterval(() => {
      const elapsed =
        elapsedRef.current + Date.now() - startedAtRef.current;

      const nextProgress = Math.min(elapsed / STORY_DURATION, 1);
      setProgress(nextProgress);

      if (nextProgress >= 1) {
  window.clearInterval(interval);

  if (currentStory < STORIES.length - 1) {
    elapsedRef.current = 0;
    setProgress(0);
    setCurrentStory((story) => story + 1);
  } else {
    setIsOpen(false);
  }
}
    }, 50);

    return () => window.clearInterval(interval);
  }, [isOpen, isPaused, currentStory]);

    useEffect(() => {
    if (!isOpen) return;

    const nextStory = currentStory + 1;

    if (nextStory < STORIES.length) {
      const image = new Image();
      image.src = STORIES[nextStory];
    }
  }, [isOpen, currentStory]);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    window.addEventListener("keydown", handleEscape);

    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  const pauseStory = () => {
    if (!isOpen || isPaused) return;

    elapsedRef.current += Date.now() - startedAtRef.current;
    setIsPaused(true);
  };
    const pointerDownTimeRef = useRef(0);
  const wasLongPressRef = useRef(false);

  const handlePointerDown = () => {
    pointerDownTimeRef.current = Date.now();
    wasLongPressRef.current = false;
    pauseStory();
  };

  const handlePointerUp = () => {
    const pressDuration = Date.now() - pointerDownTimeRef.current;

    if (pressDuration >= 200) {
      wasLongPressRef.current = true;
    }

    resumeStory();
  };

  const handleStoryClick = (direction: -1 | 1) => {
    if (wasLongPressRef.current) {
      wasLongPressRef.current = false;
      return;
    }

    changeStory(direction);
  };

  const resumeStory = () => {
    if (!isPaused) return;

    startedAtRef.current = Date.now();
    setIsPaused(false);
  };

  const closeGuide = () => {
    setIsOpen(false);
    setIsPaused(false);
  };

  const changeStory = (direction: -1 | 1) => {
    const nextStory = currentStory + direction;

    if (nextStory < 0) return;

    if (nextStory >= STORIES.length) {
      closeGuide();
      return;
    }

    elapsedRef.current = 0;
    setProgress(0);
    setCurrentStory(nextStory);
    setIsPaused(false);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div
        style={{
          position: "absolute",
          top: 12,
          left: 12,
          right: 12,
          zIndex: 2,
          display: "flex",
          gap: 4,
        }}
      >
        {STORIES.map((story, index) => (
          <div
            key={story}
            style={{
              flex: 1,
              height: 3,
              borderRadius: 3,
              background: "rgba(255,255,255,0.4)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width:
                  index < currentStory
                    ? "100%"
                    : index === currentStory
                      ? `${progress * 100}%`
                      : "0%",
                height: "100%",
                background: "#ffffff",
              }}
            />
          </div>
        ))}
      </div>

      <button
        className={styles.close}
        type="button"
        onClick={closeGuide}
        aria-label="Закрыть инструкцию"
      >
        ×
      </button>

      <img
        className={styles.image}
        src={STORIES[currentStory]}
        alt="Инструкция: главный экран приложения"
                onContextMenu={(event) => event.preventDefault()}
        draggable={false}
        style={{
          userSelect: "none",
          WebkitUserSelect: "none",
          WebkitTouchCallout: "none",
          pointerEvents: "none",
        }}
      />

      <div
                onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={handlePointerUp}
        style={{
          position: "absolute",
          inset: "30px 0 0",
          display: "flex",
          zIndex: 1,
          touchAction: "none",
                    userSelect: "none",
          WebkitUserSelect: "none",
          WebkitTouchCallout: "none",
        }}
      >
        <div
                    onClick={() => handleStoryClick(-1)}
          style={{ width: "35%", height: "100%" }}
        />
        <div
                    onClick={() => handleStoryClick(1)}
          style={{ flex: 1, height: "100%" }}
        />
      </div>
    </div>
  );
}
