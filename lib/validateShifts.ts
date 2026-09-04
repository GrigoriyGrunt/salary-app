export function validateShifts(
  firstType: "day" | "night",
  secondType: "day" | "night",
  daysBetween: number
) {
  if (
    firstType === "day" &&
    secondType === "day"
  ) {
    return daysBetween === 1;
  }

  if (
    firstType === "day" &&
    secondType === "night"
  ) {
    return daysBetween === 3;
  }

  if (
    firstType === "night" &&
    secondType === "night"
  ) {
    return daysBetween === 1;
  }

  if (
    firstType === "night" &&
    secondType === "day"
  ) {
    return daysBetween === 3;
  }

  return false;
}