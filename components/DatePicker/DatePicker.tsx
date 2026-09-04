"use client";

import { useState } from "react";
import { format } from "date-fns";

import Calendar from "./Calendar";
import styles from "./DatePicker.module.css";

type DatePickerMode =
  | "hire"
  | "nextShift"
  | "calendar";

type DatePickerProps = {
  label: string;
  value?: Date;
  onChange: (date: Date) => void;
  mode: DatePickerMode;
  minDate?: Date;
};

export default function DatePicker({
  label,
  value,
  onChange,
  mode,
  minDate,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className={styles.wrapper}>
        <label className={styles.label}>
          {label}
        </label>

        <button
          type="button"
          className={styles.input}
          onClick={() => setOpen(true)}
        >
          {value
            ? format(value, "dd.MM.yyyy")
            : "Выберите дату"}
        </button>
      </div>

      {open && (
        <>
          <div
            className={styles.overlay}
            onClick={() => setOpen(false)}
          />

          <div className={styles.sheet}>
            <div className={styles.handle} />

            <Calendar
  value={value}
  onChange={(date) => {
    onChange(date);
    setOpen(false);
  }}
  mode={mode}
  minDate={minDate}
/>
          </div>
        </>
      )}
    </>
  );
}