"use client";

import { createPortal } from "react-dom";

import styles from "./DayDetailsModal.module.css";
import { useUsersStore } from "@/store/usersStore";
import { useScheduleStore } from "@/store/scheduleStore";
import InfoRow from "@/components/common/InfoRow/InfoRow";
import { getOriginalMainShiftsForMonth } from "@/lib/getOriginalMainShiftsForMonth";
import type { User } from "@/types/user";
type ShiftData = {
  date?: Date;
  isWorked?: boolean;

  type?: string;
  workType?: string | null;
  status?: string;
  workZone?: string;

  salaryHours?: number;
  baseHours?: number;
  tobaccoHours?: number;

  boxes?: number;
  blocks?: number;

  nonProfileHours?: number;

  mentor?: boolean;
};

type DayDetailsModalProps = {
  open: boolean;
  selectedDate: Date;
  shift?: ShiftData;
  onClose: () => void;
  onEdit: () => void;
};

function getShiftType(shift?: ShiftData) {
  if (!shift) {
    return "Нет данных";
  }

  if (shift.status === "vacation") {
    return "Отпуск";
  }

  if (shift.status === "sick") {
    return "Больничный";
  }

  if (shift.status === "absence") {
    return "Отсутствие";
  }

  if (shift.status === "dayOff") {
    return "Отгул";
  }

  if (shift.workType === "overtime") {
    return "Отработка";
  }

  if (shift.workType === "extra") {
  return "Подработка";
}

  if (
    shift.type === "day" ||
    shift.type === "night"
  ) {
    return "Основная смена";
  }

  return "Выходной";
}

function getPeriod(shift?: ShiftData) {
  if (shift?.type === "day") {
    return "Дневная";
  }

  if (shift?.type === "night") {
    return "Ночная";
  }

  return "";
}

