"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import styles from "./DatePicker.module.css";

const MONTHS = [
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

const CURRENT_YEAR = new Date().getFullYear();

const YEARS = Array.from(
  { length: CURRENT_YEAR - 2015 + 1 },
  (_, index) => 2015 + index
).reverse();

const WEEK_DAYS = [
  "Пн",
  "Вт",
  "Ср",
  "Чт",
  "Пт",
  "Сб",
  "Вс",
];
type CalendarMode =
  | "hire"
  | "nextShift"
  | "calendar";

type CalendarProps = {
  value?: Date;
  onChange: (date: Date) => void;
  mode: CalendarMode;
  minDate?: Date;
};
export default function Calendar({
  value,
  onChange,
  mode,
  minDate,
}: CalendarProps) {
  const today = new Date();

  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [showMonths, setShowMonths] = useState(false);
const [showYears, setShowYears] = useState(false);
const [tempMonth, setTempMonth] = useState(month);
const [tempYear, setTempYear] = useState(year);
const [tempDay, setTempDay] = useState<number | null>(
  value?.getDate() ?? null
);

useEffect(() => {
  if (showMonths && monthListRef.current) {
    monthListRef.current.scrollTop =
  Math.max(0, month * 52 - 104);
  }
}, [showMonths, month]);

useEffect(() => {
  if (showYears && yearListRef.current) {
    const index = YEARS.findIndex(
      (item) => item === year
    );

    yearListRef.current.scrollTop =
  Math.max(0, index * 52 - 104);
  }
}, [showYears, year]);

const monthListRef = useRef<HTMLDivElement>(null);
const yearListRef = useRef<HTMLDivElement>(null);

  const days = useMemo(() => {
    const firstDay = new Date(year, month, 1);

    const start =
      (firstDay.getDay() + 6) % 7;

    const count = new Date(
      year,
      month + 1,
      0
    ).getDate();

    const result: (number | null)[] = [];

    for (let i = 0; i < start; i++) {
      result.push(null);
    }

    for (let i = 1; i <= count; i++) {
      result.push(i);
    }

    while (result.length < 42) {
      result.push(null);
    }

    return result;
  }, [month, year]);

  return (
    <>
      <div className={styles.header}>
       <button
  className={styles.navButton}
  onClick={() => {
  if (month === 0) {
  setMonth(11);
  setTempMonth(11);

  setYear((prev) => prev - 1);
  setTempYear(year - 1);
} else {
  setMonth((prev) => prev - 1);
  setTempMonth(month - 1);
}
}}
>
  ←
</button>

        <div

  className={styles.month}
  onClick={() => {
    setShowMonths(!showMonths);
    setShowYears(false);
  }}
>
  {MONTHS[month]}
</div>

<div
  className={styles.month}
  onClick={() => {
    setShowYears(!showYears);
    setShowMonths(false);
  }}
>
  {year}
</div>

        <button
  className={styles.navButton}
  onClick={() => {
  if (month === 11) {
  setMonth(0);
  setTempMonth(0);

  setYear((prev) => prev + 1);
  setTempYear(year + 1);
} else {
  setMonth((prev) => prev + 1);
  setTempMonth(month + 1);
}
}}
>
  →
</button>
      </div>
      {(showMonths || showYears) && (
  <div
    className={styles.dropdownOverlay}
    onClick={() => {
      setShowMonths(false);
      setShowYears(false);
    }}
  />
)}
{showMonths && (
  <>
    <div
      ref={monthListRef}
      className={styles.dropdown}
    >
      {MONTHS.map((item, index) => (
        <button
          key={item}
          className={
  tempMonth === index
    ? `${styles.dropdownItem} ${styles.dropdownItemActive}`
    : styles.dropdownItem
}
          onClick={() => {
            setTempMonth(index);
          }}
        >
          {item}
        </button>
      ))}
    </div>

    <button
      className={styles.confirmButton}
      onClick={() => {
        setMonth(tempMonth);
        setShowMonths(false);
      }}
    >
      Выбрать
    </button>
  </>
)}

{showYears && (
  <>
    <div
      ref={yearListRef}
      className={styles.dropdown}
    >
      {YEARS.map((item) => (
        <button
          key={item}
          className={
            tempYear === item
              ? `${styles.dropdownItem} ${styles.dropdownItemActive}`
              : styles.dropdownItem
          }
          onClick={() => {
            setTempYear(item);
          }}
        >
          {item}
        </button>
      ))}
    </div>

    <button
      className={styles.confirmButton}
      onClick={() => {
        setYear(tempYear);
        setShowYears(false);
      }}
    >
      Выбрать
    </button>
  </>
)}
      <div className={styles.weekdays}>
        {WEEK_DAYS.map((day) => (
          <span key={day}>
            {day}
          </span>
        ))}
      </div>

      <div className={styles.grid}>
  {days.map((day, index) => (
    <button
      key={index}
      className={
        day !== null && tempDay === day
          ? `${styles.day} ${styles.dayActive}`
          : styles.day
      }
     disabled={
  !day ||

  (
    mode === "hire" &&
    new Date(year, month, day) >
      new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      )
  ) ||

  (
    minDate &&
    new Date(year, month, day) < minDate
  )
}
      onClick={() => {
        if (day) {
          setTempDay(day);
        }
      }}
    >
      {day}
    </button>
  ))}
</div>

<button
  className={styles.confirmDateButton}
  disabled={tempDay === null}
  onClick={() => {
    if (tempDay === null) return;

    const selectedDate = new Date(
      tempYear,
      tempMonth,
      tempDay
    );

    onChange(selectedDate);
  }}
>
  ✓
</button>

</>
);
}
