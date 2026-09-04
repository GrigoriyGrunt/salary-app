"use client";

import { useState } from "react";
import MonthPicker from "../MonthPicker/MonthPicker";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  CalendarDays,
} from "lucide-react";
import styles from "./PeriodPicker.module.css";

type PeriodPickerProps = {
  selectedDate: Date;
  onChange: (date: Date) => void;
};

export default function PeriodPicker({
  selectedDate,
  onChange,
}: PeriodPickerProps) {
  const currentDate = new Date();

const selectedMonth = new Date(
  selectedDate.getFullYear(),
  selectedDate.getMonth(),
  1
);
  const [pickerOpen, setPickerOpen] = useState(false);

  const isCurrentMonth =
    selectedMonth.getMonth() === currentDate.getMonth() &&
    selectedMonth.getFullYear() === currentDate.getFullYear();

  const monthName = selectedMonth.toLocaleString("ru-RU", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className={styles.wrapper}>
      <button
        className={styles.arrow}
        onClick={() =>
          onChange(
            new Date(
              selectedMonth.getFullYear(),
              selectedMonth.getMonth() - 1,
              1
            )
          )
        }
      >
        <ChevronLeft size={20} />
      </button>

      <button
  className={styles.center}
  onClick={() => setPickerOpen(true)}
>
        <CalendarDays size={18} />

        <span className={styles.month}>
          {monthName.charAt(0).toUpperCase() + monthName.slice(1)}
        </span>

        <ChevronDown size={18} />
      </button>

      <button
        className={`${styles.arrow} ${
          isCurrentMonth ? styles.disabled : ""
        }`}
        disabled={isCurrentMonth}
        onClick={() =>
          onChange(
            new Date(
              selectedMonth.getFullYear(),
              selectedMonth.getMonth() + 1,
              1
            )
          )
        }
      >
        <ChevronRight size={20} />
      </button>
      <MonthPicker
  open={pickerOpen}
  onClose={() => setPickerOpen(false)}
  onSelectMonth={(month, year) => {
  onChange(
    new Date(
      year,
      month,
      1
    )
  );
}}
/>
    </div>
  );
}