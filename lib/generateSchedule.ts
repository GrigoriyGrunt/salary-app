import type { User } from "@/types/user";

import {
  detectShiftPosition,
  ShiftPosition,
} from "./detectShiftPosition";

export type ShiftType =
  | "day"
  | "night"
  | "off"
  | "vacation";

export type ShiftStatus =
  | "none"
  | "vacation"
  | "sick"
  | "absence"
  | "dayOff";

export type TransitionShiftPart = {
  baseHours: number;
  tobaccoHours: number;

  boxes: number;
  blocks: number;

  nonProfileHours: number;

  mentorHours: number;
};

export type TransitionShiftDistribution = {
  mode: "manual" | "auto";

  firstMonth: TransitionShiftPart;
  secondMonth: TransitionShiftPart;
};

export type Shift = {
  date: Date;
  type: ShiftType;
  workType:
  | "main"
  | "extra"
  | "overtime"
  | "do"
  | "absence"
  | "vacation"
  | "sick"
  | "off"
  | null;
  status: ShiftStatus;

workZone:
  | "none"
  | "base"
  | "base_tobacco"
  | "tobacco"
  | "warehouse";

salaryHours: number;
baseHours: number;
tobaccoHours: number;

boxes: number;
blocks: number;
nonProfileHours: number;

mentor: boolean;

transitionDistribution?:
  TransitionShiftDistribution;

isWorked: boolean;
};

function getPattern(
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

function createShift(
  date: Date,
  type: ShiftType
): Shift {
  return {
    date,
    type,
    workType:
      type === "off"
        ? null
        : "main",
    status: "none",

workZone: "none",

salaryHours: 0,
baseHours: 0,
tobaccoHours: 0,

boxes: 0,
blocks: 0,
nonProfileHours: 0,

mentor: false,
isWorked: false,
  };
}

function getStartDate(hireDate: Date) {
  const today = new Date();

  const startDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    1
  );

  if (hireDate > startDate) {
    startDate.setTime(hireDate.getTime());
  }

  return startDate;
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function generateSchedule(
  user: User
): Shift[] {
  const shifts: Shift[] = [];

  const hireDate = new Date(user.hireDate);
  const firstShiftDate = new Date(
    user.firstShiftDate
  );
  const secondShiftDate = new Date(
    user.secondShiftDate
  );

  const startDate = getStartDate(hireDate);
  const firstWorkingDay = startOfDay(hireDate);

  if (user.schedule === "5/2") {
    for (let i = 0; i < 730; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);

      if (date < firstWorkingDay) continue;

      const isWeekday = date.getDay() !== 0 && date.getDay() !== 6;
      shifts.push(createShift(date, isWeekday ? "day" : "off"));
    }

    return shifts;
  }

  if (user.schedule === "15/15 вахта") {
  const watchStart = startOfDay(firstShiftDate);
  const watchEnd = startOfDay(secondShiftDate);

  for (let i = 0; i < 365; i++) {
    const date = new Date(startDate);

    date.setDate(
      startDate.getDate() + i
    );

    if (date < firstWorkingDay) {
      continue;
    }

    const currentDate = startOfDay(date);

    const isWatchDay =
      currentDate >= watchStart &&
      currentDate <= watchEnd;

    shifts.push(
      createShift(
        date,
        isWatchDay ? "day" : "off"
      )
    );
  }

  return shifts;
}

  const daysBetween = Math.round(
    (
      secondShiftDate.getTime() -
      firstShiftDate.getTime()
    ) /
      (1000 * 60 * 60 * 24)
  );

  const position = detectShiftPosition(
    user.firstShiftType,
    user.secondShiftType,
    daysBetween
  );

  let pattern: ShiftType[];

  if (user.schedule === "2/2 день") {
    pattern = [
      "day",
      "day",
      "off",
      "off",
    ];
  } else if (user.schedule === "2/2 ночь") {
    pattern = [
      "night",
      "night",
      "off",
      "off",
    ];
  } else {
    pattern = getPattern(position.first);
  }

  for (let i = 0; i < 730; i++) {
    const date = new Date(startDate);

    date.setDate(
      startDate.getDate() + i
    );

    if (date < firstWorkingDay) {
      continue;
    }

    const daysFromFirstShift =
      Math.floor(
        (
          date.getTime() -
          firstShiftDate.getTime()
        ) /
          (1000 * 60 * 60 * 24)
      );

    const patternIndex =
      (
        (
          daysFromFirstShift %
          pattern.length
        ) +
        pattern.length
      ) %
      pattern.length;

    shifts.push(
      createShift(
        date,
        pattern[patternIndex]
      )
    );
  }

  return shifts;
}
