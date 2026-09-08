"use client";
import Link from "next/link";
import styles from "./TopStats.module.css";
import Image from "next/image";
import { useScheduleStore } from "@/store/scheduleStore";
import { getMonthProductionStats } from "@/lib/getMonthProductionStats";
export default function TopStats() {
  const shifts = useScheduleStore(
    (state) => state.shifts
  );

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

  const currentMonthShifts = shifts.filter((shift) => {
    const shiftDate = new Date(shift.date);

    return (
      shiftDate.getFullYear() === today.getFullYear() &&
      shiftDate.getMonth() === today.getMonth()
    );
  });

  const mainShifts = currentMonthShifts.filter(
    (shift) => shift.workType === "main"
  ).length;

  const overtimeShifts = currentMonthShifts.filter(
    (shift) => shift.workType === "overtime"
  ).length;

  const extraShifts = currentMonthShifts.filter(
    (shift) => shift.workType === "extra"
  ).length;

  const totalShifts =
    mainShifts +
    overtimeShifts +
    extraShifts;
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
      Смен в {currentMonthName}
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
    Коробок собрано
  </div>
</div>

<div className={styles.valueCenter}>
  {totalBoxes.toLocaleString("ru-RU")}
</div>

<div className={styles.small}>
  в текущем месяце
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
    Средняя уделка
  </div>
</div>

<div className={styles.valueCenter}>
  {averageBoxes.toLocaleString("ru-RU")}
</div>

<div className={styles.small}>
  коробок в смену
</div>
      </Link>
    </section>
  );
}
