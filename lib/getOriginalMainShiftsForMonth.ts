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
    Норма считается по полному месяцу
    выбранного графика.

    Дата трудоустройства не сокращает
    расчёт нормы — она влияет только
    на фактический построенный график.
  */
  const calculationStart =
    monthStart;


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
export function getOriginalMainShiftsForDate(
  user: User | null,
  shiftDate: Date
): number {
  if (!user) {
    return 0;
  }

  const date = startOfDay(shiftDate);

  const hireDate = startOfDay(
    new Date(user.hireDate)
  );

  if (date < hireDate) {
    return 0;
  }

  const scheduleChanges =
    user.scheduleChanges ?? [];

  const applicableChange =
    [...scheduleChanges]
      .sort(
        (a, b) =>
          startOfDay(a.changeDate).getTime() -
          startOfDay(b.changeDate).getTime()
      )
      .filter(
        (change) =>
          date >= startOfDay(change.changeDate)
      )
      .at(-1);

  /*
    Если смена относится к исходному графику,
    считаем норму полного месяца исходного графика.
  */
  if (!applicableChange) {
    return getOriginalMainShiftsForMonth(
      user,
      date
    );
  }

  /*
    Если смена относится к изменённому графику,
    считаем норму полного месяца именно этого
    нового графика.

    Новый цикл определяется firstShiftDate
    и secondShiftDate.

    changeDate здесь используется только
    как граница применения нового графика.
  */
  const monthStart = new Date(
    date.getFullYear(),
    date.getMonth(),
    1
  );

  const monthEnd = new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    0
  );

  const temporaryShifts: Shift[] = [];

  const currentDate =
    new Date(monthStart);

  while (currentDate <= monthEnd) {
    temporaryShifts.push(
      createTemporaryShift(
        new Date(currentDate),
        getBaseShiftType(
          user,
          new Date(currentDate)
        )
      )
    );

    currentDate.setDate(
      currentDate.getDate() + 1
    );
  }

  /*
    Для расчёта полной нормы нового графика
    считаем changeDate началом расчётного месяца.
    Сам цикл при этом по-прежнему определяется
    двумя выбранными сменами.
  */
  const normalizedChange = {
    ...applicableChange,
    changeDate: monthStart,
  };

  const shiftsWithNewSchedule =
    applyScheduleChanges(
      temporaryShifts,
      [normalizedChange]
    );

  return shiftsWithNewSchedule.filter(
    (shift) =>
      shift.workType === "main"
  ).length;
}