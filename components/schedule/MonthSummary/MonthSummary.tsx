import styles from "./MonthSummary.module.css";
import { useScheduleStore } from "@/store/scheduleStore";

type MonthSummaryProps = {
  currentDate: Date;
};

export default function MonthSummary({
  currentDate,
}: MonthSummaryProps) {
  const shifts = useScheduleStore(
    (state) => state.shifts
  );

  const currentMonthShifts = shifts.filter((shift) => {
  const date = new Date(shift.date);

  return (
    date.getMonth() === currentDate.getMonth() &&
    date.getFullYear() === currentDate.getFullYear()
  );
});

  const isShiftWorked = (shift: typeof shifts[number]) => {
  return shift.isWorked === true;
};

  const mainWorked = currentMonthShifts.filter(
    (shift) =>
      shift.workType === "main" &&
      isShiftWorked(shift)
  ).length;

  const overtimeWorked = currentMonthShifts.filter(
  (shift) =>
    shift.workType === "overtime" &&
    isShiftWorked(shift)
).length;

const extraWorked = currentMonthShifts.filter(
  (shift) =>
    shift.workType === "extra" &&
    isShiftWorked(shift)
).length;

  const absences = currentMonthShifts.filter(
    (shift) => shift.status === "absence"
  ).length;

  const daysOff = currentMonthShifts.filter(
    (shift) => shift.status === "dayOff"
  ).length;

  const vacations = currentMonthShifts.filter(
    (shift) => shift.status === "vacation"
  ).length;

  const sickDays = currentMonthShifts.filter(
    (shift) => shift.status === "sick"
  ).length;

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>Смен отработано</h3>

      <div className={styles.row}>
        <span>Основные (ОСН)</span>
        <span>{mainWorked}</span>
      </div>

<div className={styles.row}>
  <span>Подработки (ДОП)</span>
  <span>{extraWorked}</span>
</div>

<div className={styles.row}>
  <span>Отработки (ОТР)</span>
  <span>{overtimeWorked}</span>
</div>

      <div className={styles.divider} />

      <div className={styles.row}>
        <span>Прогулы (ПРГ)</span>
        <span>{absences}</span>
      </div>

      <div className={styles.row}>
        <span>День отдыха (ДО)</span>
        <span>{daysOff}</span>
      </div>

      <div className={styles.row}>
        <span>Отпуск (ОТП)</span>
        <span>{vacations}</span>
      </div>

      <div className={styles.row}>
        <span>Больничный (БЛ)</span>
        <span>{sickDays}</span>
      </div>
    </div>
  );
}