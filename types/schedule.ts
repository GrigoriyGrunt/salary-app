export type ShiftType = "day" | "night" | "off";

export type WorkType =
  | "main"
  | "extra"
  | "overtime"
  | "do"
  | "absence"
  | "vacation"
  | "sick"
  | "off"
  | null;

export interface Shift {
  shift: ShiftType;
  workType: WorkType;

  icon: "day" | "night" | "off";
}