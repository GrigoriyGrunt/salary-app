import type { Shift } from "@/lib/generateSchedule";

export type ScheduleNotification = {
  originalMainShifts: number;
  requiredShifts: number;
  date: Date;
  from: "ДОП" | "ОТР";
  to: "ДОП" | "ОТР";
};

function getNearestShift(
  shifts: Shift[],
  today: Date
) {
  return [...shifts].sort((a, b) => {
    const aDistance = Math.abs(
      new Date(a.date).getTime() - today.getTime()
    );

    const bDistance = Math.abs(
      new Date(b.date).getTime() - today.getTime()
    );

    return aDistance - bDistance;
  })[0];
}

export function getScheduleNotification(
  shifts: Shift[],
  originalMainShiftsByMonth: Record<string, number>,
  currentDate = new Date()
): ScheduleNotification | null {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthKey = `${year}-${String(
    month + 1
  ).padStart(2, "0")}`;

  const originalMainShifts =
    originalMainShiftsByMonth[monthKey] ?? 0;

  if (originalMainShifts === 0) {
    return null;
  }

  const monthShifts = shifts.filter((shift) => {
    const shiftDate = new Date(shift.date);

    return (
      shiftDate.getFullYear() === year &&
      shiftDate.getMonth() === month
    );
  });

  const mainShifts = monthShifts.filter(
    (shift) => shift.workType === "main"
  );

  const overtimeShifts = monthShifts.filter(
    (shift) => shift.workType === "overtime"
  );

  const extraShifts = monthShifts.filter(
    (shift) => shift.workType === "extra"
  );

  const mainCount = mainShifts.length;

  const regularCount =
    mainShifts.length +
    overtimeShifts.length;

  /*
    Нормы не хватает.
    При этом есть ДОП.

    Значит одна из ДОП должна быть ОТР.
  */
  if (
    regularCount < originalMainShifts &&
    extraShifts.length > 0
  ) {
    const shift = getNearestShift(
      extraShifts,
      currentDate
    );

    if (!shift) {
      return null;
    }

    return {
      originalMainShifts,
      requiredShifts: regularCount,
      date: new Date(shift.date),
      from: "ДОП",
      to: "ОТР",
    };
  }

  /*
    Норма уже превышена.

    Лишняя ОТР должна быть ДОП.
  */
  if (regularCount > originalMainShifts) {
    const shift = getNearestShift(
      overtimeShifts,
      currentDate
    );

    if (!shift) {
      return null;
    }

    return {
      originalMainShifts,
      requiredShifts: regularCount,
      date: new Date(shift.date),
      from: "ОТР",
      to: "ДОП",
    };
  }

  return null;
}