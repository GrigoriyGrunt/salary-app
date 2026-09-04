import styles from "./TodayCard.module.css";
import { useScheduleStore } from "@/store/scheduleStore";
import { isSameDate } from "@/lib/dateUtils";

export default function TodayCard({
  onOpenSheet,
}: {
  onOpenSheet?: () => void;
}) {
  const shifts = useScheduleStore(
  (state) => state.shifts
);

const today = shifts.find((shift) =>
  isSameDate(new Date(shift.date), new Date())
);
  return (
    <div className={styles.card}>

      <div className={styles.content}>
        <span className={styles.date}>
  {`Сегодня, ${new Date().getDate()} ${new Date().toLocaleString(
    "ru-RU",
    { month: "long" }
  )}`}
</span>

<div className={styles.shiftRow}>
  <h3>
    {today?.status === "vacation"
      ? "Отпуск"
      : today?.status === "sick"
      ? "Больничный"
      : today?.status === "absence"
      ? "Прогул"
      : today?.status === "dayOff"
      ? "День отдыха"
      : today?.type === "day"
      ? `Дневная смена (${
          today.workType === "extra"
  ? "Подработка"
  : today.workType === "overtime"
  ? "Отработка"
  : "Основная"
        })`
      : today?.type === "night"
      ? `Ночная смена (${
          today.workType === "extra"
  ? "Подработка"
  : today.workType === "overtime"
  ? "Отработка"
  : "Основная"
        })`
      : "Выходной"}
  </h3>

  <p>
    {today?.type === "day"
      ? "08:00 — 20:00"
      : today?.type === "night"
      ? "20:00 — 08:00"
      : ""}
  </p>
</div>

<button
  className={styles.action}
  onClick={onOpenSheet}
>
  <span>Внести данные</span>
  <span>&gt;</span>
</button>
      </div>
    </div>
  );
}
