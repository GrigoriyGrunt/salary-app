import type { Shift } from "@/lib/generateSchedule";

export type ShiftNotification = {
  date: Date;
};

function getShiftEndTime(shift: Shift) {
  const endTime = new Date(shift.date);

  if (shift.type === "day") {
    endTime.setHours(20, 0, 0, 0);
  }

  if (shift.type === "night") {
    endTime.setDate(endTime.getDate() + 1);
    endTime.setHours(8, 0, 0, 0);
  }

  return endTime;
}

export function getShiftNotifications(
  shifts: Shift[],
  currentDate = new Date(),
  watchPeriod?: { start: Date; end: Date } | null
): ShiftNotification[] {
  if (watchPeriod) {
    const today = new Date(currentDate);
    today.setHours(0, 0, 0, 0);

    const watchEnd = new Date(watchPeriod.end);
    watchEnd.setHours(0, 0, 0, 0);

    if (today > watchEnd) return [];
  }

  return shifts
    .filter((shift) => {
      const isWorkingShift =
        shift.workType === "main" ||
        shift.workType === "overtime" ||
        shift.workType === "extra";

      if (!isWorkingShift) return false;

      if (
        shift.type !== "day" &&
        shift.type !== "night"
      ) {
        return false;
      }

      if (shift.isWorked) return false;

      const shiftDate = new Date(shift.date);
      const endTime = getShiftEndTime(shift);

      if (watchPeriod) {
        const start = new Date(watchPeriod.start);
        const end = new Date(watchPeriod.end);

        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);

        if (shiftDate < start || shiftDate > end) {
          return false;
        }
      } else {
        const isCurrentMonthShift =
          shiftDate.getFullYear() === currentDate.getFullYear() &&
          shiftDate.getMonth() === currentDate.getMonth();

        const isPreviousMonthNightShift =
          shift.type === "night" &&
          endTime.getFullYear() === currentDate.getFullYear() &&
          endTime.getMonth() === currentDate.getMonth() &&
          endTime.getDate() === currentDate.getDate() &&
          shiftDate.getMonth() !== currentDate.getMonth();

        if (!isCurrentMonthShift && !isPreviousMonthNightShift) {
          return false;
        }
      }

      return currentDate >= endTime;
    })
    .sort(
      (a, b) =>
        new Date(a.date).getTime() -
        new Date(b.date).getTime()
    )
    .map((shift) => ({
      date: new Date(shift.date),
    }));
}