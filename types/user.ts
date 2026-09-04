import type { ScheduleChange } from "@/lib/profile";
export type UserRole = "admin" | "employee";

export type User = {
  id: string;
  lastName: string;
firstName: string;
middleName: string;
  accessCode: string;
    login: string;
  role: UserRole;
  isSetupCompleted: boolean;
  warehouse: string;
position: string;
schedule: string;
hireDate: string;
firstShiftDate: string;
firstShiftType: "day" | "night";

secondShiftDate: string;
secondShiftType: "day" | "night";
scheduleChanges: ScheduleChange[];
};