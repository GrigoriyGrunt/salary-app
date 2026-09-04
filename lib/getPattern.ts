import { ShiftPosition } from "./detectShiftPosition";

import { ShiftType } from "./generateSchedule";

export function getPattern(
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