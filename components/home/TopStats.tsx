"use client";
import Link from "next/link";
import styles from "./TopStats.module.css";
import Image from "next/image";
import { useScheduleStore } from "@/store/scheduleStore";
import { getMonthProductionStats } from "@/lib/getMonthProductionStats";
import { useUsersStore } from "@/store/usersStore";
export default function TopStats() {
  const shifts = useScheduleStore(
    (state) => state.shifts
  );
  const currentUser = useUsersStore(
  (state) => state.currentUser
);

const isTobaccoPicker =
  currentUser?.position === "Комплектовщик табака";

const isStacker =
  currentUser?.position ===
  "Штабелер (водитель погрузчика)";
const isStorekeeper =
  currentUser?.position === "Кладовщик";  

  const today = new Date();
  const currentMonthName = [
    "январе",
    "феврале",
    "марте",
    "апреле",
    "мае",
    "июне",
    "июле",
    "августе",
    "сентябре",
    "октябре",
    "ноябре",
    "декабре",
  ][today.getMonth()];
const toDateOnly = (value: Date | string) => {
  const date =
    value instanceof Date
      ? new Date(value)
      : new Date(`${String(value).split("T")[0]}T00:00:00`);

  date.setHours(0, 0, 0, 0);
  return date;
};
 const scheduleChanges = currentUser?.scheduleChanges ?? [];

const todayDate = new Date(today);
todayDate.setHours(0, 0, 0, 0);

const activeScheduleChange = [...scheduleChanges]
  .filter((change) => {
    const changeDate = toDateOnly(change.changeDate);
    return changeDate <= todayDate;
  })
  .sort(
    (a, b) =>
      toDateOnly(b.changeDate).getTime() -
      toDateOnly(a.changeDate).getTime()
  )[0];

const activeSchedule =
  activeScheduleChange?.schedule ?? currentUser?.schedule;

const isWatchSchedule = activeSchedule === "15/15 вахта";

const watchStartValue = activeScheduleChange
  ? activeScheduleChange.firstShiftDate
  : currentUser?.firstShiftDate;

const watchEndValue = activeScheduleChange
  ? activeScheduleChange.secondShiftDate
  : currentUser?.secondShiftDate;

const watchStart = watchStartValue
  ? toDateOnly(watchStartValue)
  : null;

const watchEnd = watchEndValue
  ? toDateOnly(watchEndValue)
  : null;

const hasCurrentWatchPeriod =
  isWatchSchedule &&
  watchStart !== null &&
  watchEnd !== null &&
  todayDate >= watchStart &&
  todayDate <= watchEnd;

const currentPeriodShifts = shifts.filter((shift) => {
  const shiftDate = toDateOnly(shift.date);

  if (isWatchSchedule) {
    return (
      hasCurrentWatchPeriod &&
      shiftDate >= watchStart! &&
      shiftDate <= watchEnd!
    );
  }

  return (
    shiftDate.getFullYear() === today.getFullYear() &&
    shiftDate.getMonth() === today.getMonth()
  );
});

const mainShifts = currentPeriodShifts.filter(
  (shift) => shift.workType === "main"
).length;

const overtimeShifts = currentPeriodShifts.filter(
  (shift) => shift.workType === "overtime"
).length;

const extraShifts = currentPeriodShifts.filter(
  (shift) => shift.workType === "extra"
).length;

const totalShifts =
  mainShifts + overtimeShifts + extraShifts;

const monthStats = isWatchSchedule
  ? hasCurrentWatchPeriod
    ? currentPeriodShifts.reduce(
        (total, shift) => {
          if (!shift.isWorked) return total;

          const distribution = shift.transitionDistribution;

          return {
            boxes: total.boxes + (
              distribution
                ? distribution.firstMonth.boxes + distribution.secondMonth.boxes
                : shift.boxes
            ),
            blocks: total.blocks + (
              distribution
                ? distribution.firstMonth.blocks + distribution.secondMonth.blocks
                : shift.blocks
            ),
            pallets: total.pallets + (
              distribution
                ? distribution.firstMonth.pallets + distribution.secondMonth.pallets
                : shift.pallets
            ),
            baseHours: total.baseHours + (
              distribution
                ? distribution.firstMonth.baseHours + distribution.secondMonth.baseHours
                : shift.baseHours
            ),
            tobaccoHours: total.tobaccoHours + (
              distribution
                ? distribution.firstMonth.tobaccoHours + distribution.secondMonth.tobaccoHours
                : shift.tobaccoHours
            ),
          };
        },
        {
          boxes: 0,
          blocks: 0,
          pallets: 0,
          baseHours: 0,
          tobaccoHours: 0,
        }
      )
    : {
        boxes: 0,
        blocks: 0,
        pallets: 0,
        baseHours: 0,
        tobaccoHours: 0,
      }
  : getMonthProductionStats(shifts, today);

const totalBoxes = monthStats.boxes;
const totalBaseHours = monthStats.baseHours;

const averageBoxes =
  totalBaseHours > 0
    ? Math.round((totalBoxes / totalBaseHours) * 11)
    : 0;

const totalBlocks = monthStats.blocks;
const totalTobaccoHours = monthStats.tobaccoHours;

const averageBlocks =
  totalTobaccoHours > 0
    ? Math.round((totalBlocks / totalTobaccoHours) * 11)
    : 0;

const totalPallets = monthStats.pallets;

const averagePallets =
  totalBaseHours > 0
    ? Math.round((totalPallets / totalBaseHours) * 11)
    : 0;
  return (
    <section className={styles.wrapper}>
      <Link href="/schedule" className={styles.card}>
        <div className={styles.header}>
  <div className={styles.icon}>
    <Image
      src="/images/icons/calendar.png"
      alt="Смены"
      width={36}
      height={36}
    />
  </div>

  <div>
    <div className={styles.title}>
      {isWatchSchedule ? "Смен в вахте" : `Смен в ${currentMonthName}`}
    </div>

    <div className={styles.value}>
  {totalShifts} <span>смен</span>
</div>
  </div>
</div>

<div className={styles.info}>
  <div>
    <span className={styles.label}>
      <span className={styles.dot}></span>
      Основные
    </span>

    <strong>{mainShifts}</strong>
  </div>

<div>
  <span className={styles.label}>
    <span className={styles.dot}></span>
    Подработки
  </span>

  <strong>{extraShifts}</strong>
</div>

<div>
  <span className={styles.label}>
    <span className={styles.dot}></span>
    Отработки
  </span>

  <strong>{overtimeShifts}</strong>
</div>
</div>
      </Link>

      <Link href="/statistics" className={styles.card}>
        <div className={styles.header}>
  <div className={styles.icon}>
    <Image
      src="/images/icons/boxes.png"
      alt="Коробки"
      width={36}
      height={36}
    />
  </div>

  <div className={styles.title}>
  {isStorekeeper
    ? "Покоробочная приемка"
    : isStacker
      ? "Паллет обработано"
      : isTobaccoPicker
        ? "Блоков собрано"
        : "Коробок собрано"}
</div>
</div>

<div className={styles.valueCenter}>
  {(isStorekeeper
    ? totalBoxes
    : isStacker
      ? totalPallets
      : isTobaccoPicker
        ? totalBlocks
        : totalBoxes
  ).toLocaleString("ru-RU")}
</div>

<div className={styles.small}>
  {isWatchSchedule ? "в текущей вахте" : "в текущем месяце"}
</div>
      </Link>

      <Link href="/statistics" className={styles.card}>
        <div className={styles.header}>
  <div className={styles.icon}>
    <Image
      src="/images/icons/average-pick.png"
      alt="Средняя уделка"
      width={36}
      height={36}
    />
  </div>

  <div className={styles.title}>
  {isStorekeeper
    ? "Палеты приемки/отгрузки"
    : "Средняя уделка"}
</div>
</div>

<div className={styles.valueCenter}>
  {(isStorekeeper
    ? totalPallets
    : isStacker
      ? averagePallets
      : isTobaccoPicker
        ? averageBlocks
        : averageBoxes
  ).toLocaleString("ru-RU")}
</div>

<div className={styles.small}>
  {isStorekeeper
    ? isWatchSchedule ? "в текущей вахте" : "в текущем месяце"
    : isStacker
      ? "паллет в смену"
      : isTobaccoPicker
        ? "блоков в смену"
        : "коробок в смену"}
</div>
      </Link>
    </section>
  );
}
