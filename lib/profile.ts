export type WorkSchedule =
  | "2/2 день/ночь"
  | "2/2 день"
  | "2/2 ночь"
  | "15/15 вахта"
  | "5/2";
export type ScheduleChange = {
  changeDate: Date;

  schedule: WorkSchedule;

  firstShiftDate: Date;
  firstShiftType?: "day" | "night";

  secondShiftDate: Date;
  secondShiftType?: "day" | "night";
};

export const profile = {
  warehouse: "",
  position: "",
  schedule: "",

  hireDate: undefined,

  firstShiftDate: undefined,
firstShiftType: undefined,

secondShiftDate: undefined,
secondShiftType: undefined,
};
export function clearProfile() {
  profile.warehouse = "";
  profile.position = "";
  profile.schedule = "";

  profile.hireDate = undefined;

  profile.firstShiftDate = undefined;
  profile.firstShiftType = undefined;

  profile.secondShiftDate = undefined;
  profile.secondShiftType = undefined;
}