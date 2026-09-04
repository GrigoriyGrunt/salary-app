"use client";

import Image from "next/image";
import {
  useShiftEditor,
} from "@/components/common/ShiftEditorProvider/ShiftEditorProvider";
import styles from "./MonthCalendar.module.css";
import { useScheduleStore } from "@/store/scheduleStore";

type MonthCalendarProps = {
  currentDate: Date;
  onMonthChange: (date: Date) => void;
};

export default function MonthCalendar({
  currentDate,
  onMonthChange,
}: MonthCalendarProps) {
const { selectedDate, setSelectedDate } = useShiftEditor();
const shifts = useScheduleStore(
  (state) => state.shifts
);
function getShift(day: number) {
  return shifts.find((shift) => {
    const date = new Date(shift.date);

    return (
      date.getDate() === day &&
      date.getMonth() === currentDate.getMonth() &&
      date.getFullYear() === currentDate.getFullYear()
    );
  });
}
const monthNames = [
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

const month = monthNames[currentDate.getMonth()];
const year = currentDate.getFullYear();
const previousMonth = () => {
  onMonthChange(
    new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - 1,
      1
    )
  );
};
const nextMonth = () => {
  onMonthChange(
    new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      1
    )
  );
};
const firstDay = new Date(year, currentDate.getMonth(), 1);

let startDay = firstDay.getDay() - 1;
if (startDay < 0) startDay = 6;

const daysInMonth = new Date(
  year,
  currentDate.getMonth() + 1,
  0
).getDate();

const days = [];

for (let i = 0; i < startDay; i++) {
  days.push(null);
}

for (let i = 1; i <= daysInMonth; i++) {
  days.push(i);
}
  return (
    <div className={styles.calendar}>
  <div className={styles.header}>
  <button
  className={styles.monthButton}
  onClick={previousMonth}
>
  {"<"}
</button>

  <div className={styles.title}>
    {month} {year}
  </div>

  <button
  className={styles.monthButton}
  onClick={nextMonth}
>
  {">"}
</button>
</div>

  <div className={styles.weekdays}>
    <div className={styles.weekday}>Пн</div>
    <div className={styles.weekday}>Вт</div>
    <div className={styles.weekday}>Ср</div>
    <div className={styles.weekday}>Чт</div>
    <div className={styles.weekday}>Пт</div>
    <div className={styles.weekday}>Сб</div>
    <div className={styles.weekday}>Вс</div>
  </div>

  <div className={styles.grid}>
  {days.map((day, index) =>
    day === null ? (
      <div key={index} className={styles.emptyDay}></div>
    ) : (
      <div
  key={index}
  className={`${styles.day}
  ${
  getShift(day)?.isWorked
    ? styles.workedCard
    : getShift(day)?.type === "day"
    ? styles.dayCard
    : getShift(day)?.type === "night"
    ? styles.nightCard
    : styles.offCard
}
  ${
    selectedDate &&
    selectedDate.getDate() === day &&
    selectedDate.getMonth() === currentDate.getMonth() &&
    selectedDate.getFullYear() === currentDate.getFullYear()
      ? styles.selectedDay
      : ""
  }`}
  onClick={() => {
  const date = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    day
  );

  setSelectedDate(date);
}}
>
  <div className={styles.dayNumber}>{day}</div>

<div className={styles.dayShift}>
  {getShift(day)?.type === "day" && (
    <Image
      src={
  getShift(day)?.isWorked
    ? "/images/icons/grayday.png"
    : "/images/icons/day.png"
}
      alt="Дневная смена"
      width={16}
      height={16}
      className={styles.shiftIcon}
    />
  )}

  {getShift(day)?.type === "night" && (
  <Image
    src={
      getShift(day)?.isWorked
        ? "/images/icons/graynight.png"
        : "/images/icons/night.png"
    }
    alt="Ночная смена"
    width={16}
    height={16}
    className={styles.shiftIcon}
  />
)}

  {getShift(day)?.type === "off" &&
    getShift(day)?.workType === null &&
    "—"}

  {(getShift(day)?.workType === "do" ||
  getShift(day)?.workType === "absence" ||
  getShift(day)?.workType === "vacation" ||
  getShift(day)?.workType === "sick") && (
    <span className={styles.statusType}>
      {getShift(day)?.workType === "do"
        ? "ДО"
        : getShift(day)?.workType === "absence"
        ? "ПРГ"
        : getShift(day)?.workType === "vacation"
        ? "ОТП"
        : "БЛ"}
    </span>
)}
</div>

<div className={styles.shiftType}>
  {getShift(day)?.workType === "main"
    ? "ОСН"
    : getShift(day)?.workType === "extra"
  ? "ДОП"
  : getShift(day)?.workType === "overtime"
  ? "ОТР"
    : ""}
</div>
</div>
    )
  )}
</div>
</div>
  );
}
