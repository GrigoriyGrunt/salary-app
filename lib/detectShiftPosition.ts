export type ShiftPosition =
  | "firstDay"
  | "secondDay"
  | "firstNight"
  | "secondNight";

export function detectShiftPosition(
  firstType: "day" | "night",
  secondType: "day" | "night",
  daysBetween: number
): {
  first: ShiftPosition;
  second: ShiftPosition;
} {
  if (
    firstType === "day" &&
    secondType === "day" &&
    daysBetween === 1
  ) {
    return {
      first: "firstDay",
      second: "secondDay",
    };
  }

  if (
    firstType === "day" &&
    secondType === "night" &&
    daysBetween === 3
  ) {
    return {
      first: "secondDay",
      second: "firstNight",
    };
  }

  if (
    firstType === "night" &&
    secondType === "night" &&
    daysBetween === 1
  ) {
    return {
      first: "firstNight",
      second: "secondNight",
    };
  }

  if (
    firstType === "night" &&
    secondType === "day" &&
    daysBetween === 3
  ) {
    return {
      first: "secondNight",
      second: "firstDay",
    };
  }

  throw new Error("Неверно выбраны ближайшие смены");
}