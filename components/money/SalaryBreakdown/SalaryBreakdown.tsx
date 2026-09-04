"use client";

import styles from "./SalaryBreakdown.module.css";
import { useUsersStore } from "@/store/usersStore";
import { useScheduleStore } from "@/store/scheduleStore";
import { getExperienceBonus } from "@/lib/experience";
import { getOriginalMainShiftsForMonth } from "@/lib/getOriginalMainShiftsForMonth";
import { useFinanceStore } from "@/store/financeStore";
import { useEffect, useState } from "react";
import BottomSheet from "@/components/BottomSheet/BottomSheet";

type Props = {
  selectedDate: Date;
  onTotalChange: (total: number) => void;
};

export default function SalaryBreakdown({
  selectedDate,
  onTotalChange,
}: Props) {
    const [premiumSheetOpen, setPremiumSheetOpen] =
    useState(false);

  const [premiumModalOpen, setPremiumModalOpen] =
    useState(false);

  const [premiumAmount, setPremiumAmount] =
    useState("");

  const [premiumComment, setPremiumComment] =
    useState("");
    const [deductionsModalOpen, setDeductionsModalOpen] =
    useState(false);
  const user = useUsersStore((state) => state.currentUser);

const shifts = useScheduleStore((state) => state.shifts);
  const premiums = useFinanceStore(
    (state) => state.premiums
  );
  const setStoredTotalSalary = useFinanceStore(
  (state) => state.setTotalSalary
);

  const addPremium = useFinanceStore(
    (state) => state.addPremium
  );

  const removePremium = useFinanceStore(
    (state) => state.removePremium
  );
const financeDeductions = useFinanceStore(
  (state) => state.deductions
);
const removeDeduction = useFinanceStore(
  (state) => state.removeDeduction
);

const decrementDeduction = useFinanceStore(
  (state) => state.decrementDeduction
);

const originalMainShiftsByMonth = useScheduleStore(
  (state) => state.originalMainShiftsByMonth
);

const experienceBonus = getExperienceBonus(
  user?.hireDate || ""
);

const currentDate = selectedDate;

const currentMonthKey = `${currentDate.getFullYear()}-${String(
  currentDate.getMonth() + 1
).padStart(2, "0")}`;

const monthPremiums = premiums.filter(
  (premium) => premium.monthKey === currentMonthKey
);

const monthDeductions = financeDeductions.filter(
  (deduction) => deduction.monthKey === currentMonthKey
);

const storedOriginalMainShifts =
  originalMainShiftsByMonth[currentMonthKey];


const originalMainShifts =
  storedOriginalMainShifts !== undefined
    ? storedOriginalMainShifts
    : getOriginalMainShiftsForMonth(
        user,
        selectedDate
      );

const monthShifts = shifts.filter((shift) => {
  const shiftDate = new Date(shift.date);

  return (
    shiftDate.getFullYear() === currentDate.getFullYear() &&
    shiftDate.getMonth() === currentDate.getMonth()
  );
});
const workedMonthShiftData = shifts.reduce(
  (result, shift) => {
    if (!shift.isWorked) {
      return result;
    }

    const shiftDate = new Date(shift.date);

    const isCurrentMonth =
      shiftDate.getFullYear() ===
        currentDate.getFullYear() &&
      shiftDate.getMonth() ===
        currentDate.getMonth();

    const nextDay = new Date(shiftDate);

    nextDay.setDate(
      nextDay.getDate() + 1
    );

    const isNextMonth =
      nextDay.getFullYear() ===
        currentDate.getFullYear() &&
      nextDay.getMonth() ===
        currentDate.getMonth();

    if (!shift.transitionDistribution) {
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
          transitionPart: null,
        });
      }

      return result;
    }

    if (isCurrentMonth) {
      result.push({
        shift,
        salaryHours: 4,
        baseHours:
          shift.transitionDistribution
            .firstMonth.baseHours ?? 0,
        tobaccoHours:
          shift.transitionDistribution
            .firstMonth.tobaccoHours ?? 0,
        boxes:
          shift.transitionDistribution
            .firstMonth.boxes ?? 0,
        blocks:
          shift.transitionDistribution
            .firstMonth.blocks ?? 0,
        nonProfileHours:
          shift.transitionDistribution
            .firstMonth.nonProfileHours ?? 0,
        transitionPart: "first",
      });
    }

    if (isNextMonth) {
      result.push({
        shift,
        salaryHours: 7,
        baseHours:
          shift.transitionDistribution
            .secondMonth.baseHours ?? 0,
        tobaccoHours:
          shift.transitionDistribution
            .secondMonth.tobaccoHours ?? 0,
        boxes:
          shift.transitionDistribution
            .secondMonth.boxes ?? 0,
        blocks:
          shift.transitionDistribution
            .secondMonth.blocks ?? 0,
        nonProfileHours:
          shift.transitionDistribution
            .secondMonth.nonProfileHours ?? 0,
        transitionPart: "second",
      });
    }

    return result;
  },
  [] as {
    shift: (typeof shifts)[number];
    salaryHours: number;
    baseHours: number;
    tobaccoHours: number;
    boxes: number;
    blocks: number;
    nonProfileHours: number;
    transitionPart: "first" | "second" | null;
  }[]
);
const hourlyRate =
  originalMainShifts > 0
    ? 23750 / originalMainShifts / 11
    : 0;

