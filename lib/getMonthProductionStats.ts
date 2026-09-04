type TransitionPart = {
  boxes?: number;
  blocks?: number;
  baseHours?: number;
  tobaccoHours?: number;
};

type TransitionDistribution = {
  firstMonth: TransitionPart;
  secondMonth: TransitionPart;
};

type ProductionShift = {
  date: string | Date;
  isWorked?: boolean;

  boxes?: number;
  blocks?: number;
  baseHours?: number;
  tobaccoHours?: number;

  transitionDistribution?: TransitionDistribution;
};

type MonthProductionStats = {
  boxes: number;
  blocks: number;
  baseHours: number;
  tobaccoHours: number;
};

export function getMonthProductionStats(
  shifts: ProductionShift[],
  selectedDate: Date
): MonthProductionStats {
  return shifts.reduce(
    (total, shift) => {
      if (!shift.isWorked) {
        return total;
      }

      const shiftDate = new Date(shift.date);

      const isShiftMonth =
        shiftDate.getFullYear() ===
          selectedDate.getFullYear() &&
        shiftDate.getMonth() ===
          selectedDate.getMonth();

      if (shift.transitionDistribution) {
        const nextDay = new Date(shiftDate);

        nextDay.setDate(
          nextDay.getDate() + 1
        );

        const isSecondMonth =
          nextDay.getFullYear() ===
            selectedDate.getFullYear() &&
          nextDay.getMonth() ===
            selectedDate.getMonth();

        if (isShiftMonth) {
          const firstMonth =
            shift.transitionDistribution.firstMonth;

          return {
            boxes:
              total.boxes +
              (firstMonth.boxes || 0),

            blocks:
              total.blocks +
              (firstMonth.blocks || 0),

            baseHours:
              total.baseHours +
              (firstMonth.baseHours || 0),

            tobaccoHours:
              total.tobaccoHours +
              (firstMonth.tobaccoHours || 0),
          };
        }

        if (isSecondMonth) {
          const secondMonth =
            shift.transitionDistribution.secondMonth;

          return {
            boxes:
              total.boxes +
              (secondMonth.boxes || 0),

            blocks:
              total.blocks +
              (secondMonth.blocks || 0),

            baseHours:
              total.baseHours +
              (secondMonth.baseHours || 0),

            tobaccoHours:
              total.tobaccoHours +
              (secondMonth.tobaccoHours || 0),
          };
        }

        return total;
      }

      if (!isShiftMonth) {
        return total;
      }

      return {
        boxes:
          total.boxes +
          (shift.boxes || 0),

        blocks:
          total.blocks +
          (shift.blocks || 0),

        baseHours:
          total.baseHours +
          (shift.baseHours || 0),

        tobaccoHours:
          total.tobaccoHours +
          (shift.tobaccoHours || 0),
      };
    },
    {
      boxes: 0,
      blocks: 0,
      baseHours: 0,
      tobaccoHours: 0,
    }
  );
}