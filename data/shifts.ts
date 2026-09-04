import type { Shift } from "@/types/schedule";

export const shifts: Record<number, Shift> = {
  1: {
    shift: "day",
workType: "main",
icon: "day",
  },

  2: {
    shift: "day",
workType: "extra",
icon: "day",
  },

  3: {
    shift: "off",
workType: null,
icon: "off",
  },

  4: {
    shift: "night",
workType: "main",
icon: "night",
  },

  5: {
    shift: "night",
workType: "extra",
icon: "night",
  },
};