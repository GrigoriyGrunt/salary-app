import styles from "./MotivationCard.module.css";
import { useFinanceStore } from "@/store/financeStore";
import { useScheduleStore } from "@/store/scheduleStore";
import { getMonthProductionStats } from "@/lib/getMonthProductionStats";
export default function MotivationCard() {
  const goal = useFinanceStore((state) => state.goal);

  const shifts = useScheduleStore(
    (state) => state.shifts
  );

  const today = new Date();

  today.setHours(0, 0, 0, 0);

  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const monthShifts = shifts.filter((shift) => {
    const date = new Date(shift.date);

    return (
      date.getMonth() === currentMonth &&
      date.getFullYear() === currentYear
    );
  });

  const monthStats =
  getMonthProductionStats(
    shifts,
    today
  );

const totalBoxes =
  monthStats.boxes;

const totalBaseHours =
  monthStats.baseHours;

const averageBoxes =
  totalBaseHours > 0
    ? Math.round(
        (totalBoxes / totalBaseHours) * 11
      )
    : 0;

const boxPrice =
  averageBoxes < 1200
    ? 2.7
    : averageBoxes < 1800
      ? 3.6
      : 4;
const hasProductionData =
  averageBoxes > 0;
const nonProfileHours = monthShifts.reduce(
  (total, shift) =>
    total + (shift.nonProfileHours || 0),
  0
);

const futureShifts = monthShifts.filter(
  (shift) =>
    !shift.isWorked &&
    (
      shift.type === "day" ||
      shift.type === "night"
    )
);

const futureBaseHours =
  futureShifts.length * 11;

const goalPerHour =
  goal / 11;

const totalMonthBaseHours =
  totalBaseHours + futureBaseHours;

const targetTotalBoxes =
  totalMonthBaseHours * goalPerHour;

const remainingBoxes =
  Math.max(
    0,
    targetTotalBoxes - totalBoxes
  );

const requiredBoxes =
  futureBaseHours > 0
    ? Math.ceil(
        (remainingBoxes / futureBaseHours) * 11
      )
    : 0;

  return (
    <div className={styles.card}>

<div className={styles.stats}>
  <div className={styles.statCard}>
    <span className={styles.label}>Стоимость коробки</span>
    <strong className={styles.value}>
  {hasProductionData
    ? `${boxPrice
        .toFixed(2)
        .replace(".", ",")} ₽`
    : "—"}
</strong>
  </div>

  <div className={styles.statCard}>
  <span className={styles.label}>
    Цель средняя в месяц
  </span>

  <strong className={styles.value}>
  {goal}
</strong>
</div>

  <div className={styles.statCard}>
    <span className={styles.label}>Непрофильные часы за месяц</span>
    <strong className={styles.value}>
  {nonProfileHours} ч
</strong>
  </div>
</div>

<div className={styles.notice}>
  До конца месяца собирайте по{" "}
  <strong>
    {requiredBoxes.toLocaleString("ru-RU")} коробок
  </strong>{" "}
  за смену.
</div>

<p className={styles.info}>
  Непрофильные часы не влияют на среднюю уделку.
</p>
    </div>
  );
}