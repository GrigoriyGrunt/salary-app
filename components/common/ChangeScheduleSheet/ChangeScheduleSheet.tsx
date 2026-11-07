import { useState } from "react";

import BottomSheet from "@/components/BottomSheet/BottomSheet";
import DatePicker from "@/components/DatePicker/DatePicker";
import NextShiftSelector from "@/components/common/NextShiftSelector/NextShiftSelector";
import Button from "@/components/Button/Button";
import Select from "@/components/Select/Select";
import type { ScheduleChange } from "@/lib/profile";
import styles from "./ChangeScheduleSheet.module.css";
import { generateSchedule } from "@/lib/generateSchedule";
import { applyScheduleChanges } from "@/lib/applyScheduleChanges";
import { getOriginalMainShiftsForMonth } from "@/lib/getOriginalMainShiftsForMonth";
import { useScheduleStore } from "@/store/scheduleStore";
import { useUsersStore } from "@/store/usersStore";
type ChangeScheduleSheetProps = {
  isOpen: boolean;
  onClose: () => void;
};
function toCalendarDate(value: Date | string): Date {
  if (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}
export default function ChangeScheduleSheet({
  isOpen,
  onClose,
}: ChangeScheduleSheetProps) {
  const [changeDate, setChangeDate] =
  useState<Date>();

const setShifts = useScheduleStore(
  (state) => state.setShifts
);
const setScheduleData = useScheduleStore(
  (state) => state.setScheduleData
);
const syncSchedule = useScheduleStore(
  (state) => state.syncSchedule
);
const updateUser = useUsersStore(
  (state) => state.updateUser
);
const selectedUser = useUsersStore(
  (state) => state.currentUser
);

const scheduleChanges = selectedUser?.scheduleChanges ?? [];

const sortedChanges = [...scheduleChanges].sort(
  (a, b) =>
    new Date(a.changeDate).getTime() -
    new Date(b.changeDate).getTime()
);

const lastChange = sortedChanges[sortedChanges.length - 1];

const activeSchedule =
  lastChange?.schedule ?? selectedUser?.schedule;

const lastWatchEnd =
  activeSchedule === "15/15 вахта"
    ? lastChange?.secondShiftDate ?? selectedUser?.secondShiftDate
    : undefined;

const watchChangeMinDate = lastWatchEnd
  ? toCalendarDate(lastWatchEnd)
  : undefined;

watchChangeMinDate?.setDate(
  watchChangeMinDate.getDate() + 1
);

  const [scheduleType, setScheduleType] =
  useState("");

const [watchType, setWatchType] =
  useState<"main" | "extra" | "">("");

  const [
    isScheduleOpen,
    setIsScheduleOpen,
  ] = useState(false);
  const [step, setStep] =
  useState<"settings" | "shifts">(
    "settings"
  );

const [firstDate, setFirstDate] =
  useState<Date>();

const [secondDate, setSecondDate] =
  useState<Date>();

const [firstShift, setFirstShift] =
  useState<"day" | "night" | null>(
    null
  );

const [secondShift, setSecondShift] =
  useState<"day" | "night" | null>(
    null
  );
  const [shiftDatesError, setShiftDatesError] =
  useState(false);
  const [showChangeDateError, setShowChangeDateError] =
  useState(false);
  const resetForm = () => {
  setChangeDate(undefined);
  setScheduleType("");
  setWatchType("");
  setIsScheduleOpen(false);
  setStep("settings");

  setFirstDate(undefined);
  setSecondDate(undefined);

  setFirstShift(null);
setSecondShift(null);

setShiftDatesError(false);
};

const handleClose = () => {
  resetForm();
  onClose();
};
  return (
    <BottomSheet
  className="changeScheduleSheet"
  isOpen={isOpen}
  onClose={handleClose}
>
      <div style={{ 
  padding: "20px",
  display: "flex",
  flexDirection: "column",
  gap: "16px"
}}>
        {step === "settings" && (
  <>
        <h2 style={{
  margin: 0,
  textAlign: "center",
  width: "100%"
}}>
  Изменить график
</h2>

        <DatePicker
  label=""
  value={changeDate}
  onChange={(date) => {
  setChangeDate(date);
  setShowChangeDateError(false);
}}
  mode="calendar"
  minDate={
    scheduleType === "shift"
      ? watchChangeMinDate
      : undefined
  }
/>
{showChangeDateError && (
  <div
    style={{
      padding: "12px 14px",
      borderRadius: "12px",
      background: "#fff1f1",
      color: "#c62828",
      fontSize: "14px",
      lineHeight: "1.4",
    }}
  >
    Выбранная дата изменения графика не может быть выбрана, так как это рабочая смена предыдущей вахты. Выберите дату после окончания текущего периода вахты.
  </div>
)}

        <div className={styles.selectWrapper}>
          <button
            type="button"
            className={styles.selectButton}
            onClick={() =>
              setIsScheduleOpen(
                !isScheduleOpen
              )
            }
          >
            <span className={styles.selectValue}>
              {scheduleType === "day" &&
                "2/2 день"}

              {scheduleType === "night" &&
                "2/2 ночь"}

              {scheduleType === "dayNight" &&
                "2/2 день/ночь"}

              {scheduleType === "shift" &&
  "15/15 вахта"}

              {!scheduleType &&
                "Выберите график"}
            </span>

            <span
              className={styles.selectArrow}
            >
              ▾
            </span>
          </button>

          {isScheduleOpen && (
            <div className={styles.dropdown}>
              <button
                type="button"
                onClick={() => {
                  setScheduleType("day");
                  setIsScheduleOpen(false);
                }}
              >
                2/2 день
              </button>

              <button
                type="button"
                onClick={() => {
                  setScheduleType("night");
                  setIsScheduleOpen(false);
                }}
              >
                2/2 ночь
              </button>

              <button
                type="button"
                onClick={() => {
                  setScheduleType("dayNight");
                  setIsScheduleOpen(false);
                }}
              >
                2/2 день/ночь
              </button>

              <button
                type="button"
                onClick={() => {
  setScheduleType("shift");
  setShowChangeDateError(false);
  setIsScheduleOpen(false);
}}
              >
                                15/15 вахта
              </button>
            </div>
          )}
                </div>

        {scheduleType === "shift" && (
          <Select
            label="Тип вахты"
            placeholder="Выберите тип вахты"
            value={
              watchType === "main"
                ? "Плановая вахта"
                : watchType === "extra"
                  ? "Межвахта"
                  : ""
            }
            onChange={(value) => {
              setWatchType(
                value === "Плановая вахта" ? "main" : "extra"
              );
            }}
            options={[
              {
                label: "Плановая вахта",
                description:
                  'Плановая вахта - это основные смены по графику с возможностью взять два выходных (в календаре выходные не указаны, изменить тип можно потом самостоятельно в разделе "График"). В графике смены будут отображаться ОСН (основная смена).',
              },
              {
                label: "Межвахта",
                description:
                  "Межвахта - это период между плановыми вахтами, в которой каждая смена считается подработкой (двойной оклад), выходные в межвахте не предусмотрены. В графике смены будут отображаться ДОП (подработка).",
              },
            ]}
          />
        )}

        <Button
  onClick={() => {
  if (scheduleType === "shift" && !watchType) return;

  if (
    scheduleType === "shift" &&
    changeDate &&
    watchChangeMinDate &&
    toCalendarDate(changeDate) < watchChangeMinDate
  ) {
    setShowChangeDateError(true);
    return;
  }

  setShowChangeDateError(false);
  setStep("shifts");
}}
>
  Продолжить
</Button>
  </>
)}

{step === "shifts" && (
  <>
    <NextShiftSelector
      isDayNight={
        scheduleType === "dayNight"
      }
      showScheduleChangeHint={true}
      isWatch1515={
        scheduleType === "shift"
      }
      firstDate={firstDate}
      secondDate={secondDate}
      onFirstDateChange={setFirstDate}
      onSecondDateChange={setSecondDate}
      firstShift={firstShift}
      secondShift={secondShift}
      onFirstShiftChange={setFirstShift}
      onSecondShiftChange={setSecondShift}
      styles={styles}
      minDate={changeDate}
hasDatesError={shiftDatesError}
    />

    <Button
  onClick={async () => {
    if (
      !changeDate ||
      !scheduleType ||
      !firstDate ||
      !secondDate
    ) {
      return;
    }

    // Для графиков 2/2 две выбранные даты
    // должны быть двумя ближайшими основными сменами.
    //
    // Допустимо:
    // 15 → 16 — смены подряд
    // 15 → 18 — между сменами два выходных
        if (scheduleType === "shift") {
      const DAY = 24 * 60 * 60 * 1000;

      const first = new Date(firstDate);
      const second = new Date(secondDate);

      first.setHours(0, 0, 0, 0);
      second.setHours(0, 0, 0, 0);

      const daysBetween = Math.round(
        (second.getTime() - first.getTime()) / DAY
      );

      if (daysBetween !== 14) {
        setShiftDatesError(true);
        return;
      }
    } else {
      const DAY = 24 * 60 * 60 * 1000;

      const first = new Date(firstDate);
      const second = new Date(secondDate);

      first.setHours(0, 0, 0, 0);
      second.setHours(0, 0, 0, 0);

      const daysBetween = Math.round(
        (second.getTime() - first.getTime()) / DAY
      );

      if (daysBetween !== 1 && daysBetween !== 3) {
        setShiftDatesError(true);
        return;
      }
    }

    setShiftDatesError(false);

    const newChange: ScheduleChange = {
  changeDate,

  schedule:
    scheduleType === "day"
      ? "2/2 день"
      : scheduleType === "night"
      ? "2/2 ночь"
      : scheduleType === "dayNight"
      ? "2/2 день/ночь"
      : "15/15 вахта",

  firstShiftDate: firstDate,
  firstShiftType: firstShift ?? undefined,

  secondShiftDate: secondDate,
  secondShiftType: secondShift ?? undefined,
};

const currentUser =
  useUsersStore.getState().currentUser;

if (!currentUser) return;

const savedChanges = [
  ...currentUser.scheduleChanges,
];

const scheduleChanges = [
  ...savedChanges,
  newChange,
];

try {
  const response = await fetch(
    "/api/users",
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: currentUser.id,
        scheduleChanges,
      }),
    }
  );

  if (!response.ok) {
    alert("Не удалось сохранить изменение графика");
    return;
  }

  const shifts = generateSchedule(currentUser);

  const existingShifts =
    useScheduleStore.getState().shifts;

  const existingShiftsByDate = new Map(
    existingShifts.map((shift) => [
      new Date(shift.date).toDateString(),
      shift,
    ])
  );

  const changeStart = new Date(changeDate);
  changeStart.setHours(0, 0, 0, 0);

updateUser(currentUser.id, {
  scheduleChanges,
});

const recalculatedShifts =
  applyScheduleChanges(
    shifts,
    scheduleChanges,
    scheduleType === "shift" && watchType !== "" ? watchType : undefined,
    scheduleType === "shift" ? changeDate : undefined
  );

const updatedShifts = recalculatedShifts.map(
  (shift) => {
    const existingShift = existingShiftsByDate.get(
      new Date(shift.date).toDateString()
    );

    const shiftDate = new Date(shift.date);
    shiftDate.setHours(0, 0, 0, 0);

    if (
      existingShift &&
      (
        shiftDate < changeStart ||
        existingShift.isWorked
      )
    ) {
      return existingShift;
    }

    return shift;
  }
);

// Обновляем нормы месяцев после изменения графика.
// Каждый месяц рассчитывается отдельно по новому циклу.
const currentMonthStart = new Date(
  changeStart.getFullYear(),
  changeStart.getMonth(),
  1
);

const updatedOriginalMainShifts = {
  ...useScheduleStore.getState().originalMainShiftsByMonth,
};

if (currentUser.schedule !== "15/15 вахта") {
  const months = new Set<string>();

  for (const shift of updatedShifts) {
    const date = new Date(shift.date);

    if (date < currentMonthStart) continue;

    const monthStart = new Date(
      date.getFullYear(),
      date.getMonth(),
      1
    );

    const monthKey = `${monthStart.getFullYear()}-${String(
      monthStart.getMonth() + 1
    ).padStart(2, "0")}`;

    months.add(monthKey);
  }

  const userWithNewChanges = {
    ...currentUser,
    scheduleChanges,
  };

  for (const monthKey of months) {
    const [year, month] = monthKey
      .split("-")
      .map(Number);

    const monthDate = new Date(
      year,
      month - 1,
      1
    );

    updatedOriginalMainShifts[monthKey] =
      getOriginalMainShiftsForMonth(
        userWithNewChanges,
        monthDate
      );
  }
}

setScheduleData(
  updatedShifts,
  updatedOriginalMainShifts
);

void syncSchedule();
handleClose();
} catch (error) {
  console.error(
    "Ошибка сохранения изменения графика:",
    error
  );
  alert("Не удалось сохранить изменение графика");
}
  }}
>
  Сохранить изменения
</Button>
  </>
)}
      </div>
    </BottomSheet>
  );
}
