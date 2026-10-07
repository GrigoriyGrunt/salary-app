import styles from "./AverageStats.module.css";
import { useScheduleStore } from "@/store/scheduleStore";
import { useUsersStore } from "@/store/usersStore";
import { getMonthProductionStats } from "@/lib/getMonthProductionStats";

type AverageStatsProps = {
  selectedDate: Date;
};

export default function AverageStats({
  selectedDate,
}: AverageStatsProps) {
  const shifts = useScheduleStore((state) => state.shifts);
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
  const monthStats =
  getMonthProductionStats(
    shifts,
    selectedDate
  );

const totalBoxes =
  monthStats.boxes;

const totalBlocks =
  monthStats.blocks;

const totalPallets =
  monthStats.pallets;

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
    ? Math.round(
        (totalBlocks / totalTobaccoHours) * 11
      )
    : 0;
  const averagePallets =
  totalBaseHours > 0
    ? Math.round(
        (totalPallets / totalBaseHours) * 11
      )
    : 0;

  return isStorekeeper ? null : (
  <section className={styles.wrapper}>
    <h2 className={styles.title}>Средние показатели</h2>

                  <div
        className={`${styles.grid} ${
          isTobaccoPicker || isStacker
            ? styles.tobaccoGrid
            : ""
        }`}
      >
        {isStacker ? (
          <div className={styles.card}>
            <div className={styles.label}>
              Средняя по паллетам
            </div>

            <div className={styles.value}>
              {averagePallets.toLocaleString("ru-RU")}
            </div>

            <div className={styles.unit}>
              пал. / смена
            </div>
          </div>
        ) : (
          <>
            {!isTobaccoPicker && (
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
            )}

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
          </>
        )}
      </div>
    </section>
  );
}