"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./MonthPicker.module.css";
const today = new Date();

const currentMonth = today.getMonth();
const currentYear = today.getFullYear();


type MonthPickerProps = {
  open: boolean;
  onClose: () => void;
  onSelectMonth: (month: number, year: number) => void;
};

export default function MonthPicker({
  open,
  onClose,
  onSelectMonth,
}: MonthPickerProps) {
      const [selectedYear, setSelectedYear] = useState(currentYear);

  const months = [
    "Январь",
    "Февраль",
    "Март",
    "Апрель",
    "Май",
    "Июнь",
    "Июль",
    "Август",
    "Сентябрь",
    "Октябрь",
    "Ноябрь",
    "Декабрь",
  ];
  if (!open) return null;
  if (typeof document === "undefined") return null;

  return createPortal(
    <>
      <div className={styles.backdrop} onClick={onClose} />

      <div className={styles.sheet}>
        <div className={styles.handle} />

        <h2 className={styles.title}>
  Выберите период
</h2>

<div className={styles.yearRow}>
  <button
  className={styles.yearArrow}
  onClick={() => setSelectedYear(selectedYear - 1)}
>
    <ChevronLeft size={20} />
  </button>

  <div className={styles.year}>
  {selectedYear}
</div>

  <button
  className={styles.yearArrow}
  disabled={selectedYear === currentYear}
  onClick={() => setSelectedYear(selectedYear + 1)}
>
    <ChevronRight size={20} />
  </button>
</div>

<div className={styles.months}>
  {months.map((month, index) => (
    <button
  key={month}
  className={`${styles.monthButton} ${
  selectedYear === currentYear && index === currentMonth
    ? styles.active
    : selectedYear === currentYear && index > currentMonth
    ? styles.disabled
    : ""
}`}
  disabled={
  selectedYear === currentYear &&
  index > currentMonth
}
  onClick={() => {
  onSelectMonth(index, selectedYear);
  onClose();
}}
>
      {month}
    </button>
  ))}
</div>
      </div>
    </>,
    document.body
  );
}