import styles from "./AverageStats.module.css";
import { useScheduleStore } from "@/store/scheduleStore";
import { getMonthProductionStats } from "@/lib/getMonthProductionStats";

type AverageStatsProps = {
  selectedDate: Date;
};

export default function AverageStats({
  selectedDate,
}: AverageStatsProps) {
  const shifts = useScheduleStore((state) => state.shifts);

  const monthStats =
  getMonthProductionStats(
    shifts,
    selectedDate
  );

const totalBoxes =
  monthStats.boxes;

const totalBlocks =
  monthStats.blocks;

const totalBaseHours =
  monthStats.baseHours;

const totalTobaccoHours =
  monthStats.tobaccoHours;

  const averageBoxes =
    totalBaseHours > 0
      ? Math.round((totalBoxes / totalBaseHours) * 11)
      : 0;

  const averageBlocks =
    totalTobaccoHours > 0
      ? Math.round((totalBlocks / totalTobaccoHours) * 11)
      : 0;

  return (
    <section className={styles.wrapper}>
      <h2 className={styles.title}>Средние показатели</h2>

      <div className={styles.grid}>
        <div className={styles.card}>
          <div className={styles.label}>
            Средняя по коробам
          </div>

          <div className={styles.value}>
            {averageBoxes.toLocaleString("ru-RU")}
          </div>

          <div className={styles.unit}>
            кор. / смена
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.label}>
            Средняя по блокам
          </div>

          <div className={styles.value}>
            {averageBlocks.toLocaleString("ru-RU")}
          </div>

          <div className={styles.unit}>
            блок. / смена
          </div>
        </div>
      </div>
    </section>
  );
}