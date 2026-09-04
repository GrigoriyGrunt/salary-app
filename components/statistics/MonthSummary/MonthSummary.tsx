import styles from "./MonthSummary.module.css";
import { useScheduleStore } from "@/store/scheduleStore";
import { useState } from "react";
import ProductionDetailsModal from "@/components/statistics/ProductionDetailsModal/ProductionDetailsModal";
type MonthSummaryProps = {
  selectedDate: Date;
};

export default function MonthSummary({
  selectedDate,
}: MonthSummaryProps) {
  const shifts = useScheduleStore(
    (state) => state.shifts
  );
  const [modalType, setModalType] = useState<
  "boxes" | "blocks" | null
>(null);

  const monthShifts = shifts.filter((shift) => {
    const shiftDate = new Date(shift.date);

    return (
      shiftDate.getMonth() === selectedDate.getMonth() &&
      shiftDate.getFullYear() === selectedDate.getFullYear() &&
      shift.isWorked
    );
  });

  const totalBoxes = shifts.reduce(
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

      const isFirstMonth =
        isCurrentMonth;

      const isSecondMonth =
        nextDay.getMonth() ===
          selectedDate.getMonth() &&
        nextDay.getFullYear() ===
          selectedDate.getFullYear();

      if (isFirstMonth) {
        return (
          total +
          (shift.transitionDistribution
            .firstMonth.boxes || 0)
        );
      }

      if (isSecondMonth) {
        return (
          total +
          (shift.transitionDistribution
            .secondMonth.boxes || 0)
        );
      }

      return total;
    }

    return isCurrentMonth
      ? total + shift.boxes
      : total;
  },
  0
);

const totalBlocks = shifts.reduce(
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

      const isFirstMonth =
        isCurrentMonth;

      const isSecondMonth =
        nextDay.getMonth() ===
          selectedDate.getMonth() &&
        nextDay.getFullYear() ===
          selectedDate.getFullYear();

      if (isFirstMonth) {
        return (
          total +
          (shift.transitionDistribution
            .firstMonth.blocks || 0)
        );
      }

      if (isSecondMonth) {
        return (
          total +
          (shift.transitionDistribution
            .secondMonth.blocks || 0)
        );
      }

      return total;
    }

    return isCurrentMonth
      ? total + shift.blocks
      : total;
  },
  0
);
  const boxItems = monthShifts
  .filter((shift) => shift.boxes > 0)
  .map((shift) => ({
    date: new Date(shift.date).toLocaleDateString("ru-RU"),
    value: shift.boxes,
  }));

const blockItems = monthShifts
  .filter((shift) => shift.blocks > 0)
  .map((shift) => ({
    date: new Date(shift.date).toLocaleDateString("ru-RU"),
    value: shift.blocks,
  }));

  return (
    <section className={styles.wrapper}>
      <h2 className={styles.title}>Итоги за месяц</h2>

      <div className={styles.grid}>
        <button
  type="button"
  className={styles.card}
  onClick={() => setModalType("boxes")}
>
          <div className={styles.info}>
            <span className={styles.label}>
              Коробок собрано
            </span>

            <div className={styles.value}>
              {totalBoxes.toLocaleString("ru-RU")}
            </div>

            <span className={styles.unit}>
              шт.
            </span>
          </div>
        </button>

        <button
          type="button"
          className={styles.card}
          onClick={() => setModalType("blocks")}
          >
          <div className={styles.info}>
            <span className={styles.label}>
              Блоков (табак)
            </span>

            <div className={styles.value}>
              {totalBlocks.toLocaleString("ru-RU")}
            </div>

            <span className={styles.unit}>
              шт.
            </span>
          </div>
        </button>
      </div>
      {modalType === "boxes" && (
  <ProductionDetailsModal
    title="Собрано коробок"
    items={boxItems}
    total={totalBoxes}
    unit="шт."
    onClose={() => setModalType(null)}
  />
)}

{modalType === "blocks" && (
  <ProductionDetailsModal
    title="Собрано блоков"
    items={blockItems}
    total={totalBlocks}
    unit="шт."
    onClose={() => setModalType(null)}
  />
)}
    </section>
  );
}