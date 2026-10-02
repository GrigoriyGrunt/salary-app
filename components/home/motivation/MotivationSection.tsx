"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import { useFinanceStore } from "@/store/financeStore";
import { useUsersStore } from "@/store/usersStore";

import styles from "./MotivationSection.module.css";
import MotivationCard from "./MotivationCard";
import MotivationSheet from "./MotivationSheet/MotivationSheet";

export default function MotivationSection() {
  const [isOpen, setIsOpen] = useState(false);
    const [showGuide, setShowGuide] = useState(false);
  const [guideMessageTop, setGuideMessageTop] =
    useState(0);

  const sectionRef =
    useRef<HTMLElement>(null);

  const guideMessageRef =
    useRef<HTMLDivElement>(null);

  const goal = useFinanceStore(
    (state) => state.goal
  );

  const setGoal = useFinanceStore(
    (state) => state.setGoal
  );

  const syncGoalMonth =
    useFinanceStore(
      (state) => state.syncGoalMonth
    );

  const currentUser =
    useUsersStore(
      (state) => state.currentUser
    );

  useEffect(() => {
    syncGoalMonth();
  }, [syncGoalMonth]);

    useEffect(() => {
    if (
      typeof window === "undefined" ||
      !currentUser?.id
    ) {
      return;
    }

    window.history.scrollRestoration = "manual";

    const guideKey =
      `show-motivation-guide-${currentUser.id}`;

    const shouldShow =
      localStorage.getItem(guideKey) ===
      "true";

    if (!shouldShow) {
      return;
    }

    setShowGuide(true);

    window.scrollTo(0, 0);

    requestAnimationFrame(() => {
      sectionRef.current?.scrollIntoView({
        behavior: "auto",
        block: "center",
      });
    });
  }, [currentUser?.id]);

    useEffect(() => {
    if (!showGuide) {
      return;
    }

    const preventScroll = (event: Event) => {
      event.preventDefault();
    };

    const preventKeyboardScroll = (
      event: KeyboardEvent
    ) => {
      const keys = [
        "ArrowUp",
        "ArrowDown",
        "PageUp",
        "PageDown",
        "Home",
        "End",
        " ",
      ];

      if (keys.includes(event.key)) {
        event.preventDefault();
      }
    };

    document.addEventListener(
      "wheel",
      preventScroll,
      { passive: false }
    );

    document.addEventListener(
      "touchmove",
      preventScroll,
      { passive: false }
    );

    document.addEventListener(
      "keydown",
      preventKeyboardScroll
    );

    return () => {
      document.removeEventListener(
        "wheel",
        preventScroll
      );

      document.removeEventListener(
        "touchmove",
        preventScroll
      );

      document.removeEventListener(
        "keydown",
        preventKeyboardScroll
      );
    };
  }, [showGuide]);
  useEffect(() => {
    if (!showGuide) {
      return;
    }

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const header =
          sectionRef.current?.querySelector(
            `.${styles.header}`
          );

        const message =
          guideMessageRef.current;

        if (!header || !message) {
          return;
        }

        const headerRect =
          header.getBoundingClientRect();

        const messageRect =
          message.getBoundingClientRect();

        setGuideMessageTop(
          headerRect.top -
            messageRect.height -
            12
        );
      });
    });
  }, [showGuide]);
  const handleOpenMotivation = () => {
    setIsOpen(true);
  };

  const handleCloseMotivation = () => {
    if (!showGuide) {
      setIsOpen(false);
    }
  };

  const handleSave = () => {
    setIsOpen(false);

    if (
      showGuide &&
      currentUser?.id
    ) {
      localStorage.removeItem(
        `show-motivation-guide-${currentUser.id}`
      );

      setShowGuide(false);
    }
  };

  return (
    <>
      {showGuide && (
        <div
          className={styles.guideOverlay}
        >
                    <div
            ref={guideMessageRef}
            className={styles.guideMessage}
            style={{
              top: `${guideMessageTop}px`,
            }}
          >
            Установите мотивацию на месяц,
            чтобы приложение могло
            рассчитать ваш прогноз
            заработка.
          </div>
        </div>
      )}

      <section
        ref={sectionRef}
        className={`${styles.section} ${
          showGuide
            ? styles.guideSection
            : ""
        }`}
      >
        <div className={styles.header}>
          <h3>Мотивация</h3>

          <button
            className={styles.link}
            onClick={
              handleOpenMotivation
            }
          >
            Подробнее &gt;
          </button>
        </div>

        <MotivationCard />

        <MotivationSheet
          key={`${isOpen}-${goal}`}
          open={isOpen}
          goal={showGuide ? 0 : goal}
          isGuide={showGuide}
          onClose={
            handleCloseMotivation
          }
          onGoalChange={setGoal}
          onSave={handleSave}
        />
      </section>
    </>
  );
}