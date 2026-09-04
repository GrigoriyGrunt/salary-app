import { useState } from "react";

import BottomSheet from "@/components/BottomSheet/BottomSheet";
import DatePicker from "@/components/DatePicker/DatePicker";
import NextShiftSelector from "@/components/common/NextShiftSelector/NextShiftSelector";
import Button from "@/components/Button/Button";
import type { ScheduleChange } from "@/lib/profile";
import styles from "./ChangeScheduleSheet.module.css";
import { generateSchedule } from "@/lib/generateSchedule";
import { applyScheduleChanges } from "@/lib/applyScheduleChanges";
import { useScheduleStore } from "@/store/scheduleStore";
import { useUsersStore } from "@/store/usersStore";
type ChangeScheduleSheetProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function ChangeScheduleSheet({
  isOpen,
  onClose,
}: ChangeScheduleSheetProps) {
  const [changeDate, setChangeDate] =
  useState<Date>();

const setShifts = useScheduleStore(
  (state) => state.setShifts
);
const updateUser = useUsersStore(
  (state) => state.updateUser
);

  const [scheduleType, setScheduleType] =
    useState("");

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
  const resetForm = () => {
  setChangeDate(undefined);
  setScheduleType("");
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
          onChange={setChangeDate}
          mode="calendar"
        />

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
                "Вахта"}

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
                  setIsScheduleOpen(false);
                }}
              >
                Вахта
              </button>
            </div>
          )}
        </div>

        <Button
  onClick={() => setStep("shifts")}
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
  onClick={() => {
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
    if (scheduleType !== "shift") {
      const DAY =
        24 * 60 * 60 * 1000;

      const first = new Date(firstDate);
      const second = new Date(secondDate);

      first.setHours(0, 0, 0, 0);
      second.setHours(0, 0, 0, 0);

      const daysBetween =
        Math.round(
          (
            second.getTime() -
            first.getTime()
          ) / DAY
        );

      if (
        daysBetween !== 1 &&
        daysBetween !== 3
      ) {
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

const shifts = generateSchedule(currentUser);

updateUser(currentUser.id, {
  scheduleChanges: [
    ...savedChanges,
    newChange,
  ],
});

const updatedShifts =
  applyScheduleChanges(
    shifts,
    [...savedChanges, newChange]
  );

setShifts(updatedShifts);
handleClose();
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