const salaryFromHours =
  workedMonthShiftData.reduce(
    (total, item) => {
      const { shift, salaryHours, transitionPart } =
        item;

      if (
        shift.workType !== "main" &&
        shift.workType !== "overtime" &&
        shift.workType !== "extra"
      ) {
        return total;
      }

      let shiftSalary = 0;

      if (shift.type === "night") {
        if (transitionPart === "first") {
          shiftSalary =
            2 * hourlyRate +
            2 * hourlyRate * 1.2;
        } else if (
          transitionPart === "second"
        ) {
          shiftSalary =
            5 * hourlyRate * 1.2 +
            2 * hourlyRate;
        } else {
          const normalHours = Math.min(
            salaryHours,
            2
          );

          const nightHours = Math.max(
            0,
            Math.min(
              salaryHours - 2,
              7
            )
          );

          const afterNightHours = Math.max(
            0,
            salaryHours - 9
          );

          shiftSalary =
            normalHours * hourlyRate +
            nightHours *
              hourlyRate *
              1.2 +
            afterNightHours * hourlyRate;
        }
      } else {
        shiftSalary =
          salaryHours * hourlyRate;
      }

      if (shift.workType === "extra") {
        shiftSalary *= 2;
      }

      return total + shiftSalary;
    },
    0
  );
