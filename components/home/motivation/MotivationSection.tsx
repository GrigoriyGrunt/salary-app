"use client";

import {
  useEffect,
  useState,
} from "react";
import { useFinanceStore } from "@/store/financeStore";
import styles from "./MotivationSection.module.css";
import MotivationCard from "./MotivationCard";
import MotivationSheet from "./MotivationSheet/MotivationSheet";

export default function MotivationSection() {
  const [isOpen, setIsOpen] = useState(false);
  const goal = useFinanceStore(
  (state) => state.goal
);

const setGoal = useFinanceStore(
  (state) => state.setGoal
);
const syncGoalMonth =
  useFinanceStore(
    (state) =>
      state.syncGoalMonth
  );

useEffect(() => {
  syncGoalMonth();
}, [syncGoalMonth]);
  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h3>Мотивация</h3>

        <button
  className={styles.link}
  onClick={() => setIsOpen(true)}
>
  Подробнее &gt;
</button>
      </div>

      <MotivationCard />

<MotivationSheet
  key={`${isOpen}-${goal}`}
  open={isOpen}
  goal={goal}
  onClose={() => setIsOpen(false)}
  onGoalChange={setGoal}
  onSave={() => setIsOpen(false)}
/>
    </section>
  );
}
