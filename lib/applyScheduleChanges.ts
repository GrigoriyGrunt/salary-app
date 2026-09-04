import type { ScheduleChange } from "./profile";

import {
  Shift,
  ShiftType,
} from "./generateSchedule";

import {
  detectShiftPosition,
  ShiftPosition,
} from "./detectShiftPosition";

const DAY = 24 * 60 * 60 * 1000;

function startOfDay(date: Date): Date {
  const result = new Date(date);

  result.setHours(0, 0, 0, 0);

  return result;
}

function diffDays(
  a: Date,
  b: Date
): number {
  return Math.round(
    (
      startOfDay(a).getTime() -
      startOfDay(b).getTime()
    ) / DAY
  );
}

function getDayNightPattern(
  position: ShiftPosition
): ShiftType[] {
  switch (position) {
    case "firstDay":
      return [
        "day",
        "day",
        "off",
        "off",
        "night",
        "night",
        "off",
        "off",
      ];

    case "secondDay":
      return [
        "day",
        "off",
        "off",
        "night",
        "night",
        "off",
        "off",
        "day",
      ];

    case "firstNight":
      return [
        "night",
        "night",
        "off",
        "off",
        "day",
        "day",
        "off",
        "off",
      ];

    case "secondNight":
      return [
        "night",
        "off",
        "off",
        "day",
        "day",
        "off",
        "off",
        "night",
      ];
  }
}

function getTwoTwoPattern(
  workType: "day" | "night",
  firstShiftDate: Date,
  secondShiftDate: Date
): ShiftType[] {
  const daysBetween = diffDays(
    secondShiftDate,
    firstShiftDate
  );

  // Две ближайшие смены идут подряд.
  //
  // 15 — смена
  // 16 — смена
  if (daysBetween === 1) {
    return [
      workType,
      workType,
      "off",
      "off",
    ];
  }

  // Две ближайшие смены разделены
  // двумя выходными.
  //
  // 15 — смена
  // 16 — выходной
  // 17 — выходной
  // 18 — смена
  if (daysBetween === 3) {
    return [
      workType,
      "off",
      "off",
      workType,
    ];
  }

  return [];
}

function getPattern(
  change: ScheduleChange
): ShiftType[] {
  if (
    !change.firstShiftDate ||
    !change.secondShiftDate
  ) {
    return [];
  }

  const daysBetween = diffDays(
    change.secondShiftDate,
    change.firstShiftDate
  );

  switch (change.schedule) {
    case "2/2 день": {
      if (daysBetween === 1) {
        return [
          "day",
          "day",
          "off",
          "off",
        ];
      }

      if (daysBetween === 3) {
        return [
          "day",
          "off",
          "off",
          "day",
        ];
      }

      return [];
    }

    case "2/2 ночь": {
      if (daysBetween === 1) {
        return [
          "night",
          "night",
          "off",
          "off",
        ];
      }

      if (daysBetween === 3) {
        return [
          "night",
          "off",
          "off",
          "night",
        ];
      }

      return [];
    }

    case "2/2 день/ночь": {
      if (
        !change.firstShiftType ||
        !change.secondShiftType
      ) {
        return [];
      }

      const position =
        detectShiftPosition(
          change.firstShiftType,
          change.secondShiftType,
          daysBetween
        );

      return getDayNightPattern(
        position.first
      );
    }

    default:
      return [];
  }
}

function getShiftType(
  date: Date,
  change: ScheduleChange
): Shift["type"] {
  const pattern = getPattern(change);

  if (
    pattern.length === 0 ||
    !change.firstShiftDate
  ) {
    return "off";
  }

  const index =
    (
      (
        diffDays(
          date,
          change.firstShiftDate
        ) % pattern.length
      ) +
      pattern.length
    ) %
    pattern.length;

  return pattern[index];
}

function applySingleChange(
  shifts: Shift[],
  change: ScheduleChange,
  nextChangeDate?: Date
): Shift[] {
  const changeDate =
    startOfDay(change.changeDate);

  const endDate = nextChangeDate
    ? startOfDay(nextChangeDate)
    : undefined;

  if (
    change.schedule === "15/15 вахта" &&
    change.firstShiftDate &&
    change.secondShiftDate
  ) {
    const watchStart =
      startOfDay(change.firstShiftDate);

    const watchEnd =
      startOfDay(change.secondShiftDate);

    return shifts.map((shift) => {
      const date =
        startOfDay(
          new Date(shift.date)
        );

      if (date < changeDate) {
        return shift;
      }

      if (
        endDate &&
        date >= endDate
      ) {
        return shift;
      }

      const isWatchDay =
        date >= watchStart &&
        date <= watchEnd;

      return {
        ...shift,
        type: isWatchDay
          ? "day"
          : "off",
        workType: isWatchDay
          ? "main"
          : null,
      };
    });
  }

  return shifts.map((shift) => {
    const date =
      startOfDay(
        new Date(shift.date)
      );

    if (date < changeDate) {
      return shift;
    }

    if (
      endDate &&
      date >= endDate
    ) {
      return shift;
    }

    const type =
      getShiftType(
        date,
        change
      );

    return {
      ...shift,
      type,
      workType:
        type === "off"
          ? null
          : "main",
    };
  });
}

export function applyScheduleChanges(
  shifts: Shift[],
  scheduleChanges: ScheduleChange[]
): Shift[] {
  if (
    scheduleChanges.length === 0
  ) {
    return shifts;
  }

  const changes =
    [...scheduleChanges].sort(
      (a, b) =>
        startOfDay(
          a.changeDate
        ).getTime() -
        startOfDay(
          b.changeDate
        ).getTime()
    );

  let result = [...shifts];

  for (
    let i = 0;
    i < changes.length;
    i++
  ) {
    const current =
      changes[i];

    const next =
      changes[i + 1];

    result =
      applySingleChange(
        result,
        current,
        next?.changeDate
      );
  }

  return result;
}