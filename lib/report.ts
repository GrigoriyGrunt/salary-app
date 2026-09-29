import type { User } from "@/types/user";
import type { Shift } from "@/lib/generateSchedule";
import {
  getOriginalMainShiftsForDate,
  getOriginalMainShiftsForMonth,
} from "@/lib/getOriginalMainShiftsForMonth";
import { getExperienceBonus } from "@/lib/experience";

export type ReportFinanceItem = {
  id: number;
  type: string;
  amount: string | number;
  monthKey: string;
};

export type ReportPremium = {
  id: number;
  amount: string | number;
  monthKey: string;
  comment?: string | null;
};

export type ReportInput = {
  user: User | null;
  shifts: Shift[];
  originalMainShiftsByMonth: Record<string, number>;
  deductions: ReportFinanceItem[];
  premiums: ReportPremium[];
  payments: ReportFinanceItem[];
};

type WorkedShiftData = {
  shift: Shift;
  salaryHours: number;
  baseHours: number;
  tobaccoHours: number;
  boxes: number;
  blocks: number;
  nonProfileHours: number;
  transitionPart: "first" | "second" | null;
};

function getMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}`;
}

function isSameMonth(
  date: Date,
  selectedDate: Date
) {
  return (
    date.getFullYear() ===
      selectedDate.getFullYear() &&
    date.getMonth() ===
      selectedDate.getMonth()
  );
}

export function calculateMonthlyReport(
  input: ReportInput,
  selectedDate: Date
) {
  const {
    user,
    shifts,
    originalMainShiftsByMonth,
    deductions,
    premiums,
    payments,
  } = input;

  const monthKey =
    getMonthKey(selectedDate);

  const monthShifts =
    shifts.filter((shift) =>
      isSameMonth(
        new Date(shift.date),
        selectedDate
      )
    );

  const storedOriginalMainShifts =
    originalMainShiftsByMonth[
      monthKey
    ];

  const originalMainShifts =
    storedOriginalMainShifts !== undefined
      ? storedOriginalMainShifts
      : getOriginalMainShiftsForMonth(
          user,
          selectedDate
        );

  const workedMonthShiftData =
    shifts.reduce(
      (
        result,
        shift
      ) => {
        if (!shift.isWorked) {
          return result;
        }

        const shiftDate =
          new Date(shift.date);

        const isCurrentMonth =
          isSameMonth(
            shiftDate,
            selectedDate
          );

        const nextDay =
          new Date(shiftDate);

        nextDay.setDate(
          nextDay.getDate() + 1
        );

        const isNextMonth =
          isSameMonth(
            nextDay,
            selectedDate
          );

        if (
          !shift.transitionDistribution
        ) {
          if (isCurrentMonth) {
            result.push({
              shift,
              salaryHours:
                shift.salaryHours ?? 0,
              baseHours:
                shift.baseHours ?? 0,
              tobaccoHours:
                shift.tobaccoHours ?? 0,
              boxes:
                shift.boxes ?? 0,
              blocks:
                shift.blocks ?? 0,
              nonProfileHours:
                shift.nonProfileHours ?? 0,
              transitionPart:
                null,
            });
          }

          return result;
        }

        if (isCurrentMonth) {
          result.push({
            shift,
            salaryHours: 4,
            baseHours:
              shift
                .transitionDistribution
                .firstMonth
                .baseHours ?? 0,
            tobaccoHours:
              shift
                .transitionDistribution
                .firstMonth
                .tobaccoHours ?? 0,
            boxes:
              shift
                .transitionDistribution
                .firstMonth
                .boxes ?? 0,
            blocks:
              shift
                .transitionDistribution
                .firstMonth
                .blocks ?? 0,
            nonProfileHours:
              shift
                .transitionDistribution
                .firstMonth
                .nonProfileHours ?? 0,
            transitionPart:
              "first",
          });
        }

        if (isNextMonth) {
          result.push({
            shift,
            salaryHours: 7,
            baseHours:
              shift
                .transitionDistribution
                .secondMonth
                .baseHours ?? 0,
            tobaccoHours:
              shift
                .transitionDistribution
                .secondMonth
                .tobaccoHours ?? 0,
            boxes:
              shift
                .transitionDistribution
                .secondMonth
                .boxes ?? 0,
            blocks:
              shift
                .transitionDistribution
                .secondMonth
                .blocks ?? 0,
            nonProfileHours:
              shift
                .transitionDistribution
                .secondMonth
                .nonProfileHours ?? 0,
            transitionPart:
              "second",
          });
        }

        return result;
      },
      [] as WorkedShiftData[]
    );

  const workedMonthShifts =
    monthShifts.filter(
      (shift) => shift.isWorked
    );

  const totalBoxes =
    workedMonthShiftData.reduce(
      (total, item) =>
        total + item.boxes,
      0
    );

  const totalBaseHours =
    workedMonthShiftData.reduce(
      (total, item) =>
        total + item.baseHours,
      0
    );

  const averageBoxes =
    totalBaseHours > 0
      ? Math.round(
          (totalBoxes /
            totalBaseHours) *
            11
        )
      : 0;

  const boxRate =
    averageBoxes >= 1800
      ? 4
      : averageBoxes >= 1200
        ? 3.6
        : 2.7;

  const salaryFromBoxes =
    totalBoxes * boxRate;

  const totalBlocks =
    workedMonthShiftData.reduce(
      (total, item) =>
        total + item.blocks,
      0
    );

  const totalTobaccoHours =
    workedMonthShiftData.reduce(
      (total, item) =>
        total + item.tobaccoHours,
      0
    );

  const averageBlocks =
    totalTobaccoHours > 0
      ? Math.round(
          (totalBlocks /
            totalTobaccoHours) *
            11
        )
      : 0;

  const blockRate =
    averageBlocks >= 4000
      ? 1
      : averageBlocks >= 3200
        ? 0.8
        : averageBlocks >= 2200
          ? 0.7
          : 0.6;

  const salaryFromBlocks =
    totalBlocks * blockRate;

  const salaryFromHours =
    workedMonthShiftData.reduce(
      (
        total,
        item
      ) => {
        const {
          shift,
          salaryHours,
          transitionPart,
        } = item;

        const shiftDate =
          new Date(shift.date);

        const rateDate =
          transitionPart === "second"
            ? new Date(
                shiftDate.getFullYear(),
                shiftDate.getMonth(),
                shiftDate.getDate() + 1
              )
            : shiftDate;

        const shiftOriginalMainShifts =
          getOriginalMainShiftsForDate(
            user,
            rateDate
          );

        const hourlyRate =
          shiftOriginalMainShifts > 0
            ? 23750 /
              shiftOriginalMainShifts /
              11
            : 0;

        if (
          shift.workType !== "main" &&
          shift.workType !== "overtime" &&
          shift.workType !== "extra"
        ) {
          return total;
        }

        let shiftSalary = 0;

        if (shift.type === "night") {
          if (
            transitionPart === "first"
          ) {
            shiftSalary =
              2 * hourlyRate +
              2 *
                hourlyRate *
                1.2;
          } else if (
            transitionPart === "second"
          ) {
            shiftSalary =
              5 *
                hourlyRate *
                1.2 +
              2 * hourlyRate;
          } else {
            const normalHours =
              Math.min(
                salaryHours,
                2
              );

            const nightHours =
              Math.max(
                0,
                Math.min(
                  salaryHours - 2,
                  7
                )
              );

            const afterNightHours =
              Math.max(
                0,
                salaryHours - 9
              );

            shiftSalary =
              normalHours *
                hourlyRate +
              nightHours *
                hourlyRate *
                1.2 +
              afterNightHours *
                hourlyRate;
          }
        } else {
          shiftSalary =
            salaryHours *
            hourlyRate;
        }

        if (
          shift.workType === "extra"
        ) {
          shiftSalary *= 2;
        }

        return total + shiftSalary;
      },
      0
    );
const hourBreakdown =
  workedMonthShiftData.reduce(
    (result, item) => {
      const {
        shift,
        salaryHours,
        transitionPart,
      } = item;

      if (
        shift.workType !== "main" &&
        shift.workType !== "overtime" &&
        shift.workType !== "extra"
      ) {
        return result;
      }

      const shiftDate =
        new Date(shift.date);

      const rateDate =
        transitionPart === "second"
          ? new Date(
              shiftDate.getFullYear(),
              shiftDate.getMonth(),
              shiftDate.getDate() + 1
            )
          : shiftDate;

      const shiftOriginalMainShifts =
        getOriginalMainShiftsForDate(
          user,
          rateDate
        );

      const hourlyRate =
        shiftOriginalMainShifts > 0
          ? 23750 /
            shiftOriginalMainShifts /
            11
          : 0;

      let nightHours = 0;

      if (shift.type === "night") {
        if (
          transitionPart === "first"
        ) {
          nightHours = 2;
        } else if (
          transitionPart === "second"
        ) {
          nightHours = 5;
        } else {
          nightHours = Math.max(
            0,
            Math.min(
              salaryHours - 2,
              7
            )
          );
        }
      }

      const multiplier =
        shift.workType === "extra"
          ? 2
          : 1;

      const baseSalary =
        salaryHours *
        hourlyRate *
        multiplier;

      const nightSurcharge =
        nightHours *
        hourlyRate *
        0.2 *
        multiplier;

      if (
        shift.workType === "main"
      ) {
        result.mainHours +=
          salaryHours;

        result.mainSalary +=
          baseSalary;
      }

      if (
        shift.workType === "overtime"
      ) {
        result.overtimeHours +=
          salaryHours;

        result.overtimeSalary +=
          baseSalary;
      }

      if (
        shift.workType === "extra"
      ) {
        result.extraHours +=
          salaryHours;

        result.extraSalary +=
          baseSalary;
      }

      result.nightHours +=
        nightHours;

      result.nightSurcharge +=
        nightSurcharge;

      return result;
    },
    {
      mainHours: 0,
      mainSalary: 0,

      overtimeHours: 0,
      overtimeSalary: 0,

      extraHours: 0,
      extraSalary: 0,

      nightHours: 0,
      nightSurcharge: 0,
    }
  );

  const totalNonProfileHours =
    workedMonthShiftData.reduce(
      (total, item) =>
        total +
        item.nonProfileHours,
      0
    );

  const salaryFromNonProfileHours =
    totalNonProfileHours * 136;

  const mentorSalaryPerShift =
    averageBoxes === 0
      ? 1200 * 3.6
      : averageBoxes < 1200
        ? 1000 * 2.7
        : averageBoxes < 1800
          ? 1200 * 3.6
          : 1800 * 4;

  const mentorShifts =
    monthShifts
      .filter(
        (shift) =>
          shift.isWorked &&
          shift.mentor === true
      )
      .sort(
        (a, b) =>
          new Date(
            a.date
          ).getTime() -
          new Date(
            b.date
          ).getTime()
      );

  const salaryFromMentoring =
    shifts.reduce(
      (
        total,
        shift
      ) => {
        if (
          !shift.isWorked ||
          shift.mentor !== true
        ) {
          return total;
        }

        const shiftDate =
          new Date(shift.date);

        const isCurrentMonth =
          isSameMonth(
            shiftDate,
            selectedDate
          );

        if (
          !shift.transitionDistribution
        ) {
          return isCurrentMonth
            ? total +
                mentorSalaryPerShift
            : total;
        }

        const nextDay =
          new Date(shiftDate);

        nextDay.setDate(
          nextDay.getDate() + 1
        );

        const isSecondMonth =
          isSameMonth(
            nextDay,
            selectedDate
          );

        if (isCurrentMonth) {
          return (
            total +
            (mentorSalaryPerShift *
              4) /
              11
          );
        }

        if (isSecondMonth) {
          return (
            total +
            (mentorSalaryPerShift *
              7) /
              11
          );
        }

        return total;
      },
      0
    );

  const totalNightHours =
    workedMonthShiftData.reduce(
      (total, item) => {
        if (
          item.shift.type !==
          "night"
        ) {
          return total;
        }

        if (
          item.transitionPart ===
          "first"
        ) {
          return total + 2;
        }

        if (
          item.transitionPart ===
          "second"
        ) {
          return total + 5;
        }

        return (
          total +
          Math.max(
            0,
            Math.min(
              item.salaryHours - 2,
              7
            )
          )
        );
      },
      0
    );

  const workedMainShiftsCount =
    monthShifts.filter(
      (shift) =>
        shift.workType ===
          "main" &&
        shift.isWorked
    ).length;
const dayOffCount =
  monthShifts.filter(
    (shift) =>
      shift.workType === "do"
  ).length;
  const salaryFromDiscipline =
    originalMainShifts > 0 &&
    workedMainShiftsCount ===
      originalMainShifts
      ? 2000
      : 0;

  const experienceBonus =
    getExperienceBonus(
      user?.hireDate || ""
    );

  const currentMonthDeductions =
    deductions.filter(
      (deduction) =>
        deduction.monthKey ===
        monthKey
    );

  const currentMonthPremiums =
    premiums.filter(
      (premium) =>
        premium.monthKey ===
        monthKey
    );

  const currentMonthPayments =
    payments.filter(
      (payment) =>
        payment.monthKey ===
        monthKey
    );

  const totalErrors =
    currentMonthDeductions
      .filter(
        (deduction) =>
          deduction.type ===
          "Ошибка"
      )
      .reduce(
        (total, deduction) =>
          total +
          Number(
            deduction.amount || 0
          ),
        0
      );

  const errorsDeduction =
    totalErrors * 600;

  const salaryWithoutErrors =
    workedMonthShifts.length > 0 &&
    totalErrors <= 2
      ? 5000
      : 0;

  const damageDeduction =
    currentMonthDeductions
      .filter(
        (deduction) =>
          deduction.type ===
          "Бой"
      )
      .reduce(
        (total, deduction) =>
          total +
          Number(
            deduction.amount || 0
          ),
        0
      );

  const manualPenaltyDeduction =
    currentMonthDeductions
      .filter(
        (deduction) =>
          deduction.type ===
            "Штраф" ||
          deduction.type ===
            "Ревизия"
      )
      .reduce(
        (total, deduction) =>
          total +
          Number(
            deduction.amount || 0
          ),
        0
      );

  const absenceCount =
    monthShifts.filter(
      (shift) =>
        shift.status ===
        "absence"
    ).length;

  const absenceDeduction =
    absenceCount * 3000;

  const totalPenaltyDeduction =
    manualPenaltyDeduction +
    absenceDeduction;

  const premiumAmountTotal =
    currentMonthPremiums.reduce(
      (total, premium) =>
        total +
        Number(
          premium.amount || 0
        ),
      0
    );

  const totalAccruals =
    Math.round(
      salaryFromHours
    ) +
    Math.round(
      salaryFromBoxes
    ) +
    Math.round(
      salaryFromBlocks
    ) +
    Math.round(
      salaryFromMentoring
    ) +
    Math.round(
      salaryFromNonProfileHours
    ) +
    salaryFromDiscipline +
    experienceBonus +
    salaryWithoutErrors +
    premiumAmountTotal;

  const totalDeductions =
    Math.round(
      errorsDeduction
    ) +
    Math.round(
      damageDeduction
    ) +
    Math.round(
      totalPenaltyDeduction
    );

  const totalSalary =
    totalAccruals -
    totalDeductions;

  const totalPaid =
  currentMonthPayments
    .filter(
      (payment) =>
        payment.type === "Аванс" ||
        payment.type === "Зарплата"
    )
    .reduce(
      (total, payment) => {
        const amount = Number(
          String(payment.amount || 0)
            .replace(/[^\d,.-]/g, "")
            .replace(",", ".")
        );

        return total + amount;
      },
      0
    );

  return {
    monthKey,

    originalMainShifts,

workedMainShiftsCount,

extraWorked:
  monthShifts.filter(
    (shift) =>
      shift.workType ===
        "extra" &&
      shift.isWorked
  ).length,

overtimeWorked:
  monthShifts.filter(
    (shift) =>
      shift.workType ===
        "overtime" &&
      shift.isWorked
  ).length,

totalActualHours:
  hourBreakdown.mainHours +
  hourBreakdown.extraHours +
  hourBreakdown.overtimeHours,

mainHours:
  hourBreakdown.mainHours,

mainSalary:
  hourBreakdown.mainSalary,

overtimeHours:
  hourBreakdown.overtimeHours,

overtimeSalary:
  hourBreakdown.overtimeSalary,

extraHours:
  hourBreakdown.extraHours,

extraSalary:
  hourBreakdown.extraSalary,

nightHours:
  hourBreakdown.nightHours,

nightSurcharge:
  hourBreakdown.nightSurcharge,


    workedShifts:
      workedMonthShifts.length,

    dayOffCount,  

    absences:
      absenceCount,

    vacations:
      monthShifts.filter(
        (shift) =>
          shift.status ===
          "vacation"
      ).length,

    sickDays:
      monthShifts.filter(
        (shift) =>
          shift.status ===
          "sick"
      ).length,

    totalBoxes,
    averageBoxes,
    boxRate,
    salaryFromBoxes,

    totalBlocks,
    averageBlocks,
    blockRate,
    salaryFromBlocks,

    totalNonProfileHours,
    salaryFromNonProfileHours,

    salaryFromHours,

    mentorShifts,
    salaryFromMentoring,

    salaryFromDiscipline,

    experienceBonus,

    salaryWithoutErrors,

    premiumAmountTotal,

    errorsCount:
      totalErrors,

    errorsDeduction,

    damageDeduction,

    manualPenaltyDeduction,

    absenceDeduction,

    totalPenaltyDeduction,

    totalAccruals,
    totalDeductions,
    totalSalary,

    totalPaid,

    balance:
      totalSalary -
      totalPaid,

    premiums:
      currentMonthPremiums,

    deductions:
      currentMonthDeductions,
  };
}