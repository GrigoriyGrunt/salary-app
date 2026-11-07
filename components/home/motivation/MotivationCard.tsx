import styles from "./MotivationCard.module.css";
import { useFinanceStore } from "@/store/financeStore";
import { useScheduleStore } from "@/store/scheduleStore";
import { getMonthProductionStats } from "@/lib/getMonthProductionStats";
import { calculateMonthlyReport } from "@/lib/report";
import { useUsersStore } from "@/store/usersStore";
import { getWarehouseConfig } from "@/lib/warehouses/config";
export default function MotivationCard() {
  const goal = useFinanceStore((state) => state.goal);
  const currentUser = useUsersStore(
  (state) => state.currentUser
);

const warehouseConfig = getWarehouseConfig(currentUser?.warehouse);
const tariffs = warehouseConfig?.tariffs;

const isTobaccoPicker =
  currentUser?.position === "Комплектовщик табака";

const isStacker =
  currentUser?.position === "Штабелер (водитель погрузчика)";

const isStorekeeper =
  currentUser?.position === "Кладовщик"; 

  const shifts = useScheduleStore(
    (state) => state.shifts
  );

  const originalMainShiftsByMonth = useScheduleStore(
  (state) => state.originalMainShiftsByMonth
);

const deductions = useFinanceStore(
  (state) => state.deductions
);

const premiums = useFinanceStore(
  (state) => state.premiums
);

const payments = useFinanceStore(
  (state) => state.payments
);

  const today = new Date();

  today.setHours(0, 0, 0, 0);

  const activeScheduleChange = (
    currentUser?.scheduleChanges ?? []
  )
    .filter((change) => {
      const date = new Date(change.changeDate);
      date.setHours(0, 0, 0, 0);
      return date <= today;
    })
    .sort(
      (a, b) =>
        new Date(a.changeDate).getTime() -
        new Date(b.changeDate).getTime()
    )
    .at(-1);

  const activeSchedule =
    activeScheduleChange?.schedule ?? currentUser?.schedule;

  const watchFirstDate =
    activeScheduleChange?.firstShiftDate ??
    currentUser?.firstShiftDate;

  const watchSecondDate =
    activeScheduleChange?.secondShiftDate ??
    currentUser?.secondShiftDate;

  const isWatchMotivation =
    currentUser?.position === "Комплектовщик основы" &&
    activeSchedule === "15/15 вахта";

  const watchStart = watchFirstDate
    ? new Date(watchFirstDate)
    : null;

  const watchEnd = watchSecondDate
    ? new Date(watchSecondDate)
    : null;

  watchStart?.setHours(0, 0, 0, 0);
  watchEnd?.setHours(0, 0, 0, 0);

  const isInsideWatchPeriod =
    isWatchMotivation &&
    watchStart !== null &&
    watchEnd !== null &&
    today >= watchStart &&
    today <= watchEnd;

    const periodShifts = isWatchMotivation
    ? isInsideWatchPeriod
      ? shifts.filter((shift) => {
          const date = new Date(shift.date);
          date.setHours(0, 0, 0, 0);

          return date >= watchStart! && date <= watchEnd!;
        })
      : []
    : shifts;

  const monthShifts = isWatchMotivation
    ? periodShifts
    : shifts.filter((shift) => {
        const date = new Date(shift.date);

        return (
          date.getMonth() === today.getMonth() &&
          date.getFullYear() === today.getFullYear()
        );
      });

  const monthStats = isWatchMotivation
    ? periodShifts.reduce(
        (total, shift) => {
          if (!shift.isWorked) return total;

          const shiftDate = new Date(shift.date);
          shiftDate.setHours(0, 0, 0, 0);

          const nextDay = new Date(shiftDate);
          nextDay.setDate(nextDay.getDate() + 1);

          const isFirstDayInside =
            isInsideWatchPeriod &&
            shiftDate >= watchStart! &&
            shiftDate <= watchEnd!;

          const isSecondDayInside =
            isInsideWatchPeriod &&
            nextDay >= watchStart! &&
            nextDay <= watchEnd!;

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
const boxPrice =
  tariffs?.boxes
    .filter((tier) => averageBoxes >= tier.minAverage)
    .at(-1)?.rate ?? 0;

const blockPrice =
  tariffs?.blocks
    .filter((tier) => averageBlocks >= tier.minAverage)
    .at(-1)?.rate ?? 0;

const palletPrice =
  tariffs?.pallets
    .filter((tier) => averagePallets >= tier.minAverage)
    .at(-1)?.rate ?? 0;

const hasProductionData =
  isStacker
    ? averagePallets > 0
    : isTobaccoPicker
      ? averageBlocks > 0
      : averageBoxes > 0;
const nonProfileHours = monthShifts.reduce(
  (total, shift) =>
    total + (shift.nonProfileHours || 0),
  0
);

const futureShifts = monthShifts.filter((shift) => {
  if (
    shift.isWorked ||
    (shift.type !== "day" && shift.type !== "night")
  ) {
    return false;
  }

  if (isWatchMotivation) {
    const shiftDate = new Date(shift.date);
    shiftDate.setHours(0, 0, 0, 0);

    return shiftDate >= today && shiftDate <= watchEnd!;
  }

  return true;
});

const futureBaseHours = futureShifts.length * 11;

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
const goalPerHourTobacco =
  goal / 11;

const totalMonthTobaccoHours =
  totalTobaccoHours + futureBaseHours;

const targetTotalBlocks =
  totalMonthTobaccoHours *
  goalPerHourTobacco;

const remainingBlocks =
  Math.max(
    0,
    targetTotalBlocks - totalBlocks
  );

const requiredBlocks =
  futureBaseHours > 0
    ? Math.ceil(
        (remainingBlocks / futureBaseHours) * 11
      )
    : 0;
const totalMonthPalletHours =
  totalBaseHours + futureBaseHours;

const targetTotalPallets =
  totalMonthPalletHours *
  (goal / 11);

const remainingPallets =
  Math.max(
    0,
    targetTotalPallets - totalPallets
  );

const requiredPallets =
  futureBaseHours > 0
    ? Math.ceil(
        (remainingPallets / futureBaseHours) * 11
      )
    : 0;

const storekeeperWorkedShifts =
  monthShifts.filter(
    (shift) =>
      shift.isWorked &&
      (
        shift.workType === "main" ||
        shift.workType === "overtime" ||
        shift.workType === "extra"
      ) &&
      (
        shift.type === "day" ||
        shift.type === "night"
      )
  ).length;

const storekeeperFutureShifts =
  monthShifts.filter(
    (shift) =>
      !shift.isWorked &&
      (
        shift.workType === "main" ||
        shift.workType === "overtime" ||
        shift.workType === "extra"
      ) &&
      (
        shift.type === "day" ||
        shift.type === "night"
      )
  ).length;

const storekeeperWorkedMainShifts =
  monthShifts.filter(
    (shift) =>
      shift.workType === "main" &&
      shift.isWorked
  ).length;

const storekeeperFutureMainShifts =
  monthShifts.filter(
    (shift) =>
      !shift.isWorked &&
      shift.workType === "main" &&
      (
        shift.type === "day" ||
        shift.type === "night"
      )
  ).length;

const storekeeperHourlyRate =
  storekeeperWorkedMainShifts +
    storekeeperFutureMainShifts >
  0
    ? (tariffs?.monthlySalary.storekeeper ?? 27000) /
  (
    storekeeperWorkedMainShifts +
    storekeeperFutureMainShifts
  ) /
  11
    : 0;

const storekeeperEarnedSalary =
  storekeeperWorkedMainShifts *
  11 *
  storekeeperHourlyRate;

const storekeeperFutureSalary =
  storekeeperFutureMainShifts *
  11 *
  storekeeperHourlyRate;

const currentMonthReport = calculateMonthlyReport(
  {
    user: currentUser,
    shifts,
    originalMainShiftsByMonth,
    deductions,
    premiums,
    payments,
  },
  today
);

const storekeeperRemainingMotivation = Math.max(
  0,
  goal -
    currentMonthReport.totalSalary -
    storekeeperFutureSalary
);

const storekeeperRequiredPallets =
  storekeeperFutureShifts > 0
    ? Math.ceil(
        storekeeperRemainingMotivation /
          (tariffs?.storekeeper.palletRate ?? 15) /
          storekeeperFutureShifts
      )
    : 0;
  return (
    <div className={styles.card}>

<div className={styles.stats}>
  <div className={styles.statCard}>
    <span className={styles.label}>
  {isStacker || isStorekeeper
    ? "Стоимость паллета"
    : isTobaccoPicker
      ? "Стоимость блока"
      : "Стоимость коробки"}
</span>

<strong className={styles.value}>
  {isStorekeeper
  ? `${(tariffs?.storekeeper.palletRate ?? 15).toFixed(2).replace(".", ",")} ₽`
    : hasProductionData
      ? `${(isStacker
          ? palletPrice
          : isTobaccoPicker
            ? blockPrice
            : boxPrice
        )
          .toFixed(2)
          .replace(".", ",")} ₽`
      : "—"}
</strong>
  </div>

  <div className={styles.statCard}>
  <span className={styles.label}>
  {isWatchMotivation
    ? "Цель средняя в текущей вахте"
    : isStorekeeper
      ? "Цель заработка в месяц"
      : "Цель средняя в месяц"}
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
  {isWatchMotivation ? "До конца вахты" : "До конца месяца"}{" "}
  {isStorekeeper
  ? "принимайте и отгружайте по"
  : isStacker
    ? "обрабатывайте по"
    : "собирайте по"}
  <strong>
{(isStorekeeper
  ? storekeeperRequiredPallets
  : isStacker
    ? requiredPallets
    : isTobaccoPicker
      ? requiredBlocks
      : requiredBoxes
).toLocaleString("ru-RU")}{" "}
{isStorekeeper
  ? "паллет"
  : isStacker
    ? "паллетов"
    : isTobaccoPicker
      ? "блоков"
      : "коробок"}
  </strong>
  {" "}за смену.
</div>

{!isStorekeeper && (
  <p className={styles.info}>
    Непрофильные часы не влияют на среднюю уделку.
  </p>
)}
    </div>
  );
}