"use client";
import Link from "next/link";
import styles from "./WeekSection.module.css";

import WeekDay from "./WeekDay";
import TodayCard from "./TodayCard";

import { useShiftEditor } from "@/components/common/ShiftEditorProvider/ShiftEditorProvider";
import { useScheduleStore } from "@/store/scheduleStore";

import {
  getStartOfWeek,
  addDays,
  getShortMonth,
  isSameDate,
} from "@/lib/dateUtils";

export default function WeekSection() {
  const { openTodayShiftEditor } = useShiftEditor();
  const shifts = useScheduleStore(
  (state) => state.shifts
);

const startOfWeek = getStartOfWeek(
  new Date()
);

const weekDays = Array.from(
  { length: 7 },
  (_, index) => {
    const date = addDays(
      startOfWeek,
      index
    );

    const shift = shifts.find((item) =>
      isSameDate(
        new Date(item.date),
        date
      )
    );

    return {
      date,
      shift,
    };
  }
);
  return (
    <section className={styles.section}>
      <div className={styles.header}>
  <div className={styles.title}>
  <h3>Текущая неделя</h3>
</div>

  <Link href="/schedule" className={styles.link}>
  Весь график &gt;
</Link>
</div>
      <div className={styles.weekdays}>
  <span>Пн</span>
  <span>Вт</span>
  <span>Ср</span>
  <span>Чт</span>
  <span>Пт</span>
  <span>Сб</span>
  <span>Вс</span>
</div>

      <div className={styles.days}>
        {weekDays.map(({ date, shift }) => (
  <WeekDay
  key={date.toISOString()}
  day=""
  date={date.getDate()}
  month={getShortMonth(date.getMonth())}
  shift={shift?.type}
  workType={shift?.workType}
  status={shift?.status}
  isWorked={shift?.isWorked}
/>
))}
</div>

      <TodayCard onOpenSheet={openTodayShiftEditor} />
    </section>
  );
}