function getWorkType(shift?: ShiftData) {
  switch (shift?.workZone) {
    case "base":
      return "Основа";

    case "base_tobacco":
      return "Основа + Табак";

    case "tobacco":
      return "Табак";

    case "warehouse":
      return "Работа по складу";

    default:
      return null;
  }
}
export function getDayEarnings(
  shift: ShiftData | undefined,
  selectedDate: Date,
  shifts: ShiftData[],
  originalMainShiftsByMonth: Record<
    string,
    number
  >,
  user: User | null
) {
  const salaryHours =
    shift?.salaryHours ?? 0;

  const boxes =
    shift?.boxes ?? 0;

  const blocks =
    shift?.blocks ?? 0;

  const nonProfileHours =
    shift?.nonProfileHours ?? 0;

  const currentMonthKey =
    `${selectedDate.getFullYear()}-${String(
      selectedDate.getMonth() + 1
    ).padStart(2, "0")}`;

  const storedOriginalMainShifts =
  originalMainShiftsByMonth[
    currentMonthKey
  ];


const originalMainShifts =
  storedOriginalMainShifts !== undefined
    ? storedOriginalMainShifts
    : getOriginalMainShiftsForMonth(
        user,
        selectedDate
      );

  const monthShifts = shifts.filter(
    (monthShift) => {
      if (!monthShift.date) return false;

      const monthShiftDate =
        new Date(monthShift.date);

      return (
        monthShiftDate.getFullYear() ===
          selectedDate.getFullYear() &&
        monthShiftDate.getMonth() ===
          selectedDate.getMonth()
      );
    }
  );

  const workedMonthShifts =
    monthShifts.filter(
      (monthShift) =>
        monthShift.isWorked
    );

  const hourlyRate =
    originalMainShifts > 0
      ? 23750 /
        originalMainShifts /
        11
      : 0;

  let salaryFromHours = 0;

  if (
    shift?.workType === "main" ||
    shift?.workType === "overtime" ||
    shift?.workType === "extra"
  ) {
    if (shift?.type === "night") {
      const normalHours =
        Math.min(salaryHours, 2);

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

      salaryFromHours =
        normalHours * hourlyRate +
        nightHours *
          hourlyRate *
          1.2 +
        afterNightHours *
          hourlyRate;
    } else {
      salaryFromHours =
        salaryHours * hourlyRate;
    }

    if (
      shift?.workType === "extra"
    ) {
      salaryFromHours *= 2;
    }
  }

  const totalBoxes =
    workedMonthShifts.reduce(
      (total, monthShift) =>
        total +
        (monthShift.boxes || 0),
      0
    );

  const totalBaseHours =
    workedMonthShifts.reduce(
      (total, monthShift) =>
        total +
        (monthShift.baseHours || 0),
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

  const boxesEarnings =
    boxes * boxRate;

  const totalBlocks =
    workedMonthShifts.reduce(
      (total, monthShift) =>
        total +
        (monthShift.blocks || 0),
      0
    );

  const totalTobaccoHours =
    workedMonthShifts.reduce(
      (total, monthShift) =>
        total +
        (monthShift.tobaccoHours || 0),
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

  const blocksEarnings =
    blocks * blockRate;

  const nonProfileEarnings =
    nonProfileHours * 136;

  const mentorEarnings =
    shift?.mentor
      ? averageBoxes === 0
        ? 1200 * 3.6
        : averageBoxes < 1200
          ? 1000 * 2.7
          : averageBoxes < 1800
            ? 1200 * 3.6
            : 1800 * 4
      : 0;

  return (
    salaryFromHours +
    boxesEarnings +
    blocksEarnings +
    nonProfileEarnings +
    mentorEarnings
  );
}

export default function DayDetailsModal({
  open,
  selectedDate,
  shift,
  onClose,
  onEdit,
}: DayDetailsModalProps) {
    const currentUser = useUsersStore(
  (state) => state.currentUser
);

const shifts = useScheduleStore(
  (state) => state.shifts
);

const originalMainShiftsByMonth = useScheduleStore(
  (state) => state.originalMainShiftsByMonth
);

  if (!open) return null;

  if (
    typeof document === "undefined"
  ) {
    return null;
  }

  const shiftType =
    getShiftType(shift);

  const period =
    getPeriod(shift);

  const workType =
    getWorkType(shift);
    const salaryHours = shift?.salaryHours ?? 0;
const baseHours = shift?.baseHours ?? 0;
const boxes = shift?.boxes ?? 0;
const tobaccoHours = shift?.tobaccoHours ?? 0;
const blocks = shift?.blocks ?? 0;
const nonProfileHours = shift?.nonProfileHours ?? 0;
const dayEarnings = getDayEarnings(
  shift,
  selectedDate,
  shifts,
  originalMainShiftsByMonth,
  currentUser
);

  return createPortal(
    <>
      <div
        className={styles.backdrop}
        onClick={onClose}
      />

      <div className={styles.sheet}>
        <div
          className={styles.handle}
        />

        <h2 className={styles.date}>
          {selectedDate.toLocaleDateString(
            "ru-RU",
            {
              day: "numeric",
              month: "long",
              year: "numeric",
            }
          )}
        </h2>

        <p
          className={styles.shiftType}
        >
          {shiftType}
        </p>

        {period && (
          <p
            className={styles.period}
          >
            {period}
          </p>
        )}

        <div
          className={styles.divider}
        />

        {workType && (
          <InfoRow
            label="Тип работы"
            value={workType}
          />
        )}

        {salaryHours > 0 && (
  <InfoRow
    label="Часы по окладу"
    value={salaryHours}
  />
)}

{baseHours > 0 && (
  <InfoRow
    label="Часы основа"
    value={`${baseHours} ч`}
  />
)}

{boxes > 0 && (
  <InfoRow
    label="Коробки"
    value={boxes}
  />
)}

{tobaccoHours > 0 && (
  <InfoRow
    label="Часы табак"
    value={`${tobaccoHours} ч`}
  />
)}

{blocks > 0 && (
  <InfoRow
    label="Блоки"
    value={blocks}
  />
)}

{nonProfileHours > 0 && (
  <InfoRow
    label="Непрофильные часы"
    value={`${nonProfileHours} ч`}
  />
)}
        {shift?.mentor && (
          <InfoRow
            label="Наставник"
            value="Да"
          />
        )}
        {dayEarnings > 0 && (
  <InfoRow
    label="Заработано"
    value={`${Math.round(
      dayEarnings
    ).toLocaleString("ru-RU")} ₽`}
  />
)}

        <button
          className={styles.editButton}
          onClick={onEdit}
        >
          Внести или редактировать данные
        </button>
      </div>
    </>,
    document.body
  );
}