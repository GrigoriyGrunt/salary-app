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

  const sectionRef =
    useRef<HTMLElement>(null);

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

    const guideKey =
      `show-motivation-guide-${currentUser.id}`;

    const shouldShow =
      localStorage.getItem(guideKey) ===
      "true";

    if (!shouldShow) {
      return;
    }

    setShowGuide(true);

    requestAnimationFrame(() => {
      sectionRef.current?.scrollIntoView({
        behavior: "auto",
        block: "center",
      });
    });
  }, [currentUser?.id]);

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
            className={styles.guideMessage}
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