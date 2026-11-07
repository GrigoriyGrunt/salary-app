import styles from "./AverageStats.module.css";
import { useScheduleStore } from "@/store/scheduleStore";
import { useUsersStore } from "@/store/usersStore";
import { getMonthProductionStats } from "@/lib/getMonthProductionStats";

type AverageStatsProps = {
  selectedDate: Date;
  watchPeriod?: {
    startDate: string;
    endDate: string;
  };
};

export default function AverageStats({
  selectedDate,
  watchPeriod,
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
  const monthStats = watchPeriod
    ? shifts.reduce(
        (total, shift) => {
          if (!shift.isWorked) return total;

          const shiftDate = new Date(shift.date);
          const nextDay = new Date(shiftDate);
          nextDay.setDate(nextDay.getDate() + 1);

          const watchStart = new Date(
            `${watchPeriod.startDate}T00:00:00`
          );
          const watchEnd = new Date(
            `${watchPeriod.endDate}T23:59:59`
          );

          const isFirstDayInside =
            shiftDate >= watchStart && shiftDate <= watchEnd;

          const isSecondDayInside =
            nextDay >= watchStart && nextDay <= watchEnd;

          if (shift.transitionDistribution) {
            const first = isFirstDayInside
              ? shift.transitionDistribution.firstMonth
              : undefined;

            const second = isSecondDayInside
              ? shift.transitionDistribution.secondMonth
              : undefined;

            return {
              boxes: total.boxes + (first?.boxes || 0) + (second?.boxes || 0),
              blocks: total.blocks + (first?.blocks || 0) + (second?.blocks || 0),
              pallets: total.pallets + (first?.pallets || 0) + (second?.pallets || 0),
              baseHours: total.baseHours + (first?.baseHours || 0) + (second?.baseHours || 0),
              tobaccoHours: total.tobaccoHours + (first?.tobaccoHours || 0) + (second?.tobaccoHours || 0),
            };
          }

          if (!isFirstDayInside) return total;

          return {
            boxes: total.boxes + (shift.boxes || 0),
            blocks: total.blocks + (shift.blocks || 0),
            pallets: total.pallets + (shift.pallets || 0),
            baseHours: total.baseHours + (shift.baseHours || 0),
            tobaccoHours: total.tobaccoHours + (shift.tobaccoHours || 0),
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
    : getMonthProductionStats(shifts, selectedDate);

  const totalBoxes = monthStats.boxes;
  const totalBlocks = monthStats.blocks;
  const totalPallets = monthStats.pallets;
  const totalBaseHours = monthStats.baseHours;
  const totalTobaccoHours = monthStats.tobaccoHours;
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