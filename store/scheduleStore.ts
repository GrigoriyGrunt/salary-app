import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { Shift } from "@/lib/generateSchedule";

type UserScheduleData = {
  shifts: Shift[];
  originalMainShiftsByMonth: Record<string, number>;
};

type ScheduleState = {
  currentUserId: string | null;

  shifts: Shift[];

  originalMainShiftsByMonth: Record<string, number>;

  schedulesByUser: Record<string, UserScheduleData>;

  setCurrentUser: (userId: string | null) => void;

  setShifts: (shifts: Shift[]) => void;

  setOriginalMainShifts: (
    monthKey: string,
    count: number
  ) => void;

  updateShift: (
    date: Date,
    data: Partial<Shift>
  ) => void;

  clear: () => void;

  deleteUserSchedule: (userId: string) => void;
};

const getUserSchedule = (
  schedulesByUser: Record<string, UserScheduleData>,
  userId: string
): UserScheduleData => {
  return (
    schedulesByUser[userId] ?? {
      shifts: [],
      originalMainShiftsByMonth: {},
    }
  );
};

export const useScheduleStore =
  create<ScheduleState>()(
    persist(
      (set) => ({
        currentUserId: null,

        shifts: [],

        originalMainShiftsByMonth: {},

        schedulesByUser: {},

        setCurrentUser: (userId) =>
          set((state) => {
            if (!userId) {
              return {
                currentUserId: null,
                shifts: [],
                originalMainShiftsByMonth: {},
              };
            }

            const userSchedule =
              getUserSchedule(
                state.schedulesByUser,
                userId
              );

            return {
              currentUserId: userId,
              shifts: userSchedule.shifts,
              originalMainShiftsByMonth:
                userSchedule.originalMainShiftsByMonth,
            };
          }),

        setShifts: (shifts) =>
          set((state) => {
            if (!state.currentUserId) {
              return { shifts };
            }

            return {
              shifts,

              schedulesByUser: {
                ...state.schedulesByUser,

                [state.currentUserId]: {
                  ...getUserSchedule(
                    state.schedulesByUser,
                    state.currentUserId
                  ),

                  shifts,
                },
              },
            };
          }),

        setOriginalMainShifts: (
          monthKey,
          count
        ) =>
          set((state) => {
            const originalMainShiftsByMonth = {
              ...state.originalMainShiftsByMonth,

              [monthKey]:
                state.originalMainShiftsByMonth[
                  monthKey
                ] ?? count,
            };

            if (!state.currentUserId) {
              return {
                originalMainShiftsByMonth,
              };
            }

            return {
              originalMainShiftsByMonth,

              schedulesByUser: {
                ...state.schedulesByUser,

                [state.currentUserId]: {
                  ...getUserSchedule(
                    state.schedulesByUser,
                    state.currentUserId
                  ),

                  originalMainShiftsByMonth,
                },
              },
            };
          }),

        updateShift: (date, data) =>
          set((state) => {
            const existingShift =
              state.shifts.find((shift) => {
                const shiftDate =
                  new Date(shift.date);

                return (
                  shiftDate.getDate() ===
                    date.getDate() &&
                  shiftDate.getMonth() ===
                    date.getMonth() &&
                  shiftDate.getFullYear() ===
                    date.getFullYear()
                );
              });

            let shifts: Shift[];

            if (existingShift) {
              shifts = state.shifts.map(
                (shift) => {
                  const shiftDate =
                    new Date(shift.date);

                  if (
                    shiftDate.getDate() ===
                      date.getDate() &&
                    shiftDate.getMonth() ===
                      date.getMonth() &&
                    shiftDate.getFullYear() ===
                      date.getFullYear()
                  ) {
                    return {
                      ...shift,
                      ...data,
                    };
                  }

                  return shift;
                }
              );
            } else {
              const newShift: Shift = {
                date: new Date(date),

                type: "off",
                workType: null,
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

                ...data,
              };

              shifts = [
                ...state.shifts,
                newShift,
              ];
            }

            if (!state.currentUserId) {
              return { shifts };
            }

            return {
              shifts,

              schedulesByUser: {
                ...state.schedulesByUser,

                [state.currentUserId]: {
                  ...getUserSchedule(
                    state.schedulesByUser,
                    state.currentUserId
                  ),

                  shifts,
                },
              },
            };
          }),

        clear: () =>
          set((state) => {
            if (!state.currentUserId) {
              return {
                shifts: [],
                originalMainShiftsByMonth: {},
              };
            }

            return {
              shifts: [],

              originalMainShiftsByMonth: {},

              schedulesByUser: {
                ...state.schedulesByUser,

                [state.currentUserId]: {
                  shifts: [],
                  originalMainShiftsByMonth: {},
                },
              },
            };
          }),

        deleteUserSchedule: (userId) =>
          set((state) => {
            const schedulesByUser = {
              ...state.schedulesByUser,
            };

            delete schedulesByUser[userId];

            return {
              schedulesByUser,

              ...(state.currentUserId === userId
                ? {
                    currentUserId: null,
                    shifts: [],
                    originalMainShiftsByMonth: {},
                  }
                : {}),
            };
          }),
      }),

      {
        name: "salary-calculator-schedule",

        skipHydration: true,

        merge: (
          persistedState,
          currentState
        ) => {
          const persisted =
            persistedState as Partial<ScheduleState>;

          const schedulesByUser =
            persisted.schedulesByUser ?? {};

          const normalizedSchedulesByUser =
            Object.fromEntries(
              Object.entries(
                schedulesByUser
              ).map(
                ([userId, userSchedule]) => [
                  userId,
                  {
                    ...userSchedule,

                    shifts:
                      userSchedule.shifts.map(
                        (shift) => ({
                          ...shift,

                          date: new Date(
                            shift.date
                          ),
                        })
                      ),
                  },
                ]
              )
            );

          return {
            ...currentState,

            ...persisted,

            schedulesByUser:
              normalizedSchedulesByUser,

            shifts: [],

            originalMainShiftsByMonth: {},
          };
        },
      }
    )
  );