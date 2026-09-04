import { Shift, ShiftType } from "./generateSchedule";
import { WorkSchedule } from "./profile";

type BuildSegmentParams = {
  startDate: Date;
  endDate: Date;

  schedule: WorkSchedule;

  firstShiftDate: Date;
  firstShiftType: "day" | "night";

  secondShiftDate: Date;
  secondShiftType: "day" | "night";
};

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

export function buildSegment(
  params: BuildSegmentParams
): Shift[] {
  const shifts: Shift[] = [];

  let pattern: ShiftType[];

  switch (params.schedule) {
    case "2/2 день":
      pattern = [
        "day",
        "day",
        "off",
        "off",
      ];
      break;

    case "2/2 ночь":
      pattern = [
        "night",
        "night",
        "off",
        "off",
      ];
      break;

    default:
      pattern = [
        params.firstShiftType,
        params.secondShiftType,
        "off",
        "off",
      ];
      break;
  }

  const cycleLength =
    pattern.length;

  const currentDate =
    new Date(params.startDate);

  while (
    currentDate <= params.endDate
  ) {
    const days =
      Math.floor(
        (
          currentDate.getTime() -
          params.firstShiftDate.getTime()
        ) /
          (1000 * 60 * 60 * 24)
      );

    const index =
      ((days % cycleLength) +
        cycleLength) %
      cycleLength;

    shifts.push(
      createShift(
        new Date(currentDate),
        pattern[index]
      )
    );

    currentDate.setDate(
      currentDate.getDate() + 1
    );
  }

  return shifts;
}