const workedMonthShifts = monthShifts.filter(
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
    ? Math.round((totalBoxes / totalBaseHours) * 11)
    : 0;

const boxRate =
  averageBoxes >= 1800
    ? 4
    : averageBoxes >= 1200
      ? 3.6
      : 2.7;

const salaryFromBoxes = totalBoxes * boxRate;

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
    ? Math.round((totalBlocks / totalTobaccoHours) * 11)
    : 0;

const blockRate =
  averageBlocks >= 4000
    ? 1
    : averageBlocks >= 3200
      ? 0.8
      : averageBlocks >= 2200
        ? 0.7
        : 0.6;

const salaryFromBlocks = totalBlocks * blockRate;
const mentorSalaryPerShift =
  averageBoxes === 0
    ? 1200 * 3.6
    : averageBoxes < 1200
      ? 1000 * 2.7
      : averageBoxes < 1800
        ? 1200 * 3.6
        : 1800 * 4;

const salaryFromMentoring = shifts.reduce(
  (total, shift) => {
    if (
      !shift.isWorked ||
      shift.mentor !== true
    ) {
      return total;
    }

    const shiftDate = new Date(shift.date);

    const isCurrentMonth =
      shiftDate.getFullYear() ===
        currentDate.getFullYear() &&
      shiftDate.getMonth() ===
        currentDate.getMonth();

    if (!shift.transitionDistribution) {
      return isCurrentMonth
        ? total + mentorSalaryPerShift
        : total;
    }

    const nextDay = new Date(shiftDate);

    nextDay.setDate(
      nextDay.getDate() + 1
    );

    const isSecondMonth =
      nextDay.getFullYear() ===
        currentDate.getFullYear() &&
      nextDay.getMonth() ===
        currentDate.getMonth();

    if (isCurrentMonth) {
      return (
        total +
        (mentorSalaryPerShift * 4) / 11
      );
    }

    if (isSecondMonth) {
      return (
        total +
        (mentorSalaryPerShift * 7) / 11
      );
    }

    return total;
  },
  0
);
  const totalNonProfileHours =
  workedMonthShiftData.reduce(
    (total, item) =>
      total + item.nonProfileHours,
    0
  );

const salaryFromNonProfileHours =
  totalNonProfileHours * 136;
  const workedMainShiftsCount = monthShifts.filter(
  (shift) =>
    shift.workType === "main" &&
    shift.isWorked
).length;

const salaryFromDiscipline =
  originalMainShifts > 0 &&
  workedMainShiftsCount === originalMainShifts
    ? 2000
    : 0;
    const totalErrors = monthDeductions
  .filter((deduction) => deduction.type === "Ошибка")
  .reduce(
    (total, deduction) =>
      total + Number(deduction.amount || 0),
    0
  );

const errorsDeduction = totalErrors * 600;
const salaryWithoutErrors =
  workedMonthShifts.length > 0 && totalErrors <= 2
    ? 5000
    : 0;

const damageDeduction = monthDeductions
  .filter((deduction) => deduction.type === "Бой")
  .reduce(
    (total, deduction) =>
      total + Number(deduction.amount || 0),
    0
  );

const manualPenaltyDeduction = monthDeductions
  .filter(
    (deduction) =>
      deduction.type === "Штраф" ||
      deduction.type === "Ревизия"
  )
  .reduce(
    (total, deduction) =>
      total + Number(deduction.amount || 0),
    0
  );

const absenceCount = monthShifts.filter(
  (shift) => shift.status === "absence"
).length;

const absenceDeduction = absenceCount * 3000;

const totalPenaltyDeduction =
  manualPenaltyDeduction + absenceDeduction;
  const premiumAmountTotal = monthPremiums.reduce(
  (total, premium) =>
    total + Number(premium.amount || 0),
  0
);
const totalAccruals =
  Math.round(salaryFromHours) +
  Math.round(salaryFromBoxes) +
  Math.round(salaryFromBlocks) +
  Math.round(salaryFromMentoring) +
  Math.round(salaryFromNonProfileHours) +
  salaryFromDiscipline +
  experienceBonus +
  salaryWithoutErrors +
  premiumAmountTotal;

const totalDeductions =
  Math.round(errorsDeduction) +
  Math.round(damageDeduction) +
  Math.round(totalPenaltyDeduction);

const totalSalary =
  totalAccruals - totalDeductions;

useEffect(() => {
  onTotalChange(totalSalary);
  setStoredTotalSalary(totalSalary);
}, [
  totalSalary,
  onTotalChange,
  setStoredTotalSalary,
]);
    const accruals = [
    {
  title: "Оклад (часы работы)",
  amount: `${Math.round(salaryFromHours).toLocaleString(
    "ru-RU"
  )} ₽`,
},
    {
  title: "Коробки",
  amount: `${Math.round(salaryFromBoxes).toLocaleString(
    "ru-RU"
  )} ₽`,
},
    {
  title: "Блоки",
  amount: `${Math.round(salaryFromBlocks).toLocaleString(
    "ru-RU"
  )} ₽`,
},
    {
  title: "Наставничество (обучение)",
  amount: `${Math.round(
    salaryFromMentoring
  ).toLocaleString("ru-RU")} ₽`,
},
    {
  title: "Непрофильные часы",
  amount: `${Math.round(
    salaryFromNonProfileHours
  ).toLocaleString("ru-RU")} ₽`,
},
    {
  title: "Дисциплина (все основные смены)",
  amount: `${salaryFromDiscipline.toLocaleString(
    "ru-RU"
  )} ₽`,
},

    ...(experienceBonus > 0
      ? [
          {
            title: "Стаж работы",
            amount: `${experienceBonus.toLocaleString("ru-RU")} ₽`,
          },
        ]
      : []),

    {
  title: "Без ошибок",
  amount: `${salaryWithoutErrors.toLocaleString(
    "ru-RU"
  )} ₽`,
},
    {
  title: "Доп. премирование",
  amount: `${premiumAmountTotal.toLocaleString(
    "ru-RU"
  )} ₽`,
  isPremium: true,
},
  ];

  const deductions = [
  {
    title: "Ошибки",
    amount:
      errorsDeduction > 0
        ? `-${Math.round(
            errorsDeduction
          ).toLocaleString("ru-RU")} ₽`
        : "0 ₽",
  },
  {
    title: "Бой товара",
    amount:
      damageDeduction > 0
        ? `-${Math.round(
            damageDeduction
          ).toLocaleString("ru-RU")} ₽`
        : "0 ₽",
  },
  {
    title: "Штрафы (прогулы и прочие)",
    amount:
      totalPenaltyDeduction > 0
        ? `-${Math.round(
            totalPenaltyDeduction
          ).toLocaleString("ru-RU")} ₽`
        : "0 ₽",
  },
];

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>Из чего состоит зарплата</h3>

            <div className={styles.accrualsHeader}>
  <div className={styles.sectionTitle}>
    Начисления
  </div>

  <button
    type="button"
    className={styles.addPremiumButton}
    onClick={() => setPremiumSheetOpen(true)}
  >
    + Премия
  </button>
</div>

      {accruals.map((item) =>
  item.isPremium ? (
  <button
    key={item.title}
    type="button"
    className={`${styles.row} ${styles.premiumRow}`}
    onClick={() => setPremiumModalOpen(true)}
  >
    <div className={styles.premiumLeft}>
      <span className={styles.label}>
        {item.title}
      </span>

      <span className={styles.premiumArrow}>
        ›
      </span>
    </div>

    <span className={styles.amount}>
      {item.amount}
    </span>
  </button>
) : (
    <div key={item.title} className={styles.row}>
      <span className={styles.label}>
        {item.title}
      </span>

      <span className={styles.amount}>
        {item.amount}
      </span>
    </div>
  )
)}

            <button
  type="button"
  className={`${styles.sectionTitle} ${styles.deductionsTitle}`}
  onClick={() => setDeductionsModalOpen(true)}
>
  <span>Списания</span>
  <span className={styles.deductionsArrow}>›</span>
</button>

            {deductions.map((item) => (
        <div key={item.title} className={styles.row}>
          <span className={styles.label}>{item.title}</span>
          <span className={styles.amount}>{item.amount}</span>
        </div>
      ))}

      {deductionsModalOpen && (
        <div
          className={styles.modalOverlay}
          onClick={() => setDeductionsModalOpen(false)}
        >
          <div
            className={styles.modal}
            onClick={(event) => event.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Списания</h3>

              <button
                type="button"
                className={styles.modalClose}
                onClick={() => setDeductionsModalOpen(false)}
                aria-label="Закрыть"
              >
                ✕
              </button>
            </div>

            {monthDeductions.length > 0 ? (
              <div className={styles.modalList}>
                {monthDeductions.map((deduction) => (
                  <div
                    key={deduction.id}
                    className={styles.modalRow}
                  >
                    <span className={styles.modalLabel}>
                      {deduction.type}
                    </span>

                    <span className={styles.modalAmount}>
                      {deduction.type === "Ошибка"
                        ? `${Number(
                            deduction.amount
                          ).toLocaleString("ru-RU")} шт.`
                        : `${Number(
                            deduction.amount
                          ).toLocaleString("ru-RU")} ₽`}
                    </span>

                    <button
  type="button"
  className={styles.deleteButton}
  onClick={() => {
    if (deduction.type === "Ошибка") {
      decrementDeduction(deduction.id);
      return;
    }

    removeDeduction(deduction.id);
  }}
  aria-label={`Удалить списание: ${deduction.type}`}
>
  ✕
</button>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                Списаний пока нет
              </div>
            )}
          </div>
        </div>
      )}
            {premiumModalOpen && (
        <div
          className={styles.modalOverlay}
          onClick={() => setPremiumModalOpen(false)}
        >
          <div
            className={styles.modal}
            onClick={(event) => event.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                Дополнительные премии
              </h3>

              <button
                type="button"
                className={styles.modalClose}
                onClick={() => setPremiumModalOpen(false)}
                aria-label="Закрыть"
              >
                ✕
              </button>
            </div>

            {monthPremiums.length > 0 ? (
              <div className={styles.modalList}>
                {monthPremiums.map((premium) => (
                  <div
                    key={premium.id}
                    className={styles.premiumModalRow}
                  >
                    <div className={styles.premiumInfo}>
                      <span className={styles.premiumComment}>
                        {premium.comment}
                      </span>

                      <span className={styles.premiumModalAmount}>
                        {Number(
                          premium.amount
                        ).toLocaleString("ru-RU")} ₽
                      </span>
                    </div>

                    <button
                      type="button"
                      className={styles.deleteButton}
                      onClick={() =>
                        removePremium(premium.id)
                      }
                      aria-label="Удалить премию"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                Дополнительных премий пока нет
              </div>
            )}
          </div>
        </div>
      )}
            <BottomSheet
        isOpen={premiumSheetOpen}
        title="Добавить премию"
        onClose={() => {
          setPremiumSheetOpen(false);
          setPremiumAmount("");
          setPremiumComment("");
        }}
      >
        <div className={styles.premiumEditor}>
          <label className={styles.premiumFieldLabel}>
            Сумма премии
          </label>

          <input
            className={styles.premiumInput}
            type="number"
            min="1"
            placeholder="Введите сумму"
            value={premiumAmount}
            onChange={(event) =>
              setPremiumAmount(event.target.value)
            }
          />

          <label className={styles.premiumFieldLabel}>
            За что премия
          </label>

          <input
            className={styles.premiumInput}
            type="text"
            placeholder="Например: За выход в подработку"
            value={premiumComment}
            onChange={(event) =>
              setPremiumComment(event.target.value)
            }
          />

          <button
            type="button"
            className={styles.savePremiumButton}
            disabled={
              !premiumAmount ||
              !premiumComment.trim()
            }
            onClick={() => {
              addPremium({
  amount: premiumAmount,
  comment: premiumComment.trim(),
  monthKey: currentMonthKey,
});

              setPremiumSheetOpen(false);
              setPremiumAmount("");
              setPremiumComment("");
            }}
          >
            Добавить
          </button>
        </div>
      </BottomSheet>
    </div>
  );
}