"use client";

import { useState } from "react";
import BottomSheet from "@/components/BottomSheet/BottomSheet";
import styles from "./MotivationSheet.module.css";

type Props = {
  open: boolean;
  goal: number;
  isGuide?: boolean;
  onClose: () => void;
  onGoalChange: (value: number) => void;
  onSave: () => void;
};

export default function MotivationSheet({
  open,
  goal,
  isGuide = false,
  onClose,
  onGoalChange,
  onSave,
}: Props) {
  const [value, setValue] =
  useState(
    isGuide ? "" : goal.toString()
  );
const numberValue = Number(value);

const isValid =
  Number.isInteger(numberValue) &&
  numberValue >= 100;
  return (
    <BottomSheet
      isOpen={open}
      onClose={onClose}
    >
      <div className={styles.container}>
        <h2 className={styles.title}>
          Мотивация
        </h2>

        <div className={styles.section}>
          <div className={styles.label}>
            Цель на месяц
          </div>

          <div className={styles.goalRow}>
            <input
              type="number"
              className={styles.input}
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
              }}
            />

            <button
  type="button"
  className={styles.save}
  disabled={!isValid}
  onClick={() => {
    if (!isValid) {
      return;
    }

    onGoalChange(numberValue);
    onSave();
  }}
>
  Сохранить
</button>
          </div>

          <div className={styles.caption}>
            коробок за смену
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.label}>
            Основа
          </div>

          <div className={styles.row}>
            <span>до 1200</span>
            <span>2,70 ₽/кор</span>
          </div>

          <div className={styles.row}>
            <span>1200–1799</span>
            <span>3,60 ₽/кор</span>
          </div>

          <div className={styles.row}>
            <span>1800+</span>
            <span>4,00 ₽/кор</span>
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.label}>
            Табак
          </div>

          <div className={styles.row}>
            <span>до 2200</span>
            <span>0,60 ₽/блок</span>
          </div>

          <div className={styles.row}>
            <span>2200–3199</span>
            <span>0,70 ₽/блок</span>
          </div>

          <div className={styles.row}>
            <span>3200–3999</span>
            <span>0,80 ₽/блок</span>
          </div>

          <div className={styles.row}>
            <span>4000+</span>
            <span>1,00 ₽/блок</span>
          </div>
        </div>
      </div>
    </BottomSheet>
  );
}