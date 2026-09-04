"use client";

import styles from "./SalaryCard.module.css";
import Link from "next/link";
import { useScheduleStore } from "@/store/scheduleStore";
import { useFinanceStore } from "@/store/financeStore";
import { useUsersStore } from "@/store/usersStore";
import { getExperienceBonus } from "@/lib/experience";

export default function SalaryCard() {
  const shifts = useScheduleStore((state) => state.shifts);

  const originalMainShiftsByMonth = useScheduleStore(
    (state) => state.originalMainShiftsByMonth
  );

  const totalSalary = useFinanceStore(
    (state) => state.totalSalary
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

  const user = useUsersStore(
    (state) => state.currentUser
  );

  const currentDate = new Date();

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const currentMonthKey =
    `${currentYear}-${String(
      currentMonth + 1
    ).padStart(2, "0")}`;

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
    user?.hireDate || ""
  );

  const boxPrice =
    goal < 1200
      ? 2.7
      : goal < 1800
        ? 3.6
        : 4;

  const hourlyRate =
    originalMainShifts > 0
      ? 23750 /
        originalMainShifts /
        11
      : 0;

  const regularShiftSalary =
  originalMainShifts > 0
    ? (
        23750 +
        goal *
          boxPrice *
          originalMainShifts
      ) / originalMainShifts
    : 0;

const regularNightShiftSalary =
  regularShiftSalary +
  hourlyRate * 7 * 0.2;

const extraShiftSalary =
  hourlyRate * 22 +
  goal * boxPrice;

const extraNightShiftSalary =
  (
    hourlyRate * 11 +
    hourlyRate * 7 * 0.2
  ) * 2 +
  goal * boxPrice;

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

  const isNightShift =
    shift.type === "night";

  if (
    shift.workType === "main" ||
    shift.workType === "overtime"
  ) {
    futureForecast += isNightShift
      ? regularNightShiftSalary
      : regularShiftSalary;

    return;
  }

  if (shift.workType === "extra") {
    if (
      extraUsedAsRegular <
      regularShiftsNeeded
    ) {
      futureForecast += isNightShift
        ? regularNightShiftSalary
        : regularShiftSalary;

      extraUsedAsRegular += 1;
    } else {
      futureForecast += isNightShift
        ? extraNightShiftSalary
        : extraShiftSalary;
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
    ) / 600;

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
  absenceCount * 3000;

  const disciplineBonus =
    hasAbsence
      ? 0
      : 2000;

  const withoutErrorsBonus =
    errorCount < 3
      ? 5000
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
  totalSalary +
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