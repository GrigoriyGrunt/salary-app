"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { useShiftEditor } from "@/components/common/ShiftEditorProvider/ShiftEditorProvider";
import { useScheduleStore } from "@/store/scheduleStore";
import { useUsersStore } from "@/store/usersStore";
import styles from "./DailyStatistics.module.css";
import DayDetailsModal, {
  getDayEarnings,
} from "../DayDetailsModal/DayDetailsModal";

function getMonday(date: Date) {
  const result = new Date(date);

  const day = result.getDay();
  const diff = day === 0 ? -6 : 1 - day;

  result.setDate(result.getDate() + diff);
  result.setHours(0, 0, 0, 0);

  return result;
}

function isSameDay(date1: Date, date2: Date) {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
}

type DailyStatisticsProps = {
  selectedDate: Date;
  onChange: (date: Date) => void;
  title?: string;
  mode?: "statistics" | "money";
};

export default function DailyStatistics({
  selectedDate,
  onChange,
  title = "Статистика по дням",
  mode = "statistics",
}: DailyStatisticsProps) {
  const { openShiftEditor } = useShiftEditor();

  const shifts = useScheduleStore(
    (state) => state.shifts
  );
  const currentUser = useUsersStore(
  (state) => state.currentUser
);
  const originalMainShiftsByMonth =
  useScheduleStore(
    (state) =>
      state.originalMainShiftsByMonth
  );

  const [selectedDay, setSelectedDay] =
    useState<Date>(selectedDate);

  const [showDetails, setShowDetails] =
    useState(false);

  const daysRef = useRef<HTMLDivElement>(null);

  const today = new Date();

today.setHours(0, 0, 0, 0);

  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth();

const weekDays = [
  "Вс",
  "Пн",
  "Вт",
  "Ср",
  "Чт",
  "Пт",
  "Сб",
];

const monthStart = new Date(
  selectedDate.getFullYear(),
  selectedDate.getMonth(),
  1
);

const daysInMonth = new Date(
  selectedDate.getFullYear(),
  selectedDate.getMonth() + 1,
  0
).getDate();

const days = Array.from(
  { length: daysInMonth },
  (_, index) => {
    const date = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      index + 1
    );

    const shift = shifts.find((item) =>
      isSameDay(
        new Date(item.date),
        date
      )
    );

    const boxes =
      shift && shift.boxes > 0
        ? shift.boxes
        : null;

    const blocks =
      shift && shift.blocks > 0
        ? shift.blocks
        : null;

    const workZone = shift?.workZone;

    const isMentor =
      shift?.mentor === true;

    const hasWorkingShift =
      shift?.type === "day" ||
      shift?.type === "night";

    const dayEarnings =
  shift?.isWorked
    ? getDayEarnings(
        shift,
        date,
        shifts,
        originalMainShiftsByMonth,
        currentUser
      )
    : null;

    return {
      date,
      day: date.getDate(),
      week: weekDays[date.getDay()],

      shift,

      boxes,
      blocks,
      dayEarnings,
      workZone,
      isMentor,

      hasWorkingShift,

      active: isSameDay(
        date,
        selectedDay
      ),
    };
  }
);

  useEffect(() => {
    const daysElement = daysRef.current;

    const isCurrentMonth =
      selectedDate.getFullYear() === todayYear &&
      selectedDate.getMonth() === todayMonth;

    if (!daysElement || !isCurrentMonth) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      const todayElement = daysElement.querySelector<HTMLElement>(
        '[data-today="true"]'
      );

      if (!todayElement) {
        return;
      }

      daysElement.scrollLeft = Math.max(
        0,
        todayElement.offsetLeft -
          (daysElement.clientWidth - todayElement.offsetWidth) / 2
      );
    });

    return () => window.cancelAnimationFrame(frame);
  }, [selectedDate, todayYear, todayMonth]);

  const selectedShift = shifts.find((shift) =>
    isSameDay(
      new Date(shift.date),
      selectedDay
    )
  );

  return (
    <section className={styles.wrapper}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          {title}
        </h2>
      </div>

      <div className={styles.days} ref={daysRef}>
        {days.map((item) => (
          <div
            key={item.date.toISOString()}
            data-today={isSameDay(item.date, today)}
            className={`${styles.day} ${
              item.active
                ? styles.active
                : ""
            }`}
            onClick={() =>
              setSelectedDay(item.date)
            }
          >
            <span className={styles.number}>
              {item.day}
            </span>

            <span className={styles.week}>
              {item.week}
            </span>

            <span className={styles.boxes}>
  {mode === "statistics" ? (
  !item.hasWorkingShift ? (
    "—"
  ) : !item.shift?.isWorked ? (
    "н/д"
  ) : item.isMentor ? (
    "Наст."
  ) : item.workZone === "warehouse" ? (
    "РПС"
  ) : item.workZone === "tobacco" ? (
    item.blocks !== null ? (
      <>
        {item.blocks}
        <span className={styles.unit}>
          {" "}блок
        </span>
      </>
    ) : (
      "—"
    )
  ) : item.boxes !== null ? (
    <>
      {item.boxes}
      <span className={styles.unit}>
        {" "}кор
      </span>
    </>
  ) : (
    "—"
  )
  ) : item.dayEarnings !== null ? (
  `${Math.round(
    item.dayEarnings
  ).toLocaleString("ru-RU")} ₽`
) : item.hasWorkingShift ? (
  "н/д"
) : (
  "—"
)}
</span>
          </div>
        ))}
      </div>

      <button
        className={styles.details}
        onClick={() =>
          setShowDetails(true)
        }
      >
        <span>
          Посмотреть день в деталях
        </span>

        <ChevronRight size={18} />
      </button>

      <DayDetailsModal
        open={showDetails}
        selectedDate={selectedDay}
        shift={selectedShift}
        onClose={() =>
          setShowDetails(false)
        }
        onEdit={() => {
          setShowDetails(false);
          openShiftEditor(selectedDay);
        }}
      />
    </section>
  );
}
