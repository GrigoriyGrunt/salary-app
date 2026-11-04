"use client";

import styles from "./SalaryCard.module.css";
import Link from "next/link";
import { useScheduleStore } from "@/store/scheduleStore";
import { useFinanceStore } from "@/store/financeStore";
import { useUsersStore } from "@/store/usersStore";
import { getExperienceBonus } from "@/lib/experience";
import { getOriginalMainShiftsForDate } from "@/lib/getOriginalMainShiftsForMonth";
import { getMonthProductionStats } from "@/lib/getMonthProductionStats";
import { calculateMonthlyReport } from "@/lib/report";
import { getWarehouseConfig } from "@/lib/warehouses/config";

export default function SalaryCard() {
  const shifts = useScheduleStore((state) => state.shifts);

  const originalMainShiftsByMonth = useScheduleStore(
    (state) => state.originalMainShiftsByMonth
  );

  const goal = useFinanceStore(
    (state) => state.goal
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

  const user = useUsersStore(
    (state) => state.currentUser
  );

  const currentDate = new Date();
  const warehouseConfig = getWarehouseConfig(
  user?.warehouse
);

if (!warehouseConfig) {
  throw new Error(
    `Не найдена конфигурация склада: ${user?.warehouse}`
  );
}

const tariffs = warehouseConfig.tariffs;

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const currentMonthKey =
    `${currentYear}-${String(
      currentMonth + 1
    ).padStart(2, "0")}`;
   
  const currentMonthReport = calculateMonthlyReport(
  {
    user,
    shifts,
    originalMainShiftsByMonth,
    deductions,
    premiums,
    payments,
  },
  currentDate
);

const isStacker =
  user?.position === "Штабелер (водитель погрузчика)";

const isStorekeeper =
  user?.position === "Кладовщик";

  const originalMainShifts =
    originalMainShiftsByMonth[
      currentMonthKey
    ] ?? 0;

  const monthShifts = shifts
    .filter((shift) => {
      const shiftDate = new Date(shift.date);

      return (
        shiftDate.getFullYear() === currentYear &&
        shiftDate.getMonth() === currentMonth
      );
    })
    .sort(
      (a, b) =>
        new Date(a.date).getTime() -
        new Date(b.date).getTime()
    );

  const monthDeductions = deductions.filter(
    (deduction) =>
      deduction.monthKey === currentMonthKey
  );

  const monthPremiums = premiums.filter(
    (premium) =>
      premium.monthKey === currentMonthKey
  );

  const experienceBonus = getExperienceBonus(
  user?.hireDate || "",
  tariffs.experienceBonus
);

const monthStats =
  getMonthProductionStats(
    shifts,
    currentDate
  );

const totalBoxes =
  monthStats.boxes;

const totalBaseHours =
  monthStats.baseHours;

const totalPallets =
  monthStats.pallets;

const averagePallets =
  totalBaseHours > 0
    ? Math.round(
        (totalPallets / totalBaseHours) * 11
      )
    : 0;

const palletPrice =
  [...tariffs.pallets]
    .reverse()
    .find((tier) => averagePallets >= tier.minAverage)
    ?.rate ?? 0;

const palletSalary =
  totalPallets * palletPrice;

const averageBoxes =
  totalBaseHours > 0
    ? Math.round(
        (totalBoxes / totalBaseHours) * 11
      )
    : 0;  

  const boxPrice =
  [...tariffs.boxes]
    .reverse()
    .find(
      (tier) =>
        (averageBoxes > 0 ? averageBoxes : goal) >=
        tier.minAverage
    )
    ?.rate ?? 0;
    const totalBlocks =
    monthStats.blocks;

  const totalTobaccoHours =
    monthStats.tobaccoHours;

  const averageBlocks =
    totalTobaccoHours > 0
      ? Math.round(
          (totalBlocks / totalTobaccoHours) * 11
        )
      : 0;

  const blockPrice =
  [...tariffs.blocks]
    .reverse()
    .find(
      (tier) =>
        (averageBlocks > 0 ? averageBlocks : goal) >=
        tier.minAverage
    )
    ?.rate ?? 0;

  const motivationPrice =
  user?.position === "Комплектовщик табака"
    ? blockPrice
    : boxPrice;

const palletForecastPrice =
  [...tariffs.pallets]
    .reverse()
    .find(
      (tier) =>
        (averagePallets > 0 ? averagePallets : goal) >=
        tier.minAverage
    )
    ?.rate ?? 0;

const forecastBoxPrice =
  isStacker
    ? palletForecastPrice
    : boxPrice;

const forecastMotivationPrice =
  isStacker
    ? palletForecastPrice
    : motivationPrice;

const hourlyRate =
    originalMainShifts > 0
      ? tariffs.monthlySalary[
  isStorekeeper ? "storekeeper" : "default"
] /
        originalMainShifts /
        11
      : 0;

  const regularShiftSalary =
  originalMainShifts > 0
    ? (
        tariffs.monthlySalary[
  isStorekeeper ? "storekeeper" : "default"
] +
        goal *
          forecastMotivationPrice *
          originalMainShifts
      ) / originalMainShifts
    : 0;

const regularNightShiftSalary =
  regularShiftSalary +
  hourlyRate *
    7 *
    tariffs.nightSurchargeRate;

const extraShiftSalary =
  hourlyRate * 22 +
  goal * forecastMotivationPrice;

const extraNightShiftSalary =
  (
    hourlyRate * 11 +
    hourlyRate *
      7 *
      tariffs.nightSurchargeRate
  ) *
    tariffs.extraShiftMultiplier +
  goal * forecastMotivationPrice;

  const mainAndOvertimeCount =
    monthShifts.filter(
      (shift) =>
        shift.workType === "main" ||
        shift.workType === "overtime"
    ).length;

  const regularShiftsNeeded =
    Math.max(
      0,
      originalMainShifts -
        mainAndOvertimeCount
    );

  let extraUsedAsRegular = 0;

    let futureForecast = 0;

  monthShifts.forEach((shift) => {
    const isWorkingShift =
      shift.workType === "main" ||
      shift.workType === "overtime" ||
      shift.workType === "extra";

    if (!isWorkingShift || shift.isWorked) {
      return;
    }

    const shiftDate =
      new Date(shift.date);

    const shiftOriginalMainShifts =
      getOriginalMainShiftsForDate(
        user,
        shiftDate
      );

    const shiftHourlyRate =
  shiftOriginalMainShifts > 0
    ? tariffs.monthlySalary[
        isStorekeeper ? "storekeeper" : "default"
      ] /
      shiftOriginalMainShifts /
      11
    : 0;

const shiftRegularSalary =
  shiftOriginalMainShifts > 0
    ? (
        tariffs.monthlySalary[
          isStorekeeper ? "storekeeper" : "default"
        ] +
        goal *
          forecastMotivationPrice *
          shiftOriginalMainShifts
      ) / shiftOriginalMainShifts
    : 0;

    const shiftRegularNightSalary =
  shiftRegularSalary +
  shiftHourlyRate *
    7 *
    tariffs.nightSurchargeRate;

const shiftExtraSalary =
  shiftHourlyRate * 22 +
  goal * forecastMotivationPrice;

const shiftExtraNightSalary =
  (
    shiftHourlyRate * 11 +
    shiftHourlyRate *
      7 *
      tariffs.nightSurchargeRate
  ) *
    tariffs.extraShiftMultiplier +
  goal * forecastMotivationPrice;

    const isNightShift =
      shift.type === "night";

    if (
      shift.workType === "main" ||
      shift.workType === "overtime"
    ) {
      futureForecast += isNightShift
        ? shiftRegularNightSalary
        : shiftRegularSalary;

      return;
    }

    if (shift.workType === "extra") {
      if (
        extraUsedAsRegular <
        regularShiftsNeeded
      ) {
        futureForecast += isNightShift
          ? shiftRegularNightSalary
          : shiftRegularSalary;

        extraUsedAsRegular += 1;
      } else {
        futureForecast += isNightShift
          ? shiftExtraNightSalary
          : shiftExtraSalary;
      }
    }
  });

  const errorCount =
  monthDeductions.filter(
    (deduction) =>
      deduction.type === "Ошибка"
  ).reduce(
    (total, deduction) =>
      total +
      Number(deduction.amount || 0),
    0
  ) /
  tariffs.bonuses.errorDeduction[
    isStacker
      ? "stacker"
      : isStorekeeper
        ? "storekeeper"
        : "default"
  ];

  const hasAbsence =
    monthShifts.some(
      (shift) =>
        shift.status === "absence"
    );

    const absenceCount =
  monthShifts.filter(
    (shift) =>
      shift.status === "absence"
  ).length;

const absenceDeduction =
  absenceCount * tariffs.bonuses.absenceDeduction;

  const disciplineBonus =
  hasAbsence
    ? 0
    : tariffs.bonuses.discipline;

  const withoutErrorsBonus =
  !isStorekeeper && !isStacker && errorCount === 0
    ? tariffs.bonuses.noErrors
    : 0;

const stackerWithoutErrorsBonus =
  isStacker &&
  monthShifts.some((shift) => shift.isWorked) &&
  errorCount === 0
    ? tariffs.bonuses.stackerNoErrors
    : 0;

const totalSalary =
  currentMonthReport.totalSalary;  
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

const storekeeperTotalMainShifts =
  monthShifts.filter(
    (shift) =>
      shift.workType === "main" &&
      (
        shift.type === "day" ||
        shift.type === "night"
      )
  ).length;

const storekeeperHourlyRate =
  storekeeperTotalMainShifts > 0
    ? tariffs.monthlySalary.storekeeper /
      storekeeperTotalMainShifts /
      11
    : 0;

const storekeeperWorkedPallets =
  totalPallets;

const storekeeperWorkedMotivation =
  storekeeperWorkedPallets *
  tariffs.storekeeper.palletRate;

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

const storekeeperFutureSalary =
  storekeeperFutureMainShifts *
  11 *
  storekeeperHourlyRate;

const storekeeperWorkedSalary =
  storekeeperWorkedMainShifts *
  11 *
  storekeeperHourlyRate;

const storekeeperRemainingMotivation = Math.max(
  0,
  goal - totalSalary - storekeeperFutureSalary
);

const storekeeperRequiredPallets =
  storekeeperFutureShifts > 0
    ? Math.ceil(
        storekeeperRemainingMotivation /
          tariffs.storekeeper.palletRate /
          storekeeperFutureShifts
      )
    : 0;
  const premiumTotal =
    monthPremiums.reduce(
      (total, premium) =>
        total +
        Number(premium.amount || 0),
      0
    );

  const futureBonuses =
    experienceBonus +
    disciplineBonus +
    withoutErrorsBonus +
    premiumTotal;

  const currentBonuses =
    experienceBonus +
    disciplineBonus +
    withoutErrorsBonus +
    premiumTotal;

  const forecast =
  isStorekeeper
    ? totalSalary +
      storekeeperFutureSalary +
      storekeeperRequiredPallets *
        tariffs.storekeeper.palletRate *
        storekeeperFutureShifts
    : totalSalary +
      futureForecast -
      absenceDeduction;

  return (
    <section className={styles.card}>
      <div className={styles.top}>
        <div>
          <p className={styles.label}>
            Заработано за{" "}
            {new Intl.DateTimeFormat(
              "ru-RU",
              { month: "long" }
            ).format(new Date())}
          </p>

          <h2 className={styles.amount}>
            {Math.round(totalSalary)
              .toLocaleString("ru-RU")} ₽
          </h2>

          <span className={styles.update}>
            Обновляется ежедневно
          </span>
        </div>

        <div className={styles.forecast}>
          <span className={styles.forecastTitle}>
            Прогноз
          </span>

          <strong>
            {Math.ceil(forecast)
              .toLocaleString("ru-RU")} ₽
          </strong>

          <small>
            за месяц
          </small>
        </div>
      </div>

      <Link
        href="/money"
        className={styles.details}
      >
        <div>
          <strong>
            Детализация расчёта
          </strong>

          <span>
            Оклад, мотивация,
            бонусы и штрафы
          </span>
        </div>

        <div className={styles.arrow}>
          &gt;
        </div>
      </Link>
    </section>
  );
}