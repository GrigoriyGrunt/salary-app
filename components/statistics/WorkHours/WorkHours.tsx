import styles from "./WorkHours.module.css";
import { useScheduleStore } from "@/store/scheduleStore";

type WorkHoursProps = {
  selectedDate: Date;
};

export default function WorkHours({
  selectedDate,
}: WorkHoursProps) {
  const shifts = useScheduleStore(
    (state) => state.shifts
  );

  const getMonthHours = (
  field:
    | "baseHours"
    | "nonProfileHours"
    | "tobaccoHours"
) => {
  return shifts.reduce((total, shift) => {
    if (!shift.isWorked) {
      return total;
    }

    const shiftDate = new Date(shift.date);

    const isCurrentMonth =
      shiftDate.getMonth() ===
        selectedDate.getMonth() &&
      shiftDate.getFullYear() ===
        selectedDate.getFullYear();

    if (shift.transitionDistribution) {
      const nextDay = new Date(shiftDate);

      nextDay.setDate(
        nextDay.getDate() + 1
      );

      const isSecondMonth =
        nextDay.getMonth() ===
          selectedDate.getMonth() &&
        nextDay.getFullYear() ===
          selectedDate.getFullYear();

      if (isCurrentMonth) {
        return (
          total +
          (shift.transitionDistribution
            .firstMonth[field] || 0)
        );
      }

      if (isSecondMonth) {
        return (
          total +
          (shift.transitionDistribution
            .secondMonth[field] || 0)
        );
      }

      return total;
    }

    return isCurrentMonth
      ? total + (shift[field] || 0)
      : total;
  }, 0);
};

const salaryHours = shifts.reduce(
  (total, shift) => {
    if (!shift.isWorked) {
      return total;
    }

    const shiftDate = new Date(shift.date);

    const isCurrentMonth =
      shiftDate.getMonth() ===
        selectedDate.getMonth() &&
      shiftDate.getFullYear() ===
        selectedDate.getFullYear();

    if (shift.transitionDistribution) {
      const nextDay = new Date(shiftDate);

      nextDay.setDate(
        nextDay.getDate() + 1
      );

      const isSecondMonth =
        nextDay.getMonth() ===
          selectedDate.getMonth() &&
        nextDay.getFullYear() ===
          selectedDate.getFullYear();

      if (isCurrentMonth) {
        return total + 4;
      }

      if (isSecondMonth) {
        return total + 7;
      }

      return total;
    }

    return isCurrentMonth
      ? total + (shift.salaryHours || 0)
      : total;
  },
  0
);

const baseHours = getMonthHours(
  "baseHours"
);

const nonProfileHours = getMonthHours(
  "nonProfileHours"
);

const tobaccoHours = getMonthHours(
  "tobaccoHours"
);

  return (
    <section className={styles.card}>
      <h2 className={styles.title}>Отработанные часы</h2>

      <div className={styles.grid}>
        <div className={styles.item}>
          <div className={styles.label}>По окладу</div>
          <div className={styles.value}>{salaryHours} ч</div>
        </div>

        <div className={styles.item}>
          <div className={styles.label}>На основе</div>
          <div className={styles.value}>{baseHours} ч</div>
        </div>

        <div className={styles.item}>
          <div className={styles.label}>Непрофильные</div>
          <div className={styles.value}>
            {nonProfileHours} ч
          </div>
        </div>

        <div className={styles.item}>
          <div className={styles.label}>На табаке</div>
          <div className={styles.value}>{tobaccoHours} ч</div>
        </div>
      </div>
    </section>
  );
}