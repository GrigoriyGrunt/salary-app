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

type WatchPeriod = {
  startDate: string;
  endDate: string;
};

type PeriodPickerProps = {
  selectedDate: Date;
  onChange: (date: Date) => void;
  watchPeriods?: WatchPeriod[];
  selectedWatchPeriodIndex?: number;
  onWatchPeriodChange?: (index: number) => void;
};

export default function PeriodPicker({
  selectedDate,
  onChange,
  watchPeriods,
  selectedWatchPeriodIndex,
  onWatchPeriodChange,
}: PeriodPickerProps) {
  const currentDate = new Date();
  const [pickerOpen, setPickerOpen] = useState(false);

  const watchMode =
    watchPeriods !== undefined &&
    selectedWatchPeriodIndex !== undefined &&
    onWatchPeriodChange !== undefined;

  const selectedMonth = new Date(
    selectedDate.getFullYear(),
    selectedDate.getMonth(),
    1
  );

  const isCurrentMonth =
    selectedMonth.getMonth() === currentDate.getMonth() &&
    selectedMonth.getFullYear() === currentDate.getFullYear();

  const monthName = selectedMonth.toLocaleString("ru-RU", {
    month: "long",
    year: "numeric",
  });

  const formatDate = (value: string) => {
    const date = new Date(`${value.slice(0, 10)}T00:00:00`);

    return date.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
    });
  };

  if (watchMode) {
    const period = watchPeriods[selectedWatchPeriodIndex];

    return (
      <div className={styles.wrapper}>
        <button
          className={styles.arrow}
          disabled={selectedWatchPeriodIndex <= 0}
          onClick={() =>
            onWatchPeriodChange(selectedWatchPeriodIndex - 1)
          }
        >
          <ChevronLeft size={20} />
        </button>

        <div className={styles.center}>
          <CalendarDays size={18} />

          <span className={styles.month}>
            {period
              ? `${formatDate(period.startDate)} — ${formatDate(period.endDate)}`
              : "Нет периодов"}
          </span>
        </div>

        <button
          className={styles.arrow}
          disabled={
            selectedWatchPeriodIndex >= watchPeriods.length - 1
          }
          onClick={() =>
            onWatchPeriodChange(selectedWatchPeriodIndex + 1)
          }
        >
          <ChevronRight size={20} />
        </button>
      </div>
    );
  }

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
          onChange(new Date(year, month, 1));
        }}
      />
    </div>
  );
}