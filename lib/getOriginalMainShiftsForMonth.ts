import type { User } from "@/types/user";

import {
  Shift,
  ShiftType,
} from "./generateSchedule";

import {
  detectShiftPosition,
  ShiftPosition,
} from "./detectShiftPosition";

import { applyScheduleChanges } from "./applyScheduleChanges";


function startOfDay(date: Date): Date {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
}


function createTemporaryShift(
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


function getBaseShiftType(
  user: User,
  date: Date
): ShiftType {
  const firstShiftDate =
    startOfDay(
      new Date(user.firstShiftDate)
    );

  const secondShiftDate =
    startOfDay(
      new Date(user.secondShiftDate)
    );


  if (user.schedule === "5/2") {
    const day = date.getDay();

    return day === 0 || day === 6
      ? "off"
      : "day";
  }


  if (
    user.schedule ===
    "15/15 вахта"
  ) {
    return date >= firstShiftDate &&
      date <= secondShiftDate
      ? "day"
      : "off";
  }


  let pattern: ShiftType[];


  if (user.schedule === "2/2 день") {
    pattern = [
      "day",
      "day",
      "off",
      "off",
    ];
  } else if (
    user.schedule === "2/2 ночь"
  ) {
    pattern = [
      "night",
      "night",
      "off",
      "off",
    ];
  } else {
    const daysBetween =
      Math.round(
        (
          secondShiftDate.getTime() -
          firstShiftDate.getTime()
        ) /
          (1000 * 60 * 60 * 24)
      );

    const position =
      detectShiftPosition(
        user.firstShiftType,
        user.secondShiftType,
        daysBetween
      );

    pattern =
      getDayNightPattern(
        position.first
      );
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


  return pattern[patternIndex];
}


export function getOriginalMainShiftsForMonth(
  user: User | null,
  selectedDate: Date
): number {
  if (!user) {
    return 0;
  }


  const hireDate =
    startOfDay(
      new Date(user.hireDate)
    );


  const monthStart = new Date(
    selectedDate.getFullYear(),
    selectedDate.getMonth(),
    1
  );


  const monthEnd = new Date(
    selectedDate.getFullYear(),
    selectedDate.getMonth() + 1,
    0
  );


  /*
    Пользователь ещё не работал
    в этом месяце.
  */
  if (monthEnd < hireDate) {
    return 0;
  }


  /*
    Если месяц совпадает с месяцем
    трудоустройства, расчёт начинается
    с даты устройства.

    В остальных случаях — с первого
    дня выбранного месяца.
  */
  const calculationStart =
    monthStart < hireDate
      ? hireDate
      : monthStart;


  const temporaryShifts: Shift[] = [];


  const currentDate =
    new Date(calculationStart);


  while (currentDate <= monthEnd) {
    const date =
      startOfDay(
        new Date(currentDate)
      );


    const type =
      getBaseShiftType(
        user,
        date
      );


    temporaryShifts.push(
      createTemporaryShift(
        date,
        type
      )
    );


    currentDate.setDate(
      currentDate.getDate() + 1
    );
  }


  /*
    Применяем изменения графика
    к временному массиву.

    Эти данные никуда не сохраняются.
  */
  const shiftsWithChanges =
    applyScheduleChanges(
      temporaryShifts,
      user.scheduleChanges ?? []
    );


  return shiftsWithChanges.filter(
    (shift) =>
      shift.workType === "main"
  ).length;
}